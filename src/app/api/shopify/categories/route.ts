import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAccessToken } from '@/lib/shopify-auth';

// GraphQL response interfaces
interface ProductTypeNode {
  productType: string;
}

interface ProductTypeEdge {
  node: ProductTypeNode;
}

interface ProductTypesResponse {
  data: {
    products: {
      edges: ProductTypeEdge[];
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

    // GraphQL query to get product types (categories)
    const query = `
      query getProductTypes($first: Int!) {
        products(first: $first) {
          edges {
            node {
              productType
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
          first: 100 // Get first 100 products to extract product types
        }
      })
    });

    if (!response.ok) {
      console.error('Shopify API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch categories from Shopify' },
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

    // Extract unique product types from all products
    const allCategories = new Set<string>();
    
    const responseData = data as ProductTypesResponse;
    responseData.data.products.edges.forEach((edge: ProductTypeEdge) => {
      const productType = edge.node.productType;
      if (productType && productType.trim()) {
        allCategories.add(productType.trim());
      }
    });

    const uniqueCategories = Array.from(allCategories).sort();

    return NextResponse.json({
      success: true,
      categories: uniqueCategories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}