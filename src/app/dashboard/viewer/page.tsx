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
      // Check if it's HTTP and we're on HTTPS (mixed content)
      if (channelData.media_url.startsWith('http://') && 
          typeof window !== 'undefined' && 
          window.location.protocol === 'https:') {
        // Use proxy to avoid mixed content issues
        return `/api/proxy-stream?url=${encodeURIComponent(channelData.media_url)}`;
      }
      return channelData.media_url;
    }
    
    // Fallback to hls_url if no media_url
    if (!channelData.hls_url) return "";
    
    // If it's a relative URL, make it absolute with the API base URL
    let streamUrl = channelData.hls_url;
    if (streamUrl.startsWith('/')) {
      streamUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}${streamUrl}`;
    }
    
    // Check if it's HTTP and we're on HTTPS (mixed content)
    if (streamUrl.startsWith('http://') && 
        typeof window !== 'undefined' && 
        window.location.protocol === 'https:') {
      // Use proxy to avoid mixed content issues
      return `/api/proxy-stream?url=${encodeURIComponent(streamUrl)}`;
    }
    
    return streamUrl;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Stream Viewer</h1>
            <p className="text-gray-600">
              Select a channel to watch live streams with Tunity's streaming technology
            </p>
          </div>

          {/* Channel Selection */}
          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
            <div className="mb-6">
              <label htmlFor="channel-select" className="block text-sm font-medium text-gray-700 mb-3">
                Select Channel
              </label>
              
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-tunity-blue"></div>
                  <span className="text-sm text-gray-500">Loading channels...</span>
                </div>
              ) : (
                <select
                  id="channel-select"
                  value={selectedChannelId}
                  onChange={(e) => handleChannelChange(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tunity-blue focus:border-tunity-blue text-sm"
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
              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Channel Information
                </h3>
                <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Title</dt>
                    <dd className="text-sm text-gray-900 font-medium">{channelData.title}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</dt>
                    <dd className="text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          channelData.status === "live"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {channelData.status === "live" && (
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></div>
                        )}
                        {channelData.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Channel ID</dt>
                    <dd className="text-sm text-gray-900 font-mono">{channelData.channel_id}</dd>
                  </div>
                </dl>
                {channelData.description && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</dt>
                    <dd className="text-sm text-gray-700 mt-1">{channelData.description}</dd>
                  </div>
                )}
              </div>
            )}

            {/* Stream Loading */}
            {channelLoading && (
              <div className="flex items-center justify-center space-x-3 text-tunity-blue py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-tunity-blue"></div>
                <span className="text-sm font-medium">Loading channel data...</span>
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
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                  Live Stream: {channelData.title}
                </h2>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <div className="mb-3 text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded border">
                Stream URL: {getStreamUrl(channelData)}
              </div>
              <div className="rounded-lg overflow-hidden bg-black">
                <HLSVideoPlayer 
                  src={getStreamUrl(channelData)} 
                  autoPlay={true} 
                />
              </div>
              {/* Debug info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border text-xs">
                <h4 className="font-semibold text-gray-700 mb-2">Debug Information</h4>
                <div className="space-y-1 text-gray-600">
                  <p><strong>HLS URL:</strong> {channelData.hls_url || "Not provided"}</p>
                  <p><strong>Media URL:</strong> {channelData.media_url || "Not provided"}</p>
                  <p><strong>Final URL:</strong> {getStreamUrl(channelData)}</p>
                  <p><strong>Using:</strong> {channelData.media_url ? "media_url (preferred)" : "hls_url"}</p>
                  {!channelData.media_url && channelData.hls_url && (
                    <p className="text-amber-600 mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Note: media_url not provided, using hls_url which may not exist on server
                    </p>
                  )}
                </div>
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-tunity-blue" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-tunity-blue">How to use Tunity Viewer</h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Select a channel from the dropdown menu above</li>
                      <li>Wait for the stream to load with Tunity's technology</li>
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
