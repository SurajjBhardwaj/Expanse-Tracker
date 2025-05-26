"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/lib/api/auth";
import { Loader2 } from "lucide-react";

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
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

function LoadingSpinner() {
  return (
    <div className="flex h-screen min-w-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
    </div>
  );
}

// Create the auth provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (token && storedUser) {
        try {
          // Verify token is valid
          await authApi.getUserInfo();
          setUser(JSON.parse(storedUser));
        } catch (err) {
          // If token is invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("lia-token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      // Save user data
      if (response.user) {
        setUser(response.user);
      }

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Login failed. Please check your credentials."
      );
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // Register the user
      await authApi.register({ name, email, password });

      // After successful signup, redirect to login
      navigate("/login");
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear user data and token
      localStorage.removeItem("token");
      localStorage.removeItem("lia-token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };

  // Create the auth context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    error,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
