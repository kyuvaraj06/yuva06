import express, { Response } from "express";
import { Products, Users, DBProduct, DBReview } from "../db.js";
import { authenticateToken, requireRole, CustomRequest } from "../utils/auth.js";

const router = express.Router();

// Get list of all products, with optional filters
router.get("/", (req: express.Request, res: express.Response) => {
  const { category, sellerId, search } = req.query;
  let list = Products.find();

  if (category) {
    list = list.filter((p) => p.category === category);
  }
  if (sellerId) {
    list = list.filter((p) => p.sellerId === sellerId);
  }
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter((p) => 
      p.nameEN.toLowerCase().includes(q) ||
      p.nameTA.toLowerCase().includes(q) ||
      p.descriptionEN.toLowerCase().includes(q) ||
      p.descriptionTA.toLowerCase().includes(q) ||
      p.district.toLowerCase().includes(q)
    );
  }

  return res.json(list);
});

// Search products explicitly
router.get("/search", (req: express.Request, res: express.Response) => {
  const { query } = req.query;
  if (!query) {
    return res.json(Products.find());
  }
  const q = String(query).toLowerCase();
  const filtered = Products.find((p) => 
    p.nameEN.toLowerCase().includes(q) ||
    p.nameTA.toLowerCase().includes(q) ||
    p.descriptionEN.toLowerCase().includes(q) ||
    p.descriptionTA.toLowerCase().includes(q) ||
    p.district.toLowerCase().includes(q)
  );
  return res.json(filtered);
});

// Get products by specific category
router.get("/category/:category", (req: express.Request, res: express.Response) => {
  const category = req.params.category;
  const filtered = Products.find({ category: category as any });
  return res.json(filtered);
});

// Get detailed product view
router.get("/:id", (req: express.Request, res: express.Response) => {
  const product = Products.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }
  return res.json(product);
});

// Seller / Admin Add Product
router.post("/", authenticateToken, requireRole(["seller", "admin"]), (req: CustomRequest, res: Response) => {
  const {
    nameEN,
    nameTA,
    descriptionEN,
    descriptionTA,
    category,
    price,
    availableStock,
    availableStockUnitEN,
    availableStockUnitTA,
    images,
    healthBenefitsEN,
    healthBenefitsTA,
    deliveryAvailability
  } = req.body;

  if (!nameEN || !nameTA || !category || !price || !availableStock) {
    return res.status(400).json({ message: "Required fields (Name EN/TA, Category, Price, Stock) are missing." });
  }

  const user = Users.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: "Seller account verification failed." });
  }

  // If role is seller, check if approved
  if (user.role === "seller" && !user.isApprovedSeller) {
    return res.status(403).json({ message: "Your seller profile is awaiting administration approval." });
  }

  const pImageUrl = images && images.length > 0 ? images : ["https://images.unsplash.com/photo-1464226184884-fa280b87c3a1?q=80&w=200"];

  try {
    const newProduct = Products.create({
      sellerId: user.id,
      sellerName: user.fullName,
      nameEN,
      nameTA,
      descriptionEN,
      descriptionTA,
      category,
      price: Number(price),
      availableStock: Number(availableStock),
      availableStockUnitEN: availableStockUnitEN || "kg",
      availableStockUnitTA: availableStockUnitTA || "கிலோ",
      district: user.district,
      images: pImageUrl,
      reviews: [],
      healthBenefitsEN,
      healthBenefitsTA,
      deliveryAvailability: deliveryAvailability !== false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      message: "Product added successfully.",
      product: newProduct
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add product." });
  }
});

// Seller / Admin Update Product
router.put("/:id", authenticateToken, requireRole(["seller", "admin"]), (req: CustomRequest, res: Response) => {
  const pId = req.params.id;
  const product = Products.findById(pId);
  if (!product) {
    return res.status(404).json({ message: "Product not exist." });
  }

  // Only allow updating if own product or admin
  if (req.user!.role !== "admin" && product.sellerId !== req.user!.id) {
    return res.status(403).json({ message: "Unauthorized to edit this product." });
  }

  const {
    nameEN,
    nameTA,
    descriptionEN,
    descriptionTA,
    category,
    price,
    availableStock,
    availableStockUnitEN,
    availableStockUnitTA,
    images,
    healthBenefitsEN,
    healthBenefitsTA,
    deliveryAvailability
  } = req.body;

  try {
    const updated = Products.findByIdAndUpdate(pId, {
      nameEN: nameEN || undefined,
      nameTA: nameTA || undefined,
      descriptionEN: descriptionEN || undefined,
      descriptionTA: descriptionTA || undefined,
      category: category || undefined,
      price: price ? Number(price) : undefined,
      availableStock: availableStock !== undefined ? Number(availableStock) : undefined,
      availableStockUnitEN: availableStockUnitEN || undefined,
      availableStockUnitTA: availableStockUnitTA || undefined,
      images: images || undefined,
      healthBenefitsEN: healthBenefitsEN !== undefined ? healthBenefitsEN : undefined,
      healthBenefitsTA: healthBenefitsTA !== undefined ? healthBenefitsTA : undefined,
      deliveryAvailability: deliveryAvailability !== undefined ? deliveryAvailability : undefined
    });

    return res.json({
      message: "Product updated successfully.",
      product: updated
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update product." });
  }
});

// Seller / Admin Delete Product
router.delete("/:id", authenticateToken, requireRole(["seller", "admin"]), (req: CustomRequest, res: Response) => {
  const pId = req.params.id;
  const product = Products.findById(pId);
  
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  // Only allow if own product or admin
  if (req.user!.role !== "admin" && product.sellerId !== req.user!.id) {
    return res.status(403).json({ message: "Unauthorized to delete this product." });
  }

  try {
    Products.deleteOne({ id: pId });
    return res.json({ message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product." });
  }
});

// Add Review & Rating to a Product
router.post("/:id/review", authenticateToken, (req: CustomRequest, res: Response) => {
  const pId = req.params.id;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ message: "Rating and review comment are required." });
  }

  const product = Products.findById(pId);
  if (!product) {
    return res.status(404).json({ message: "Product not matching." });
  }

  const user = Users.findById(req.user!.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const newReview: DBReview = {
    id: "rev_" + Math.random().toString(36).substring(5),
    userId: user.id,
    userName: user.fullName,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString()
  };

  try {
    const updatedReviews = [...(product.reviews || []), newReview];
    Products.findByIdAndUpdate(pId, { reviews: updatedReviews });
    return res.status(201).json({
      message: "Review added successfully.",
      review: newReview,
      product: Products.findById(pId)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to post review." });
  }
});

export default router;
