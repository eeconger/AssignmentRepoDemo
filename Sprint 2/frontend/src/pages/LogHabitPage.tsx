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
  // Store available habits separated by type
  const [availablePositiveHabits, setAvailablePositiveHabits] = useState<string[]>([]);
  const [availableNegativeHabits, setAvailableNegativeHabits] = useState<string[]>([]);

  // Store selected habits in separate Sets for efficient toggling
  const [selectedPositiveHabits, setSelectedPositiveHabits] = useState<Set<string>>(new Set());
  const [selectedNegativeHabits, setSelectedNegativeHabits] = useState<Set<string>>(new Set());
  
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
        // Set positive and negative habits in their own state
        setAvailablePositiveHabits(profile.positiveHabits || []);
        setAvailableNegativeHabits(profile.negativeHabits || []);
      } catch (error) {
        console.error('Failed to load user habits:', error);
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
   * @param type - The category of the habit ('positive' or 'negative').
   */
  const handleToggleHabit = (habitLabel: string, type: 'positive' | 'negative') => {
    // Dynamically choose which state updater to call
    const stateUpdater = type === 'positive' 
      ? setSelectedPositiveHabits 
      : setSelectedNegativeHabits;

    stateUpdater((prevSelected) => {
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
   * Saves the selected habits to localStorage and navigates to the mood logger.
   */
  const handleSubmit = () => {
    // Convert Sets to arrays for storage
    const positiveHabitsToLog = Array.from(selectedPositiveHabits);
    const negativeHabitsToLog = Array.from(selectedNegativeHabits);

    localStorage.setItem('logging_positiveHabits', JSON.stringify(positiveHabitsToLog));
    localStorage.setItem('logging_negativeHabits', JSON.stringify(negativeHabitsToLog));
    
    navigate("/log/mood");
  };

  /**
   * Saves empty arrays to localStorage (for the "skip" action) 
   * and navigates to the mood logger.
   */
  const handleSkip = () => {
    localStorage.setItem('logging_positiveHabits', JSON.stringify([]));
    localStorage.setItem('logging_negativeHabits', JSON.stringify([]));
    
    navigate("/log/mood");
  };

  /**
   * Clears habit data from localStorage and returns to the dashboard.
   */
  const handleCancel = () => {
    localStorage.removeItem('logging_positiveHabits');
    localStorage.removeItem('logging_negativeHabits');
    
    navigate("/dashboard");
  };

  // --- Helper ---
  /**
   * Generates the image URL for a given habit label.
   */
  const getImageUrl = (label: string): string => {
    const imageName = label.replace(/ /g, '_');
    return `/images/${imageName}.png`;
  };

  // --- Render ---

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
    <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4 sm:p-8">
      <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg sm:p-10">
        
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">
          What did you do today?
        </h2>

        {/* Grid of selectable habits */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
          {/* Render Positive Habits */}
          {availablePositiveHabits.map((habitLabel) => {
            const isSelected = selectedPositiveHabits.has(habitLabel);
            return (
              <button
                key={habitLabel}
                onClick={() => handleToggleHabit(habitLabel, 'positive')}
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
                <img
                  src={getImageUrl(habitLabel)}
                  alt={habitLabel}
                  className="aspect-[11/8] w-full object-cover bg-gray-200"
                />
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
          
          {/* Render Negative Habits */}
          {availableNegativeHabits.map((habitLabel) => {
            const isSelected = selectedNegativeHabits.has(habitLabel);
            return (
              <button
                key={habitLabel}
                onClick={() => handleToggleHabit(habitLabel, 'negative')}
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
                <img
                  src={getImageUrl(habitLabel)}
                  alt={habitLabel}
                  className="aspect-[11/8] w-full object-cover bg-gray-200"
                />
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
          {/* NEW Cancel Button */}
          <button
            onClick={handleCancel}
            type="button"
            className="rounded-lg px-8 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </button>

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
            Next
          </button>
        </div>
        
      </div>
    </div>
  );
};