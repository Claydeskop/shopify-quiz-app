// src/app/api/debug/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY || 'NOT_SET',
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || 'NOT_SET',
    SHOPIFY_SCOPES: process.env.SHOPIFY_SCOPES || 'NOT_SET',
    SHOPIFY_HOST_NAME: process.env.SHOPIFY_HOST_NAME || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}