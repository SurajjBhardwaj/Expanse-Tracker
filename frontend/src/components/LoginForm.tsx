"use client";

import type React from "react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formFocused, setFormFocused] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await auth.login(email, password);
  };

  return (
    <div className="w-full py-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-white"
            >
              Email address
            </Label>
          </div>
          <div
            className={`relative transition-all duration-300 group ${
              formFocused === "email"
                ? "ring-2 ring-violet-600 ring-offset-1"
                : ""
            }`}
          >
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-600" />
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFormFocused("email")}
              onBlur={() => setFormFocused(null)}
              className="pl-10 py-6 h-auto border-gray-300 focus:border-violet-600 focus:ring-0"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 dark:text-white"
            >
              Password
            </Label>
          </div>
          <div
            className={`relative transition-all duration-300 group ${
              formFocused === "password"
                ? "ring-2 ring-violet-600 ring-offset-1"
                : ""
            }`}
          >
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-600" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFormFocused("password")}
              onBlur={() => setFormFocused(null)}
              className="pl-10 pr-10 py-6 h-auto border-gray-300 focus:border-violet-600 focus:ring-0"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {auth.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 text-sm rounded-md bg-red-50 text-red-600 border border-red-200"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{auth.error}</span>
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full py-6 h-auto text-base font-medium bg-violet-600 hover:bg-violet-700 transition-all"
          disabled={auth.isLoading}
        >
          {auth.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-violet-600 hover:text-violet-800 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
