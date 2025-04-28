import { api } from "../axios";
import { removeToken, setToken } from "../token";
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
    // console.log("Login response:", response);
    if (response.token) {
      setToken(response.token);
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
    // Clear token from local storage and cookies
    localStorage.removeItem("lia-token");
    Cookies.remove("token");
    localStorage.removeItem("user");
    return response;
  },

  getUserInfo: async () => {
    const response = await api.get("/auth/current");
    return response;
  },
};
