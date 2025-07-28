import { NextRequest, NextResponse } from 'next/server';
import { getShopFromRequest } from '@/lib/shopify-auth';

export async function GET(request: NextRequest) {
  try {
    const shopDomain = await getShopFromRequest(request);
    
    if (!shopDomain) {
      return NextResponse.json(
        { error: 'No shop domain found' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      shopDomain
    });
  } catch (error) {
    console.error('Session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}