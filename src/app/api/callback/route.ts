// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const shop = searchParams.get('shop');

  if (!code || !shop) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  // Token exchange burada yapılacak (şimdilik basit redirect)
  return NextResponse.redirect('/');
}