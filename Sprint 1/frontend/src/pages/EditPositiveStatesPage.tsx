import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGetUserProfile, apiUpdateOnboardingProfile } from "../api";
import { POSITIVE_STATES } from "../constants";

// Custom class for gradient text (Blue to Purple)
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";
// Class for the gradient button background (Blue to Purple)
const primaryButtonClass =
  "w-full px-6 py-3 text-white text-lg font-semibold rounded-lg bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition duration-300 shadow-md disabled:opacity-50";

const EditPositiveStatesPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const profile = await apiGetUserProfile(token);
        setSelectedStates(profile.positiveStates || []);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const toggleState = (state: string) => {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  };

  const handleSave = async () => {
    if (selectedStates.length < 3) {
      alert("Please select at least 3 positive states.");
      return;
    }

    setSaving(true);
    try {
      await apiUpdateOnboardingProfile(
        { positiveStates: selectedStates },
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
      <div className="p-8 text-lg font-semibold text-purple-600">
        Loading...
      </div>
    );

  return (
    // Outer wrapper for full-screen centering and white background
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-2xl max-w-md w-full m-4">
        {/* HEADING with GRADIENT TEXT */}
        <h1
          className={`text-3xl font-bold mb-6 text-center ${gradientTextClass}`}
        >
          Edit Positive States
        </h1>

        <div className="bg-white p-0 w-full mb-6">
          <p className="text-lg text-gray-700 mb-6 text-center">
            Select at least 3 positive states you want to track:
          </p>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {POSITIVE_STATES.map((state) => {
                const isSelected = selectedStates.includes(state);

                const baseClasses =
                  "px-4 py-2 rounded-full text-base font-semibold transition duration-200 shadow-sm border";

                // SELECTED: Uses the Blue-to-Purple gradient background
                const selectedClasses =
                  "bg-gradient-to-r from-sky-500 to-purple-600 text-white border-transparent";

                // UNSELECTED: Uses the Blue-to-Purple gradient for text, white background, and a soft purple border
                const unselectedClasses = `${gradientTextClass} bg-white border-purple-200 hover:border-purple-600`;

                return (
                  <button
                    key={state}
                    onClick={() => toggleState(state)}
                    className={`${baseClasses} ${
                      isSelected ? selectedClasses : unselectedClasses
                    }`}
                  >
                    {state}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-4 text-center">
            Selected: {selectedStates.length} (minimum 3 required)
          </p>
        </div>

        <div className="flex justify-end gap-4 w-full">
          {/* Cancel Button */}
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition duration-200"
          >
            Cancel
          </button>

          {/* Save Button with Gradient */}
          <button
            onClick={handleSave}
            disabled={saving || selectedStates.length < 3}
            className={primaryButtonClass}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPositiveStatesPage;
