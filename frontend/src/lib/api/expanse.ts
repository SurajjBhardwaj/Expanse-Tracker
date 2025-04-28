import { api } from "../axios";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  description?: string;
  category?: string;
  date?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ExpenseParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  category?: string;
}

export interface ExpenseResponse {
  data: Expense[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface ExpenseCreateUpdateData {
  name: string;
  amount: number;
  description?: string;
  category?: string;
  date?: string;
}

export const expenseApi = {
  createExpense: async (data: ExpenseCreateUpdateData) => {
    const response = await api.post<Expense>("/expanse", data);
    return response.data;
  },

  getExpenses: async (params: ExpenseParams = {}) => {
    const response = await api.get<ExpenseResponse>("/expanse", { params });
    return response.data;
  },

  getExpenseById: async (id: string) => {
    const response = await api.get<Expense>(`/expanse/${id}`);
    return response.data;
  },

  updateExpense: async (id: string, data: ExpenseCreateUpdateData) => {
    const response = await api.put<Expense>(`/expanse/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string) => {
    const response = await api.delete(`/expanse/${id}`);
    return response.data;
  },
};
