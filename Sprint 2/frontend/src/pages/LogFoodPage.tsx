import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// This wrapper function allows the component to be used directly in routing.
export default function LogFoodPage() {
    return (
        <FoodLogger />
    );
}

// --- CONSTANTS & TYPES ---
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600";
const primaryButtonClass =
  "px-6 py-3 text-white font-bold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";

type PortionSizes = { fist: number; palm: number; thumb: number; };
type FoodGroups = {
  vegetables: PortionSizes; protein: PortionSizes; grains: PortionSizes;
  dairy: PortionSizes; fruits: PortionSizes;
};

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const FOOD_GROUPS: { name: keyof FoodGroups; label: string }[] = [
    { name: "vegetables", label: "Vegetables" },
    { name: "protein", label: "Protein" },
    { name: "grains", label: "Grains" },
    { name: "dairy", label: "Dairy" },
    { name: "fruits", label: "Fruits" },
];
const PORTIONS: { name: keyof PortionSizes; icon: string }[] = [
    { name: "fist", icon: "✊" },
    { name: "palm", icon: "🖐️" },
    { name: "thumb", icon: "👍" },
];

const INITIAL_FOOD_DATA: FoodGroups = {
  vegetables: { fist: 0, palm: 0, thumb: 0 },
  protein: { fist: 0, palm: 0, thumb: 0 },
  grains: { fist: 0, palm: 0, thumb: 0 },
  dairy: { fist: 0, palm: 0, thumb: 0 },
  fruits: { fist: 0, palm: 0, thumb: 0 },
};

// --- HELPER COMPONENT ---

interface FoodGroupInputProps {
    group: { name: keyof FoodGroups; label: string };
    foodData: FoodGroups;
    submitting: boolean;
    getGroupSummary: (g: keyof FoodGroups) => string;
    addPortion: (g: keyof FoodGroups, p: keyof PortionSizes) => void;
    setEditingGroup: React.Dispatch<React.SetStateAction<{ group: keyof FoodGroups; portion: keyof PortionSizes; } | null>>;
}

