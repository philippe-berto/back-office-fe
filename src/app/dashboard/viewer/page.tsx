"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import HLSVideoPlayer from "@/components/HLSVideoPlayer";
import { apiClient } from "@/lib/api";

interface Channel {
  channel_id: string;
  hls_url: string;
  media_url: string;
  title: string;
  description: string;
  status: string;
}

interface ChannelsResponse {
  channels: string[];
  total: number;
}

export default function ViewerPage() {
  const [channelIds, setChannelIds] = useState<string[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [channelData, setChannelData] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelLoading, setChannelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const data: ChannelsResponse = await apiClient.getViewerChannels();
      setChannelIds(data.channels || []);
    } catch (err) {
      setError("Failed to fetch channels");
      console.error("Error fetching channels:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelChange = async (channelId: string) => {
    setSelectedChannelId(channelId);
    setChannelData(null);
    
    if (!channelId) return;

    try {
      setChannelLoading(true);
      setError(null);
      
      const data: Channel = await apiClient.getViewerChannel(channelId);
      setChannelData(data);
    } catch (err) {
      setError("Failed to get channel data");
      console.error("Error getting channel data:", err);
    } finally {
      setChannelLoading(false);
    }
  };

  const getStreamUrl = (channelData: Channel) => {
    // Prioritize media_url if available (external working stream)
    if (channelData.media_url) {
      return channelData.media_url;
    }
    
    // Fallback to hls_url if no media_url
    if (!channelData.hls_url) return "";
    
    // If it's a relative URL, make it absolute with the API base URL
    let streamUrl = channelData.hls_url;
    if (streamUrl.startsWith('/')) {
      streamUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${streamUrl}`;
    }
    
    return streamUrl;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Viewer</h1>
            <p className="mt-2 text-sm text-gray-600">
              Select a channel to watch live streams
            </p>
          </div>

          {/* Channel Selection */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="channel-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Channel
              </label>
              
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  <span className="text-sm text-gray-500">Loading channels...</span>
                </div>
              ) : (
                <select
                  id="channel-select"
                  value={selectedChannelId}
                  onChange={(e) => handleChannelChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Choose a channel...</option>
                  {channelIds.map((channelId) => (
                    <option key={channelId} value={channelId}>
                      {channelId}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Channel Info */}
            {channelData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Channel Information</h3>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Title</dt>
                    <dd className="text-sm text-gray-900">{channelData.title}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Status</dt>
                    <dd className="text-sm">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          channelData.status === "live"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {channelData.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Channel ID</dt>
                    <dd className="text-sm text-gray-900">{channelData.channel_id}</dd>
                  </div>
                </dl>
                {channelData.description && (
                  <div className="mt-2">
                    <dt className="text-xs font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{channelData.description}</dd>
                  </div>
                )}
              </div>
            )}

            {/* Stream Loading */}
            {channelLoading && (
              <div className="mt-4 flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Loading channel data...</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
                <button
                  onClick={() => selectedChannelId && handleChannelChange(selectedChannelId)}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Video Player */}
          {channelData && (channelData.hls_url || channelData.media_url) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Live Stream: {channelData.title}
              </h2>
              <div className="mb-2 text-sm text-gray-600">
                Stream URL: {getStreamUrl(channelData)}
              </div>
              <HLSVideoPlayer 
                src={getStreamUrl(channelData)} 
                autoPlay={true} 
              />
              {/* Debug info */}
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <p><strong>HLS URL:</strong> {channelData.hls_url || "Not provided"}</p>
                <p><strong>Media URL:</strong> {channelData.media_url || "Not provided"}</p>
                <p><strong>Final URL:</strong> {getStreamUrl(channelData)}</p>
                <p><strong>Using:</strong> {channelData.media_url ? "media_url (preferred)" : "hls_url"}</p>
                {!channelData.media_url && channelData.hls_url && (
                  <p className="text-amber-600 mt-1">⚠️ Note: media_url not provided, using hls_url which may not exist on server</p>
                )}
              </div>
            </div>
          )}

          {/* No Stream Message */}
          {selectedChannelId && channelData && !channelData.hls_url && !channelLoading && !error && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No stream available</h3>
                <p className="mt-1 text-sm text-gray-500">
                  The selected channel doesn't have an active stream at the moment.
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!selectedChannelId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">How to use the Viewer</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select a channel from the dropdown menu above</li>
                      <li>Wait for the stream to load</li>
                      <li>Use the video controls to play, pause, adjust volume, and go fullscreen</li>
                      <li>Only active channels will have available streams</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
