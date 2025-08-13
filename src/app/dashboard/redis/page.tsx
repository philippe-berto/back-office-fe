"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import { apiClient } from "@/lib/api";

export default function RedisPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRedisData = async () => {
    if (!key.trim()) {
      setError("Please enter a Redis key");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getRedisData(encodeURIComponent(key));
      setData(result);
    } catch (err) {
      setError("Failed to fetch Redis data");
      console.error("Error fetching Redis data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRedisData();
  };

  const formatJson = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <ProtectedRoute requiredRoles={["admin", "qa"]}>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Redis Data</h1>
            <p className="mt-2 text-sm text-gray-600">
              Debug tool for fetching Redis data by key
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="redis-key" className="block text-sm font-medium text-gray-700">
                    Redis Key
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="redis-key"
                      id="redis-key"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter Redis key (e.g., session:12345, user:data:67890)"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                      ) : (
                        "Fetch"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Data Display */}
          {data && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Redis Data for: {key}
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(formatJson(data))}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Copy JSON
                  </button>
                </div>
                
                {data.exists ? (
                  <div className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Type</dt>
                      <dd className="mt-1 text-sm text-gray-900">{data.type}</dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">TTL</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {data.ttl === -1 ? "No expiration" : `${data.ttl} seconds`}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Value</dt>
                      <dd className="mt-1">
                        <pre className="bg-gray-50 rounded-md p-4 text-sm text-gray-900 overflow-x-auto">
                          {typeof data.value === 'string' 
                            ? data.value 
                            : formatJson(data.value)
                          }
                        </pre>
                      </dd>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Key not found in Redis</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common Keys Helper */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Common Key Patterns:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• session:&lt;session_id&gt; - Session data</li>
              <li>• user:&lt;user_id&gt; - User information</li>
              <li>• channel:&lt;channel_id&gt; - Channel configuration</li>
              <li>• cache:* - Cached data</li>
              <li>• queue:* - Queue data</li>
            </ul>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
