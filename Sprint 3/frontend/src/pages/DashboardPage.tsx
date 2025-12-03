import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGetUserProfile } from "../api";
// Importing icons for the buttons and edit functionality
import { Smile, Utensils, Pencil, TrendingUp } from "lucide-react"; // Added TrendingUp for Insights

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
  // Determine color for the edit button
  const editButtonColor = isNegative
    ? "text-red-500 hover:text-red-700"
    : "text-purple-500 hover:text-purple-700";

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 min-h-[200px]">
      <div className="flex justify-between items-start mb-4">
        <h3 className={`text-2xl font-bold ${titleGradient}`}>{title}</h3>
        <button onClick={onEdit} className={`p-2 rounded-full ${editButtonColor} transition duration-150`}>
          <Pencil size={18} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className={`px-3 py-1 text-sm font-medium rounded-full border ${tagBorderColor} text-gray-700 bg-gray-50`}
            >
              {item}
            </span>
          ))
        ) : (
          <p className="text-gray-500 italic">No {title.toLowerCase()} selected yet. Tap the edit icon to choose.</p>
        )}
      </div>
    </div>
  );
};

// Helper component for logging buttons
const LogButton: React.FC<{
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  colorClass: string;
}> = ({ title, icon, onClick, colorClass }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02] ${colorClass}`}
  >
    {icon}
    <span className="mt-2 text-white font-semibold text-lg">{title}</span>
  </button>
);


const DashboardPage = () => {
  const navigate = useNavigate();
  const { logout: signOut, token } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      apiGetUserProfile(token)
        .then((profile: UserProfile) => {
          setUserProfile(profile);
          setIsLoading(false);
          // Redirect to onboarding if not complete
          if (!profile.onboardingComplete) {
            navigate("/onboarding/display-name");
          }
        })
        .catch((e) => {
          setError("Failed to load profile. Please sign in again.");
          console.error(e);
          setIsLoading(false);
        });
    }
  }, [token, navigate]);

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };
  
  const handleViewInsights = () => {
    navigate("/insights");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-2xl text-purple-600">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4 text-center">
        <p className="text-xl text-red-600 mb-4">{error}</p>
        <button
          onClick={handleSignOut}
          className="px-6 py-2 text-white font-semibold rounded-lg bg-red-500 hover:bg-red-600 transition duration-300 shadow-md"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  if (!userProfile) return null; // Should be covered by isLoading/error, but for type safety

  const welcomeMessage = `Hello, ${userProfile.displayName || userProfile.email}!`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-extrabold mb-2 text-center md:text-left">
          <span className={positiveGradientClass}>{welcomeMessage}</span>
        </h1>
        <p className="text-xl text-gray-500 mb-8 text-center md:text-left">
          Welcome back to your well-being hub.
        </p>

        {/* Log Activity Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">
            Log Your Activity
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <LogButton
              title="Mood"
              icon={<Smile size={32} className="text-white" />}
              onClick={() => navigate("/log/mood")}
              colorClass="bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-300"
            />
            <LogButton
              title="Habits"
              icon={<Pencil size={32} className="text-white" />}
              onClick={() => navigate("/log/habits")}
              colorClass="bg-gradient-to-r from-sky-500 to-cyan-500 shadow-sky-300"
            />
            <LogButton
              title="Food"
              icon={<Utensils size={32} className="text-white" />}
              onClick={() => navigate("/log/food")}
              colorClass="bg-gradient-to-r from-red-500 to-orange-500 shadow-red-300"
            />
          </div>
        </div>

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

        {/* Insights and Sign out buttons */}
        <div className="mt-12 flex justify-center gap-4">
            {/* NEW INSIGHTS BUTTON */}
            <button
                onClick={handleViewInsights}
                className="px-8 py-3 text-white text-lg font-semibold rounded-lg \
                           bg-gradient-to-r from-teal-500 to-green-600 \
                           hover:from-teal-600 hover:to-green-700 \
                           transition duration-300 shadow-lg flex items-center gap-2"
            >
                <TrendingUp size={20} /> View Insights
            </button>
            {/* EXISTING SIGN OUT BUTTON */}
          <button
            onClick={handleSignOut}
            className="px-8 py-3 text-white text-lg font-semibold rounded-lg \
                       bg-gradient-to-r from-sky-500 to-purple-600 \
                       hover:from-sky-600 hover:to-purple-700 \
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