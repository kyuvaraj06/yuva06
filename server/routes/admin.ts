import express, { Response } from "express";
import fs from "fs";
import path from "path";
import { Users, Orders, Products, DeliveryCharges, GPayConfigs, DBUser } from "../db.js";
import { authenticateToken, requireRole, CustomRequest } from "../utils/auth.js";

const router = express.Router();

// 1. GET all registered users
router.get("/users", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  const users = Users.find();
  // Filter out password hashes before conveying
  const sanitized = users.map(({ passwordHash, ...rest }) => rest);
  return res.json(sanitized);
});

// 2. TOGGLE BLOCKED status on a user
router.put("/users/:id/block", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  const uId = req.params.id;
  const user = Users.findById(uId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.role === "admin") {
    return res.status(400).json({ message: "Administrators cannot be blocked." });
  }

  try {
    const isBlocked = !user.isBlocked;
    const updated = Users.findByIdAndUpdate(uId, { isBlocked });
    return res.json({
      message: isBlocked ? "User blocked successfully." : "User unblocked successfully.",
      user: { id: updated!.id, fullName: updated!.fullName, isBlocked: updated!.isBlocked }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to compile block operation." });
  }
});

// 3. APPROVE or reject seller credential
router.put("/sellers/:id/approve", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  const sId = req.params.id;
  const { isApproved } = req.body; // boolean

  const seller = Users.findById(sId);
  if (!seller || seller.role !== "seller") {
    return res.status(404).json({ message: "Seller account matching ID not found." });
  }

  try {
    const updated = Users.findByIdAndUpdate(sId, { isApprovedSeller: isApproved === true });
    return res.json({
      message: isApproved ? "Seller approved successfully!" : "Seller approval reversed.",
      seller: { id: updated!.id, fullName: updated!.fullName, isApprovedSeller: updated!.isApprovedSeller }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save approval update." });
  }
});

// 4. GET Analytics Dashboard
router.get("/analytics", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  const allOrders = Orders.find();
  const allUsers = Users.find();
  const allProducts = Products.find();

  // Metrics calculation
  let totalRevenue = 0;
  let totalCommission = 0;
  let verifiedOrdersCount = 0;
  let pendingQRVerificationCount = 0;

  allOrders.forEach((o) => {
    if (o.status !== "Cancelled") {
      totalRevenue += o.totalAmount - o.deliveryCharge; // product sales subtotal
      if (o.paymentVerified) {
        totalCommission += o.commissionAmount;
        verifiedOrdersCount++;
      } else {
        pendingQRVerificationCount++;
      }
    }
  });

  const usersCount = allUsers.filter((u) => u.role === "user").length;
  const sellersCount = allUsers.filter((u) => u.role === "seller").length;
  const productsCount = allProducts.length;

  // Daily Sales logs (group orders by creation date)
  const salesByDate: { [date: string]: { revenue: number; commission: number; orders: number } } = {};
  allOrders.forEach((order) => {
    if (order.status !== "Cancelled") {
      const date = order.createdAt.substring(0, 10);
      if (!salesByDate[date]) {
        salesByDate[date] = { revenue: 0, commission: 0, orders: 0 };
      }
      salesByDate[date].revenue += order.totalAmount - order.deliveryCharge;
      salesByDate[date].commission += order.commissionAmount;
      salesByDate[date].orders += 1;
    }
  });

  const dailySalesReport = Object.entries(salesByDate).map(([date, stats]) => ({
    date,
    revenue: Number(stats.revenue.toFixed(2)),
    commission: Number(stats.commission.toFixed(2)),
    ordersCount: stats.orders
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Category sales breakdown
  const categorySalesMap: { [cat: string]: number } = {};
  allOrders.forEach((order) => {
    if (order.status !== "Cancelled") {
      order.items.forEach((item) => {
        const prod = Products.findById(item.productId);
        const cat = prod ? prod.category : "local_products";
        if (!categorySalesMap[cat]) categorySalesMap[cat] = 0;
        categorySalesMap[cat] += item.price * item.quantity;
      });
    }
  });

  const categoryBreakdown = Object.entries(categorySalesMap).map(([category, value]) => ({
    category,
    value: Number(value.toFixed(2))
  }));

  return res.json({
    metrics: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalCommission: Number(totalCommission.toFixed(2)),
      verifiedOrdersCount,
      pendingQRVerificationCount,
      usersCount,
      sellersCount,
      productsCount
    },
    dailySalesReport,
    categoryBreakdown
  });
});

// 5. UPDATE GPay global configuration details
router.put("/gpay-qr", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  const { gpayId, qrImageUrl } = req.body;

  if (!gpayId || !qrImageUrl) {
    return res.status(400).json({ message: "GPay ID and QR Image URL are required." });
  }

  try {
    GPayConfigs.findByIdAndUpdate("global", {
      gpayId,
      qrImageUrl
    });
    return res.json({
      message: "GPay configuration updated successfully.",
      config: GPayConfigs.findOne({ id: "global" })
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to save GPay details." });
  }
});

// 6. UPDATE specific delivery charge rates or create new district entry
router.put("/delivery-charges", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  const { districtEN, districtTA, charge, estimatedDays } = req.body;

  if (!districtEN || !districtTA || charge === undefined || !estimatedDays) {
    return res.status(400).json({ message: "Mandatory shipping details missing." });
  }

  try {
    const existing = DeliveryCharges.findOne((d) => d.districtEN.toLowerCase() === districtEN.toLowerCase());

    let updatedDoc;
    if (existing) {
      updatedDoc = DeliveryCharges.findByIdAndUpdate(existing.id, {
        charge: Number(charge),
        estimatedDays: Number(estimatedDays),
        districtTA: districtTA
      });
    } else {
      updatedDoc = DeliveryCharges.create({
        districtEN,
        districtTA,
        charge: Number(charge),
        estimatedDays: Number(estimatedDays)
      });
    }

    return res.json({
      message: "Delivery charge rate configured.",
      deliveryCharge: updatedDoc
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to configure delivery scale." });
  }
});

// 7. GET list of all delivery charges configurations
router.get("/delivery-charges", authenticateToken, (req: CustomRequest, res: Response) => {
  return res.json(DeliveryCharges.find());
});

// 8. GET raw database files for inspection
router.get("/database-raw", authenticateToken, requireRole(["admin"]), (req: CustomRequest, res: Response) => {
  try {
    const DATA_DIR = path.join(process.cwd(), ".data");
    const usersPath = path.join(DATA_DIR, "users.json");
    const productsPath = path.join(DATA_DIR, "products.json");
    const ordersPath = path.join(DATA_DIR, "orders.json");

    const usersRaw = fs.existsSync(usersPath) ? fs.readFileSync(usersPath, "utf-8") : "[]";
    const productsRaw = fs.existsSync(productsPath) ? fs.readFileSync(productsPath, "utf-8") : "[]";
    // Check if orders.json exists, if not return empty array string
    const ordersRaw = fs.existsSync(ordersPath) ? fs.readFileSync(ordersPath, "utf-8") : "[]";

    // Standard raw JSON structures parsed and sent to clientside
    return res.json({
      users: JSON.parse(usersRaw),
      products: JSON.parse(productsRaw),
      orders: JSON.parse(ordersRaw)
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Failed to read database files: " + error.message });
  }
});

export default router;
