import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiCreateAccount } from "../api";
// ---------------------

const CreateAccountPage: React.FC = () => {
  // Renaming 'email' state variable to 'username' for clarity
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // [E01] Client-side check
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }
    // [BR03] Client-side check
    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions.");
      return;
    }

    // [E02] Client-side check for username presence
    if (!username) {
      setError("Please enter a username.");
      return;
    }

    try {
      const token = await apiCreateAccount({
        username: username, // Using the renamed state variable
        password,
        termsAccepted,
      });

      // Login with the token we received from the backend
      login(token);

      // Navigate to the next step
      navigate("/onboarding/display-name");
      // ------------------------------------------
    } catch (err: any) {
      // This will display errors from the backend,
      // such as "A user with that email/username already exists."
      setError(err.message || "Failed to create account");
    }
  };

  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Create Your Account [PR02]
      </h2>

      <form onSubmit={handleSubmit} className="w-full">
        {/* Username Field (formerly Email) */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Username
          </label>
          <input
            // Changed type from 'email' to 'text' and removed email validation requirement
            type="text"
            // Changed ID from 'email' to 'username'
            id="username"
            value={username}
            // Updated setter to setUsername
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Choose your username"
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-describedby="password-hint"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p id="password-hint" className="text-xs text-gray-500 mt-1">
            Must be at least 12 characters. [BR01]
          </p>
        </div>

        {/* Terms Checkbox */}
        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            I accept the Terms & Conditions [BR03]
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 text-white text-lg font-semibold bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
        >
          Create Account
        </button>
      </form>

      {/* Back Link */}
      <Link to="/" className="text-sm text-indigo-600 hover:underline mt-6">
        Back to Welcome
      </Link>
    </div>
  );
};

export default CreateAccountPage;
