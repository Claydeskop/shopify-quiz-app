// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const hmac = searchParams.get('hmac');

  console.log('OAuth callback received for shop:', shop);

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
      throw new Error('Failed to exchange code for access token');
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
    const response = NextResponse.redirect(`https://${shop}/admin/apps/shopify-quiz-app`);
    
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
    return NextResponse.json({ error: 'OAuth process failed' }, { status: 500 });
  }
}
