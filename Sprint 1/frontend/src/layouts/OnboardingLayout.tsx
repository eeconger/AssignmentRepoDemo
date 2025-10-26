// src/layouts/OnboardingLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { OnboardingProvider } from "../context/OnboardingContext";

const OnboardingLayout: React.FC = () => {
  return (
    // Provide the context to all onboarding pages
    <OnboardingProvider>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        {/* You could add a progress bar here */}
        <main className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
          <Outlet /> {/* This will render the current step's page */}
        </main>
      </div>
    </OnboardingProvider>
  );
};

export default OnboardingLayout;
