"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  roles: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("google_token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      console.log("Skipping token validation - using fake user data for testing...");
      
      // FAKE USER DATA FOR TESTING - SKIP API VALIDATION
      const fakeUserData = {
        success: true,
        user: {
          id: "test-user-123",
          email: "test@tunity.com",
          name: "Test User",
          picture: "https://via.placeholder.com/40/4F7DF8/FFFFFF?text=TU",
          roles: ["admin", "qa", "developer", "viewer"]
        }
      };

      console.log("Using fake user data:", fakeUserData);
      
      if (fakeUserData.success) {
        setUser(fakeUserData.user);
      } else {
        localStorage.removeItem("google_token");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("google_token");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("google_token");
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