/** Renders a single food group block with portion buttons and summary. */
const FoodGroupInput: React.FC<FoodGroupInputProps> = ({ 
    group, foodData, submitting, getGroupSummary, addPortion, setEditingGroup
}) => {
    const summary = getGroupSummary(group.name);

    return (
        <div className="p-4 rounded-xl border-2 border-gray-200 bg-white">
            <span className="font-semibold text-gray-900">{group.label}</span>
            
            <div className="flex flex-wrap gap-2 mt-3 mb-2">
                {PORTIONS.map((portion) => (
                    <button
                        key={portion.name}
                        type="button"
                        onClick={() => addPortion(group.name, portion.name)}
                        disabled={submitting}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 text-sm font-medium flex items-center gap-2 text-gray-700 disabled:opacity-70"
                    >
                        {/* Plus Icon replacement */}
                        <span className="w-3 h-3 flex items-center justify-center font-bold text-lg leading-none p-0 m-0 pb-1">+</span>
                        <span>{portion.icon}</span>
                        <span className="capitalize">{portion.name}</span>
                    </button>
                ))}
            </div>

            {summary && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => {
                            const portions = foodData[group.name];
                            const activePortion = (Object.keys(portions) as Array<keyof PortionSizes>).find((key) => portions[key] > 0);
                            if (activePortion) {
                                setEditingGroup({ group: group.name, portion: activePortion });
                            }
                        }}
                        disabled={submitting}
                        className="text-sm text-purple-600 hover:underline disabled:opacity-70"
                    >
                        {summary}
                    </button>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

const FoodLogger: React.FC = () => {
    const navigate = useNavigate();
    const [selectedMeal, setSelectedMeal] = useState<string>("");
    const [notes, setNotes] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [foodData, setFoodData] = useState<FoodGroups>(INITIAL_FOOD_DATA);
    const [editingGroup, setEditingGroup] = useState<{
        group: keyof FoodGroups; portion: keyof PortionSizes;
    } | null>(null);

    // Load data from localStorage on mount (New Functionality)
    useEffect(() => {
        const storedData = localStorage.getItem('logging_meal');
        if (storedData) {
            try {
                const parsedData = JSON.parse(storedData);
                
                // Populate states if data is present
                if (parsedData.meal) setSelectedMeal(parsedData.meal);
                if (parsedData.notes) setNotes(parsedData.notes);
                // Deep copy to ensure state is properly initialized/updated
                if (parsedData.data) setFoodData(parsedData.data);
            } catch (e) {
                console.error("Error parsing stored meal data:", e);
                // Optional: Clear bad data if parsing fails
                // localStorage.removeItem('logging_meal');
            }
        }
    }, []);

    // --- Data Handlers ---

    const addPortion = (group: keyof FoodGroups, portion: keyof PortionSizes) => {
        setFoodData((prev) => ({
            ...prev,
            [group]: { ...prev[group], [portion]: prev[group][portion] + 1, },
        }));
    };

    const updatePortion = (
        group: keyof FoodGroups, portion: keyof PortionSizes, value: number
    ) => {
        setFoodData((prev) => ({
            ...prev,
            [group]: { ...prev[group], [portion]: Math.max(0, value), },
        }));
    };

    const getGroupSummary = useMemo(() => (group: keyof FoodGroups): string => {
        const portions = foodData[group];
        const items: string[] = [];
        if (portions.fist > 0) items.push(`Fist x ${portions.fist}`);
        if (portions.palm > 0) items.push(`Palm x ${portions.palm}`);
        if (portions.thumb > 0) items.push(`Thumb x ${portions.thumb}`);
        return items.length > 0 ? `Logged: ${items.join(", ")}` : "";
    }, [foodData]);

    const hasAnyFood = useMemo(() => {
        return Object.values(foodData).some((group) =>
            Object.values(group).some((count) => count > 0)
        );
    }, [foodData]);

    const handleBackToDashboard = () => {
        // Clear all logging data from localStorage before navigating
        localStorage.removeItem('logging_meal');
        localStorage.removeItem('logging_positiveHabits');
        localStorage.removeItem('logging_negativeHabits');
        
        navigate("/dashboard");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        if (!selectedMeal) {
            setError("Please select a meal type.");
            setSubmitting(false);
            return;
        }

        if (!hasAnyFood) {
            setError("Please add at least one food item.");
            setSubmitting(false);
            return;
        }

        // Combine meal type, notes, and food data into one payload object
        const mealLogData = {
            meal: selectedMeal, data: foodData, notes: notes, timestamp: new Date().toISOString(),
        };

        // Store the data in localStorage
        localStorage.setItem('logging_meal', JSON.stringify(mealLogData));

        // Navigate to the next logging step (Habits)
        navigate("/log/habits");
    };

    // --- Render Functions ---

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4 sm:p-8">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-purple-100">
                    <h1 className={`text-3xl font-bold mb-2 ${gradientTextClass} text-center`}>
                        Log Your Food
                    </h1>
                    <p className="text-gray-600 text-center mb-8">
                        Track what you eat to see how it affects your mood
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Meal Type Selection */}
                        <div>
                            <label className="block text-base font-semibold text-gray-700 mb-3">Select Meal Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                {MEAL_TYPES.map((meal) => (
                                    <button
                                        key={meal} type="button" onClick={() => setSelectedMeal(meal)}
                                        disabled={submitting}
                                        className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 font-medium ${
                                            selectedMeal === meal
                                                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg"
                                                : "border-gray-200 hover:border-purple-300 hover:shadow-md text-gray-700"
                                            } disabled:opacity-70`}
                                    >
                                        {meal}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Food Items - Using the Helper Component */}
                        <div className="space-y-4">
                            <label className="block text-base font-semibold text-gray-700">Add Food Items</label>
                            {FOOD_GROUPS.map((group) => (
                                <FoodGroupInput 
                                    key={group.name} 
                                    group={group} 
                                    foodData={foodData} 
                                    addPortion={addPortion} 
                                    setEditingGroup={setEditingGroup}
                                    submitting={submitting}
                                    getGroupSummary={getGroupSummary}
                                />
                            ))}
                        </div>

                        {/* Summary Card */}
                        {hasAnyFood && (
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                                <h3 className="font-semibold text-gray-900 mb-3">Your {selectedMeal || "Meal"} Summary</h3>
                                <div className="space-y-2 text-sm">
                                    {FOOD_GROUPS.map((group) => {
                                        const summary = getGroupSummary(group.name);
                                        return summary ? (
                                            <div key={group.name} className="flex justify-between">
                                                <span className="font-medium text-gray-700">{group.label}:</span>
                                                <span className="text-gray-600">{summary.replace("Logged: ", "")}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-base font-semibold text-gray-700 mb-2">Notes (Optional)</label>
                            <textarea
                                id="notes" placeholder="Any additional details about the meal..."
                                value={notes} onChange={(e) => setNotes(e.target.value)}
                                disabled={submitting} rows={4}
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 min-h-24 text-base text-gray-900 placeholder-gray-400 disabled:bg-gray-50"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-600 text-center">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons (Back and Submit) */}
                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={handleBackToDashboard} type="button" disabled={submitting}
                                className="rounded-lg px-8 py-2.5 font-semibold text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-70"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit" disabled={submitting}
                                className={`${primaryButtonClass} w-full sm:w-auto flex-1 sm:flex-none`}
                            >
                                {submitting ? 'Logging...' : 'Next'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Portion Size Reference Card */}
                <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-xl">
                    <h3 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                        <span className="text-2xl">💡</span>
                        Portion Size Reference
                    </h3>
                    <div className="space-y-1 text-sm text-gray-700">
                        <p><strong>✊ Fist:</strong> 1 cup (grains, vegetables)</p>
                        <p><strong>🖐️ Palm:</strong> 3-4 oz (proteins)</p>
                        <p><strong>👍 Thumb:</strong> 1 tablespoon (fats, dressings)</p>
                    </div>
                </div>
            </div>

            {/* Edit Portion Modal */}
            {editingGroup && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setEditingGroup(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                Edit {FOOD_GROUPS.find((g) => g.name === editingGroup.group)?.label} - {editingGroup.portion}
                            </h3>
                        </div>
                        <div className="flex items-center justify-center gap-4 py-6">
                            {/* Minus Button */}
                            <button
                                type="button"
                                onClick={() => updatePortion(editingGroup.group, editingGroup.portion, foodData[editingGroup.group][editingGroup.portion] - 1)}
                                className="p-2 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-gray-50 transition-colors"
                            >
                                {/* Minus Icon replacement */}
                                <span className="w-4 h-4 flex items-center justify-center font-bold text-xl leading-none p-0 m-0 pb-1">-</span>
                            </button>
                            <span className="text-4xl font-bold w-16 text-center text-gray-900">
                                {foodData[editingGroup.group][editingGroup.portion]}
                            </span>
                            {/* Plus Button */}
                            <button
                                type="button"
                                onClick={() => updatePortion(editingGroup.group, editingGroup.portion, foodData[editingGroup.group][editingGroup.portion] + 1)}
                                className="p-2 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-gray-50 transition-colors"
                            >
                                {/* Plus Icon replacement */}
                                <span className="w-4 h-4 flex items-center justify-center font-bold text-xl leading-none p-0 m-0 pb-1">+</span>
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingGroup(null)}
                            className={`${primaryButtonClass} w-full`}
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
