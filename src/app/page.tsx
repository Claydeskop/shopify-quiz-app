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
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizType, setQuizType] = useState('product-recommendation');
  
  const handleCreateQuiz = () => {
    shopify.modal.show('create-quiz-modal');
  };

  const handleSaveQuiz = () => {
    console.log('Creating quiz:', {
      title: quizTitle,
      description: quizDescription,
      type: quizType
    });
    
    // Close modal and reset form
    shopify.modal.hide('create-quiz-modal');
    setQuizTitle('');
    setQuizDescription('');
    setQuizType('product-recommendation');
    
    // Show success toast
    shopify.toast.show('Quiz created successfully!');
  };

  const quizTypeOptions = [
    { label: 'Product Recommendation', value: 'product-recommendation' },
    { label: 'Customer Survey', value: 'customer-survey' },
    { label: 'Lead Generation', value: 'lead-generation' },
    { label: 'Brand Awareness', value: 'brand-awareness' }
  ];

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

        {/* Basit Modal - Orijinal Yapı */}
        <Modal id="create-quiz-modal" variant="max">
          
          
          <TitleBar title="Create New Quiz">
            <button 
              variant="primary" 
              onClick={handleSaveQuiz}
              disabled={!quizTitle.trim()}
            >
              Create Quiz
            </button>
            <button onClick={() => shopify.modal.hide('create-quiz-modal')}>
              Cancel
            </button>
          </TitleBar>
        </Modal>
      </Page>
    </>
  );
}

export default function HomePage() {
  const [appBridgeLoaded, setAppBridgeLoaded] = useState(false);
  const searchParams = useSearchParams();
  const host = searchParams.get('host') || '';
  const shop = searchParams.get('shop') || '';
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Development mode - host/shop yoksa direkt geç
    if (!host || !shop) {
      console.log('🔧 Development mode - no host/shop params');
      setTimeout(() => setAppBridgeLoaded(true), 1000);
      return;
    }

    // Manual script loading - Next.js Script component bazen başarısız oluyor
    const loadAppBridge = () => {
      // Önce mevcut script'i kontrol et
      const existingScript = document.querySelector('script[src*="app-bridge.js"]');
      
      if (!existingScript) {
        console.log('🔄 Loading App Bridge script manually...');
        
        // Meta tag'i kontrol et/ekle
        const apiKeyMeta = document.querySelector('meta[name="shopify-api-key"]');
        if (!apiKeyMeta && apiKey) {
          const meta = document.createElement('meta');
          meta.name = 'shopify-api-key';
          meta.content = apiKey;
          document.head.appendChild(meta);
          console.log('✅ API key meta tag added');
        }
        
        // Script tag'i ekle
        const script = document.createElement('script');
        script.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
        script.async = false;
        script.defer = false;
        
        script.onload = () => {
          console.log('✅ App Bridge script loaded');
          checkAppBridge();
        };
        
        script.onerror = (error) => {
          console.error('❌ App Bridge script failed to load:', error);
          setAppBridgeLoaded(true); // Yine de devam et
        };
        
        document.head.appendChild(script);
      } else {
        console.log('✅ App Bridge script already exists');
        checkAppBridge();
      }
    };

    // App Bridge global'ını kontrol et
    const checkAppBridge = () => {
      let attempts = 0;
      const maxAttempts = 30; // 3 saniye
      
      const check = () => {
        attempts++;
        console.log(`🔍 Checking App Bridge... (${attempts}/${maxAttempts})`);
        
        if (window.shopify) {
          console.log('✅ App Bridge loaded successfully!', window.shopify);
          setAppBridgeLoaded(true);
        } else if (attempts >= maxAttempts) {
          console.log('⏰ App Bridge loading timeout - proceeding anyway');
          setAppBridgeLoaded(true);
        } else {
          setTimeout(check, 100);
        }
      };
      
      setTimeout(check, 100);
    };

    // Script loading'i başlat
    setTimeout(loadAppBridge, 100);
  }, [host, shop, apiKey]);

  if (!appBridgeLoaded) {
    return (
      <AppProvider i18n={enTranslations}>
        <Page title="Loading App Bridge...">
          <Card>
            <Box padding="400">
              <Text as="p">Loading App Bridge...</Text>
              <Box paddingBlockStart="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Host: {host || 'None'} | Shop: {shop || 'None'}
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