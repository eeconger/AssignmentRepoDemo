// src/pages/onboarding/PositiveStatesPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { POSITIVE_STATES } from "../constants";
import { apiUpdateOnboardingProfile } from "../api";

// Custom class for gradient text (Blue to Purple)
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";
// Class for the gradient button background (Blue to Purple)
const primaryButtonClass =
  "w-full px-6 py-3 text-white text-xl font-bold rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition duration-300 shadow-lg disabled:opacity-50";

const PositiveStatesPage: React.FC = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggleState = (state: string) => {
    const currentStates = onboardingData.positiveStates;
    const newStates = currentStates.includes(state)
      ? currentStates.filter((s) => s !== state)
      : [...currentStates, state];

    updateOnboardingData({ positiveStates: newStates });
    setError(null);
  };

  const handleNext = async () => {
    if (onboardingData.positiveStates.length < 3) {
      setError("Please select at least 3 positive states.");
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
        { positiveStates: onboardingData.positiveStates },
        token
      );
      navigate("/onboarding/negative-states");
    } catch (err: any) {
      setError(err.message || "Failed to save positive states.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ⭐️ CHANGE 1: Removed 'min-h-screen' and 'justify-center'. Used 'pt-12 pb-20' for safe vertical padding.
    <div className="flex flex-col items-center bg-white pt-12 pb-20">
      {/* Inner content container: Kept 'max-w-md' and added horizontal margin 'mx-4' for mobile safety.
          Removed all vertical margins on this div. */}
      <div className="w-full max-w-md mx-4 rounded-2xl">
        {/* Heading with gradient text */}
        <h1
          className={`text-3xl font-bold mb-6 text-center ${gradientTextClass}`}
        >
          Select Positive States
        </h1>

        {/* Content area: Reduced bottom margin from mb-6 to mb-4 */}
        <div className="w-full mb-4">
          <p className="text-lg text-gray-700 mb-6 text-center">
            These are moods and feelings you want to encourage:
          </p>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {POSITIVE_STATES.map((state) => {
                const isSelected =
                  onboardingData.positiveStates.includes(state);

                // Reduced vertical padding from py-2 to py-1.5 for a slightly shorter button
                const baseClasses =
                  "px-4 py-1.5 rounded-full text-base font-semibold transition duration-200 shadow-sm border";

                const selectedClasses =
                  "bg-gradient-to-r from-sky-500 to-purple-600 text-white border-transparent";

                const unselectedClasses = `${gradientTextClass} bg-white border-purple-200 hover:border-purple-600`;

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

          <p className="text-sm text-gray-500 mt-4 text-center">
            Selected: {onboardingData.positiveStates.length} (minimum 3
            required)
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Buttons container */}
        <div className="w-full">
          <button
            onClick={handleNext}
            disabled={isLoading || onboardingData.positiveStates.length < 3}
            className={primaryButtonClass}
          >
            {isLoading ? "Saving..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PositiveStatesPage;
