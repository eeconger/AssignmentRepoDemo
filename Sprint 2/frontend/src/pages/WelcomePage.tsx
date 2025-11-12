import React from "react";
import { Link } from "react-router-dom";

// Custom class for gradient text
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";

// Class for the gradient button background
const primaryButtonClass =
  "w-full text-center px-6 py-3 mb-4 text-white text-xl font-bold rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition duration-300 shadow-lg";

/**
 * Renders the Welcome Screen (UC01 Basic Path Step 1)
 */
const WelcomePage: React.FC = () => {
  return (
    // Outer wrapper for full-screen centering
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Content container */}
      <div className="flex flex-col items-center w-full max-w-md m-4 p-8 bg-white rounded-2xl shadow-2xl">
        {/* Heading with gradient text */}
        <h1
          className={`text-4xl font-extrabold mb-6 text-center ${gradientTextClass}`}
        >
          Welcome to Equanimity
        </h1>

        {/* Description */}
        <p className="text-xl text-gray-700 font-medium text-center mb-10">
          Let's explore what you do, and how it makes you feel.
        </p>

        {/* Get started button */}
        <Link to="/register" className={primaryButtonClass}>
          Get Started
        </Link>

        {/* Sign-in button */}
        <Link
          to="/signin"
          className="w-full text-center px-6 py-3 text-lg font-semibold rounded-lg 
                     bg-white text-purple-700 border-2 border-purple-200
                     hover:bg-purple-50 
                     transition duration-300 shadow-md"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;
