// src/pages/onboarding/CreateAccountPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCreateAccount } from "../api";

// Custom class for gradient text
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";

const CreateAccountPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }
    if (!username) {
      setError("Please enter a username.");
      return;
    }
    if (
      !email ||
      !email.includes("@") ||
      !email.substring(email.indexOf("@")).includes(".")
    ) {
      setError("Please enter a valid email address.");
      return;
    }
    try {
      const token = await apiCreateAccount({
        username,
        email,
        password,
        termsAccepted,
      });
      login(token);
      navigate("/onboarding/display-name");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    }
  };

  return (
    <div className="flex flex-col items-center pt-12 pb-20 min-h-screen">
      {/* Card container */}
      <div className="flex flex-col items-center w-full max-w-md mx-4 p-8 bg-white rounded-2xl shadow-2xl">
        {/* Heading with gradient text */}
        <h2 className={`text-3xl font-bold mb-8 ${gradientTextClass}`}>
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="w-full">
          {/* Username field */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <div className="relative p-[2px] rounded-lg focus-within:bg-gradient-to-r focus-within:from-sky-500 focus-within:to-purple-600">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-transparent rounded-md focus:outline-none bg-white text-gray-900 placeholder-gray-400"
                placeholder="Choose your username"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <div className="relative p-[2px] rounded-lg focus-within:bg-gradient-to-r focus-within:from-sky-500 focus-within:to-purple-600">
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border-2 border-transparent rounded-md focus:outline-none bg-white text-gray-900 placeholder-gray-400"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative p-[2px] rounded-lg focus-within:bg-gradient-to-r focus-within:from-sky-500 focus-within:to-purple-600">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-16 border-2 border-transparent rounded-md focus:outline-none bg-white text-gray-900 placeholder-gray-400"
                aria-describedby="password-hint"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-purple-600 hover:text-purple-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p id="password-hint" className="text-xs text-gray-500 mt-1">
              Must be at least 12 characters.
            </p>
          </div>

          {/* Terms checkbox */}
          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I accept the Terms & Conditions
            </label>
            <Link
              to="/terms"
              className="ml-2 w-5 h-5 rounded-full bg-gradient-to-r from-sky-500 to-purple-600 text-white text-xs flex items-center justify-center hover:from-sky-600 hover:to-purple-700 transition duration-200"
              title="View Terms & Conditions"
            >
              ?
            </Link>
          </div>

          {error && (
            <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Create account button */}
          <button
            type="submit"
            className="w-full text-center px-6 py-3 text-white text-xl font-bold rounded-lg 
                                   bg-gradient-to-r from-sky-500 to-purple-600 
                                   hover:from-sky-600 hover:to-purple-700 
                                   transition duration-300 shadow-lg"
          >
            Create Account
          </button>
        </form>

        <Link to="/" className="text-sm text-purple-600 hover:underline mt-6">
          Back to Welcome
        </Link>
      </div>
    </div>
  );
};

export default CreateAccountPage;
