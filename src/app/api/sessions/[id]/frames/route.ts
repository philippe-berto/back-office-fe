import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    
    // Get backend URL from environment or use default
    const backendURL = process.env.BACKEND_URL || 'http://34.29.136.15:8080';
    
    console.log(`Proxying session frames request to: ${backendURL}/sessions/${sessionId}/frames`);
    
    // Get authorization header from the original request
    const authHeader = request.headers.get('authorization');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Make the request to your backend from the server side (avoids mixed content)
    const response = await fetch(`${backendURL}/sessions/${sessionId}/frames`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`Backend response error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Session frames proxy error:', error);
    return NextResponse.json(
      { error: 'Session frames service unavailable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}