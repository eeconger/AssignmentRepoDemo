import React, { useState } from "react";
import { Link } from "react-router-dom";
// Removed import { ArrowLeft, Plus, Minus } from "lucide-react";

// This wrapper function allows the component to be used directly in routing.
export default function LogFoodPage() {
    return (
        <FoodLogger />
    );
}

// Custom class for gradient text (matching project style)
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600"; // Used blue-500 consistent with MoodLogger

// Gradient button class (matching project style)
const primaryButtonClass =
  "w-full px-6 py-3 text-white text-xl font-bold rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2";

type PortionSizes = {
  fist: number;
  palm: number;
  thumb: number;
};

type FoodGroups = {
  vegetables: PortionSizes;
  protein: PortionSizes;
  grains: PortionSizes;
  dairy: PortionSizes;
  fruits: PortionSizes;
};

/**
 * A component for users to log their food intake using
 * portion size estimates (fist, palm, thumb).
 */
const FoodLogger: React.FC = () => {
  const [selectedMeal, setSelectedMeal] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foodData, setFoodData] = useState<FoodGroups>({
    vegetables: { fist: 0, palm: 0, thumb: 0 },
    protein: { fist: 0, palm: 0, thumb: 0 },
    grains: { fist: 0, palm: 0, thumb: 0 },
    dairy: { fist: 0, palm: 0, thumb: 0 },
    fruits: { fist: 0, palm: 0, thumb: 0 },
  });
  const [editingGroup, setEditingGroup] = useState<{
    group: keyof FoodGroups;
    portion: keyof PortionSizes;
  } | null>(null);

  const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const foodGroups: { name: keyof FoodGroups; label: string }[] = [
    { name: "vegetables", label: "Vegetables" },
    { name: "protein", label: "Protein" },
    { name: "grains", label: "Grains" },
    { name: "dairy", label: "Dairy" },
    { name: "fruits", label: "Fruits" },
  ];
  const portions: { name: keyof PortionSizes; icon: string }[] = [
    { name: "fist", icon: "✊" },
    { name: "palm", icon: "🖐️" },
    { name: "thumb", icon: "👍" },
  ];

  const addPortion = (group: keyof FoodGroups, portion: keyof PortionSizes) => {
    setFoodData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [portion]: prev[group][portion] + 1,
      },
    }));
  };

  const updatePortion = (
    group: keyof FoodGroups,
    portion: keyof PortionSizes,
    value: number
  ) => {
    setFoodData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [portion]: Math.max(0, value),
      },
    }));
  };

  const getGroupSummary = (group: keyof FoodGroups) => {
    const portions = foodData[group];
    const items: string[] = [];
    if (portions.fist > 0) items.push(`Fist x ${portions.fist}`);
    if (portions.palm > 0) items.push(`Palm x ${portions.palm}`);
    if (portions.thumb > 0) items.push(`Thumb x ${portions.thumb}`);
    return items.length > 0 ? `Logged: ${items.join(", ")}` : "";
  };

  const hasAnyFood = () => {
    return Object.values(foodData).some((group) =>
      Object.values(group).some((count) => count > 0)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedMeal) {
      setError("Please select a meal type.");
      return;
    }

    if (!hasAnyFood()) {
      setError("Please add at least one food item.");
      return;
    }

    // In a real application, you would send the foodData and notes to an API here.
    console.log("Submitting food log:", {
      meal: selectedMeal,
      data: foodData,
      notes: notes,
      timestamp: new Date().toISOString(),
    });

    setSuccess(`Your ${selectedMeal} has been logged successfully!`);

    // Reset form
    setFoodData({
      vegetables: { fist: 0, palm: 0, thumb: 0 },
      protein: { fist: 0, palm: 0, thumb: 0 },
      grains: { fist: 0, palm: 0, thumb: 0 },
      dairy: { fist: 0, palm: 0, thumb: 0 },
      fruits: { fist: 0, palm: 0, thumb: 0 },
    });
    setNotes("");
    setSelectedMeal("");

    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-orange-50 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        {/* Back button (Updated to match style of MoodLogger back button) */}
        <Link to="/dashboard">
          <button
            type="button"
            className="mb-6 flex items-center rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            {/* SVG for ArrowLeft replacement */}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-2" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
        </Link>

        {/* Main card */}
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
              <label className="block text-base font-semibold text-gray-700 mb-3">
                Select Meal Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {mealTypes.map((meal) => (
                  <button
                    key={meal}
                    type="button"
                    onClick={() => setSelectedMeal(meal)}
                    className={`px-6 py-4 rounded-xl border-2 transition-all duration-300 font-medium ${
                      selectedMeal === meal
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg"
                        : "border-gray-200 hover:border-purple-300 hover:shadow-md text-gray-700"
                    }`}
                  >
                    {meal}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Items */}
            <div className="space-y-4">
              <label className="block text-base font-semibold text-gray-700">
                Add Food Items
              </label>
              {foodGroups.map((group) => (
                <div
                  key={group.name}
                  className="p-4 rounded-xl border-2 border-gray-200 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">
                      {group.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {portions.map((portion) => (
                      <button
                        key={portion.name}
                        type="button"
                        onClick={() => addPortion(group.name, portion.name)}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 text-sm font-medium flex items-center gap-2 text-gray-700"
                      >
                        {/* Replacement for Plus Icon */}
                        <span className="w-3 h-3 flex items-center justify-center font-bold text-lg leading-none p-0 m-0 pb-1">
                          +
                        </span>
                        <span>{portion.icon}</span>
                        <span className="capitalize">{portion.name}</span>
                      </button>
                    ))}
                  </div>
                  {getGroupSummary(group.name) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          const portions = foodData[group.name];
                          const activePortion = (
                            Object.keys(portions) as Array<keyof PortionSizes>
                          ).find((key) => portions[key] > 0);
                          if (activePortion) {
                            setEditingGroup({
                              group: group.name,
                              portion: activePortion,
                            });
                          }
                        }}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        {getGroupSummary(group.name)}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary Card */}
            {hasAnyFood() && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Your {selectedMeal || "Meal"} Summary
                </h3>
                <div className="space-y-2 text-sm">
                  {foodGroups.map((group) => {
                    const summary = getGroupSummary(group.name);
                    return summary ? (
                      <div key={group.name} className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          {group.label}:
                        </span>
                        <span className="text-gray-600">
                          {summary.replace("Logged: ", "")}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-base font-semibold text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                placeholder="Any additional details about the meal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 min-h-24 text-base text-gray-900 placeholder-gray-400"
                rows={4}
              />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 text-center">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={`${primaryButtonClass} flex items-center justify-center`}
              >
                {/* Replacement for Plus Icon (Used a slightly larger one here) */}
                <span className="w-5 h-5 flex items-center justify-center font-bold text-2xl leading-none mr-2 p-0 m-0 pb-1">
                  +
                </span>
                Log Meal
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
            <p>
              <strong>✊ Fist:</strong> 1 cup (grains, vegetables)
            </p>
            <p>
              <strong>🖐️ Palm:</strong> 3-4 oz (proteins)
            </p>
            <p>
              <strong>👍 Thumb:</strong> 1 tablespoon (fats, dressings)
            </p>
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
                Edit{" "}
                {foodGroups.find((g) => g.name === editingGroup.group)?.label}{" "}
                - {editingGroup.portion}
              </h3>
            </div>
            <div className="flex items-center justify-center gap-4 py-6">
              <button
                type="button"
                onClick={() =>
                  updatePortion(
                    editingGroup.group,
                    editingGroup.portion,
                    foodData[editingGroup.group][editingGroup.portion] - 1
                  )
                }
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-gray-50 transition-colors"
              >
                {/* Replacement for Minus Icon */}
                <span className="w-4 h-4 flex items-center justify-center font-bold text-xl leading-none p-0 m-0 pb-1">
                  -
                </span>
              </button>
              <span className="text-4xl font-bold w-16 text-center text-gray-900">
                {foodData[editingGroup.group][editingGroup.portion]}
              </span>
              <button
                type="button"
                onClick={() =>
                  updatePortion(
                    editingGroup.group,
                    editingGroup.portion,
                    foodData[editingGroup.group][editingGroup.portion] + 1
                  )
                }
                className="p-2 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:bg-gray-50 transition-colors"
              >
                {/* Replacement for Plus Icon */}
                <span className="w-4 h-4 flex items-center justify-center font-bold text-xl leading-none p-0 m-0 pb-1">
                  +
                </span>
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