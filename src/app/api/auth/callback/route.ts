// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const hmac = searchParams.get('hmac');

  console.log('=== OAuth Callback Debug ===');
  console.log('Full URL:', request.url);
  console.log('Code:', code);
  console.log('Shop:', shop);
  console.log('HMAC:', hmac);
  console.log('All params:', Object.fromEntries(searchParams));
  console.log('========================');

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const appUrl = process.env.SHOPIFY_APP_URL;

  if (!apiKey || !apiSecret || !appUrl) {
    return NextResponse.json({ error: 'Missing app configuration' }, { status: 500 });
  }

  try {
    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText,
        url: tokenUrl
      });
      throw new Error(`Failed to exchange code for access token: ${tokenResponse.status} ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const scope = tokenData.scope;

    console.log('Shop authentication completed for:', shop);

    // Save or update shop data in Supabase
    const { error } = await supabase
      .from('shops')
      .upsert({
        shop_domain: shop,
        access_token: accessToken,
        scope: scope,
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'shop_domain'
      });

    if (error) {
      console.error('Error saving shop data:', error);
      return NextResponse.json({ error: 'Failed to save shop data' }, { status: 500 });
    }

    // Set session/cookie for the shop
    const response = NextResponse.redirect(`https://${shop}/admin/apps/product-finder-quiz-app-dev`);
    
    // Set primary shop cookie
    response.cookies.set('shopify_shop', shop, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Set alternative session shop cookie for better session management
    response.cookies.set('shopify_session_shop', shop, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code,
      shop,
      apiKey,
      apiSecret: apiSecret ? 'SET' : 'NOT_SET',
      appUrl
    });
    return NextResponse.json({ 
      error: 'OAuth process failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
