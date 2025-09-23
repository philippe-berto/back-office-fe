import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    // Get backend URL from environment or use default
    const backendURL = process.env.BACKEND_URL || 'http://34.29.136.15:8080';
    
    console.log(`Proxying session request to: ${backendURL}/sessions/${sessionId}`);
    
    // Get authorization header from the original request
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to your backend from the server side (avoids mixed content)
    const response = await fetch(`${backendURL}/sessions/${sessionId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`Backend response error: ${response.status} ${response.statusText}`);
    }

    // Handle different response types
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    if (response.status >= 400) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `HTTP_ERROR_${response.status}`, message: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Session proxy error:', error);
    return NextResponse.json(
      { error: 'Session service unavailable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}