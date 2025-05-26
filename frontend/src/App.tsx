import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import { Suspense, lazy } from "react";

// Lazy load pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              Loading...
            </div>
          }
        >
          <AuthProvider>
            <Routes>
              {/* Public routes - redirect to dashboard if already logged in */}
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
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Protected routes - require authentication */}
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
