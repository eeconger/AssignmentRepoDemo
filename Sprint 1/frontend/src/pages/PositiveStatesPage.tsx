// src/pages/onboarding/PositiveStatesPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { POSITIVE_STATES } from "../constants";
import { apiUpdateOnboardingProfile } from "../api";

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
    setError(null); // Clear error on selection
  };

  const handleNext = async () => {
    // [E02] Enforce BR02 on the client
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
      navigate("/onboarding/negative-states"); // Go to next step
    } catch (err: any) {
      setError(err.message || "Failed to save positive states.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Select Positive States [PR06]</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {POSITIVE_STATES.map((state) => {
          const isSelected = onboardingData.positiveStates.includes(state);
          return (
            <button
              key={state}
              onClick={() => handleToggleState(state)}
              className={`px-4 py-2 rounded-full font-semibold ${
                isSelected
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {state}
            </button>
          );
        })}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        onClick={handleNext}
        className="w-full px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Continue"}
      </button>
    </>
  );
};

export default PositiveStatesPage;
