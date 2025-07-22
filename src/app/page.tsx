'use client';

import { Modal, NavMenu, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import {
  AppProvider,
  Box,
  Button,
  Card,
  Page,
  Text
} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function AppContent() {
  const shopify = useAppBridge();
  
  const handleCreateQuiz = () => {
    shopify.modal.show('create-quiz-modal');
  };

  return (
    <>
      {/* Sol Navigation Menu */}
      <NavMenu>
        <a href="/" rel="home">🏠 Dashboard</a>
        <a href="/quizzes">📋 My Quizzes</a>
        <a href="/analytics">📊 Analytics</a>
        <a href="/templates">🎨 Templates</a>
        <a href="/settings">⚙️ Settings</a>
        <a href="/help">❓ Help & Support</a>
      </NavMenu>

      <Page
        title="Quiz Dashboard"
        primaryAction={{
          content: 'Create Quiz',
          onAction: handleCreateQuiz,
        }}
      >
        <Card>
          <Box padding="400">
            <Box paddingBlockEnd="300">
              <Text variant="headingMd" as="h2">
                Welcome to Quiz Builder
              </Text>
            </Box>
            <Box paddingBlockEnd="300">
              <Text as="p">
                Create engaging quizzes to help your customers find the perfect products and boost your sales.
              </Text>
            </Box>
            <Button
              variant="primary"
              size="large"
              onClick={handleCreateQuiz}
            >
              Create Quiz
            </Button>
          </Box>
        </Card>

        {/* Modal - Verdiğiniz örnekteki gibi */}
        <Modal id="create-quiz-modal" variant="max">
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            height: '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <h2 style={{ fontSize: '24px', color: '#333' }}>
              Bu boş bir max modal içeriğidir.
            </h2>
          </div>
          <TitleBar title="Create New Quiz">
            <button variant="primary">
              Kaydet
            </button>
            <button onClick={() => shopify.modal.hide('create-quiz-modal')}>
              İptal
            </button>
          </TitleBar>
        </Modal>
      </Page>
    </>
  );
}

export default function HomePage() {
  const [appBridgeLoaded, setAppBridgeLoaded] = useState(false);
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const searchParams = useSearchParams();
  const host = searchParams.get('host') || '';
  const shop = searchParams.get('shop') || '';
  
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // URL debug info
    const currentUrl = window.location.href;
    const allParams = Object.fromEntries(searchParams.entries());
    
    setDebugInfo(`URL: ${currentUrl} | All Params: ${JSON.stringify(allParams)} | Host: ${host}, Shop: ${shop}, API Key: ${apiKey ? 'Set' : 'Missing'}`);

    // Eğer host/shop yoksa, direkt yüklenmiş gibi davran (development için)
    if (!host || !shop) {
      setDebugInfo(prev => prev + ' | Missing host/shop - assuming development mode');
      setTimeout(() => setAppBridgeLoaded(true), 1000);
      return;
    }

    // Önce meta tag ekle
    if (apiKey) {
      const existingMeta = document.querySelector('meta[name="shopify-api-key"]');
      if (!existingMeta) {
        const metaTag = document.createElement('meta');
        metaTag.name = 'shopify-api-key';
        metaTag.content = apiKey;
        document.head.appendChild(metaTag);
        setDebugInfo(prev => prev + ' | Meta tag added');
      }
    }

    // Script yükle
    const existingScript = document.querySelector('script[src*="app-bridge.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
      script.async = false;
      script.defer = false;
      
      script.onload = () => {
        setDebugInfo(prev => prev + ' | Script loaded');
        
        // window.shopify kontrol et
        const checkShopify = () => {
          if (window.shopify) {
            setDebugInfo(prev => prev + ' | Shopify global found');
            setAppBridgeLoaded(true);
          } else {
            setDebugInfo(prev => prev + ' | Waiting for shopify global...');
            setTimeout(checkShopify, 100);
          }
        };
        
        setTimeout(checkShopify, 100);
      };
      
      script.onerror = (error) => {
        setDebugInfo(prev => prev + ` | Script error: ${error}`);
      };
      
      document.head.appendChild(script);
      setDebugInfo(prev => prev + ' | Script tag added');
    } else {
      setDebugInfo(prev => prev + ' | Script already exists');
      // Zaten yüklendiyse direkt kontrol et
      if (window.shopify) {
        setAppBridgeLoaded(true);
      }
    }
  }, []);

  if (!appBridgeLoaded) {
    return (
      <AppProvider i18n={enTranslations}>
        <Page title="Loading App Bridge...">
          <Card>
            <Box padding="400">
              <Text as="p">Loading App Bridge...</Text>
              <Box paddingBlockStart="200">
                <Text as="p" variant="bodyMd">
                  Debug: {debugInfo}
                </Text>
              </Box>
            </Box>
          </Card>
        </Page>
      </AppProvider>
    );
  }

  return (
    <AppProvider i18n={enTranslations}>
      <AppContent />
    </AppProvider>
  );
}