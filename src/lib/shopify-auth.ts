// src/lib/shopify-auth.ts
import { NextRequest } from 'next/server';
import { supabase } from './supabase';

export interface ShopData {
  shop_domain: string;
  access_token: string;
  scope: string;
  installed_at: string;
  updated_at: string;
}

export async function getShopFromRequest(request: NextRequest): Promise<string | null> {
  // Try to get shop from cookie first
  const shopFromCookie = request.cookies.get('shopify_shop')?.value;
  if (shopFromCookie) {
    return shopFromCookie;
  }

  // Try to get shop from query params
  const { searchParams } = new URL(request.url);
  const shopFromQuery = searchParams.get('shop');
  if (shopFromQuery) {
    return shopFromQuery;
  }

  // Try to get shop from headers (for embedded apps)
  const shopFromHeader = request.headers.get('x-shopify-shop-domain');
  if (shopFromHeader) {
    return shopFromHeader;
  }

  // Development fallback - get first available shop from database
  if (process.env.NODE_ENV === 'development') {
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('shop_domain')
        .limit(1)
        .single();

      if (!error && data) {
        console.log('Using development fallback shop:', data.shop_domain);
        return data.shop_domain;
      }
    } catch (error) {
      console.log('No shops found in database for development fallback');
    }
  }

  return null;
}

export async function getAccessTokenForShop(shopDomain: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('access_token')
      .eq('shop_domain', shopDomain)
      .single();

    if (error) {
      console.error('Error fetching access token:', error);
      return null;
    }

    return data?.access_token || null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function getShopData(shopDomain: string): Promise<ShopData | null> {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('shop_domain', shopDomain)
      .single();

    if (error) {
      console.error('Error fetching shop data:', error);
      return null;
    }

    return data as ShopData;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function validateShopAccess(request: NextRequest): Promise<{
  valid: boolean;
  shop?: string;
  accessToken?: string;
  error?: string;
}> {
  const shop = await getShopFromRequest(request);
  
  if (!shop) {
    return {
      valid: false,
      error: 'No shop domain found in request'
    };
  }

  const accessToken = await getAccessTokenForShop(shop);
  
  if (!accessToken) {
    return {
      valid: false,
      shop,
      error: 'No access token found for shop. Please reinstall the app.'
    };
  }

  return {
    valid: true,
    shop,
    accessToken
  };
}

export async function refreshAccessToken(shopDomain: string): Promise<string | null> {
  // For Shopify apps, access tokens don't expire unless the app is uninstalled
  // This function is here for future extensibility if needed
  
  const shopData = await getShopData(shopDomain);
  if (!shopData) {
    return null;
  }

  // In a real scenario, you might want to verify the token is still valid
  // by making a test API call to Shopify
  
  return shopData.access_token;
}

export function createShopifyApiUrl(shop: string, endpoint: string): string {
  const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
  return `https://${shopDomain}/admin/api/2024-01/${endpoint}`;
}

export async function makeShopifyRequest(
  shop: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = await getAccessTokenForShop(shop);
  
  if (!accessToken) {
    throw new Error('No access token available for shop');
  }

  const url = createShopifyApiUrl(shop, endpoint);
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': accessToken,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}