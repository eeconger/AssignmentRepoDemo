import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiSignIn } from "../api";

// Custom class for gradient text
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";

const SignInPage: React.FC = () => {
  // (state and handleSubmit function remain the same)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password.");
      setIsLoading(false);
      return;
    }

    try {
      const sessionToken = await apiSignIn(username, password);

      auth.login(sessionToken);

      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex flex-col items-center pt-12 pb-20 min-h-screen">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl max-w-md w-full m-4">
        {/* Heading with gradient text */}
        <h2
          className={`text-3xl font-bold mb-4 text-center ${gradientTextClass}`}
        >
          Sign In
        </h2>
        <p className="mb-8 text-lg text-gray-700 text-center">
          Sign in to continue to your account.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Username field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <div className="relative p-[2px] rounded-lg focus-within:bg-gradient-to-r focus-within:from-sky-500 focus-within:to-purple-600 mt-1">
              <input
                id="username"
                type="text"
                className="w-full px-4 py-2 border-2 border-transparent rounded-md shadow-sm focus:outline-none bg-white text-gray-900 placeholder-gray-400"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative p-[2px] rounded-lg focus-within:bg-gradient-to-r focus-within:from-sky-500 focus-within:to-purple-600 mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-2 border-2 border-transparent rounded-md shadow-sm focus:outline-none bg-white text-gray-900 placeholder-gray-400 pr-12"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-purple-600 hover:text-purple-500 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full text-center px-6 py-3 text-white text-xl font-bold rounded-lg 
                               bg-gradient-to-r from-sky-500 to-purple-600 
                               hover:from-sky-600 hover:to-purple-700 
                               transition duration-300 shadow-lg disabled:from-sky-300 disabled:to-purple-400"
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-purple-600 hover:underline">
            Back to Welcome
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
