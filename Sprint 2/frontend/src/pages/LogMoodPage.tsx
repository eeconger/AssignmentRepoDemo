import React, { useState, useEffect } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiGetUserProfile } from "../api";

// This wrapper function allows the component to be used directly in routing.
export default function LogMoodPage() {
    return (
        <MoodLogger />
    );
}

// --- Types ---
type MoodRatings = Record<string, number>;

/**
 * A component for users to log their daily moods using sliders.
 * It fetches the user's tracked states from their profile.
 * On submit, it reads habit data from localStorage, combines it with
 * mood data, and prepares it for submission.
 */
const MoodLogger: React.FC = () => {
  // --- Hooks ---
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // --- State ---
  // Separated states for explicit positive/negative tracking
  const [positiveAvailableStates, setPositiveAvailableStates] = useState<string[]>([]);
  const [negativeAvailableStates, setNegativeAvailableStates] = useState<string[]>([]);
  
  const [positiveMoodRatings, setPositiveMoodRatings] = useState<MoodRatings>({});
  const [negativeMoodRatings, setNegativeMoodRatings] = useState<MoodRatings>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchStates = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const profile = await apiGetUserProfile(token);
        
        const posStates = profile.positiveStates || [];
        const negStates = profile.negativeStates || [];

        setPositiveAvailableStates(posStates);
        setNegativeAvailableStates(negStates);

        // Initialize positive mood ratings to 0 ("Unset")
        const initialPositiveRatings: MoodRatings = {};
        posStates.forEach((state: string) => {
          initialPositiveRatings[state] = 0;
        });
        setPositiveMoodRatings(initialPositiveRatings);

        // Initialize negative mood ratings to 0 ("Unset")
        const initialNegativeRatings: MoodRatings = {};
        negStates.forEach((state: string) => {
          initialNegativeRatings[state] = 0;
        });
        setNegativeMoodRatings(initialNegativeRatings);

      } catch (error)
 {
        console.error('Failed to load user states:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, [token]);

  // --- Handlers ---

  /**
   * Updates the rating for a specific mood state.
   * @param state The mood state being changed (e.g., "Calm").
   * @param value The new rating (0-5).
   * @param isPositive True if the state is positive, false if negative.
   */
  const handleSliderChange = (state: string, value: number, isPositive: boolean) => {
    if (isPositive) {
        setPositiveMoodRatings(prev => ({
            ...prev,
            [state]: value,
        }));
    } else {
        setNegativeMoodRatings(prev => ({
            ...prev,
            [state]: value,
        }));
    }
  };

  /**
   * Navigates back to the habit logger.
   */
  const handleBack = () => {
    navigate("/log/habits"); 
  };

  /**
   * Clears all logging data from localStorage and returns to the dashboard.
   */
  const handleCancel = () => {
    localStorage.removeItem('logging_positiveHabits');
    localStorage.removeItem('logging_negativeHabits');
    navigate("/dashboard");
  };

  /**
   * Gathers all data (habits + moods) and formats the final payload.
   * This now uses the pre-separated positive and negative mood ratings.
   */
  const handleSubmit = async () => {
    setSubmitting(true);

    // 1. Get habit data from localStorage
    const positiveHabits = JSON.parse(localStorage.getItem('logging_positiveHabits') || '[]');
    const negativeHabits = JSON.parse(localStorage.getItem('logging_negativeHabits') || '[]');

    // 2. Format the final payload using the separated state objects
    const dailyLogPayload = {
      positiveHabits: positiveHabits,
      negativeHabits: negativeHabits,
      positiveStates: positiveMoodRatings, // Directly use the positive state object
      negativeStates: negativeMoodRatings, // Directly use the negative state object
      loggedAt: new Date().toISOString(), // ISO timestamp
    };

    // 3. "Submit" the data (e.g., to your API)
    console.log("Submitting Daily Log:", dailyLogPayload);
    try {
      // Example of where you would call the API
      // await apiSubmitDailyLog(token, dailyLogPayload);
    } catch (error) {
      console.error("Failed to submit daily log:", error);
      setSubmitting(false);
      // Optionally show an error message to the user here
      return; 
    }

    // 4. Clean up localStorage and navigate
    localStorage.removeItem('logging_positiveHabits');
    localStorage.removeItem('logging_negativeHabits');
    navigate("/dashboard");
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4">
        <div className="text-xl font-semibold text-gray-700">
          Loading states...
        </div>
      </div>
    );
  }

  // Combine positive and negative states for rendering
  const allStatesToRender = [
      ...positiveAvailableStates.map(state => ({ state, isPositive: true })),
      ...negativeAvailableStates.map(state => ({ state, isPositive: false })),
  ];


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4 sm:p-8">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg sm:p-10">
        
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">
          Rate how much you felt the following today.
        </h2>

        {/* Sliders Container */}
        <div className="space-y-8">
          {allStatesToRender.map(({ state, isPositive }) => {
            const currentRatings = isPositive ? positiveMoodRatings : negativeMoodRatings;
            const setRatings = isPositive ? setPositiveMoodRatings : setNegativeMoodRatings;
            
            return (
              <div key={state}>
                <label htmlFor={state} className="block text-lg font-medium text-gray-800">
                  {state}
                </label>
                <input
                  type="range"
                  id={state}
                  min="0"
                  max="5"
                  step="1"
                  value={currentRatings[state] || 0}
                  onChange={(e) => handleSliderChange(state, parseInt(e.target.value), isPositive)}
                  className="
                    mt-2 w-full cursor-pointer appearance-none rounded-lg
                    bg-gray-200 accent-purple-600 outline-none
                    /* FIX: Added horizontal padding to input to align track endpoints with labels */
                    px-[6.6%] /* Approximately half the width of the first/last label segment (1/12th of 100%) */

                    /* Custom slider track styles */
                    h-3  /* Thicker bar */
                    [&::-webkit-slider-runnable-track]:rounded-lg
                    [&::-moz-range-track]:rounded-lg
                    
                    /* Custom slider thumb styles */
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-5  /* Height for rounded square */
                    [&::-webkit-slider-thumb]:w-5  /* Width for rounded square */
                    [&::-webkit-slider-thumb]:rounded-md /* Rounded square */
                    [&::-webkit-slider-thumb]:bg-purple-600
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:-mt-1 /* Adjust thumb position to center on thicker track */

                    [&::-moz-range-thumb]:appearance-none
                    [&::-moz-range-thumb]:h-5
                    [&::-moz-range-thumb]:w-5
                    [&::-moz-range-thumb]:rounded-md
                    [&::-moz-range-thumb]:bg-purple-600
                    [&::-moz-range-thumb]:shadow-md
                  "
                />
                {/* Tick Marks - All spans use flex-1 and text-center for perfect alignment */}
                <div className="mt-1 flex w-full justify-between px-0 text-sm text-gray-500">
                  <span className="flex-1 text-center">Unset</span>
                  <span className="flex-1 text-center">1</span>
                  <span className="flex-1 text-center">2</span>
                  <span className="flex-1 text-center">3</span>
                  <span className="flex-1 text-center">4</span>
                  <span className="flex-1 text-center">5</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleBack}
            type="button"
            disabled={submitting}
            className="rounded-lg px-8 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Back
          </button>
          <button
            onClick={handleCancel}
            type="button"
            disabled={submitting}
            className="rounded-lg px-8 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="button"
            disabled={submitting}
            className="
              rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-10 py-2.5
              font-semibold text-white shadow-md transition-all
              hover:opacity-90 focus:outline-none focus:ring-2
              focus:ring-purple-500 focus:ring-offset-2
              disabled:opacity-70
            "
          >
            {submitting ? 'Submitting...' : 'Done'}
          </button>
        </div>
        
      </div>
    </div>
  );
};
