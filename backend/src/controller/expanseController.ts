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
    // Ensure user is authenticated
    if (!req.user || !req.user.userId) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      sortBy = "date",
      sortOrder = "desc",
      search = "",
      category,
      minAmount,
      maxAmount,
      startDate,
      endDate,
    } = req.query;

    const userId = req.user.userId;

    // Validate and parse pagination parameters
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    if (
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      isNaN(pageSize) ||
      pageSize < 1
    ) {
      res.status(400).json({ error: "Invalid pagination parameters" });
      return;
    }

    // Validate sort order
    const validSortOrder =
      sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc";

    // Build filter conditions
    const filters: any = { userId: req.user.userId };
    if (category && category != "all") filters.category = category;
    if (minAmount)
      filters.amount = { ...filters.amount, gte: parseFloat(minAmount) };
    if (maxAmount)
      filters.amount = { ...filters.amount, lte: parseFloat(maxAmount) };
    if (startDate) filters.date = { ...filters.date, gte: new Date(startDate) };
    if (endDate) filters.date = { ...filters.date, lte: new Date(endDate) };
    if (search) {
      filters.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    filters.isDeleted = false; // Exclude deleted expanses

    console.log("Filters:", filters);

    // Fetch expanses with pagination, sorting, and filtering
    const expanses = await prisma.expanse.findMany({
      where: filters,
      orderBy: { [sortBy]: validSortOrder },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    // Fetch total count for pagination metadata
    const totalCount = await prisma.expanse.count({ where: filters });

    // Respond with data and metadata
    res.status(200).json({
      data: expanses,
      meta: {
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        currentPage: pageNumber,
        pageSize,
      },
    });
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

    const expanse = await prisma.expanse.update({
      where: { id: expanseId },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: "Expanse moved to trash", expanse });
  } catch (error) {
    console.error("Error deleting expanse:", error);
    res.status(500).json({ error: "Failed to delete expanse" });
  }
};

export const getTrash: RequestHandler = async (req: any, res) => {
  try {
    const userId = req.user.userId;

    const trashedExpenses = await prisma.expanse.findMany({
      where: { userId, isDeleted: true },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json(trashedExpenses);
  } catch (error) {
    console.error("Error fetching trashed expenses:", error);
    res.status(500).json({ error: "Failed to fetch trashed expenses" });
  }
};

export const restoreExpanse: RequestHandler = async (req: any, res) => {
  try {
    const expanseId = req.params.id;

    if (!expanseId) {
      res.status(400).json({ error: "Expanse ID is required" });
      return;
    }

    const expanse = await prisma.expanse.findUnique({
      where: { id: expanseId, userId: req.user.userId },
    });

    if (!expanse || !expanse.isDeleted) {
      res.status(404).json({ error: "Expanse not found or not in trash" });
      return;
    }

    const restoredExpanse = await prisma.expanse.update({
      where: { id: expanseId },
      data: { isDeleted: false },
    });

    res
      .status(200)
      .json({ message: "Expanse restored successfully", restoredExpanse });
  } catch (error) {
    console.error("Error restoring expanse:", error);
    res.status(500).json({ error: "Failed to restore expanse" });
  }
};

export const deleteExpansePermanently: RequestHandler = async (
  req: any,
  res
) => {
  try {
    const expanseId = req.params.id;

    if (!expanseId) {
      res.status(400).json({ error: "Expanse ID is required" });
      return;
    }

    const expanse = await prisma.expanse.findUnique({
      where: { id: expanseId, userId: req.user.userId },
    });

    if (!expanse || !expanse.isDeleted) {
      res.status(404).json({ error: "Expanse not found or not in trash" });
      return;
    }

    await prisma.expanse.delete({
      where: { id: expanseId },
    });

    res.status(200).json({ message: "Expanse permanently deleted" });
  } catch (error) {
    console.error("Error permanently deleting expanse:", error);
    res.status(500).json({ error: "Failed to permanently delete expanse" });
  }
};
