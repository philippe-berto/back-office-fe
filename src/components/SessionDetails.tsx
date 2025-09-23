"use client";

import { SessionResponse } from "@/types/dashboard";

interface SessionDetailsProps {
  sessionData: SessionResponse;
}

export default function SessionDetails({ sessionData }: SessionDetailsProps) {
  const { message, session, location } = sessionData;

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "N/A";
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  };

  const getStatusColor = (failure: string) => {
    if (!failure) {
      return "bg-green-100 text-green-800";
    }
    return "bg-red-100 text-red-800";
  };

  if (!session) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              No Session Data
            </h3>
            {message && (
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Session Details
        </h3>
        
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Session Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Session Information</h4>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Session ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{session.id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{session.user_id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Selected Tuner</dt>
                <dd className="mt-1 text-sm text-gray-900">{session.selected_tuner}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.failure_reason)}`}>
                    {session.failure_reason ? "Failed" : "Success"}
                  </span>
                </dd>
              </div>
              
              {session.failure_reason && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Failure Reason</dt>
                  <dd className="mt-1 text-sm text-red-600">{session.failure_reason}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Timing and Location */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Timing & Location</h4>
            
            <div className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Start Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(session.init_ts)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500">End Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(session.end_ts)}</dd>
              </div>
              
              {location && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Country</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.country || "N/A"}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Region</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.region || "N/A"}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">County</dt>
                    <dd className="mt-1 text-sm text-gray-900">{location.county || "N/A"}</dd>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}