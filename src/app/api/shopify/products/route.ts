import { NextRequest, NextResponse } from 'next/server';
import { validateShopAccess, createShopifyApiUrl } from '@/lib/shopify-auth';

// GraphQL response interfaces
interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  status: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  variants: {
    edges: Array<{
      node: {
        price: string;
      };
    }>;
  };
}

interface ShopifyProductEdge {
  node: ShopifyProductNode;
}

interface ShopifyProductsResponse {
  data: {
    products: {
      edges: ShopifyProductEdge[];
    };
  };
  errors?: unknown[];
}

const GET_PRODUCTS_QUERY = `
  query getProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          vendor
          status
          featuredImage {
            url
            altText
          }
          variants(first: 1) {
            edges {
              node {
                price
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchProducts(shop: string, accessToken: string, request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const query = searchParams.get('query') || '';

  const graphqlUrl = createShopifyApiUrl(shop, 'graphql.json');

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: GET_PRODUCTS_QUERY,
      variables: {
        first: limit,
        query: query || undefined,
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

  const responseData = data as ShopifyProductsResponse;
  const products = responseData.data.products.edges.map((edge: ShopifyProductEdge) => ({
    id: edge.node.id.replace('gid://shopify/Product/', ''),
    title: edge.node.title,
    handle: edge.node.handle,
    vendor: edge.node.vendor,
    status: edge.node.status,
    image: edge.node.featuredImage?.url || null,
    price: edge.node.variants.edges[0]?.node.price || null,
  }));

  return NextResponse.json({ products });
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

    return await fetchProducts(shop, accessToken, request);
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from Shopify' },
      { status: 500 }
    );
  }
}