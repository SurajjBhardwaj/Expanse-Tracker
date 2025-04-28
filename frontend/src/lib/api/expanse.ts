import { api } from "../axios";

export const expanseAPi = {
  createExpanse: async (data: {
    name: string;
    amount: number;
    description?: string;
    category?: string;
    date?: string;
  }) => {
    const response = await api.post("/expanse", data);
    return response;
  },

  getExpanses: async (params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    category?: string;
  }) => {
    const response = await api.get("/expanse", { params });
    return response;
  },
  getExpanseById: async (id: string) => {
    const response = await api.get(`/expanse/${id}`);
    return response;
  },
  updateExpanse: async (
    id: string,
    data: {
      name: string;
      amount: number;
      description?: string;
      category?: string;
      date?: string;
    }
  ) => {
    const response = await api.put(`/expanse/${id}`, data);

    return response;
  },
  deleteExpanse: async (id: string) => {
    const response = await api.delete(`/expanse/${id}`);
    return response;
  },
};
