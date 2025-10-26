// src/pages/SignInPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiSignIn } from "../api";

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      const sessionToken = await apiSignIn(email, password);

      auth.login(sessionToken);

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ Wrap everything in a single div
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Sign In [PR03]</h2>
      <p className="mb-6 text-gray-600">Sign in to continue to your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded mt-1"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded mt-1"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link to="/welcome" className="text-sm text-indigo-600 hover:underline">
          Back to Welcome
        </Link>
      </div>
    </div>
  );
};

export default SignInPage;
