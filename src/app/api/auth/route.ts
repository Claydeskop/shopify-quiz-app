// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shop = searchParams.get('shop');

  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  // Debug için URL'leri logla
  console.log('=== OAUTH DEBUG ===');
  console.log('Shop:', shop);
  console.log('API Key:', process.env.SHOPIFY_API_KEY);
  console.log('App URL:', process.env.SHOPIFY_APP_URL);
  console.log('Scopes:', process.env.SHOPIFY_SCOPES);

  // Shopify OAuth URL'i oluştur
  const redirectUri = `${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  console.log('Redirect URI:', redirectUri);
  console.log('Full Auth URL:', authUrl);
  console.log('===================');

  return NextResponse.redirect(authUrl);
}