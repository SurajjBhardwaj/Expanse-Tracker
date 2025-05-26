import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post("/auth/password-reset", { email });
      setMessage("Password reset link has been sent to your email.");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to send password reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8 border rounded-xl p-5 bg-white dark:bg-gray-800 shadow-lg">
        <h1 className="text-xl text-nowrap font-bold mb-4">Forgot Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-white"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {message && <p className="text-green-500">{message}</p>}
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        <div className="mt-6 text-right cursor-pointer">
          <p onClick={() => navigate("/login")} className="w-full mt-4">
            Back to <span className="text-amber-300">Login</span>
          </p>
        </div>
      </div>
    </div>
  );
}
