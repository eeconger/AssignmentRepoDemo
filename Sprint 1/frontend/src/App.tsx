import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AuthLayout from "./layouts/AuthLayouts";
import OnboardingLayout from "./layouts/OnboardingLayout";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import WelcomePage from "./pages/WelcomePage";
import SignInPage from "./pages/SignInPage";
import CreateAccountPage from "./pages/CreateAccountPage";

// Onboarding Pages
import DisplayNamePage from "./pages/DisplayNamePage";
import PositiveStatesPage from "./pages/PositiveStatesPage";
import NegativeStatesPage from "./pages/NegativeStatesPage";
import PositiveHabitsPage from "./pages/PositiveHabitsPage";
import NegativeHabitsPage from "./pages/NegativeHabitsPage";
import OnboardingCompletePage from "./pages/OnboardingCompletePage";

// App Page
// import DashboardPage from "./pages/DashboardPage"; // Dashboard is not yet implemented

export default function App() {
  return (
    <Routes>
      {/* 1. AUTH ROUTES (User is logged out) */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<CreateAccountPage />} />
      </Route>

      {/* 2. ONBOARDING WIZARD (User is logged in) */}
      <Route element={<ProtectedRoute />}>
        {" "}
        {/* Ensures user is logged in */}
        <Route element={<OnboardingLayout />}>
          {" "}
          {/* Wraps all steps */}
          <Route
            path="/onboarding/display-name"
            element={<DisplayNamePage />}
          />
          <Route
            path="/onboarding/positive-states"
            element={<PositiveStatesPage />}
          />
          <Route
            path="/onboarding/negative-states"
            element={<NegativeStatesPage />}
          />
          <Route
            path="/onboarding/positive-habits"
            element={<PositiveHabitsPage />}
          />
          <Route
            path="/onboarding/negative-habits"
            element={<NegativeHabitsPage />}
          />
          {/* The final step */}
          <Route
            path="/onboarding/complete"
            element={<OnboardingCompletePage />}
          />
        </Route>
      </Route>

      {/* 3. MAIN APP (User is logged in) - Commented out Dashboard */}
      {/* <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route> */}

      {/* 4. FALLBACK (Redirects to the root path) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
