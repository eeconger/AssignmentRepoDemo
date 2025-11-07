// src/api.ts
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const apiCreateAccount = async (data: any) => {
  const response = await fetch(`${BASE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.text(); // Returns the session token
};

/**
 * NEW FUNCTION
 * Signs a user in using Basic Authentication
 */
export const apiSignIn = async (email: string, password: string) => {
  // btoa() creates the Base64 string required for Basic Auth
  const basicAuth = btoa(`${email}:${password}`);

  const response = await fetch(`${BASE_URL}/auth`, {
    method: "GET", // Your sign-in route is a GET request
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuth}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.text(); // Returns the session token
};

export const apiUpdateOnboardingProfile = async (data: any, token: string) => {
  const response = await fetch(`${BASE_URL}/profile/onboarding`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.text();
};

export const apiGetUserProfile = async (token: string) => {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
};
