import { NextRequest, NextResponse } from 'next/server';
import { validateShopAccess, createShopifyApiUrl } from '@/lib/shopify-auth';

// GraphQL response interfaces
interface MetafieldValidation {
  name: string;
  value: string;
}

interface ShopifyMetafieldNode {
  id: string;
  key: string;
  namespace: string;
  name: string;
  description: string;
  type: {
    name: string;
  };
  ownerType: string;
  validations: MetafieldValidation[];
}

interface ShopifyMetafieldEdge {
  node: ShopifyMetafieldNode;
}

interface ShopifyMetafieldsResponse {
  data: {
    metafieldDefinitions: {
      edges: ShopifyMetafieldEdge[];
    };
  };
  errors?: unknown[];
}

const GET_METAFIELDS_QUERY = `
  query getMetafields($first: Int!, $ownerType: MetafieldOwnerType!, $namespace: String) {
    metafieldDefinitions(first: $first, ownerType: $ownerType, namespace: $namespace) {
      edges {
        node {
          id
          key
          namespace
          name
          description
          type {
            name
          }
          ownerType
          validations {
            name
            value
          }
        }
      }
    }
  }
`;

async function fetchMetafields(shop: string, accessToken: string, request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const namespace = searchParams.get('namespace') || undefined;
  const ownerType = searchParams.get('ownerType') || 'PRODUCT';

  const graphqlUrl = createShopifyApiUrl(shop, 'graphql.json');

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({
      query: GET_METAFIELDS_QUERY,
      variables: {
        first: limit,
        ownerType,
        namespace,
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

  const responseData = data as ShopifyMetafieldsResponse;
  const metafields = responseData.data.metafieldDefinitions.edges.map((edge: ShopifyMetafieldEdge) => ({
    id: edge.node.id.replace('gid://shopify/MetafieldDefinition/', ''),
    key: edge.node.key,
    namespace: edge.node.namespace,
    name: edge.node.name || edge.node.key,
    description: edge.node.description,
    type: edge.node.type.name,
    ownerType: edge.node.ownerType,
    validations: edge.node.validations || [],
  }));

  return NextResponse.json({ metafields });
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

    return await fetchMetafields(shop, accessToken, request);
  } catch (error) {
    console.error('Error fetching Shopify metafields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metafields from Shopify' },
      { status: 500 }
    );
  }
}