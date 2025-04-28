import { api } from "../axios";
import { setToken } from "../token";
import Cookies from "js-cookie";

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const response = await api.post<LoginResponse>("/auth/login", data);
    console.log("Login response:", response);
    if (response.token) {
      setToken(response.token);
      localStorage.setItem("token", response.token);
      Cookies.set("token", response.token, { expires: 7 }); // Token expires in 7 days
    }
    return response;
  },

  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post("/auth/signup", data);
    return response;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response;
  },

  getUserInfo: async () => {
    const response = await api.get("/auth/current");
    return response;
  },
};
