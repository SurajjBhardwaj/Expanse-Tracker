import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, addDays } from "date-fns";

interface Expense {
  id: string;
  name: string;
  description?: string;
  amount: number;
  updatedAt: string; // Date when it was moved to trash
}

export default function TrashTab() {
  const queryClient = useQueryClient();

  const {
    data: trashedExpenses = [],
    isLoading,
    isError,
    error,
  } = useQuery<Expense[]>({
    queryKey: ["trash"],
    queryFn: () => api.get("/expanse/trash").then((res) => res.data),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => api.put(`/expanse/trash/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const deletePermanentlyMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/expanse/trash/${id}/permanent`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trash"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">
        Error loading trashed expenses: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
        Trashed Expenses
      </h2>

      {trashedExpenses.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No trashed expenses found.
        </p>
      ) : (
        <ul className="space-y-2">
          {trashedExpenses.map((expense) => {
            const deletionDate = addDays(new Date(expense.updatedAt), 30);
            const daysLeft = formatDistanceToNow(deletionDate, {
              addSuffix: true,
            });

            return (
              <li
                key={expense.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {expense.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {expense.description || "No description"}
                    </p>
                    <p className="text-sm text-red-500">
                      Permanently deleted {daysLeft}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restoreMutation.mutate(expense.id)}
                      disabled={
                        restoreMutation.status === "pending" ||
                        restoreMutation.status === "success"
                      }
                    >
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        deletePermanentlyMutation.mutate(expense.id)
                      }
                      disabled={
                        deletePermanentlyMutation.status === "pending" ||
                        deletePermanentlyMutation.status === "success"
                      }
                    >
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
