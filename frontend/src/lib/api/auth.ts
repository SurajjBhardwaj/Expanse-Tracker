import { api } from "../axios";
import Cookies from "js-cookie";

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (data: { email: string; password: string }) => {
    try {
      const response = await api.post<LoginResponse>("/auth/login", data);

      // Store token in localStorage and cookies for persistence
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        Cookies.set("token", response.data.token, { expires: 7 }); // Token expires in 7 days

        // Update axios headers for future requests
        api.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
      }

      // Store user data
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error("Login API error:", error);
      throw error;
    }
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  logout: async () => {
    try {
      const response = await api.post("/auth/logout");

      // Clear token from local storage, cookies, and axios headers
      localStorage.removeItem("token");
      localStorage.removeItem("lia-token");
      Cookies.remove("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common.Authorization;

      return response.data;
    } catch (error) {
      // Still clear tokens even if API call fails
      localStorage.removeItem("token");
      localStorage.removeItem("lia-token");
      Cookies.remove("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common.Authorization;

      throw error;
    }
  },

  getUserInfo: async () => {
    const response = await api.get("/auth/current");

    // Update stored user data if needed
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },
};
