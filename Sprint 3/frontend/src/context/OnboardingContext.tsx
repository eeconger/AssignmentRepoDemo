// src/context/OnboardingContext.tsx
import React, { createContext, useState, useContext } from "react";

// Define the shape of onboarding data
interface IOnboardingData {
  displayName: string;
  positiveStates: string[];
  negativeStates: string[];
  positiveHabits: string[];
  negativeHabits: string[];
  sessionToken: string;
}

interface IOnboardingContext {
  onboardingData: IOnboardingData;
  updateOnboardingData: (data: Partial<IOnboardingData>) => void;
}

const OnboardingContext = createContext<IOnboardingContext | null>(null);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [onboardingData, setOnboardingData] = useState<IOnboardingData>({
    displayName: "",
    positiveStates: [],
    negativeStates: [],
    positiveHabits: [],
    negativeHabits: [],
    sessionToken: "",
  });

  const updateOnboardingData = (data: Partial<IOnboardingData>) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  };

  return (
    <OnboardingContext.Provider
      value={{ onboardingData, updateOnboardingData }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
