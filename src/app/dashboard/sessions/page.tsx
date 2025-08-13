"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient } from "@/lib/api";

interface Session {
  id: string;
  name: string;
  status: string;
  channel_id: string;
  created_at: string;
  updated_at: string;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      setError("Failed to fetch sessions");
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
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

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchSessions}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {sessions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sessions found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <li key={session.id}>
                      <Link
                        href={`/dashboard/sessions/${session.id}`}
                        className="block hover:bg-gray-50"
                      >
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {session.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                Channel: {session.channel_id}
                              </p>
                              <p className="text-sm text-gray-500">
                                Created: {new Date(session.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  session.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : session.status === "ended"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {session.status}
                              </span>
                              <p className="text-sm text-gray-500">
                                ID: {session.id}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
