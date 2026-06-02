import express, { Response } from "express";
import { Orders, Products, Users, DeliveryCharges, Notifications } from "../db.js";
import { authenticateToken, requireRole, CustomRequest, sendEmailNotification } from "../utils/auth.js";

const router = express.Router();

// Get list of orders (filtering: buyers see their own, sellers see items belonging to them, admins see all)
router.get("/", authenticateToken, (req: CustomRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  try {
    let list = Orders.find();

    if (role === "user") {
      list = list.filter((o) => o.userId === userId);
    } else if (role === "seller") {
      // Return order if any of the items belong to this seller
      list = list.filter((o) => o.items.some((item) => item.sellerId === userId));
    }
    // Admin sees all, no filtering
    
    // Sort orders from newest to oldest
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json(list);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load orders." });
  }
});

// Calculate delivery charge and estimated days preview
router.post("/calculate-delivery", (req: express.Request, res: express.Response) => {
  const { district, pincode } = req.body;
  if (!district) {
    return res.status(400).json({ message: "District query parameter mandatory." });
  }

  // Look up district-wise charge
  const chargeDoc = DeliveryCharges.findOne((d) => 
    d.districtEN.toLowerCase() === district.toLowerCase() ||
    d.districtTA === district
  );

  const charge = chargeDoc ? chargeDoc.charge : 50; // standard fallback
  const days = chargeDoc ? chargeDoc.estimatedDays : 3;

  const today = new Date();
  today.setDate(today.getDate() + days);
  
  return res.json({
    charge,
    estimatedDays: days,
    estimatedDeliveryDate: today.toISOString().split("T")[0]
  });
});

