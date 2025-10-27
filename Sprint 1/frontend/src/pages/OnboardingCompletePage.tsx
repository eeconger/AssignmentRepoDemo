import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // Using Lucide for a clean check icon

const OnboardingCompletePage: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/");
  };

  const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }> = ({ icon, title, description }) => (
    <div className="flex items-start p-4 bg-gray-50 rounded-xl shadow-inner border border-gray-200">
      <div className="text-indigo-600 mr-4 mt-1 flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 w-full max-w-2xl mx-auto">
      {/* Header Section */}
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h1 className="text-4xl font-extrabold text-gray-800 mb-2 text-center">
        Onboarding Complete!
      </h1>
      <p className="text-xl text-gray-600 mb-8 text-center">
        You are what you eat.
      </p>

      {/* Feature Summary Section */}
      <div className="space-y-6 w-full mb-10">
        <FeatureCard
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-apple"
            >
              <path d="M11 17l6.5-6.5C21 7 21 4.5 21 4s-4.5 0-6.5 3.5L4 14l9 9 2-2z" />
              <path d="M12 11h.01" />
              <path d="M15 8h.01" />
            </svg>
          } // Simple food-related icon
          title="Track Your Nutrition & Mood"
          description="Keep track of your nutrition to see the correlations between what you eat and how you feel, logging both whenever you want."
        />

        <FeatureCard
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-hand-metal"
            >
              <path d="M18 10c0 1.3-3.6 2-6 2s-6-.7-6-2v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4z" />
              <path d="M8 12v6a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-6" />
              <path d="M4 12v6a2 2 0 0 0 2 2h2" />
              <path d="M20 12v6a2 2 0 0 1-2 2h-2" />
              <path d="M12 12v8" />
            </svg>
          } // Represents the hand reference for portions
          title="Portion Size Reference"
          description="Use your hand (closed fist, palm, thumb, finger) as a convenient reference for tracking portions."
        />
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="w-full px-8 py-4 text-xl font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition duration-300 shadow-lg"
      >
        Continue
      </button>
    </div>
  );
};

export default OnboardingCompletePage;
