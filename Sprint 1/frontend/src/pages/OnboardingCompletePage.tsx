import React from "react";
import { useNavigate } from "react-router-dom";
// CheckCircle icon import (unused)
import { CheckCircle } from "lucide-react";

// Custom class for gradient text
const gradientTextClass =
  "bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-purple-600";
// Class for the gradient button background
const primaryButtonClass =
  "w-full text-center px-8 py-3 text-xl font-bold text-white rounded-xl bg-gradient-to-r from-sky-500 to-purple-600 hover:from-sky-600 hover:to-purple-700 transition duration-300 shadow-lg";

const OnboardingCompletePage: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/dashboard");
  };

  // FeatureCard component
  const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
  }> = ({ icon, title, description }) => (
    // Card styling
    <div className="flex items-start p-4 rounded-xl border border-purple-100 hover:shadow-lg transition duration-200">
      {/* Icon color */}
      <div className={`mr-4 mt-1 flex-shrink-0 text-purple-600`}>{icon}</div>
      <div>
        {/* Feature card title uses gradient */}
        <h3 className={`text-lg font-semibold mb-1 ${gradientTextClass}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center bg-white pt-8 pb-12">
      <div className="flex flex-col items-center w-full max-w-lg px-4">
        {/* Header section */}
        {/* <CheckCircle className={`w-20 h-20 mb-4 ${gradientTextClass}`} /> */}

        {/* Heading with gradient */}
        <h1
          className={`text-4xl font-extrabold mb-2 text-center ${gradientTextClass}`}
        >
          You're All Set!
        </h1>
        <p className="text-xl text-gray-700 mb-6 text-center">
          Your Equanimity journey starts now.
        </p>

        {/* Feature summary */}
        <div className="space-y-4 w-full mb-8">
          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                // Generic icon class for cleaner rendering
                className="lucide lucide-zap text-purple-600"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            }
            title="Track Your Nutrition & Mood"
            description="Keep track of your nutrition to see the correlations between what you eat and how you feel, logging both whenever you want."
          />

          <FeatureCard
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                // Generic icon class for cleaner rendering
                className="lucide lucide-ruler text-purple-600"
              >
                <path d="M5 21l-3-3m3 3v-2l1-1h6l3 3h4l2-2v-4l-3-3v-6l-1-1h-2l-3 3v2l-1 1h-6l-3-3h-4l-2 2v4l3 3z" />
              </svg>
            }
            title="Portion Size Reference"
            description="Use your hand (closed fist, palm, thumb, finger) as a convenient reference for tracking portions."
          />
        </div>

        {/* Continue button with gradient */}
        <button onClick={handleContinue} className={primaryButtonClass}>
          Start Tracking Now!
        </button>
      </div>
    </div>
  );
};

export default OnboardingCompletePage;
