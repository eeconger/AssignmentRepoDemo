import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { NEGATIVE_HABITS } from "../constants";
import { apiUpdateOnboardingProfile } from "../api";

// UPDATED: Gradient for NEGATIVE elements (purple to red)
const negativeGradientClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-red-600";
// UPDATED: Class for the primary action button for NEGATIVE steps
const negativeButtonClass =
  "w-full text-center px-6 py-3 text-white text-xl font-bold rounded-lg bg-gradient-to-r from-purple-500 to-red-600 hover:from-purple-600 hover:to-red-700 transition duration-300 shadow-lg disabled:from-purple-300 disabled:to-red-400";

const NegativeHabitsPage: React.FC = () => {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggleHabit = (habit: string) => {
    const currentHabits = onboardingData.negativeHabits;
    const newHabits = currentHabits.includes(habit)
      ? currentHabits.filter((h) => h !== habit)
      : [...currentHabits, habit];

    updateOnboardingData({ negativeHabits: newHabits });
    setError(null);
  };

  const handleNext = async () => {
    if (onboardingData.negativeHabits.length < 3) {
      setError("Please select at least 3 negative habits.");
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
        {
          negativeHabits: onboardingData.negativeHabits,
          onboardingComplete: true,
        },
        token
      );
      // Navigate to the Onboarding Complete page, which is the final step.
      navigate("/onboarding/complete");
    } catch (err: any) {
      setError(err.message || "Failed to save negative habits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // This container now holds the content only, optimized for a parent card wrapper.
    <div className="flex flex-col items-center w-full">
      {/* HEADING uses the Negative Gradient (Purple/Red) */}
      <h2
        className={`text-3xl font-bold mb-6 text-center ${negativeGradientClass}`}
      >
        Select Negative Habits
      </h2>

      <p className="text-lg text-gray-700 mb-6 text-center">
        Which habits do you want to change?
      </p>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 w-full">
        <div className="flex flex-wrap gap-3 justify-center">
        {NEGATIVE_HABITS.map((habit) => {
          const isSelected = onboardingData.negativeHabits.includes(habit);

          const baseClasses =
            "px-4 py-2 rounded-full text-base font-semibold transition duration-200 shadow-sm border";

          // SELECTED: Button has the Purple/Red gradient background
          const selectedClasses =
            "bg-gradient-to-r from-purple-500 to-red-600 text-white border-transparent";

          // UNSELECTED: Button has Purple/Red gradient text and a soft red border
          const unselectedClasses = `${negativeGradientClass} bg-white border-red-200 hover:border-red-600`;

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
        Selected: {onboardingData.negativeHabits.length} (minimum 3 required)
      </p>

      {error && (
        <p className="text-red-500 text-sm text-center mb-4">{error}</p>
      )}

      {/* Primary Button uses the negativeButtonClass (Purple/Red) and is the final 'Finish' action */}
      <button
        onClick={handleNext}
        className={negativeButtonClass}
        disabled={isLoading || onboardingData.negativeHabits.length < 3}
      >
        {isLoading ? "Saving..." : "Finish"}
      </button>
    </div>
  );
};

export default NegativeHabitsPage;
