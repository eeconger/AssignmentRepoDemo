import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 1. Import this
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);
import { AuthProvider } from "./context/AuthContext";

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
