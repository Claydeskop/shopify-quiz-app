import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@shopify/polaris', '@shopify/app-bridge', '@shopify/app-bridge-react'],
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.myshopify.com https://admin.shopify.com",
          },
        ],
      },
    ];
  },
  
  // Experimental features for better Shopify integration
  experimental: {
    serverComponentsExternalPackages: ['@shopify/shopify-api'],
  },
};

export default nextConfig;