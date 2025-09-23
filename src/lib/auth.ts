import { UserData } from "@/types/dashboard";

/**
 * Get the current user data from localStorage
 */
export function getCurrentUser(): UserData | null {
  if (typeof window === "undefined") {
    return null; // SSR safe
  }
  
  try {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error parsing user data from localStorage:", error);
    return null;
  }
}

/**
 * Get the Google token from localStorage
 */
export function getGoogleToken(): string | null {
  if (typeof window === "undefined") {
    return null; // SSR safe
  }
  
  return localStorage.getItem("google_token");
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!(getGoogleToken() && getCurrentUser());
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === "undefined") {
    return; // SSR safe
  }
  
  localStorage.removeItem("google_token");
  localStorage.removeItem("user_data");
}

/**
 * Check if token is expired (basic check)
 */
export function isTokenExpired(): boolean {
  const token = getGoogleToken();
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
}