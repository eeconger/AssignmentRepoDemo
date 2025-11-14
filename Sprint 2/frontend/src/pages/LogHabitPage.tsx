import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiGetUserProfile } from "../api";

export default function LogHabitPage() {
    return (
        <HabitLogger />
    );
}

/**
 * A component for users to log their daily habits.
 * It fetches the user's tracked habits from their profile
 * and displays them as a selectable grid.
 */
const HabitLogger: React.FC = () => {
  // --- Hooks ---
  const { token } = useAuth();
  const navigate = useNavigate(); // Included based on your snippet
  
  // --- State ---
  const [availableHabits, setAvailableHabits] = useState<string[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchHabits = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const profile = await apiGetUserProfile(token);
        // Combine positive and negative habits into one list for logging
        const allHabits = [
          ...(profile.positiveHabits || []),
          ...(profile.negativeHabits || []),
        ];
        setAvailableHabits(allHabits);
      } catch (error) {
        console.error('Failed to load user habits:', error);
        // You could add an error state here to show a message to the user
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [token]);

  // --- Handlers ---

  /**
   * Toggles the selection state of a habit.
   * @param habitLabel - The habit string to toggle.
   */
  const handleToggleHabit = (habitLabel: string) => {
    setSelectedHabits((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(habitLabel)) {
        newSelected.delete(habitLabel);
      } else {
        newSelected.add(habitLabel);
      }
      return newSelected;
    });
  };

  /**
   * Handles the "Done" button click.
   * This would typically send the data to a REST API.
   */
  const handleSubmit = () => {
    const habitsToLog = Array.from(selectedHabits);
    console.log('Submitting habits:', habitsToLog);
    // e.g., api.post('/logs/daily-habits', { habits: habitsToLog, token });
    // navigate('/dashboard'); // Example usage of navigate
  };

  /**
   * Handles the "Skip" button click.
   */
  const handleSkip = () => {
    console.log('User skipped logging.');
    // navigate('/dashboard'); // Example usage of navigate
  };

  // --- Helper ---
  /**
   * Generates the image URL for a given habit label.
   * Replaces spaces with underscores and appends .png.
   * @param label - The habit label (e.g., "Excessive Screen Time")
   * @returns The public image path (e.g., "/images/Excessive_Screen_Time.png")
   */
  const getImageUrl = (label: string): string => {
    // Use a regex with the global flag to replace all spaces
    const imageName = label.replace(/ /g, '_');
    return `/images/${imageName}.png`;
  };

  // --- Render ---

  // Handle Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4">
        <div className="text-xl font-semibold text-gray-700">
          Loading habits...
        </div>
      </div>
    );
  }

  return (
    // Main container with the light orange/cream background
    <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4 sm:p-8">
      {/* Card-based layout, matching the design language */}
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg sm:p-10">
        
        {/* Header Title */}
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">
          What did you do today?
        </h2>

        {/* Grid of selectable habits */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {availableHabits.map((habitLabel) => {
            const isSelected = selectedHabits.has(habitLabel);
            return (
              <button
                key={habitLabel} // Use the habit string as the key
                onClick={() => handleToggleHabit(habitLabel)}
                type="button"
                className={`
                  overflow-hidden rounded-lg border-2 shadow-sm transition-all
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                  ${
                    isSelected
                      ? 'border-purple-600 ring-2 ring-purple-300'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }
                `}
              >
                {/* --- MODIFIED SECTION ---
                  Replaced the placeholder div with an <img> tag.
                  - src calls the getImageUrl helper.
                  - alt provides accessibility.
                  - className maintains the aspect ratio, sets object-fit,
                    and provides a fallback background color.
                */}
                <img
                  src={getImageUrl(habitLabel)}
                  alt={habitLabel}
                  className="aspect-[11/8] w-full object-cover bg-gray-200"
                />
                
                {/* Habit Label */}
                <div
                  className={`
                    p-3 text-center text-sm font-medium sm:text-base
                    ${isSelected ? 'bg-purple-50 text-purple-800' : 'bg-white text-gray-700'}
                  `}
                >
                  {habitLabel}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleSkip}
            type="button"
            className="rounded-lg px-8 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Skip
          </button>
          
          <button
            onClick={handleSubmit}
            type="button"
            className="
              rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-2.5
              font-semibold text-white shadow-md transition-all
              hover:opacity-90 focus:outline-none focus:ring-2
              focus:ring-purple-500 focus:ring-offset-2
            "
          >
            Done
          </button>
        </div>
        
      </div>
    </div>
  );
};
