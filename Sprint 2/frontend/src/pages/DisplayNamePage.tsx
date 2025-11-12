// src/pages/onboarding/DisplayNamePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { apiUpdateOnboardingProfile } from "../api";

// Custom class for gradient text
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";

const DisplayNamePage: React.FC = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (
      !onboardingData.displayName ||
      onboardingData.displayName.trim() === ""
    ) {
      setError("Please enter a display name.");
      return;
    }

    if (!token) {
      setError("Authentication error. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiUpdateOnboardingProfile(
        { displayName: onboardingData.displayName },
        token
      );
      navigate("/onboarding/positive-states");
    } catch (err: any) {
      setError(err.message || "Failed to save display name.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container for a single card layout
    <div className="flex flex-col items-center w-full">
      {/* Heading with gradient text */}
      <h2
        className={`text-3xl font-bold mb-4 text-center ${gradientTextClass}`}
      >
        Set Your Display Name
      </h2>
      <p className="mb-8 text-lg text-gray-700 text-center">
        Please enter a name for your profile.
      </p>

      {/* Input field */}
      <div className="w-full relative p-[2px] rounded-lg focus-within:bg-gradient-to-r focus-within:from-sky-500 focus-within:to-purple-600 mb-6">
        <input
          type="text"
          className="w-full px-4 py-2 border-2 border-transparent rounded-md shadow-sm focus:outline-none bg-white text-gray-900 placeholder-gray-400"
          placeholder="Your display name"
          value={onboardingData.displayName}
          onChange={(e) =>
            updateOnboardingData({ displayName: e.target.value })
          }
          disabled={isLoading}
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}

      {/* Continue button with gradient */}
      <button
        onClick={handleNext}
        className="w-full text-center px-6 py-3 text-white text-xl font-bold rounded-lg 
                            bg-gradient-to-r from-sky-500 to-purple-600 
                            hover:from-sky-600 hover:to-purple-700 
                            transition duration-300 shadow-lg disabled:from-sky-300 disabled:to-purple-400"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
};

export default DisplayNamePage;
