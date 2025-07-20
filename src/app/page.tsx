// src/app/page.tsx - Absolute URL ile fix
'use client';

import { AppProvider, Button, Layout, Page } from '@shopify/polaris';
import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    console.log('HomePage mounted!');
    console.log('Current URL:', window.location.href);
    
    // URL'den shop parametresini manuel olarak al
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    
    console.log('Shop parameter:', shop);
    
    // Eğer shop parametresi varsa OAuth'a yönlendir
    if (shop) {
      console.log('Redirecting to OAuth...');
      
      // Absolute URL kullan
      const currentOrigin = window.location.origin;
      const oauthUrl = `${currentOrigin}/api/auth?shop=${shop}`;
      
      console.log('OAuth URL:', oauthUrl);
      window.location.href = oauthUrl;
      return;
    }
  }, []);

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
            <p>Quiz listesi burada görünecek...</p>
            <p>Debug: Current URL = {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}