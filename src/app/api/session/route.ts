import { NextRequest, NextResponse } from 'next/server';
import { getShopFromRequest } from '@/lib/shopify-auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Session request URL:', request.url);
    console.log('Session request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Session request cookies:', Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])));
    
    const shopDomain = await getShopFromRequest(request);
    
    console.log('Shop domain found:', shopDomain);
    
    if (!shopDomain) {
      return NextResponse.json(
        { error: 'No shop domain found' },
        { status: 401 }
      );
    }

    // Check if shop exists, if not trigger OAuth installation
    const { data: existingShop, error: shopError } = await supabase
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shopDomain)
      .single();

    console.log('Shop check result:', { existingShop, shopError, shopDomain });

    if (shopError || !existingShop || !existingShop.access_token || existingShop.access_token === 'embedded-app-token') {
      // Shop needs proper OAuth installation
      const installUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=${process.env.SHOPIFY_SCOPES}&redirect_uri=${process.env.SHOPIFY_APP_URL}/api/auth/callback`;
      
      console.log('Shop needs OAuth, redirecting to:', installUrl);
      
      return NextResponse.json({
        success: false,
        requiresAuth: true,
        installUrl,
        shopDomain
      });
    }

    console.log('Session successful, returning shop:', shopDomain);
    
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