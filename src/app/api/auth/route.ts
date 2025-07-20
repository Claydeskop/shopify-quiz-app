// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  console.log('=== AUTH REQUEST ===');
  console.log('Shop:', shop);
  console.log('Request URL:', request.url);
  console.log('Headers:', Object.fromEntries(request.headers.entries()));

  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  // Shop domain doğrulama
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;

  // Environment variables kontrolü
  const apiKey = process.env.SHOPIFY_API_KEY;
  const appUrl = process.env.SHOPIFY_APP_URL;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_collections';

  if (!apiKey) {
    console.error('SHOPIFY_API_KEY not found');
    return NextResponse.json({ error: 'App configuration error' }, { status: 500 });
  }

  if (!appUrl) {
    console.error('SHOPIFY_APP_URL not found');
    return NextResponse.json({ error: 'App URL not configured' }, { status: 500 });
  }

  // OAuth URL oluştur
  const redirectUri = `${appUrl}/api/auth/callback`;
  const authUrl = `https://${shopDomain}/admin/oauth/authorize?` +
    `client_id=${apiKey}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  console.log('Redirect URI:', redirectUri);
  console.log('Full Auth URL:', authUrl);
  console.log('===================');

  // CORS headers ekle
  const response = NextResponse.redirect(authUrl);
  response.headers.set('X-Frame-Options', 'ALLOWALL');
  response.headers.set('Access-Control-Allow-Origin', '*');
  
  return response;
}