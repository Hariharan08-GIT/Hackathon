import React, { useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContextValue";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("user") || null);

  const register = async (
    username,
    password,
    role = "participant",
    name = ""
  ) => {
    await axios.post("/api/auth/register", {
      username,
      password,
      role,
      name: name || username, // Send name or default to username
    });
  };

  const login = async (username, password) => {
    const response = await axios.post("/api/auth/login", {
      username,
      password,
    });
    localStorage.setItem("token", response.data.token);
    const userFromServer = response.data?.user || { username };
    localStorage.setItem("user", JSON.stringify(userFromServer));
    setUser(userFromServer);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Function to check token expiration
  const isTokenExpired = () => {
    const token = localStorage.getItem("token");
    if (!token) return true;

    const [, payload] = token.split(".");
    const decodedPayload = atob(payload);
    const { exp } = JSON.parse(decodedPayload);

    return Date.now() >= exp * 1000; // Check if current time exceeds expiration
  };

  useEffect(() => {
    if (isTokenExpired()) {
      logout(); // Automatically log out if token is expired
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Axios Interceptor for handling 401 responses (Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Check if token is expired and log out
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const [, payload] = token.split(".");
          const { exp } = JSON.parse(atob(payload));
          if (Date.now() >= exp * 1000) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.reload(); // Refresh the page or redirect to login
          }
        } catch (e) {
          console.error("Error parsing token", e);
        }
      }
    }
    return Promise.reject(error);
  }
);
