import {
  createExpanse,
  deleteExpanse,
  getExpanseById,
  getExpanses,
  updateExpanse,
  getTrash,
  restoreExpanse,
  deleteExpansePermanently,
} from "../controller/expanseController";
import express from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// Ensure `/trash` is matched before `/:id`
router.get("/trash", authMiddleware, getTrash);
router.get("/", authMiddleware, getExpanses);
router.get("/:id", authMiddleware, getExpanseById);
router.post("/", authMiddleware, createExpanse);
router.put("/:id", authMiddleware, updateExpanse);
router.put("/trash/:id/restore", authMiddleware, restoreExpanse);
router.delete("/:id", authMiddleware, deleteExpanse);
router.delete("/trash/:id/permanent", authMiddleware, deleteExpansePermanently);

export default router;
