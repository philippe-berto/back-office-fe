"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import SessionLookupForm from "@/components/SessionLookupForm";
import SessionDetails from "@/components/SessionDetails";
import { SessionResponse } from "@/types/dashboard";

export default function SessionsPage() {
  const [lookupSessionData, setLookupSessionData] = useState<SessionResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupWarning, setLookupWarning] = useState<string | null>(null);

  const handleSessionFound = (sessionData: SessionResponse) => {
    setLookupSessionData(sessionData);
    setLookupError(null);
    setLookupWarning(null);
  };

  const handleLookupError = (errorMessage: string) => {
    setLookupError(errorMessage);
    setLookupSessionData(null);
    setLookupWarning(null);
  };

  const handleLookupWarning = (warningMessage: string) => {
    setLookupWarning(warningMessage);
    setLookupError(null);
    setLookupSessionData(null);
  };

  return (
    <ProtectedRoute requiredRoles={["admin", "qa", "developer"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
            <p className="mt-2 text-sm text-gray-600">
              View and manage streaming sessions
            </p>
          </div>

          {/* Session Lookup Form */}
          <SessionLookupForm 
            onSessionFound={handleSessionFound}
            onError={handleLookupError}
            onWarning={handleLookupWarning}
          />

          {/* Lookup Error Display */}
          {lookupError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{lookupError}</p>
            </div>
          )}

          {/* Lookup Warning Display */}
          {lookupWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">{lookupWarning}</p>
            </div>
          )}

          {/* Session Details Display */}
          {lookupSessionData && (
            <SessionDetails sessionData={lookupSessionData} />
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
