import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGetUserProfile } from "../api";
// Importing icons for the buttons and edit functionality
import { Smile, Utensils, Pencil } from "lucide-react";

interface UserProfile {
  email: string;
  displayName: string;
  onboardingComplete: boolean;
  positiveStates: string[];
  negativeStates: string[];
  positiveHabits: string[];
  negativeHabits: string[];
}

// Gradient for POSITIVE/GENERAL elements (Sky Blue to Purple)
const positiveGradientClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";
// Gradient for NEGATIVE elements (Purple to Red)
const negativeGradientClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-red-600";

// Helper component for styled lists (States/Habits)
const ListCard: React.FC<{
  title: string;
  items: string[];
  isNegative: boolean;
  onEdit: () => void;
}> = ({ title, items, isNegative, onEdit }) => {
  // Determine which gradient to use for the title
  const titleGradient = isNegative
    ? negativeGradientClass
    : positiveGradientClass;
  // Determine border color for the tags
  const tagBorderColor = isNegative ? "border-red-200" : "border-purple-200";
  // Determine color for the edit icon
  const iconColor = isNegative ? "text-red-500" : "text-purple-500";

  return (
    // Card now has relative positioning for the icon and hover effect
    <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100 relative group hover:shadow-xl transition duration-300">
      {/* EDIT ICON: Visible only on hover (group-hover:opacity-100) */}
      <button
        onClick={onEdit}
        className={`absolute top-4 right-4 p-2 rounded-full bg-white/80 opacity-0 group-hover:opacity-100 ${iconColor} hover:bg-gray-100 transition duration-300`}
        aria-label={`Edit ${title}`}
      >
        <Pencil className="w-5 h-5" />
      </button>

      <h3 className={`text-2xl font-bold mb-4 ${titleGradient}`}>{title}</h3>

      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          // List Items: Black text with a categorized border color
          <span
            key={index}
            className={`px-3 py-1 text-base font-semibold rounded-full border ${tagBorderColor} bg-white text-gray-900`}
          >
            {item}
          </span>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 italic">None selected.</p>
        )}
      </div>
    </div>
  );
};

// Action Button component (from previous step, included here for context)
const ActionButton: React.FC<{
  title: string;
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
}> = ({ title, icon, gradientFrom, gradientTo }) => (
  <button
    onClick={() => console.log(`Clicked ${title}`)}
    className={`flex flex-col items-center justify-center w-32 h-32 rounded-full text-white font-bold text-sm 
                  bg-gradient-to-br ${gradientFrom} ${gradientTo} shadow-xl 
                  hover:scale-[1.03] transition duration-200 ease-in-out transform`}
  >
    <div className="text-4xl mb-1">{icon}</div>
    <span>{title}</span>
  </button>
);

const DashboardPage: React.FC = () => {
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // (authentication and data fetching logic omitted for brevity)
      if (!token) {
        setError("No session token found");
        setLoading(false);
        return;
      }
      try {
        // Fetch the user profile using the current session token
        const profile = await apiGetUserProfile(token);
        setUserProfile(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, token]);

  // Sign-out handler
  const handleSignOut = () => {
    logout();
    navigate("/");
  };

  // Loading and error states (simplified)
  if (!isAuthenticated)
    return (
      <div className="p-8 text-red-600">Please sign in to view dashboard</div>
    );
  if (loading)
    return (
      <div className="p-8 text-lg font-semibold text-purple-600">
        Loading...
      </div>
    );
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!userProfile) return <div className="p-8">No profile data found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-5xl font-extrabold ${positiveGradientClass}`}>
            Welcome, {userProfile.displayName}!
          </h1>
        </div>

        {/* ACTION BUTTONS Section */}
        <div className="flex justify-center space-x-8 mb-12">
          <ActionButton
            title="Log Mood"
            icon={<Smile className="w-10 h-10" />}
            gradientFrom="from-sky-500"
            gradientTo="to-purple-600"
          />
          <ActionButton
            title="Log Food"
            icon={<Utensils className="w-10 h-10" />}
            gradientFrom="from-orange-500"
            gradientTo="to-yellow-500"
          />
        </div>

        {/* Focus areas */}
        <h2
          className={`text-3xl font-bold mb-10 text-center ${positiveGradientClass}`}
        >
          Your Focus Areas
        </h2>

        {/* States and habits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ListCard
            title="Positive States"
            items={userProfile.positiveStates}
            isNegative={false}
            onEdit={() => navigate("/edit/positive-states")}
          />
          <ListCard
            title="Negative States"
            items={userProfile.negativeStates}
            isNegative={true}
            onEdit={() => navigate("/edit/negative-states")}
          />
          <ListCard
            title="Positive Habits"
            items={userProfile.positiveHabits}
            isNegative={false}
            onEdit={() => navigate("/edit/positive-habits")}
          />
          <ListCard
            title="Negative Habits"
            items={userProfile.negativeHabits}
            isNegative={true}
            onEdit={() => navigate("/edit/negative-habits")}
          />
        </div>

        {/* Sign out button */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleSignOut}
            className="px-8 py-3 text-white text-lg font-semibold rounded-lg 
                       bg-gradient-to-r from-sky-500 to-purple-600 
                       hover:from-sky-600 hover:to-purple-700 
                       transition duration-300 shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
