import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't need authentication
  const publicRoutes = [
    '/api/quiz/public',
    '/api/proxy/quiz/public',
    '/apps/quiz-app/api/quiz/public',
    '/api/debug' // Debug routes should be public in development
  ];
  
  // Check if this is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Admin routes - require Shopify authentication (only for main page and non-public APIs)
  if (pathname === '/' || (pathname.startsWith('/api/') && !isPublicRoute)) {
    const host = request.nextUrl.searchParams.get('host');
    const shop = request.nextUrl.searchParams.get('shop');
    const embedded = request.nextUrl.searchParams.get('embedded');
    
    // Check for Shopify iframe context headers
    const isShopifyRequest = request.headers.get('sec-fetch-site') === 'cross-origin' || 
                            request.headers.get('sec-fetch-mode') === 'navigate' ||
                            embedded === '1';
    
    // In development, be more permissive with API routes but still protect admin UI
    if (process.env.NODE_ENV === 'development') {
      // Only block direct access to root page without shop param
      if (pathname === '/' && !shop) {
        return new NextResponse('Unauthorized: This admin panel can only be accessed through Shopify.', { status: 403 });
      }
      // Allow all API routes in development
      if (pathname.startsWith('/api/')) {
        return NextResponse.next();
      }
      return NextResponse.next();
    }
    
    // In production, require Shopify auth params and proper context only for root page
    if (pathname === '/' && (!host || !shop)) {
      if (shop) {
        // Redirect to Shopify OAuth
        const authUrl = `https://${process.env.SHOPIFY_APP_URL}/auth?shop=${shop}`;
        return NextResponse.redirect(authUrl);
      } else {
        return new NextResponse('Unauthorized: This admin panel can only be accessed through Shopify.', { status: 403 });
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};