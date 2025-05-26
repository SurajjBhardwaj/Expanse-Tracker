import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";

export default function PasswordResetPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await api.post(`/auth/password-reset/${token}`, {
        password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md mb-8  border rounded-xl p-10 bg-white dark:bg-gray-800 shadow-lg">
        <h1 className="text-xl text-nowrap font-bold mb-4">Reset Password</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter your new password below to reset your account password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          {success && (
            <p className="text-green-500">
              Password reset successfully! Redirecting to login...
            </p>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Resetting..." : "Reset Password"}
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
