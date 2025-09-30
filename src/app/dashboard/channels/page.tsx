"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient } from "@/lib/api";

interface Channel {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  return (
    <ProtectedRoute requiredRoles={["admin", "developer"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Channels</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage streaming channel configurations
            </p>
          </div>

          {/* {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchChannels}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          )} */}

          {!loading && !error && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {channels.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No channels found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {channels.map((channel) => (
                    <li key={channel.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {channel.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {channel.description}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                channel.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {channel.status}
                            </span>
                            <p className="text-sm text-gray-500">
                              ID: {channel.id}
                            </p>
                          </div>
                        </div>
                      </div>
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
