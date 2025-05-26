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
                <div className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(expense)}
                    aria-label={`Edit ${expense.name}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  >
                    <Edit className="h-5 w-5" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(expense.id)}
                    aria-label={`Delete ${expense.name}`}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  >
                    <Trash2 className="h-5 w-5" />
                    Move to Trash
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
