import React from "react";

// Authentication types
export interface GoogleTokenPayload {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google user ID
  iss: string; // Issuer
  aud: string; // Audience
  exp: number; // Expiration time
  iat: number; // Issued at time
}

export interface UserData {
  email: string;
  name: string;
  picture: string;
  roles: string[];
}

// Dashboard related types
export interface DashboardStats {
  onlineChannels: number;
  sessionsLastHour: number;
  loading: boolean;
  error: string | null;
}

// Quick action types
export interface QuickAction {
  name: string;
  description: string;
  href: string;
  icon: string | React.ReactElement;
  color: string;
  roles?: string[] | null;
}

export interface QuickActionCardProps {
  name: string;
  description: string;
  href: string;
  icon: string | React.ReactElement;
  color: string;
}

// Session related types
export interface LocationData {
  country: string;
  region: string;
  county: string;
}

export interface SimpleSession {
  id: number;
  user_id: number;
  selected_tuner: number;
  failure_reason: string;
  init_ts: string;
  end_ts: string;
}

export interface SessionResponse {
  message?: string;
  session?: SimpleSession;
  location?: LocationData;
}
