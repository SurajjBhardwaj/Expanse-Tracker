import prisma from "../db";
import { RequestHandler } from "express";
import { z } from "zod";

const expanseSchemaProps = {
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(0, "Amount must be a positive number"),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
};

export const createExpanse: RequestHandler = async (req: any, res) => {
  try {
    // Preprocess the date field to convert it to a Date object if it's a string
    // console.log("Validated data:", req.body);

    const validatedData = z.object(expanseSchemaProps).parse(req.body);
    const date = validatedData.date ? new Date(validatedData.date) : new Date(); // Default to current date if not provided

    // console.log("Parsed date:", date);
    // console.log("req.user:", req.user);

    // Validate userId format (ensure it's a valid ObjectId)
    if (!req.user || !req.user.userId) {
      res.status(400).json({ error: "Invalid user ID" });
      return; // Prevent further execution
    }

    // Create expanse
    const result = await prisma.expanse.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        description: validatedData.description || "",
        category: validatedData.category || "",
        date: date,
        user: {
          connect: { id: req.user.userId }, // Assuming req.user contains the authenticated user's ID
        },
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating expanse:", error);
    res.status(400).json({
      error: "Failed to create expanse",
      message: (error as Error).message,
    });
    return; // Prevent further execution
  }
};

export const getExpanses: RequestHandler = async (req: any, res) => {
  try {
    const expanses = await prisma.expanse.findMany({
      where: { userId: req.user.id }, // Assuming req.user contains the authenticated user's ID
      orderBy: { date: "desc" },
    });

    res.status(200).json(expanses);
  } catch (error) {
    console.error("Error fetching expanses:", error);
    res.status(500).json({ error: "Failed to fetch expanses" });
  }
};

export const getExpanseById: RequestHandler = async (req: any, res) => {
  try {
    const expanseId = req.params.id;

    if (!expanseId) {
      res.status(400).json({ error: "Expanse ID is required" });
    }

    const expanse = await prisma.expanse.findUnique({
      where: { id: expanseId },
    });

    if (!expanse) {
      res.status(404).json({ error: "Expanse not found" });
    }

    res.status(200).json(expanse);
  } catch (error) {
    console.error("Error fetching expanse:", error);
    res.status(500).json({ error: "Failed to fetch expanse" });
  }
};

export const updateExpanse: RequestHandler = async (req: any, res) => {
  try {
    const expanseId = req.params.id;

    if (!expanseId) {
      res.status(400).json({ error: "Expanse ID is required" });
    }

    const existingExpanse = await prisma.expanse.findUnique({
      where: {
        id: expanseId,
        userId: req.user.userId, // Assuming req.user contains the authenticated user's ID
      },
    });

    if (!existingExpanse) {
      res.status(404).json({ error: "Expanse not found" });
      return;
    }

    const validatedData = z.object(expanseSchemaProps).parse(req.body);

    // console.log("Validated data:", validatedData);

    const expanse = await prisma.expanse.update({
      where: { id: expanseId },
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        description: validatedData.description || "",
        category: validatedData.category || "",
        date: validatedData?.date ? new Date(validatedData.date) : new Date(), // Default to current date if not provided
      },
    });

    res.status(200).json(expanse);
  } catch (error) {
    console.error("Error updating expanse:", error);
    res.status(500).json({ error: "Failed to update expanse" });
  }
};

export const deleteExpanse: RequestHandler = async (req: any, res) => {
  try {
    const expanseId = req.params.id;

    if (!expanseId) {
      res.status(400).json({ error: "Expanse ID is required" });
    }

    await prisma.expanse.delete({
      where: { id: expanseId },
    });

    res.status(204).send({ message: " Expanse deleted successfully" });
  } catch (error) {
    console.error("Error deleting expanse:", error);
    res.status(500).json({ error: "Failed to delete expanse" });
  }
};
