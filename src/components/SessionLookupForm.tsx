"use client";

import { useState } from "react";
import { SessionResponse } from "@/types/dashboard";
import { apiClient } from "@/lib/api";

interface SessionLookupFormProps {
  onSessionFound: (sessionData: SessionResponse) => void;
  onError: (error: string) => void;
  onWarning: (warning: string) => void;
}

export default function SessionLookupForm({ onSessionFound, onError, onWarning }: SessionLookupFormProps) {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId.trim()) {
      onError("Please enter a session ID");
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.getSessionById(sessionId.trim());
      onSessionFound(response);
    } catch (err: any) {
      console.error("Error fetching session:", err);
      
      if (err.message === 'NO_CONTENT') {
        onWarning(`No content for this session. (HTTP 204).`);
      } else if (err.message?.startsWith('HTTP_ERROR_')) {
        const statusCode = err.message.replace('HTTP_ERROR_', '');
        onError(`Failed to fetch session ${sessionId} (HTTP ${statusCode}). Please check the ID or contact the admin.`);
      } else {
        onError(`Failed to fetch session ${sessionId}. Please check the ID and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Session Lookup
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Enter a session ID to view detailed session information.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="sessionId" className="sr-only">
              Session ID
            </label>
            <input
              type="text"
              name="sessionId"
              id="sessionId"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md text-gray-900 px-4 py-2"
              placeholder="Enter session ID"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !sessionId.trim()}
            className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              "Lookup Session"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}