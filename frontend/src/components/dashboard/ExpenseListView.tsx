"use client";

import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Expense } from "@/lib/api/expanse";
import { Badge } from "@/components/ui/badge";

interface ExpenseListViewProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export default function ExpenseListView({
  expenses,
  onEdit,
  onDelete,
}: ExpenseListViewProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="rounded-md border overflow-hidden bg-white dark:bg-gray-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{expense.name}</div>
                  {expense.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
                      {expense.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {expense.category ? (
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20"
                  >
                    {expense.category}
                  </Badge>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                {expense.date
                  ? format(new Date(expense.date), "MMM d, yyyy")
                  : "-"}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(expense.amount)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(expense)}
                    aria-label={`Edit ${expense.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(expense.id)}
                    aria-label={`Delete ${expense.name}`}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
