import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import { Suspense } from "react";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import { Loader2 } from "lucide-react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function LoadingSpinner() {
  return (
    <div className="flex h-screen min-w-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                }
              />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route
                path="/password-reset/:token"
                element={<PasswordResetPage />}
              />
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Redirect to login if no route matches */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </Suspense>
      </Router>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
