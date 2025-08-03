import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAccessToken } from '@/lib/shopify-auth';

// GraphQL response interfaces
interface ProductTagsNode {
  tags: string[];
}

interface ProductTagsEdge {
  node: ProductTagsNode;
}

interface ProductTagsResponse {
  data: {
    products: {
      edges: ProductTagsEdge[];
    };
  };
  errors?: unknown[];
}

export async function GET(request: NextRequest) {
  try {
    const shopDomain = request.headers.get('x-shopify-shop-domain');
    
    if (!shopDomain) {
      return NextResponse.json(
        { error: 'Shop domain not found' },
        { status: 401 }
      );
    }

    const accessToken = await getShopifyAccessToken(shopDomain);
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token not found' },
        { status: 401 }
      );
    }

    // GraphQL query to get product tags
    const query = `
      query getProductTags($first: Int!) {
        products(first: $first) {
          edges {
            node {
              tags
            }
          }
        }
      }
    `;

    const response = await fetch(`https://${shopDomain}/admin/api/2024-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query,
        variables: {
          first: 100 // Get first 100 products to extract tags
        }
      })
    });

    if (!response.ok) {
      console.error('Shopify API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch tags from Shopify' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { error: 'GraphQL query failed' },
        { status: 400 }
      );
    }

    // Extract unique tags from all products
    const allTags = new Set<string>();
    
    const responseData = data as ProductTagsResponse;
    responseData.data.products.edges.forEach((edge: ProductTagsEdge) => {
      edge.node.tags.forEach((tag: string) => {
        if (tag.trim()) {
          allTags.add(tag.trim());
        }
      });
    });

    const uniqueTags = Array.from(allTags).sort();

    return NextResponse.json({
      success: true,
      tags: uniqueTags
    });

  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}