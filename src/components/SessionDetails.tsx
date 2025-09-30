"use client";

import { useState } from "react";
import { SessionResponse } from "@/types/dashboard";
import { apiClient } from "@/lib/api";

interface SessionDetailsProps {
  sessionData: SessionResponse;
}

interface LogEntry {
  Timestamp: string;
  Level: string;
  Message: string;
  SessionID: string;
  [key: string]: any; // Allow for additional log fields
}

export default function SessionDetails({ sessionData }: SessionDetailsProps) {
  const { message, session, location } = sessionData;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

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

  const fetchLogs = async () => {
    if (!session?.id) return;
    
    setLogsLoading(true);
    setLogsError(null);
    
    try {
      // Calculate start time as one minute before init_ts
      const initTime = new Date(session.init_ts);
      const startTime = new Date(initTime.getTime() - 60 * 1000); // Subtract 1 minute in milliseconds
      
      // Convert end_ts to ISO format if it exists
      const endTime = session.end_ts ? new Date(session.end_ts).toISOString() : undefined;
      
      const response = await apiClient.getSessionLogs(
        session.id.toString(), 
        startTime.toISOString(), 
        endTime
      );
      // Handle both array response and object with logs property
      const logsData = Array.isArray(response) ? response : (response.logs || []);
      setLogs(logsData);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogsError("Failed to fetch logs. Please try again.");
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchVideoFrames = async () => {
    if (!session?.id) return;
    
    setVideoLoading(true);
    setVideoError(null);
    
    try {
      const response = await apiClient.getSessionFrames(session.id.toString());
      if (response.signedURL) {
        setVideoUrl(response.signedURL);
      } else {
        setVideoError("No video URL received from server.");
      }
    } catch (error) {
      console.error("Error fetching video frames:", error);
      setVideoError("Failed to fetch video frames. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warn':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'debug':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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
    <div className="space-y-6">
      {/* Session Details Card */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Redis Data
          </h3>

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

      {/* Redis Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Logs
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={fetchLogs}
                disabled={logsLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {logsLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Fetching...
                  </>
                ) : (
                  'Fetch Logs'
                )}
              </button>
              
              <button
                onClick={fetchVideoFrames}
                disabled={videoLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {videoLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Video...
                  </>
                ) : (
                  'Fetch Video'
                )}
              </button>
            </div>
          </div>

          {logsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{logsError}</p>
            </div>
          )}

          {videoError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{videoError}</p>
            </div>
          )}

          {videoUrl && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Session Video</h4>
              <div className="bg-black rounded-lg overflow-hidden">
                <video
                  controls
                  className="w-full h-auto max-w-2xl"
                  preload="metadata"
                >
                  <source src={videoUrl} type="video/quicktime" />
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="mt-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(log.Timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.Level)}`}>
                            {log.Level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-md break-words">
                          {log.Message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {logs.length === 0 && !logsLoading && !logsError && (
            <div className="text-center py-8">
              <p className="text-gray-500">No logs available. Click "Fetch Logs" to retrieve session logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}