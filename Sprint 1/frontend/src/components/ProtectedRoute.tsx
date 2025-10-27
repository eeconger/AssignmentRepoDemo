// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to signin page, but save the location they tried to access
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />; // Render the child route (e.g., Dashboard or Onboarding)
};

export default ProtectedRoute;
