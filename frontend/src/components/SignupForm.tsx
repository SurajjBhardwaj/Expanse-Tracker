"use client";

import React from "react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api/auth";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formFocused, setFormFocused] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [Error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }
      setIsLoading(true);
      setError("");

      setPasswordError("");
      const response = await authApi.register({ name, email, password });
      if (response.status >= 200 && response.status < 300) {
        // Save user data to state
        navigate("/login");
      } else {
        setError(response.error);
        return;
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Signup failed. Please check your credentials."
      );
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
  };

  const isDisable = () => {
    if (isLoading) return true;
    if (!name || !email || !password || !confirmPassword) return true;
    if (password !== confirmPassword) return true;
    if (passwordStrength < 2) return true;
    return false;
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-white"
            >
              Full name
            </Label>
          </div>
          <div
            className={`relative transition-all duration-300 group ${
              formFocused === "name"
                ? "ring-2 ring-violet-600 ring-offset-1"
                : ""
            }`}
          >
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-600" />
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFormFocused("name")}
              onBlur={() => setFormFocused(null)}
              className="pl-10 py-6 h-auto border-gray-300 focus:border-violet-600 focus:ring-0"
              required
            />
          </div>
        </div>

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
              onChange={handlePasswordChange}
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

          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i < passwordStrength
                        ? passwordStrength === 1
                          ? "bg-red-400"
                          : passwordStrength === 2
                          ? "bg-yellow-400"
                          : passwordStrength === 3
                          ? "bg-green-400"
                          : "bg-green-600"
                        : "bg-gray-200"
                    }`}
                  ></div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {password.length >= 8 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  <span
                    className={
                      password.length >= 8 ? "text-green-700" : "text-gray-500"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/[A-Z]/.test(password) ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  <span
                    className={
                      /[A-Z]/.test(password)
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    Uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/[0-9]/.test(password) ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  <span
                    className={
                      /[0-9]/.test(password)
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    Number
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {/[^A-Za-z0-9]/.test(password) ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Info className="h-3.5 w-3.5 text-gray-400" />
                  )}
                  <span
                    className={
                      /[^A-Za-z0-9]/.test(password)
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    Special character
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700 dark:text-white"
            >
              Confirm password
            </Label>
          </div>
          <div
            className={`relative transition-all duration-300 group ${
              formFocused === "confirmPassword"
                ? "ring-2 ring-violet-600 ring-offset-1"
                : ""
            }`}
          >
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-violet-600" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setFormFocused("confirmPassword")}
              onBlur={() => setFormFocused(null)}
              className={`pl-10 pr-10 py-6 h-auto border-gray-300 focus:border-violet-600 focus:ring-0 ${
                confirmPassword && password === confirmPassword
                  ? "border-green-500"
                  : confirmPassword
                  ? "border-red-500"
                  : ""
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-3.5 w-3.5" /> {passwordError}
            </p>
          )}
        </div>

        {Error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 text-sm rounded-md bg-red-50 text-red-600 border border-red-200"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{Error}</span>
          </motion.div>
        )}

        <Button
          type="submit"
          className="w-full py-6 h-auto text-base font-medium bg-violet-600 hover:bg-violet-700 transition-all"
          disabled={isLoading || isDisable()}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
              account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-violet-600 hover:text-violet-800 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupForm;
