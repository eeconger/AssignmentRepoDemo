import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGetUserProfile, apiUpdateOnboardingProfile } from "../api";
import { NEGATIVE_HABITS } from "../constants";

// Custom class for gradient text (Purple to Red)
const negativeGradientClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-red-600";
// Class for the gradient button background (Purple to Red)
const negativeButtonClass =
  "w-full px-6 py-3 text-white text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-500 to-red-600 hover:from-purple-600 hover:to-red-700 transition duration-300 shadow-md disabled:opacity-50";

const EditNegativeHabitsPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const profile = await apiGetUserProfile(token);
        setSelectedHabits(profile.negativeHabits || []);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const handleSave = async () => {
    if (selectedHabits.length < 3) {
      alert("Please select at least 3 negative habits.");
      return;
    }

    setSaving(true);
    try {
      await apiUpdateOnboardingProfile(
        { negativeHabits: selectedHabits },
        token!
      );
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-lg font-semibold text-red-600">Loading...</div>
    );

  return (
    // Outer wrapper for full-screen centering and white background
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl max-w-md w-full m-4">
        {/* HEADING with NEGATIVE GRADIENT TEXT (Purple to Red) */}
        <h1
          className={`text-3xl font-bold mb-6 text-center ${negativeGradientClass}`}
        >
          Edit Negative Habits
        </h1>

        <div className="bg-white p-0 w-full mb-6">
          <p className="text-lg text-gray-700 mb-6 text-center">
            Select at least 3 negative habits you want to change:
          </p>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-3 justify-center">
            {NEGATIVE_HABITS.map((habit) => {
              const isSelected = selectedHabits.includes(habit);

              const baseClasses =
                "px-4 py-2 rounded-full text-base font-semibold transition duration-200 shadow-sm border";

              // SELECTED: Uses the Purple-to-Red gradient background
              const selectedClasses =
                "bg-gradient-to-r from-purple-500 to-red-600 text-white border-transparent";

              // UNSELECTED: Uses the Purple-to-Red gradient for text, white background, and a soft red border
              const unselectedClasses = `${negativeGradientClass} bg-white border-red-200 hover:border-red-600`;

              return (
                <button
                  key={habit}
                  onClick={() => toggleHabit(habit)}
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

          <p className="text-sm text-gray-500 mt-4 text-center">
            Selected: {selectedHabits.length} (minimum 3 required)
          </p>
        </div>

        <div className="flex justify-end gap-4 w-full">
          {/* Cancel Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition duration-200"
          >
            Cancel
          </button>

          {/* Save Button with NEGATIVE Gradient (Purple to Red) */}
          <button
            onClick={handleSave}
            disabled={saving || selectedHabits.length < 3}
            className={negativeButtonClass}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNegativeHabitsPage;
