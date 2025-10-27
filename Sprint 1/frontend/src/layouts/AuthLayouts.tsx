import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Provides the centered, gray-background layout for all auth pages.
 * The <Outlet /> component will render the specific page
 * (e.g., WelcomePage, SignInPage) inside this layout.
 */
const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {/* <Outlet /> is a placeholder from react-router-dom */}
      {/* It renders the matched child route */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;
