"use client";

import LoginForm from "@/components/LoginForm";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center md:flex-row bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mb-8 text-center border rounded-xl p-10 bg-white dark:bg-gray-800 shadow-lg">
        <p className="text-muted-foreground mt-2">
          Login to your account to get started
        </p>
        <LoginForm />
        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-violet-600 hover:text-violet-800 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}
