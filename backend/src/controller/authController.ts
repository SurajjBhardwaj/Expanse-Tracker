import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../db";
import { Request, Response } from "express";
import { RequestHandler } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";

declare module "bcryptjs";
declare module "jsonwebtoken";

// Validation schemas
const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

const setAuthCookie = (res: Response, token: string) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.setHeader(
    "Set-Cookie",
    `auth-token=${token}; HttpOnly; ${
      isProduction ? "Secure;" : ""
    } SameSite=None; Path=/; Max-Age=${7 * 24 * 60 * 60}`
  );
  return;
};

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const signup: RequestHandler = async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const result = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    //console.log(result);
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.id,
        role: result.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set JWT token in cookie
    const data = setAuthCookie(res, token);

    //console.log("req:", req);

    // Return success response
    res.status(201).json({
      message: "User created successfully",
      token, // Still include token in response for client-side storage if needed
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        role: result.role,
      },
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    }
    console.error("Signup error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
};

export const login: RequestHandler = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    // Verify password
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const validPassword = await bcrypt.compare(
      validatedData.password,
      user.password!
    );
    if (!validPassword) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    // Update last login
    const userData = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set JWT token in cookie
    const data = setAuthCookie(res, token);
    // Return success response
    res.json({
      token, // Still include token in response for client-side storage if needed
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        lastLogin: userData.lastLogin,
      },
    });
    return;
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
    return;
  }
};

export const logout = async (req: Request, res: Response) => {
  // Clear the auth cookie - make sure options match those used when setting the cookie
  res.clearCookie("auth-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax", // 'lax' is more permissive than 'strict'
    // Don't include domain for localhost
  });

  // For debugging
  console.log("Clearing auth-token cookie");

  res.json({ message: "Logged out successfully" });
  return;
};

export const getCurrentUser: RequestHandler = async (
  req: any,
  res: Response
) => {
  try {
    const userId = req.user.userId; // From auth middleware
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    //console.log(user);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      // it's not a mistake, we are returning here
      // because we don't want to continue if user is not found

      // then you will say you can return while sending response, BUT IN THE EXPRES JS CURRENT VERSION, they are saying that they will return by ownself, but if i am not typing return, type error is occuring
      return;
    }

    // Return user without sensitive data
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    return;
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "Failed to get user data" });
    return;
  }
};

export const requestPasswordReset: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt: expiry },
    });

    const resetLink = `${process.env.CLIENT_URL}password-reset/${token}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      text: `Click the link to reset your password: ${resetLink}`,
    });

    res.json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      res.status(400).json({ error: "Invalid or expired token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({ where: { token } });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};
