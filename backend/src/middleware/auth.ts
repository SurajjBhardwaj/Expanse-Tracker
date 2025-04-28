import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db";

declare module "jsonwebtoken";

interface JWTPayload {
  userId: string;
  role: string;
}

// Helper function to extract token from request
const getTokenFromRequest = (req: Request): string | null => {
  // First try to get token from cookies (more secure)
  const cookieToken = req.cookies && req.cookies["auth-token"];
  if (cookieToken) return cookieToken;

  // Fall back to Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
};

// Main authentication middleware that verifies the token and attaches user to request
export const isAuthenticated = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach full user object to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Simplified middleware that only verifies token without database lookup
export const authMiddleware: RequestHandler = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
    }
    const decoded = jwt.verify(
      token!,
      process.env.JWT_SECRET!
    ) as unknown as JWTPayload;
    console.log("Decoded token:", decoded);

    // Attach decoded token data to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