// Checkout Order
router.post("/", authenticateToken, requireRole(["user", "admin"]), (req: CustomRequest, res: Response) => {
  const userId = req.user!.id;
  const {
    items, // Array of { productId, quantity }
    district,
    pincode,
    fullAddress,
    paymentMethod,
    paymentId,
    paymentScreenshot
  } = req.body;

  if (!items || items.length === 0 || !district || !pincode || !fullAddress || !paymentMethod) {
    return res.status(400).json({ message: "Incomplete order specifications." });
  }

  const user = Users.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User account verification failed." });
  }

  try {
    // 1. Map and validate items, calculate subtotal
    let subtotal = 0;
    const orderItems: any[] = [];
    const sellerEarningsMap: { [sellerId: string]: number } = {};

    for (const inline of items) {
      const p = Products.findById(inline.productId);
      if (!p) {
        return res.status(404).json({ message: `Product ${inline.productId} not found.` });
      }

      if (p.availableStock < inline.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${p.nameEN}. Only ${p.availableStock} remaining.` });
      }

      const itemCost = p.price * inline.quantity;
      subtotal += itemCost;

      // Track item
      orderItems.push({
        productId: p.id,
        productNameEN: p.nameEN,
        productNameTA: p.nameTA,
        quantity: inline.quantity,
        price: p.price,
        sellerId: p.sellerId
      });

      // Deduct available stock
      Products.findByIdAndUpdate(p.id, {
        availableStock: p.availableStock - inline.quantity
      });

      // Split earnings (98% to seller, 2% admin commission on product subtotal)
      const sellerPortion = itemCost * 0.98;
      if (!sellerEarningsMap[p.sellerId]) {
        sellerEarningsMap[p.sellerId] = 0;
      }
      sellerEarningsMap[p.sellerId] += sellerPortion;
    }

    // 2. Fetch shipping charge
    const chargeDoc = DeliveryCharges.findOne((d) => 
      d.districtEN.toLowerCase() === district.toLowerCase() ||
      d.districtTA === district
    );

    const deliveryCharge = chargeDoc ? chargeDoc.charge : 50;
    const deliveryDays = chargeDoc ? chargeDoc.estimatedDays : 3;

    const arrivalDate = new Date();
    arrivalDate.setDate(arrivalDate.getDate() + deliveryDays);

    const commissionAmount = subtotal * 0.02;
    const totalAmount = subtotal + deliveryCharge;

    // 3. Create the Order
    const newOrder = Orders.create({
      userId: user.id,
      buyerName: user.fullName,
      buyerPhone: user.phoneNumber,
      buyerEmail: user.email,
      items: orderItems,
      totalAmount,
      commissionAmount,
      sellerEarnings: sellerEarningsMap,
      fullAddress,
      district,
      pincode,
      deliveryCharge,
      estimatedDeliveryDate: arrivalDate.toISOString().split("T")[0],
      status: paymentMethod === "Razorpay" ? "Confirmed" : "Pending", // Gpay QR payment needs admin manual review
      paymentMethod,
      paymentId: paymentId || (paymentMethod === "GPayQR" ? "GPAY_PENDING_" + Date.now() : "RAZORPAY_" + Math.random().toString(36).substring(5)),
      paymentScreenshot: paymentScreenshot || undefined,
      paymentVerified: paymentMethod === "Razorpay", // Auto confirmed for card gateways, screens manual
      createdAt: new Date().toISOString()
    });

    // 4. Send Email Notification
    const itemsDescription = orderItems.map(i => `${i.productNameEN} x ${i.quantity} (₹${i.price} each)`).join("\n");
    const buyerEmailBody = `
Dear ${user.fullName},

Thank you for shopping at Tamil Agro Mart! Your order has been registered successfully.

--- ORDER DETAILS ---
Order ID: ${newOrder.id}
Products Ordered:
${itemsDescription}

Subtotal: ₹${subtotal}
Delivery Charge: ₹${deliveryCharge}
Total Amount Paid: ₹${totalAmount} (via ${paymentMethod})
Status: ${newOrder.status}
Estimated Delivery: ${newOrder.estimatedDeliveryDate}

Shipping Address:
${fullAddress}, ${district} - ${pincode}
Contact Phone: ${user.phoneNumber}

We appreciate your direct support of local agriculture!
    `;
    
    // Notify buyer
    sendEmailNotification(user.email, `Tamil Agro Mart - Order Registered [#${newOrder.id}]`, buyerEmailBody);

    // Notify sellers and administrators
    const sellerIds = Object.keys(sellerEarningsMap);
    sellerIds.forEach((sId) => {
      const seller = Users.findById(sId);
      if (seller) {
        const sellerEmailBody = `
Dear ${seller.fullName},

An order has been placed for your produce on Tamil Agro Mart!

--- PRODUCTS ORDERED ---
${orderItems.filter(i => i.sellerId === sId).map(i => `${i.productNameEN} x ${i.quantity}`).join("\n")}

Delivery District: ${district}
Pincode: ${pincode}
Estimated Payout for this Order (98%): ₹${sellerEarningsMap[sId].toFixed(2)} (Commission 2% deducted)

Kindly package the goods for transit. Update the status to 'Shipped' when handed off to the courier.
        `;
        sendEmailNotification(seller.email, `Tamil Agro Mart - New Sale Received [#${newOrder.id}]`, sellerEmailBody);
      }
    });

    // Write persistent notifications
    Notifications.create({
      recipientId: "admin",
      titleEN: `New Order #${newOrder.id}`,
      titleTA: `புதிய ஆர்டர் #${newOrder.id}`,
      messageEN: `${user.fullName} placed a ₹${totalAmount} order via ${paymentMethod}.`,
      messageTA: `${user.fullName} ₹${totalAmount} ஆர்டர் செய்துள்ளார் (${paymentMethod}).`,
      read: false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      message: paymentMethod === "Razorpay" ? "Order placed and paid successfully!" : "Order submitted. Awaiting QR payment validation from Admin.",
      order: newOrder
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Failed during order registration." });
  }
});

// Fetch detailed view of specific Order
router.get("/:id", authenticateToken, (req: CustomRequest, res: Response) => {
  const oId = req.params.id;
  const order = Orders.findById(oId);

  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  // Auth shield
  const isAuthorized = 
    req.user!.role === "admin" ||
    order.userId === req.user!.id ||
    order.items.some(i => i.sellerId === req.user!.id);

  if (!isAuthorized) {
    return res.status(403).json({ message: "Access unauthorized." });
  }

  return res.json(order);
});

// Update order progress status
router.put("/:id/status", authenticateToken, requireRole(["seller", "admin"]), (req: CustomRequest, res: Response) => {
  const oId = req.params.id;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ message: "Status parameter is missing." });
  }

  const order = Orders.findById(oId);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  // Seller checks: can only update if some of the items are theirs
  if (req.user!.role === "seller" && !order.items.some(i => i.sellerId === req.user!.id)) {
    return res.status(403).json({ message: "Unauthorized. Order contains items from other sellers." });
  }

  try {
    const updated = Orders.findByIdAndUpdate(oId, { status });
    
    // Create notification for the buyer
    Notifications.create({
      recipientId: order.userId,
      titleEN: `Order #${order.id} status updated: ${status}`,
      titleTA: `ஆர்டர் #${order.id} நிலை மாற்றப்பட்டது: ${status === 'Confirmed' ? 'உறுதி செய்யப்பட்டது' : status === 'Shipped' ? 'அனுப்பப்பட்டது' : status === 'Delivered' ? 'வழங்கப்பட்டது' : status}`,
      messageEN: `Your package estimated for ${order.estimatedDeliveryDate} has been updated to ${status}.`,
      messageTA: `தங்களது ஆர்டர் நிலை '${status}' என புதுப்பிக்கப்பட்டுள்ளது.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    return res.json({
      message: "Order status updated successfully.",
      order: updated
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update order status." });
  }
});

// Admin verify QR screen upload manual payment
router.put("/:id/verify-payment", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  const oId = req.params.id;
  const { verified, paymentId } = req.body;

  const order = Orders.findById(oId);
  if (!order) {
    return res.status(404).json({ message: "Order not found." });
  }

  try {
    const changes: any = { paymentVerified: verified };
    if (verified) {
      changes.status = "Confirmed";
      if (paymentId) changes.paymentId = paymentId;
    }

    const updated = Orders.findByIdAndUpdate(oId, changes);

    // Alert Buyer
    Notifications.create({
      recipientId: order.userId,
      titleEN: verified ? "Payment Verified & Order Confirmed!" : "Payment verification failed",
      titleTA: verified ? "பணம் செலுத்தப்பட்டது உறுதிசெய்யப்பட்டது!" : "பணம் செலுத்தியது நிராகரிக்கப்பட்டது",
      messageEN: verified 
        ? `Your QR payment for Order #${order.id} is verified. Packing initialized.` 
        : `Your payment validation for Order #${order.id} has been blocked. Contact administrator support.`,
        messageTA: verified
        ? `தங்கள் செலுத்திய பணம் சரிபார்க்கப்பட்டு ஆர்டர் #${order.id} உறுதி செய்யப்பட்டது.`
        : `ஆர்டர் #${order.id} பணம் சரிபார்ப்பு தோல்வியுற்றது.`,
      read: false,
      createdAt: new Date().toISOString()
    });

    return res.json({
      message: verified ? "Manual payment verified. Order confirmed." : "Verification pending update.",
      order: updated
    });
  } catch (error) {
    return res.status(500).json({ message: "Verification action failed." });
  }
});

export default router;
