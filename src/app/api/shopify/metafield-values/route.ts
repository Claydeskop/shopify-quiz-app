import { NextRequest, NextResponse } from 'next/server';
import { validateShopAccess, createShopifyApiUrl } from '@/lib/shopify-auth';

const GET_METAFIELD_VALUES_QUERY = `
  query getMetafieldValues($first: Int!, $metafieldKey: String!, $namespace: String!) {
    products(first: $first) {
      edges {
        node {
          metafield(key: $metafieldKey, namespace: $namespace) {
            value
          }
        }
      }
    }
  }
`;

async function fetchMetafieldValues(shop: string, accessToken: string, request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const namespace = searchParams.get('namespace');
  const limit = parseInt(searchParams.get('limit') || '250');

  if (!key || !namespace) {
    return NextResponse.json(
      { error: 'Missing key or namespace parameter' },
      { status: 400 }
    );
  }

  const graphqlUrl = createShopifyApiUrl(shop, 'graphql.json');

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: GET_METAFIELD_VALUES_QUERY,
      variables: {
        first: limit,
        metafieldKey: key,
        namespace: namespace,
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

  // Extract unique values from the products
  const values = new Set<string>();
  
  data.data.products.edges.forEach((edge: any) => {
    const metafield = edge.node.metafield;
    if (metafield && metafield.value) {
      values.add(metafield.value);
    }
  });

  // Convert to sorted array
  const sortedValues = Array.from(values).sort();

  return NextResponse.json({ 
    values: sortedValues,
    count: sortedValues.length,
    metafield: { key, namespace }
  });
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

    return await fetchMetafieldValues(shop, accessToken, request);
  } catch (error) {
    console.error('Error fetching metafield values:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metafield values from Shopify' },
      { status: 500 }
    );
  }
}