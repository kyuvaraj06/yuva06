import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { Users, DBUser } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "tamil_agro_mart_secret_key_2026";

export interface CustomRequest extends Request {
  user?: {
    id: string;
    role: "user" | "seller" | "admin";
  };
}

// Generate JWT Token
export function generateToken(user: DBUser): string {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Auth Middleware: Verify Token
export function authenticateToken(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Token missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: "user" | "seller" | "admin" };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
}

// Role Authorization Middleware
export function requireRole(roles: ("user" | "seller" | "admin")[]) {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. Higher clearance required." });
    }

    // Verify blocked status of user
    const userDoc = Users.findById(req.user.id);
    if (userDoc && userDoc.isBlocked) {
      return res.status(403).json({ message: "Your account is temporarily suspended." });
    }

    next();
  };
}

// Password hashing helper
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Password verification helper
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Mock Email Dispatcher
export function sendEmailNotification(to: string, subject: string, message: string) {
  console.log("========================================");
  console.log(`📡 NODEMAILER EMAIL DISPATCH SIMULATED`);
  console.log(`📩 To: ${to}`);
  console.log(`🏷️ Subject: ${subject}`);
  console.log(`📝 Message:\n${message}`);
  console.log("========================================");
  return { success: true, messageId: "sim_" + Math.random().toString(36).substring(7) };
}
