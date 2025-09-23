"use client";

import { useState, useEffect } from "react";
import { getGoogleToken, clearAuth } from "@/lib/auth";
import { apiClient } from "@/lib/api";

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
    const token = getGoogleToken();
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      console.log("Validating token with backend...");
      
      // Call backend to validate token and get user data with roles
      const response = await apiClient.validateGoogleToken(token);
      
      if (response.success && response.user) {
        // Convert backend user data to our User interface format
        const userWithId: User = {
          id: response.user.email, // Use email as ID if backend doesn't provide a separate ID
          email: response.user.email,
          name: response.user.name,
          picture: response.user.picture,
          roles: response.user.roles
        };
        
        // Update stored user data with backend response
        localStorage.setItem("user_data", JSON.stringify(response.user));
        setUser(userWithId);
        console.log("Token validation successful:", userWithId);
      } else {
        console.error("Token validation failed:", response.message);
        clearAuth();
      }
    } catch (error) {
      console.error("Token validation request failed:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
