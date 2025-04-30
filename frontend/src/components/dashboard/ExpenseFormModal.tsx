"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  expenseApi,
  type Expense,
  type ExpenseCreateUpdateData,
} from "@/lib/api/expanse";
import { toast } from "sonner";

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: Expense | null;
}

// Common expense categories
const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Shopping",
  "Travel",
  "Other",
];

export default function ExpenseFormModal({
  isOpen,
  onClose,
  expense,
}: ExpenseFormModalProps) {
  // Form state
  const [formData, setFormData] = useState<ExpenseCreateUpdateData>({
    name: "",
    amount: 0,
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD for date input
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Query client for mutations
  const queryClient = useQueryClient();

  // Reset form when modal opens/closes or expense changes
  useEffect(() => {
    if (isOpen) {
      if (expense) {
        setFormData({
          name: expense.name,
          amount: expense.amount,
          description: expense.description || "",
          category: expense.category || "",
          date: expense.date
            ? new Date(expense.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        });
      } else {
        setFormData({
          name: "",
          amount: 0,
          description: "",
          category: "",
          date: new Date().toISOString().split("T")[0],
        });
      }
      setErrors({});
    }
  }, [isOpen, expense]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: expenseApi.createExpense,
    onMutate: async (newExpense) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["expenses"] });

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData(["expenses"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["expenses"], (old: any) => {
        // Create a temporary ID for the new expense
        const tempId = `temp-${Date.now()}`;
        const optimisticExpense = {
          id: tempId,
          ...newExpense,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: "current-user", // This will be replaced by the actual ID from the server
        };

        return {
          ...old,
          data: [optimisticExpense, ...(old?.data || [])],
        };
      });

      // Return a context object with the snapshot
      return { previousExpenses };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["expenses"], context?.previousExpenses);
      toast.error("Failed to create expense");
    },
    onSuccess: () => {
      toast.success("Expense created successfully");
      onClose();
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ExpenseCreateUpdateData;
    }) => {
      console.log("Updating expense:", id, data);
      return expenseApi.updateExpense(id, data);
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["expenses"] });

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData(["expenses"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["expenses"], (old: any) => {
        return {
          ...old,
          data: old.data.map((expense: Expense) =>
            expense.id === id
              ? { ...expense, ...data, updatedAt: new Date().toISOString() }
              : expense
          ),
        };
      });

      // Return a context object with the snapshot
      return { previousExpenses };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["expenses"], context?.previousExpenses);
      toast.error("Failed to update expense");
    },
    onSuccess: () => {
      toast.success("Expense updated successfully");
      onClose();
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Form submitted with data:", formData);
    console.log("Editing expense:", expense);

    // Convert date string to ISO string for API
    const formDataWithFullDate = {
      ...formData,
      date: formData.date
        ? new Date(`${formData.date}T00:00:00`).toISOString()
        : new Date().toISOString(),
    };

    if (expense) {
      try {
        console.log(
          `Updating expense ${expense.id} with:`,
          formDataWithFullDate
        );
        updateMutation.mutate({
          id: expense.id,
          data: {
            name: formDataWithFullDate.name,
            amount: Number(formDataWithFullDate.amount),
            description: formDataWithFullDate.description,
            category: formDataWithFullDate.category,
            date: formDataWithFullDate.date,
          },
        });
      } catch (error) {
        console.error("Error in update mutation:", error);
      }
    } else {
      createMutation.mutate(formDataWithFullDate);
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) || 0 : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Check if mutation is in progress
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>
            {expense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Expense name"
              className={errors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={errors.amount ? "border-red-500" : ""}
              disabled={isSubmitting}
              min="0"
              step="0.01"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="category" className="text-foreground">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="z-100 bg-white dark:bg-gray-900">
                {EXPENSE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details about this expense"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {expense ? "Update" : "Create"} Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
