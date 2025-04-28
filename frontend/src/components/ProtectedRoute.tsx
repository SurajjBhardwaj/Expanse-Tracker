"use client";

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  // console.log("Protected Route - Auth State:", {
  //   isLoading: auth.isLoading,
  //   isAuthenticated: auth.isAuthenticated,
  //   user: auth.user,
  //   path: location.pathname,
  // });

  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    // Redirect to login but remember where the user was trying to go
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
