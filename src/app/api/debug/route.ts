// src/app/api/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow debug endpoints in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');
  
  return NextResponse.json({
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? 'SET' : 'NOT_SET',
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? 'SET' : 'NOT_SET',
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || 'NOT_SET',
    SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES || 'NOT_SET',
    SHOPIFY_HOST_NAME: process.env.SHOPIFY_HOST_NAME || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    REQUEST_URL: request.url,
    SHOP_PARAM: shop,
    // Only expose headers in development
    HEADERS: Object.fromEntries(request.headers.entries()),
  });
}