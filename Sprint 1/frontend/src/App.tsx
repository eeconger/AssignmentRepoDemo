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
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import SignOut from "./pages/SignOut";

// Onboarding Pages
import DisplayNamePage from "./pages/DisplayNamePage";
import PositiveStatesPage from "./pages/PositiveStatesPage";
import NegativeStatesPage from "./pages/NegativeStatesPage";
import PositiveHabitsPage from "./pages/PositiveHabitsPage";
import NegativeHabitsPage from "./pages/NegativeHabitsPage";
import OnboardingCompletePage from "./pages/OnboardingCompletePage";

// App Page
import DashboardPage from "./pages/DashboardPage";

// Edit Pages
import EditPositiveStatesPage from "./pages/EditPositiveStatesPage";
import EditNegativeStatesPage from "./pages/EditNegativeStatesPage";
import EditPositiveHabitsPage from "./pages/EditPositiveHabitsPage";
import EditNegativeHabitsPage from "./pages/EditNegativeHabitsPage";

export default function App() {
  return (
    <Routes>
      {/* Auth routes (user is logged out) */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<CreateAccountPage />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route path="/signout" element={<SignOut />} />
      </Route>

      {/* Onboarding wizard (user is logged in) */}
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

      {/* Main app (user is logged in) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/edit/positive-states"
          element={<EditPositiveStatesPage />}
        />
        <Route
          path="/edit/negative-states"
          element={<EditNegativeStatesPage />}
        />
        <Route
          path="/edit/positive-habits"
          element={<EditPositiveHabitsPage />}
        />
        <Route
          path="/edit/negative-habits"
          element={<EditNegativeHabitsPage />}
        />
      </Route>

      {/* Fallback: redirect to the root path */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
