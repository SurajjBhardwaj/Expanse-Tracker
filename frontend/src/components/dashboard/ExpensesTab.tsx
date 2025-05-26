"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  expenseApi,
  type Expense,
  type ExpenseParams,
} from "@/lib/api/expanse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { Plus, List, Grid, Search } from "lucide-react";
import ExpenseListView from "./ExpenseListView";
import ExpenseCardView from "./ExpenseCardView";
import ExpenseFormModal from "./ExpenseFormModal";
import { toast } from "sonner";

export default function ExpensesTab() {
  // State for view type (list or card)
  const [viewType, setViewType] = useState<"list" | "card">("list");

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Query client for mutations
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedCategory]);

  // Build query params
  const queryParams: ExpenseParams = {
    page: currentPage,
    limit: pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: debouncedSearchTerm,
    ...(selectedCategory && selectedCategory !== "all"
      ? { category: selectedCategory }
      : {}),
  };

  // Fetch expenses
  const {
    data: expensesData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["expenses", queryParams],
    queryFn: () => expenseApi.getExpenses(queryParams),
  });

  // Delete mutation with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: expenseApi.deleteExpense,
    onMutate: async (expenseId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["expenses"] });

      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData([
        "expenses",
        queryParams,
      ]);

      // Optimistically update to the new value
      queryClient.setQueryData(["expenses", queryParams], (old: any) => {
        return {
          ...old,
          data: old.data.filter((expense: Expense) => expense.id !== expenseId),
        };
      });

      // Return a context object with the snapshot
      return { previousExpenses };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["expenses", queryParams],
        context?.previousExpenses
      );
      toast.error("Failed to delete expense");
    },
    onSuccess: () => {
      toast.success("Expense deleted successfully");
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  // Handle expense deletion
  const handleDeleteExpense = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate(id);
    }
  };

  // Handle editing expense
  const handleEditExpense = (expense: Expense) => {
    console.log("Editing expense:", expense);
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  // Extract unique categories for filter dropdown
  const categories = expensesData?.data
    ? Array.from(
        new Set(
          expensesData.data.map((expense) => expense.category).filter(Boolean)
        )
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top controls: Add button, view toggle, search, and filter */}
      <div className="space-y-4">
        {/* Add button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>

          {/* View toggle */}
          <div className="hidden sm:flex bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-1">
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("card")}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View toggle for mobile */}
          <div className="flex sm:hidden bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-1 self-start">
            <Button
              variant={viewType === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("list")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("card")}
              className="rounded-l-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Category filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="z-100 bg-white dark:bg-gray-800">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category || ""}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">
          Error loading expenses: {(error as Error).message}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && expensesData?.data.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No expenses found
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {debouncedSearchTerm || selectedCategory
              ? "Try adjusting your search or filters"
              : "Get started by adding your first expense"}
          </p>
          {!debouncedSearchTerm && !selectedCategory && (
            <Button onClick={() => setIsModalOpen(true)} className="mt-4">
              Add Expense
            </Button>
          )}
        </div>
      )}

      {/* Expense list/card view */}
      {!isLoading &&
        !isError &&
        expensesData?.data &&
        expensesData.data.length > 0 && (
          <>
            {viewType === "list" ? (
              <div className="overflow-x-auto">
                <ExpenseListView
                  expenses={expensesData.data}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                />
              </div>
            ) : (
              <ExpenseCardView
                expenses={expensesData.data}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            )}

            {/* Pagination */}
            {expensesData.meta.totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={expensesData.meta.totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

      {/* Add/Edit Expense Modal */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
      />
    </div>
  );
}
