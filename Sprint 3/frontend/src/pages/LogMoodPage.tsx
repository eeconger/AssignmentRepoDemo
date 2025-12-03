import React, {useState, useEffect} from "react";
import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
import {apiGetUserProfile, apiUserLog} from "../api";

// This wrapper function allows the component to be used directly in routing.
export default function LogMoodPage() {
    return <MoodLogger />;
}

// --- Types ---
type MoodRatings = Record<string, number>;

// Helper to safely parse JSON from localStorage
const safeParseJson = (key: string): MoodRatings => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            // Note: If stored data is not an object (e.g., "[]" or a string), this might fail.
            // MoodRatings is expected to be { [state: string]: number }, so we default to {}
            // if parsing fails or returns a non-object.
            const parsed = JSON.parse(stored);
            if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                return parsed;
            }
            return {};
        } catch (e) {
            console.error(`Failed to parse data for key: ${key}`, e);
            return {};
        }
    }
    return {};
}

/**
 * A component for users to log their daily moods using sliders.
 * It fetches the user's tracked states from their profile.
 * On submit, it reads habit data from localStorage, combines it with
 * mood data, and prepares it for submission.
 */
const MoodLogger: React.FC = () => {
    // --- Hooks ---
    const {token} = useAuth();
    const navigate = useNavigate();

    // --- State ---
    const [positiveAvailableStates, setPositiveAvailableStates] = useState<string[]>([]);
    const [negativeAvailableStates, setNegativeAvailableStates] = useState<string[]>([]);

    const [positiveMoodRatings, setPositiveMoodRatings] = useState<MoodRatings>({});
    const [negativeMoodRatings, setNegativeMoodRatings] = useState<MoodRatings>({});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // --- Data Fetching and LocalStorage Initialization ---
    useEffect(() => {
        const fetchStates = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // Load existing data from localStorage first (Requirement 2)
                const storedPositiveRatings = safeParseJson("logging_positiveStates");
                const storedNegativeRatings = safeParseJson("logging_negativeStates");
                
                // Fetch profile to get the currently tracked states
                const profile = await apiGetUserProfile(token);

                // Note: Using profile.positiveStates and profile.negativeStates (as per original logic from user's snippet)
                const posStates = profile.positiveStates || [];
                const negStates = profile.negativeStates || [];

                setPositiveAvailableStates(posStates);
                setNegativeAvailableStates(negStates);

                // Initialize positive mood ratings
                const initialPositiveRatings: MoodRatings = {};
                posStates.forEach((state: string) => {
                    // Use stored value if it exists for this state, otherwise default to 0
                    initialPositiveRatings[state] = storedPositiveRatings[state] !== undefined
                        ? storedPositiveRatings[state]
                        : 0;
                });
                setPositiveMoodRatings(initialPositiveRatings);

                // Initialize negative mood ratings
                const initialNegativeRatings: MoodRatings = {};
                negStates.forEach((state: string) => {
                    // Use stored value if it exists for this state, otherwise default to 0
                    initialNegativeRatings[state] = storedNegativeRatings[state] !== undefined
                        ? storedNegativeRatings[state]
                        : 0;
                });
                setNegativeMoodRatings(initialNegativeRatings);
            } catch (error) {
                console.error("Failed to load user states or initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStates();
    }, [token]);

    // --- Handlers ---

    /**
     * Updates the rating for a specific mood state.
     */
    const handleSliderChange = (state: string, value: number, isPositive: boolean) => {
        if (isPositive) {
            setPositiveMoodRatings((prev) => ({
                ...prev,
                [state]: value
            }));
        } else {
            setNegativeMoodRatings((prev) => ({
                ...prev,
                [state]: value
            }));
        }
    };

    /**
     * Saves current mood ratings to localStorage before navigating back. (Requirement 1)
     */
    const handleBack = () => {
        localStorage.setItem("logging_positiveStates", JSON.stringify(positiveMoodRatings));
        localStorage.setItem("logging_negativeStates", JSON.stringify(negativeMoodRatings));

        navigate("/log/habits");
    };

    /**
     * Gathers all data (habits + moods), submits, and clears localStorage. (Requirement 3)
     */
    const handleSubmit = async () => {
        setSubmitting(true);

        // 1. Get habit data from localStorage
        const meal = JSON.parse(localStorage.getItem("logging_meal") || "[]");
        const positiveHabits = JSON.parse(localStorage.getItem("logging_positiveHabits") || "[]");
        const negativeHabits = JSON.parse(localStorage.getItem("logging_negativeHabits") || "[]");

        // 2. Format the final payload
        const dailyLogPayload = {
            meal: meal,
            positiveHabits: positiveHabits,
            negativeHabits: negativeHabits,
            positiveStates: positiveMoodRatings, 
            negativeStates: negativeMoodRatings, 
            loggedAt: new Date().toISOString() // ISO timestamp
        };

        // 3. "Submit" the data (e.g., to your API)
        console.log("Submitting Daily Log:", dailyLogPayload);
        try {
            await apiUserLog(dailyLogPayload, token!);
            
            // 4. Clear all relevant keys from localStorage on success
            localStorage.removeItem("logging_meal");
            localStorage.removeItem("logging_positiveHabits");
            localStorage.removeItem("logging_negativeHabits");
            localStorage.removeItem("logging_positiveStates");
            localStorage.removeItem("logging_negativeStates");

            navigate("/dashboard");
        } catch (error) {
            console.error("Failed to submit daily log:", error);
            alert("Failed to save changes. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // --- Render ---

    if (loading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4">
                <div className="text-xl font-semibold text-gray-700">Loading states...</div>
            </div>
        );
    }

    // Combine positive and negative states for rendering
    const allStatesToRender = [
        ...positiveAvailableStates.map((state) => ({state, isPositive: true})),
        ...negativeAvailableStates.map((state) => ({state, isPositive: false}))
    ];

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4 sm:p-8">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg sm:p-10">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Rate how much you felt the following today.</h2>

                {/* Sliders Container */}
                <div className="space-y-8">
                    {allStatesToRender.map(({state, isPositive}) => {
                        const currentRatings = isPositive ? positiveMoodRatings : negativeMoodRatings;

                        // Ensure we use the state name to look up the current rating value, defaulting to 0
                        const currentValue = currentRatings[state] !== undefined ? currentRatings[state] : 0;

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
                                    value={currentValue}
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
                        className="rounded-lg px-8 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900">
                        Back
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
            ">
                        {submitting ? "Submitting..." : "Done"}
                    </button>
                </div>
            </div>
        </div>
    );
};