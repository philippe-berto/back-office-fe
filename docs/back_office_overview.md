# Tunity Back Office

A back-office system for managing streaming resources with role-based access control.

## Authentication Architecture

This project uses **frontend-managed Google OAuth2 authentication** with JWT token validation on the backend.

### Flow Overview

1. Frontend handles Google OAuth2 using Google's JavaScript SDK
2. Frontend receives JWT token from Google
3. Frontend sends JWT to backend for validation
4. Backend validates JWT, checks domain, assigns roles, and creates/updates user

## Frontend Integration (Next.js)

### Required Dependencies

```bash
npm install @react-oauth/google
```

### Environment Variables (.env.local)

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### Google OAuth Setup

1. **GCP Console Configuration:**

   - Go to `APIs & Services → Credentials`
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized origins:
     - `http://localhost:3000` (development)
     - `https://your-domain.com` (production)
   - Add authorized redirect URIs (if needed):
     - `http://localhost:3000/auth/callback`

2. **OAuth Consent Screen:**
   - Set to "Internal" for company domain
   - Required scopes: `email`, `profile`, `openid`

### Authentication Implementation

#### 1. Google Provider Setup

```tsx
// app/layout.tsx or pages/_app.tsx
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

#### 2. Login Component

```tsx
// components/LoginButton.tsx
import { GoogleLogin } from "@react-oauth/google";

export default function LoginButton() {
  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: credentialResponse.credential }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Store token for API calls
        localStorage.setItem("google_token", credentialResponse.credential);
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => console.log("Login Failed")}
      text="signin_with"
      shape="rectangular"
      theme="outline"
    />
  );
}
```

#### 3. API Client with Authentication

```tsx
// lib/api.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem("google_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
        ...options.headers,
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

  async getSessionDetails(sessionId: string) {
    return this.request(`/api/sessions/${sessionId}`);
  }
}

export const apiClient = new ApiClient();
```

#### 4. Auth Hook for User State

```tsx
// hooks/useAuth.ts
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  roles: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("google_token");
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: token }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        localStorage.removeItem("google_token");
      }
    } catch (error) {
      console.error("Token validation failed:", error);
      localStorage.removeItem("google_token");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("google_token");
    setUser(null);
    window.location.href = "/login";
  };

  return { user, loading, logout };
}
```

#### 5. Protected Route Component

```tsx
// components/ProtectedRoute.tsx
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ProtectedRoute({
  children,
  requiredRoles = [],
}: {
  children: React.ReactNode;
  requiredRoles?: string[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  // Check roles if specified
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user.roles.includes(role)
    );
    if (!hasRequiredRole) {
      return (
        <div>Access denied. Required roles: {requiredRoles.join(", ")}</div>
      );
    }
  }

  return <>{children}</>;
}
```

## Backend API Endpoints

### Authentication

- `POST /auth/validate` - Validate Google JWT token
  ```json
  {
    "id_token": "google-jwt-token"
  }
  ```

### Protected Endpoints (require Authorization header)

- `GET /api/channels` - Get channel configurations
- `GET /api/sessions` - Get session details
- `GET /api/sessions/:id/videos` - Get session videos
- `GET /api/redis/:key` - Fetch data from Redis for QA

## User Roles & Permissions

- **admin**: Full access to all resources
- **qa**: Access to sessions, videos, and Redis data
- **developer**: Access to channels and sessions
- **viewer**: Read-only access to basic resources

## Domain Restrictions

Only users with email addresses from `yourcompany.com` domain are allowed.

## Development Setup

1. Configure Google OAuth2 in GCP Console
2. Set environment variables in Next.js
3. Start backend server on port 8080
4. Start Next.js frontend on port 3000
5. Test authentication flow
