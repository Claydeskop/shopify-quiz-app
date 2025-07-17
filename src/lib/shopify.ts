// src/lib/shopify.ts
import { ApiVersion, shopifyApi } from '@shopify/shopify-api'

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes: process.env.SHOPIFY_SCOPES?.split(',') || ['read_products', 'read_collections'],
  hostName: process.env.SHOPIFY_HOST_NAME!,
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
})