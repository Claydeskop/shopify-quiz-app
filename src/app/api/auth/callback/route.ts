// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');
  const hmac = searchParams.get('hmac');

  console.log('Callback received:', { code, shop, hmac });

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Shopify App sayfasına yönlendir
  const redirectUrl = `https://${shop}/admin/apps/shopify-quiz-app`;
  return NextResponse.redirect(redirectUrl);
}
