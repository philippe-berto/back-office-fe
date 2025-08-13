# Viewer Page - HLS Video Streaming

## Overview

The Viewer page is a dedicated streaming interface that allows users to watch live HLS streams from available channels. It's positioned as the first item in the navigation menu below the Dashboard.

## Features

### 🎥 **HLS Video Player**

- **Custom built player** with full control interface
- **HLS.js integration** for cross-browser compatibility
- **Safari native support** for Apple devices
- **Responsive design** that works on all screen sizes

### 🎮 **Player Controls**

- **Play/Pause**: Start and stop video playback
- **Progress Bar**: Seek to any position in the video
- **Volume Control**: Adjust audio level with slider
- **Mute/Unmute**: Quick audio toggle
- **Fullscreen**: Expand to full browser window
- **Time Display**: Current time and total duration

### 📺 **Channel Selection**

- **Dropdown menu** with all available channels
- **Channel information display** (name, status, ID, description)
- **Real-time status** indicators (active/inactive)
- **Automatic stream loading** when channel is selected

### 🔄 **Stream Management**

- **Automatic HLS detection** and format support
- **Error handling** with retry functionality
- **Loading states** with visual indicators
- **No-stream messaging** for inactive channels

## Technical Implementation

### **API Endpoints**

- `GET /api/channels/streams` - Get channels with streaming capability
- `GET /api/channels/{id}/stream` - Get specific channel's HLS stream URL

### **Components Used**

- `HLSVideoPlayer.tsx` - Custom HLS video player component
- `DashboardLayout.tsx` - Consistent navigation and layout
- `ProtectedRoute.tsx` - Authentication wrapper

### **Libraries**

- **HLS.js** - For HLS stream playback in browsers
- **React hooks** - For state management and effects

## User Experience

### **Access Control**

- Available to **all authenticated users** (no role restrictions)
- Seamlessly integrated into the dashboard navigation

### **Workflow**

1. User navigates to "Viewer" in the left menu
2. Selects a channel from the dropdown
3. Stream automatically loads and begins playing
4. Full control over playback with custom player controls

### **Error Handling**

- Clear error messages for connection issues
- Retry functionality for failed streams
- Graceful fallback when no stream is available

## Stream Format Support

- **HLS (HTTP Live Streaming)** - Primary format
- **Cross-browser compatibility** via HLS.js
- **Native Safari support** for Apple devices
- **Adaptive bitrate streaming** (if provided by backend)

## Future Enhancements

Potential additions that could be implemented:

- Multiple quality selection
- Picture-in-picture mode
- Stream recording functionality
- Chat or commentary overlay
- Multiple simultaneous streams
- Stream analytics and monitoring

## Backend Requirements

The backend should provide:

- Channel list with streaming capabilities
- HLS stream URLs in .m3u8 format
- Stream status and availability information
- Proper CORS headers for cross-origin streaming

This completes the core streaming functionality for the Tunity Back Office system!
