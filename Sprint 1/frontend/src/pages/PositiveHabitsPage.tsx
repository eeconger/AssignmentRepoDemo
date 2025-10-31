// src/pages/onboarding/PositiveHabitsPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { POSITIVE_HABITS } from "../constants";
import { apiUpdateOnboardingProfile } from "../api";

// Custom class for gradient text (Blue to Purple)
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";
// Class for the gradient button background (Blue to Purple)
const primaryButtonClass =
  "w-full px-6 py-3 text-white text-xl font-bold rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition duration-300 shadow-lg disabled:from-sky-300 disabled:to-purple-400";

const PositiveHabitsPage: React.FC = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggleHabit = (habit: string) => {
    const currentHabits = onboardingData.positiveHabits;
    const newHabits = currentHabits.includes(habit)
      ? currentHabits.filter((h) => h !== habit)
      : [...currentHabits, habit];

    updateOnboardingData({ positiveHabits: newHabits });
    setError(null); // Clear error on selection
  };

  const handleNext = async () => {
    if (onboardingData.positiveHabits.length < 3) {
      setError("Please select at least 3 positive habits.");
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
        { positiveHabits: onboardingData.positiveHabits },
        token
      );
      navigate("/onboarding/negative-habits");
    } catch (err: any) {
      setError(err.message || "Failed to save positive habits.");
    } finally {
      setIsLoading(false);
    }
  };

  // The component now returns ONLY the content that should be inside the single card,
  // assuming the parent component provides the 'bg-white rounded-2xl shadow-2xl' styling.
  return (
    <div className="flex flex-col items-center w-full">
      {/* HEADING with GRADIENT TEXT */}
      <h2
        className={`text-3xl font-bold mb-6 text-center ${gradientTextClass}`}
      >
        Select Positive Habits
      </h2>

      <p className="text-lg text-gray-700 mb-6 text-center">
        Which habits do you want to build?
      </p>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 w-full">
        <div className="flex flex-wrap gap-3 justify-center">
          {POSITIVE_HABITS.map((habit) => {
            const isSelected = onboardingData.positiveHabits.includes(habit);

            const baseClasses =
              "px-4 py-2 rounded-full text-base font-semibold transition duration-200 shadow-sm border";

            // SELECTED: Button has the gradient background and white text
            const selectedClasses =
              "bg-gradient-to-r from-sky-500 to-purple-600 text-white border-transparent";

            // UNSELECTED: Button has gradient text, white background, and a subtle border
            const unselectedClasses = `${gradientTextClass} bg-white border-purple-200 hover:border-purple-600`;

            return (
              <button
                key={habit}
                onClick={() => handleToggleHabit(habit)}
                className={`${baseClasses} ${
                  isSelected ? selectedClasses : unselectedClasses
                }`}
              >
                {habit}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center mb-4">
        Selected: {onboardingData.positiveHabits.length} (minimum 3 required)
      </p>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}

      {/* Primary Button with Gradient, full width */}
      <button
        onClick={handleNext}
        className={primaryButtonClass}
        disabled={isLoading || onboardingData.positiveHabits.length < 3}
      >
        {isLoading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
};

export default PositiveHabitsPage;
