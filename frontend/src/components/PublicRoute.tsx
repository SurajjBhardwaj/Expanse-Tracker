"use client";

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children: ReactNode;
}

/**
 * PublicRoute component prevents authenticated users from accessing public pages
 * like login and signup. If they're already logged in, they get redirected to the dashboard.
 */
export default function PublicRoute({ children }: PublicRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  console.log("Public Route - Auth State:", {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    path: location.pathname,
  });

  if (auth.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the public route content
  return <>{children}</>;
}
