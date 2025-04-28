"use client";

import { format } from "date-fns";
import { Edit, Trash2, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Expense } from "@/lib/api/expanse";
import { Badge } from "@/components/ui/badge";

interface ExpenseCardViewProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseCardView({
  expenses,
  onEdit,
  onDelete,
}: ExpenseCardViewProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenses.map((expense) => (
        <Card
          key={expense.id}
          className="overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-lg">{expense.name}</h3>
                  {expense.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {expense.description}
                    </p>
                  )}
                </div>
                <div className="text-xl font-bold text-primary">
                  {formatCurrency(expense.amount)}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                {expense.category && (
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {expense.category}
                    </Badge>
                  </div>
                )}
                {expense.date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 flex">
              <Button
                variant="ghost"
                className="flex-1 rounded-none py-4 h-auto text-sm"
                onClick={() => onEdit(expense)}
              >
                <Edit className="h-4 w-4 mr-2" /> Edit
              </Button>
              <div className="w-px bg-gray-100 dark:bg-gray-800" />
              <Button
                variant="ghost"
                className="flex-1 rounded-none py-4 h-auto text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={() => onDelete(expense.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
