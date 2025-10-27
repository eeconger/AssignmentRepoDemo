// src/pages/onboarding/NegativeHabitsPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "../context/OnboardingContext";
import { useAuth } from "../context/AuthContext";
import { NEGATIVE_HABITS } from "../constants";
import { apiUpdateOnboardingProfile } from "../api";

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
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to save negative habits.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Select Negative Habits</h2>
      <p className="mb-6">Which habits do you want to change?</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {NEGATIVE_HABITS.map((habit) => {
          const isSelected = onboardingData.negativeHabits.includes(habit);
          return (
            <button
              key={habit}
              onClick={() => handleToggleHabit(habit)}
              className={`px-4 py-2 rounded-full font-semibold ${
                isSelected
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {habit}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>} {/* Show error */}
      <button
        onClick={handleNext}
        className="w-full px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300"
        disabled={isLoading}
      >
        {isLoading ? "Saving..." : "Finish"}
      </button>
    </>
  );
};

export default NegativeHabitsPage;
