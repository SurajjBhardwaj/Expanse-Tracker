import LoginForm from "@/components/LoginForm";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    console.log("LoginPage mounted");
    console.log("user", user);
    console.log("isAuthenticated", isAuthenticated);
  }, []);
  return (
    <div className="min-h-screen w-screen border-blue-500 border-2 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold">Expense Tracker</h1>
        <p className="text-muted-foreground mt-2 border border-blue-100">
          Sign in to manage your expenses
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
