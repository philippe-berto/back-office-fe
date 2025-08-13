class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("google_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...(options.headers as Record<string, string>),
      },
    });

    if (response.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem("google_token");
      window.location.href = "/login";
      return;
    }

    return response.json();
  }

  // Example API methods
  async getChannels() {
    return this.request("/api/channels");
  }

  // HARDCODED RESPONSES FOR TESTING - VIEWER ENDPOINTS
  async getViewerChannels(): Promise<{channels: string[], total: number}> {
    // Hardcoded response for testing purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          "channels": [
            "ch001",
            "ch002",
            "ch003",
            "ch004"
          ],
          "total": 4
        });
      }, 500); // Simulate network delay
    });
  }

  async getViewerChannel(channelId: string): Promise<{
    channel_id: string;
    hls_url: string;
    media_url: string;
    title: string;
    description: string;
    status: string;
  }> {
    // Hardcoded response for testing purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          "channel_id": channelId,
          "hls_url": `/viewer/hls/${channelId}/playlist.m3u8`,
          "media_url": "http://34.63.72.90/viewer/18003/stream.m3u8",
          "title": `Channel ${channelId.replace('ch', '')} - News`,
          "description": "24/7 News Channel",
          "status": "live"
        });
      }, 300); // Simulate network delay
    });
  }
  // END HARDCODED RESPONSES

  async getSessionDetails(sessionId: string) {
    return this.request(`/api/sessions/${sessionId}`);
  }

  async getSessions() {
    return this.request("/api/sessions");
  }

  async getSessionVideos(sessionId: string) {
    return this.request(`/api/sessions/${sessionId}/videos`);
  }

  async getRedisData(key: string) {
    return this.request(`/api/redis/${key}`);
  }
}

export const apiClient = new ApiClient();
