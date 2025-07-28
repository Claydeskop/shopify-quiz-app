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
  const { searchParams } = new URL(request.url);
  
  // Try to get shop from cookie first (most reliable for authenticated sessions)
  const shopFromCookie = request.cookies.get('shopify_shop')?.value;
  if (shopFromCookie && isValidShopDomain(shopFromCookie)) {
    return shopFromCookie;
  }

  // Try to get shop from session cookie (alternative session storage)
  const sessionShop = request.cookies.get('shopify_session_shop')?.value;
  if (sessionShop && isValidShopDomain(sessionShop)) {
    return sessionShop;
  }

  // Try to get shop from query params
  const shopFromQuery = searchParams.get('shop');
  if (shopFromQuery && isValidShopDomain(shopFromQuery)) {
    return shopFromQuery;
  }

  // Try to decode shop from host parameter (Shopify embedded apps)
  const hostParam = searchParams.get('host');
  if (hostParam) {
    try {
      // Decode base64 host parameter
      const decodedHost = Buffer.from(hostParam, 'base64').toString('utf-8');
      // Extract shop domain from decoded host (format: admin.shopify.com/store/SHOP_NAME)
      const shopMatch = decodedHost.match(/\/store\/([^\/]+)/);
      if (shopMatch && shopMatch[1]) {
        const shopDomain = `${shopMatch[1]}.myshopify.com`;
        if (isValidShopDomain(shopDomain)) {
          return shopDomain;
        }
      }
    } catch (error) {
      console.log('Failed to decode host parameter:', error);
    }
  }

  // Try to get shop from headers (for embedded apps)
  const shopFromHeader = request.headers.get('x-shopify-shop-domain');
  if (shopFromHeader && isValidShopDomain(shopFromHeader)) {
    return shopFromHeader;
  }

  // Try to get shop from authorization header (JWT token)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // This could be a session token containing shop info
      const shopFromToken = extractShopFromToken(token);
      if (shopFromToken && isValidShopDomain(shopFromToken)) {
        return shopFromToken;
      }
    } catch (error) {
      console.log('Failed to extract shop from auth token:', error);
    }
  }

  // Try to get shop from referer header as last resort
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererShop = refererUrl.searchParams.get('shop');
      if (refererShop && isValidShopDomain(refererShop)) {
        return refererShop;
      }
      
      // Also check if referer contains embedded shop info
      const refererHost = refererUrl.searchParams.get('host');
      if (refererHost) {
        const decodedHost = Buffer.from(refererHost, 'base64').toString('utf-8');
        const shopMatch = decodedHost.match(/\/store\/([^\/]+)/);
        if (shopMatch && shopMatch[1]) {
          const shopDomain = `${shopMatch[1]}.myshopify.com`;
          if (isValidShopDomain(shopDomain)) {
            return shopDomain;
          }
        }
      }
    } catch (error) {
      console.log('Failed to extract shop from referer:', error);
    }
  }

  console.log('No valid shop found in request - authentication required');
  return null;
}

function extractShopFromToken(token: string): string | null {
  try {
    // Basic JWT decode (without verification - just for extracting shop info)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.shop || payload.dest || null;
  } catch (error) {
    return null;
  }
}

function isValidShopDomain(shop: string): boolean {
  // Basic validation for Shopify shop domain
  const shopPattern = /^[a-zA-Z0-9\-]+\.myshopify\.com$/;
  return shopPattern.test(shop);
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
      .select('shop_domain, access_token, scope, installed_at, updated_at')
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