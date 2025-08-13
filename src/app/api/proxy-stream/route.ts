import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mediaUrl = searchParams.get('url');

  if (!mediaUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    // Fetch the media content from the HTTP source
    const response = await fetch(mediaUrl, {
      headers: {
        // Forward relevant headers
        'User-Agent': request.headers.get('user-agent') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: response.status });
    }

    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    
    // If it's an HLS manifest (.m3u8), we need to rewrite relative URLs
    if (contentType.includes('application/vnd.apple.mpegurl') || mediaUrl.endsWith('.m3u8')) {
      const manifestText = await response.text();
      
      // Get base URL for the manifest
      const baseUrl = mediaUrl.substring(0, mediaUrl.lastIndexOf('/') + 1);
      
      // Rewrite relative URLs to use our proxy
      const rewrittenManifest = manifestText.split('\n').map(line => {
        // Skip comment lines and empty lines
        if (line.startsWith('#') || line.trim() === '') {
          return line;
        }
        
        // If it's a relative URL (doesn't start with http), rewrite it
        if (!line.startsWith('http')) {
          const fullUrl = baseUrl + line.trim();
          return `/api/proxy-stream?url=${encodeURIComponent(fullUrl)}`;
        }
        
        return line;
      }).join('\n');
      
      return new NextResponse(rewrittenManifest, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }

    // For non-manifest files (like .ts chunks), just stream them
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
