Create admin page using App Bridge + Polaris following current project patterns.

## Requirements:
- Use @shopify/app-bridge-react Provider
- Use @shopify/polaris components
- Follow embedded app patterns
- Include proper TypeScript types
- Add error boundaries
- Route: /app/admin/[page-name]

## Template Pattern:
```tsx
import { AppBridgeProvider } from '@shopify/app-bridge-react'
import { Page, Card, Layout } from '@shopify/polaris'

export default function AdminPage() {
  return (
    <AppBridgeProvider>
      <Page title="Page Title">
        <Layout>
          <Layout.Section>
            <Card>
              {/* Content */}
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppBridgeProvider>
  )
}