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
  const navigate = useNavigate();
  
  // --- State ---
  // Store available habits separated by type
  const [availablePositiveHabits, setAvailablePositiveHabits] = useState<string[]>([]);
  const [availableNegativeHabits, setAvailableNegativeHabits] = useState<string[]>([]);

  // Store selected habits in separate Sets for efficient toggling
  const [selectedPositiveHabits, setSelectedPositiveHabits] = useState<Set<string>>(new Set());
  const [selectedNegativeHabits, setSelectedNegativeHabits] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true);

  // --- Initialization and Persistence ---

  // 1. Load available habits from user profile
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

  // 2. Check localStorage on load and populate selected habits (New Functionality)
  useEffect(() => {
    const loadSelectedHabits = (key: string, setter: React.Dispatch<React.SetStateAction<Set<string>>>) => {
      const storedData = localStorage.getItem(key);
      if (storedData) {
        try {
          const habits = JSON.parse(storedData);
          if (Array.isArray(habits)) {
            setter(new Set(habits));
          }
        } catch (e) {
          console.error(`Error parsing stored habits for key ${key}:`, e);
          // localStorage.removeItem(key); // Optional: clear bad data
        }
      }
    };

    loadSelectedHabits('logging_positiveHabits', setSelectedPositiveHabits);
    loadSelectedHabits('logging_negativeHabits', setSelectedNegativeHabits);
  }, []); // Run only on mount

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
   * Saves selected habits to localStorage and returns to the food logger.
   * This allows the user to preserve their input when navigating back.
   */
  const handleBack = () => {
    // Save current selections to localStorage (new behavior)
    const positiveHabitsToLog = Array.from(selectedPositiveHabits);
    const negativeHabitsToLog = Array.from(selectedNegativeHabits);

    localStorage.setItem('logging_positiveHabits', JSON.stringify(positiveHabitsToLog));
    localStorage.setItem('logging_negativeHabits', JSON.stringify(negativeHabitsToLog));
    
    // Navigating back to the food logging page
    navigate("/log/food");
  };

  // --- Helper ---
  /**
   * Generates the image URL for a given habit label.
   */
  const getImageUrl = (label: string): string => {
    // NOTE: This assumes images are available at the root level in a directory named 'images'
    const imageName = label.replace(/ /g, '_');
    return `/images/${imageName}.png`;
  };

  // --- Render ---

  // Use the same styling variables for consistency
  const primaryButtonClass = "rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-2.5 font-semibold text-white shadow-md transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";
  const backSkipButtonClass = "rounded-lg px-8 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900";


  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4">
        <div className="text-xl font-semibold text-gray-700">
          Loading habits...
        </div>
      </div>
    );
  }

  // Combine both habit lists for display
  const allHabits = [
    ...availablePositiveHabits.map(label => ({ label, type: 'positive' as const })),
    ...availableNegativeHabits.map(label => ({ label, type: 'negative' as const })),
  ];
  
  if (allHabits.length === 0) {
     return (
        <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4">
            <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg sm:p-10 text-center">
                <h2 className="mb-4 text-3xl font-bold text-gray-800">No Habits to Track</h2>
                <p className="text-gray-600 mb-8">
                    It looks like you haven't set up any positive or negative habits in your profile yet.
                </p>
                <button onClick={() => navigate("/dashboard")} className={primaryButtonClass}>
                    Go to Dashboard
                </button>
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
          {allHabits.map(({ label, type }) => {
            const isPositive = type === 'positive';
            const isSelected = isPositive ? selectedPositiveHabits.has(label) : selectedNegativeHabits.has(label);
            
            return (
              <button
                key={label}
                onClick={() => handleToggleHabit(label, type)}
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
                {/* Fallback box if image URL is invalid or not found */}
                <div
                  className="aspect-[11/8] w-full object-cover bg-gray-200 flex items-center justify-center"
                  style={{ backgroundImage: `url(${getImageUrl(label)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                  onError={(e) => {
                    (e.target as HTMLDivElement).style.backgroundImage = 'none';
                    (e.target as HTMLDivElement).textContent = label.charAt(0);
                    (e.target as HTMLDivElement).style.fontSize = '3rem';
                  }}
                >
                </div>
                
                <div
                  className={`
                    p-3 text-center text-sm font-medium sm:text-base
                    ${isSelected ? 'bg-purple-50 text-purple-800' : 'bg-white text-gray-700'}
                  `}
                >
                  {label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          
          <button
            onClick={handleBack}
            type="button"
            className={backSkipButtonClass}
          >
            Back
          </button>

          <button
            onClick={handleSkip}
            type="button"
            className={backSkipButtonClass}
          >
            Skip
          </button>
          
          <button
            onClick={handleSubmit}
            type="button"
            className={primaryButtonClass}
          >
            Next
          </button>
        </div>
        
      </div>
    </div>
  );
};
