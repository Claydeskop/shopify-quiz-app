'use client';

import { NavMenu } from '@shopify/app-bridge-react';
import {
  AppProvider,
  Box,
  Button,
  Card,
  Page,
  Text
} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { useEffect, useState } from 'react';
import CreateQuizModal from '../components/quiz/CreateQuizModal';

export default function HomePage() {
  const [appBridgeLoaded, setAppBridgeLoaded] = useState(false);

  // Manual App Bridge Loading
  useEffect(() => {
    if (typeof window !== 'undefined' && !appBridgeLoaded) {
      // API Key meta tag ekle
      const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
      if (apiKey) {
        const metaTag = document.createElement('meta');
        metaTag.name = 'shopify-api-key';
        metaTag.content = apiKey;
        document.head.appendChild(metaTag);
      }

      // App Bridge script yükle - ASYNC YOK!
      const script = document.createElement('script');
      script.src = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';
      script.async = false;
      script.defer = false;
      script.onload = () => {
        console.log('App Bridge loaded successfully');
        setTimeout(() => {
          setAppBridgeLoaded(true);
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load App Bridge');
      };
      document.head.appendChild(script);
    }
  }, [appBridgeLoaded]);

  const handleCreateQuiz = () => {
    const modal = document.getElementById('create-quiz-modal') as any;
    if (modal) modal.show();
  };

  if (!appBridgeLoaded) {
    return (
      <AppProvider i18n={enTranslations}>
        <Page title="Loading...">
          <Card>
            <Box padding="400">
              <Text as="p">Loading App Bridge...</Text>
            </Box>
          </Card>
        </Page>
      </AppProvider>
    );
  }

  return (
    <AppProvider i18n={enTranslations}>
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

        {/* Quiz Modal Component */}
        <CreateQuizModal />
      </Page>
    </AppProvider>
  );
}