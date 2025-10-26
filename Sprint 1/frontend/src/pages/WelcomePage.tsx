import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

/**
 * Renders the Welcome Screen (UC01 Basic Path Step 1)
 */
const WelcomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-xl max-w-md w-full">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-6">
        Welcome to Equanimity
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Set up personalized states and habits, and start logging your food and
        mood.
      </p>

      {/* Use <Link> for navigation. It's styled like a button. */}
      <Link
        to="/register" // Navigates to the /register URL
        className="w-full text-center px-6 py-3 mb-4 text-white text-lg font-semibold bg-green-600 rounded-lg hover:bg-green-700 transition duration-300 shadow-md"
      >
        Create Account
      </Link>

      {/* Use <Link> for navigation. */}
      <Link
        to="/signin" // Navigates to the /signin URL
        className="w-full text-center px-6 py-3 text-indigo-600 text-lg font-semibold border-2 border-indigo-600 rounded-lg bg-white hover:bg-indigo-50 transition duration-300 shadow-md"
      >
        Sign In
      </Link>
      <p className="text-sm mt-4 text-gray-500">
        Already have an account? Select "Sign In".
      </p>
    </div>
  );
};

export default WelcomePage;
