import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle video requests to prevent VS Code from trying to download them
  if (request.nextUrl.pathname.startsWith('/videos/') || 
      request.nextUrl.pathname.includes('.mp4') ||
      request.nextUrl.pathname.includes('.webm') ||
      request.nextUrl.pathname.includes('.ogg')) {
    
    // Check if request is coming from VS Code or development tools
    const userAgent = request.headers.get('user-agent') || '';
    const isVSCode = userAgent.includes('Visual Studio Code') || 
                     userAgent.includes('vscode') ||
                     userAgent.includes('VS Code');
    
    if (isVSCode) {
      console.log('🚫 Blocking video request from VS Code:', request.nextUrl.pathname);
      return new NextResponse('Video access blocked for development tools', { 
        status: 403,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
    
    // For legitimate browser requests, add proper video headers
    const response = NextResponse.next();
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Content-Type', 'video/mp4');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    return response;
  }
  
  // Add baseline security headers
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return res;
}

export const config = {
  matcher: [
    '/videos/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
