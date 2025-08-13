import React from "react";

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
