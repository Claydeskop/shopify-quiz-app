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
import { useEffect, useMemo, useState } from 'react';
import QuizBuilder from '../components/QuizBuilder';

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
        <a href="/templates">🎨 A/B Testing</a>
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

        {/* Quiz Builder Modal */}
        <Modal id="create-quiz-modal" variant="max">
          <QuizBuilder
            quizTitle={quizTitle}
            quizDescription={quizDescription}
            quizType={quizType}
            onTitleChange={setQuizTitle}
            onDescriptionChange={setQuizDescription}
            onTypeChange={setQuizType}
          />
          
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
  
  const stableHost = useMemo(() => searchParams.get('host') || '', [searchParams]);
  const stableShop = useMemo(() => searchParams.get('shop') || '', [searchParams]); 
  const stableApiKey = useMemo(() => process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '', []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Development mode - no host/shop params
    if (!stableHost || !stableShop) {
      console.log('🔧 Development mode - no host/shop params');
      setAppBridgeLoaded(true);
      return;
    }

    // Wait for App Bridge script to load and initialize
    const checkAppBridge = () => {
      console.log('🔍 Checking for App Bridge global...');
      
      if (window.shopify && typeof window.shopify === 'object') {
        console.log('✅ App Bridge is ready!', Object.keys(window.shopify));
        setAppBridgeLoaded(true);
      } else {
        console.log('⏳ Waiting for App Bridge...');
        setTimeout(checkAppBridge, 200);
      }
    };

    // Start checking after a short delay
    setTimeout(checkAppBridge, 500);
  }, [stableHost, stableShop, stableApiKey]);

  if (!appBridgeLoaded) {
    return (
      <AppProvider i18n={enTranslations}>
        <Page title="Loading App Bridge...">
          <Card>
            <Box padding="400">
              <Text as="p">Loading App Bridge...</Text>
              <Box paddingBlockStart="200">
                <Text as="p" variant="bodySm" tone="subdued">
                  Host: {stableHost || 'None'} | Shop: {stableShop || 'None'}
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