import {
  createExpanse,
  deleteExpanse,
  getExpanseById,
  getExpanses,
  updateExpanse,
} from "../controller/expanseController";
import express from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

router.get("/", authMiddleware, getExpanses);
router.get("/:id", authMiddleware, getExpanseById);
router.post("/", authMiddleware, createExpanse);
router.put("/:id", authMiddleware, updateExpanse);
router.delete("/:id", authMiddleware, deleteExpanse);

export default router;
