// src/pages/onboarding/NegativeStatesPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { NEGATIVE_STATES } from "../constants";
import { apiUpdateOnboardingProfile } from "../api";

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
    <>
      <h2 className="text-2xl font-bold mb-4">Select Negative States</h2>
      <p className="mb-6">Which states do you commonly experience?</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {NEGATIVE_STATES.map((state) => {
          const isSelected = onboardingData.negativeStates.includes(state);
          return (
            <button
              key={state}
              onClick={() => handleToggleState(state)}
              className={`px-4 py-2 rounded-full font-semibold ${
                isSelected
                  ? "bg-blue-500 text-white"
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

export default NegativeStatesPage;
