// src/pages/onboarding/DisplayNamePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { apiUpdateOnboardingProfile } from "../api";

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
    <>
      <h2 className="text-2xl font-bold mb-4">Set Display Name [PR05]</h2>
      <p className="mb-6">Please enter a name for your profile.</p>
      <input
        type="text"
        className="w-full p-2 border rounded mb-6"
        placeholder="Your display name"
        value={onboardingData.displayName}
        onChange={(e) => updateOnboardingData({ displayName: e.target.value })}
        disabled={isLoading}
      />

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

export default DisplayNamePage;
