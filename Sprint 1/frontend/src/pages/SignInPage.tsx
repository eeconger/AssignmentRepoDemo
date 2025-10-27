import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiSignIn } from "../api";

const SignInPage: React.FC = () => {
  // Renaming 'email' state variable to 'username' for clarity
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // New state to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Updated check to use username
    if (!username || !password) {
      setError("Please enter both username and password.");
      setIsLoading(false);
      return;
    }

    try {
      // Passes username (formerly email) to apiSignIn
      const sessionToken = await apiSignIn(username, password);

      auth.login(sessionToken);

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Sign in failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle the password visibility state
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Sign In [PR03]</h2>
      <p className="mb-6 text-gray-600">Sign in to continue to your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            // Changed htmlFor from 'email' to 'username'
            htmlFor="username"
            className="block text-sm font-medium text-gray-700"
          >
            Username
          </label>
          <input
            // Changed ID from 'email' to 'username'
            id="username"
            // Changed type from 'email' to 'text'
            type="text"
            className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Your username"
            value={username}
            // Updated setter to setUsername
            onChange={(e) => setUsername(e.target.value)}
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
          {/* Add a container for the input and the toggle button */}
          <div className="relative mt-1">
            <input
              id="password"
              // Conditionally set the type attribute
              type={showPassword ? "text" : "password"}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10" // Added pr-10 for button spacing
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="button" // Important: use type="button" to prevent form submission
              onClick={handleTogglePassword}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-600 hover:text-indigo-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {/* Simple text/icon-like representation */}
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
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
