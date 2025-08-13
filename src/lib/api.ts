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

  async getViewerChannels() {
    return this.request("/viewer/channels");
  }

  async getViewerChannel(channelId: string) {
    return this.request(`/viewer/channels/${channelId}`);
  }

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
