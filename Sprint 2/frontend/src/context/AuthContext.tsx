// src/context/AuthContext.tsx
import React, { createContext, useState, useContext } from "react";

interface IAuthContext {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Try to get token from localStorage on initial load
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token")
  );

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken); // Persist token
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
