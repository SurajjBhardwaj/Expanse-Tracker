"use client";

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
  children: ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  // Get the intended destination if it exists
  const from = location.state?.from || "/dashboard";

  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard or the intended destination
  if (auth.isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Otherwise, render the public route content
  return <>{children}</>;
}
