import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get backend URL from environment or use default
    const backendURL = process.env.BACKEND_URL || 'http://34.29.136.15:8080';
    
    console.log(`Proxying channels online count request to: ${backendURL}/api/channels/online/count`);
    
    // Get authorization header from the original request
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to your backend from the server side (avoids mixed content)
    const response = await fetch(`${backendURL}/api/channels/online/count`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`Backend response error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Channels online count proxy error:', error);
    return NextResponse.json(
      { error: 'Channels online count service unavailable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}