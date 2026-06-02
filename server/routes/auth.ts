import express, { Response } from "express";
import { Users, Carts } from "../db.js";
import { hashPassword, comparePassword, generateToken, authenticateToken, CustomRequest } from "../utils/auth.js";

const router = express.Router();

// User/Seller Registration
router.post("/register", async (req: express.Request, res: express.Response) => {
  const {
    fullName,
    age,
    phoneNumber,
    email,
    password,
    fullAddress,
    district,
    pincode,
    aadhaarNumber,
    aadhaarPhotoUrl,
    profilePhotoUrl,
    role
  } = req.body;

  if (!fullName || !phoneNumber || !email || !password || !district || !pincode || !aadhaarNumber) {
    return res.status(400).json({ message: "Mandatory fields are missing." });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email structure." });
  }

  try {
    const existingUser = Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const hashed = await hashPassword(password);
    
    // Set appropriate starting flags
    const userRole = role === "seller" ? "seller" : "user";
    const isApprovedSeller = userRole === "seller" ? false : undefined; // Sellers must be approved by admin

    const newUser = Users.create({
      fullName,
      age: Number(age) || 21,
      phoneNumber,
      email,
      passwordHash: hashed,
      fullAddress,
      district,
      pincode,
      aadhaarNumber,
      aadhaarPhotoUrl: aadhaarPhotoUrl || "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=200", // placeholder
      profilePhotoUrl: profilePhotoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200", // avatar placeholder
      role: userRole,
      isBlocked: false,
      isApprovedSeller,
      createdAt: new Date().toISOString()
    });

    // Create empty cart for users
    if (userRole === "user") {
      Carts.create({
        id: newUser.id,
        items: []
      });
    }

    const token = generateToken(newUser);

    // Hide password before returning
    const { passwordHash, ...userResponse } = newUser;

    return res.status(201).json({
      message: userRole === "seller" ? "Seller profile submitted. Subject to admin approval." : "Registration successful.",
      token,
      user: userResponse
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error during registration." });
  }
});

// User/Seller Login
router.post("/login", async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = Users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been suspended by administration." });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    const token = generateToken(user);
    const { passwordHash, ...userResponse } = user;

    return res.json({
      message: "Login successful.",
      token,
      user: userResponse
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error during login." });
  }
});

// Admin Login Shortcut Endpoint (or normal authentication check)
router.post("/admin-login", async (req: express.Request, res: express.Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const user = Users.findOne({ email, role: "admin" });
    if (!user) {
      return res.status(401).json({ message: "Admin credentials unauthorized." });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const token = generateToken(user);
    const { passwordHash, ...userResponse } = user;

    return res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
});

// Fetch Profile status of log-in account
router.get("/me", authenticateToken, (req: CustomRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized." });

  const user = Users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const { passwordHash, ...userResponse } = user;
  return res.json(userResponse);
});

// Update Profile Detail or Addresses
router.put("/profile/update", authenticateToken, (req: CustomRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized." });

  const { fullName, age, phoneNumber, fullAddress, district, pincode } = req.body;

  try {
    const updated = Users.findByIdAndUpdate(req.user.id, {
      fullName: fullName || undefined,
      age: age ? Number(age) : undefined,
      phoneNumber: phoneNumber || undefined,
      fullAddress: fullAddress || undefined,
      district: district || undefined,
      pincode: pincode || undefined
    });

    if (!updated) {
      return res.status(404).json({ message: "User not found." });
    }

    const { passwordHash, ...userResponse } = updated;
    return res.json({
      message: "Profile updated successfully.",
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile." });
  }
});

export default router;
