# Tunity Back Office Frontend

A React/Next.js frontend for the Tunity Back Office system with Google OAuth2 authentication and role-based access control.

## Features

- **Google OAuth2 Authentication**: Secure login with Google accounts
- **Role-based Access Control**: Different permissions for admin, qa, developer, and viewer roles
- **Dashboard**: Overview of user information and quick access to features
- **Channels Management**: View and manage streaming channel configurations (admin, developer)
- **Sessions Management**: View streaming sessions and their details (admin, qa, developer)
- **Redis Debugging**: QA tool for fetching Redis data by key (admin, qa)
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop

## Setup

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Platform account with OAuth2 setup
- Backend API running on port 8080

### 1. Environment Configuration

Copy the `.env.local` file and update with your Google OAuth2 credentials:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 2. Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Credentials**
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
5. Configure OAuth consent screen as "Internal" for company domain
6. Required scopes: `email`, `profile`, `openid`

### 3. Install Dependencies

```bash
npm install
```

### 4. Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## User Roles & Permissions

- **admin**: Full access to all resources
- **qa**: Access to sessions, videos, and Redis data debugging
- **developer**: Access to channels and sessions
- **viewer**: Read-only access to basic resources

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout with OAuth provider
├── components/           # Reusable components
│   ├── DashboardLayout.tsx
│   ├── LoginButton.tsx
│   └── ProtectedRoute.tsx
├── hooks/               # Custom React hooks
│   └── useAuth.ts       # Authentication hook
└── lib/                 # Utilities and API client
    └── api.ts           # API client with authentication
```

## API Integration

The frontend communicates with the backend through the following endpoints:

- `POST /api/auth/validate` - Validate Google JWT token
- `GET /api/channels` - Get channel configurations
- `GET /api/sessions` - Get session list
- `GET /api/sessions/:id` - Get session details
- `GET /api/sessions/:id/frames` - Get session frames
- `GET /api/redis/:key` - Fetch Redis data for debugging

## Build and Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Security

- JWT tokens are stored in localStorage
- Domain restrictions enforce company email addresses only
- Role-based route protection prevents unauthorized access
- Automatic token validation and refresh handling
