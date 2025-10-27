<<<<<<< HEAD
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // 1. Import this
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);
import { AuthProvider } from "./context/AuthContext";
=======
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
>>>>>>> 8916393b8e09f589da1c0a034f7fa8aaa795708f

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
