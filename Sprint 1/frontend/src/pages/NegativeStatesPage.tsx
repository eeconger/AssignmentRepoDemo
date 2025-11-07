// src/pages/onboarding/NegativeStatesPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { NEGATIVE_STATES } from "../constants";
import { apiUpdateOnboardingProfile } from "../api";

// UPDATED: Gradient for NEGATIVE elements (purple to red)
const negativeGradientClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-red-600";

// UPDATED: Class for the primary action button for NEGATIVE steps
const negativeButtonClass =
  "w-full text-center px-6 py-3 text-white text-xl font-bold rounded-lg bg-gradient-to-r from-purple-500 to-red-600 hover:from-purple-600 hover:to-red-700 transition duration-300 shadow-lg disabled:from-purple-300 disabled:to-red-400";

const NegativeStatesPage: React.FC = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggleState = (state: string) => {
    const currentStates = onboardingData.negativeStates;
    const newStates = currentStates.includes(state)
      ? currentStates.filter((s) => s !== state)
      : [...currentStates, state];

    updateOnboardingData({ negativeStates: newStates });
    setError(null); // Clear error on selection
  };

  const handleNext = async () => {
    if (onboardingData.negativeStates.length < 3) {
      setError("Please select at least 3 negative states.");
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
        { negativeStates: onboardingData.negativeStates },
        token
      );
      navigate("/onboarding/positive-habits");
    } catch (err: any) {
      setError(err.message || "Failed to save negative states.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white pt-8 pb-12">
      {/* Inner content container */}
      <div className="w-full max-w-md mx-4">
        {/* HEADING uses the new negativeGradientClass (Purple/Red) */}
        <h2
          className={`text-3xl font-bold mb-4 text-center ${negativeGradientClass}`}
        >
          Select Negative States
        </h2>

        <p className="text-lg text-gray-700 mb-4 text-center">
          Which states do you commonly experience?
        </p>

        {/* Scrollable list container (max height constraint) */}
        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {NEGATIVE_STATES.map((state) => {
              const isSelected = onboardingData.negativeStates.includes(state);

              // Reduced vertical padding from py-2 to py-1.5 for a shorter button
              const baseClasses =
                "px-4 py-1.5 rounded-full text-base font-semibold transition duration-200 shadow-sm border";

              // SELECTED button uses the Purple/Red gradient
              const selectedClasses =
                "bg-gradient-to-r from-purple-500 to-red-600 text-white border-transparent";

              // UNSELECTED button uses the Purple/Red gradient for text, and a soft red border
              const unselectedClasses = `${negativeGradientClass} bg-white border-red-200 hover:border-red-600`;

              return (
                <button
                  key={state}
                  onClick={() => handleToggleState(state)}
                  className={`${baseClasses} ${
                    isSelected ? selectedClasses : unselectedClasses
                  }`}
                >
                  {state}
                </button>
              );
            })}
          </div>
        </div>

        {/* ⭐️ CHANGE 4: Reduced bottom margin from mb-6 to mb-4 */}
        <p className="text-sm text-gray-500 mt-4 text-center mb-4">
          Selected: {onboardingData.negativeStates.length} (minimum 3 required)
        </p>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        {/* Primary Button (Continue) uses the negativeButtonClass (Purple/Red) */}
        <div className="w-full mt-4">
          <button
            onClick={handleNext}
            className={negativeButtonClass}
            disabled={isLoading || onboardingData.negativeStates.length < 3}
          >
            {isLoading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NegativeStatesPage;
