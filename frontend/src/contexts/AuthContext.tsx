"use client";

import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api/auth";
import { getToken } from "@/lib/token";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  error: null,
});

// Export the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          //console.log("Loaded user from storage:", JSON.parse(storedUser));
        }
      } catch (err) {
        console.error("Error loading user from storage:", err);
      }
      setIsLoading(false);
    };

    const checkAuth = async () => {
      const token = getToken();

      if (token) {
        try {
          setIsLoading(true);
          const response = await authApi.getUserInfo();
          const userData = response;

          // Save user to state and localStorage
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
          //console.log("Authenticated user:", userData);
        } catch (err) {
          console.error("Authentication error:", err);
          // Clear invalid tokens
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } finally {
          setIsLoading(false);
        }
      } else {
        // No token found, just finish loading
        loadUserFromStorage();
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });

      // Save user data to state
      setUser(response.user);

      //console.log("Login successful, user data:", response.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      setIsLoading(true);
      const response = await authApi.register({ name, email, password });
      if (response.status >= 200 && response.status < 300) {
        // Save user data to state
        navigate("/login");
      } else {
        setError(response.error);
        return;
      }
      // After successful signup, log the user in
    } catch (err: any) {
      setError(err.response?.data.errror || "Signup failed. Please try again.");
      console.error("Signup error:", err);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Even if the API call fails, clear local auth state
      setUser(null);
      navigate("/login");
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    login,
    signup,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export the hook
export const useAuth = () => {
  return useContext(AuthContext);
};
