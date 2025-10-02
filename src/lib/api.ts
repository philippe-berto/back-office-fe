import { getGoogleToken, clearAuth } from "./auth";

class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  private getAuthHeaders(): Record<string, string> {
    const token = getGoogleToken();
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
      clearAuth();
      window.location.href = "/login";
      return;
    }

    return response.json();
  }

  // Authentication methods - call backend directly via HTTPS
  async validateGoogleToken(token: string): Promise<{
    success: boolean;
    user?: {
      email: string;
      name: string;
      picture: string;
      roles: string[];
    };
    message?: string;
  }> {
    // Call backend directly via HTTPS
    const response = await fetch(`${this.baseURL}/auth/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_token: token }),
    });

    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login";
      return { success: false, message: "Unauthorized" };
    }

    return response.json();
  }

  // Channel API methods - call backend directly via HTTPS
  async getChannels() {
    const response = await fetch(`${this.baseURL}/api/channels`, {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login";
      return;
    }

    return response.json();
  }

  async getOnlineChannelsCount(): Promise<{ count: number }> {
    const response = await fetch(`${this.baseURL}/api/channels/online/count`, {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login";
      return { count: 0 };
    }

    return response.json();
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
    // Call backend directly via HTTPS
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login";
      return;
    }

    if (response.status === 204) {
      throw new Error('NO_CONTENT');
    }

    if (response.status >= 400) {
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    return response.json();
  }

  async getSessionById(sessionId: string) {
    // Call backend directly via HTTPS
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}`, {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (response.status === 401) {
      // Token expired, redirect to login
      clearAuth();
      window.location.href = "/login";
      return;
    }

    if (response.status === 204) {
      // No content for this session
      throw new Error('NO_CONTENT');
    }

    if (response.status >= 400) {
      // Client or server error
      throw new Error(`HTTP_ERROR_${response.status}`);
    }

    return response.json();
  }

  async getRedisData(key: string) {
    // Call backend directly via HTTPS
    const response = await fetch(`${this.baseURL}/api/redis/${key}`, {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login";
      return;
    }

    return response.json();
  }

  async getSessionLogs(sessionId: string, startTime: string, endTime?: string) {
    // Call backend directly via HTTPS
    const url = new URL(`${this.baseURL}/sessions/${sessionId}/logs`);
    
    // If endTime is not provided, set it to one hour after startTime
    const finalEndTime = endTime || (() => {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour in milliseconds
      return end.toISOString();
    })();
    
    url.searchParams.append('start', startTime);
    url.searchParams.append('end', finalEndTime);

    const response = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login";
      return;
    }

    return response.json();
  }

  async getSessionFrames(sessionId: string) {
    // Call backend directly via HTTPS
    const response = await fetch(`${this.baseURL}/sessions/${sessionId}/frames`, {
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
    });

    if (response.status === 401) {
      clearAuth();
      window.location.href = "/login";
      return;
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
