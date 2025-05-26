import {
  getCurrentUser,
  login,
  signup,
  logout,
  requestPasswordReset,
  resetPassword,
} from "../controller/authController";
import express from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/current", authMiddleware, getCurrentUser); // Corrected to use the getCurrentUser controller

router.post("/logout", authMiddleware, logout); // Corrected to use the logout controller
router.post("/login", login);
router.post("/signup", signup);
router.post("/password-reset", requestPasswordReset);
router.post("/password-reset/:token", resetPassword);

export default router;
