import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@shopify/polaris', '@shopify/app-bridge', '@shopify/app-bridge-react'],
  
  images: {
    domains: ['cdn.shopify.com'],
  },
  
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
  
  // Server external packages for better Shopify integration
  serverExternalPackages: ['@shopify/shopify-api'],
};

export default nextConfig;