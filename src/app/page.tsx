// src/app/page.tsx - Ana sayfa olarak admin paneli
'use client';

import { AppProvider, Button, Layout, Page } from '@shopify/polaris';

export default function HomePage() {
  return (
    <AppProvider i18n={{}}>
      <Page 
        title="Quiz Yönetimi"
        primaryAction={
          <Button variant="primary" tone="critical">
            Create Quiz
          </Button>
        }
      >
        <Layout>
          <Layout.Section>
            {/* Ana içerik buraya gelecek */}
            <p>Quiz listesi burada görünecek...</p>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}