import { NextRequest, NextResponse } from 'next/server';
import { validateShopAccess, createShopifyApiUrl } from '@/lib/shopify-auth';

const GET_FILES_QUERY = `
  query getFiles($first: Int!) {
    files(first: $first, query: "media_type:IMAGE") {
      edges {
        node {
          id
          alt
          ... on MediaImage {
            image {
              url
              width
              height
            }
          }
        }
      }
    }
  }
`;

async function fetchMediaFiles(shop: string, accessToken: string, request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');

  const graphqlUrl = createShopifyApiUrl(shop, 'graphql.json');

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: GET_FILES_QUERY,
      variables: {
        first: limit,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  const files = data.data.files.edges.map((edge: any) => ({
    id: edge.node.id,
    alt: edge.node.alt || '',
    url: edge.node.image?.url || '',
    width: edge.node.image?.width || 0,
    height: edge.node.image?.height || 0,
  }));

  return NextResponse.json({ files });
}

export async function GET(request: NextRequest) {
  try {
    // Validate shop access and get access token
    const { valid, shop, accessToken, error } = await validateShopAccess(request);
    
    if (!valid || !shop || !accessToken) {
      // Development fallback - use environment variables if no OAuth setup yet
      if (process.env.NODE_ENV === 'development') {
        const fallbackDomain = process.env.SHOPIFY_STORE_DOMAIN;
        const fallbackToken = process.env.SHOPIFY_ACCESS_TOKEN;
        
        if (fallbackDomain && fallbackToken) {
          console.log('Using development fallback credentials');
          return await fetchMediaFiles(fallbackDomain, fallbackToken, request);
        }
      }
      
      return NextResponse.json(
        { error: error || 'Unauthorized access. Please complete OAuth flow first.' },
        { status: 401 }
      );
    }

    return await fetchMediaFiles(shop, accessToken, request);
  } catch (error) {
    console.error('Error fetching Shopify media:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media files from Shopify' },
      { status: 500 }
    );
  }
}