import { NextRequest, NextResponse } from 'next/server';
import { validateShopAccess, createShopifyApiUrl } from '@/lib/shopify-auth';

// GraphQL response interfaces
interface ShopifyCollectionNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  productsCount?: {
    count: number;
  };
  image?: {
    url: string;
    altText?: string;
  };
}

interface ShopifyCollectionEdge {
  node: ShopifyCollectionNode;
}

interface ShopifyCollectionsResponse {
  data: {
    collections: {
      edges: ShopifyCollectionEdge[];
    };
  };
  errors?: unknown[];
}

const GET_COLLECTIONS_QUERY = `
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          productsCount {
            count
          }
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

async function fetchCollections(shop: string, accessToken: string, request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');

  const graphqlUrl = createShopifyApiUrl(shop, 'graphql.json');

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: GET_COLLECTIONS_QUERY,
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

  const responseData = data as ShopifyCollectionsResponse;
  const collections = responseData.data.collections.edges.map((edge: ShopifyCollectionEdge) => ({
    id: edge.node.id.replace('gid://shopify/Collection/', ''),
    title: edge.node.title,
    handle: edge.node.handle,
    description: edge.node.description,
    productsCount: edge.node.productsCount?.count || 0,
    image: edge.node.image?.url || null,
  }));

  return NextResponse.json({ collections });
}

export async function GET(request: NextRequest) {
  try {
    // Validate shop access and get access token
    const { valid, shop, accessToken, error } = await validateShopAccess(request);
    
    if (!valid || !shop || !accessToken) {
      return NextResponse.json(
        { error: error || 'Unauthorized access. Please complete OAuth flow first.' },
        { status: 401 }
      );
    }

    return await fetchCollections(shop, accessToken, request);
  } catch (error) {
    console.error('Error fetching Shopify collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections from Shopify' },
      { status: 500 }
    );
  }
}