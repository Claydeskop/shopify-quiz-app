'use client';

import createApp from '@shopify/app-bridge';
import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';
import {
  AppProvider,
  Box,
  FormLayout,
  Page,
  Select,
  Spinner,
  TextField
} from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface AppInstance {
  dispatch: (action: unknown) => void;
  modal?: {
    show: (id: string) => void;
    hide: (id: string) => void;
  };
}

function QuizCreateContent() {
  const searchParams = useSearchParams();
  const host = searchParams.get('host') || '';
  const [app, setApp] = useState<AppInstance | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizType, setQuizType] = useState('product-recommendation');

  // App Bridge initialization
  useEffect(() => {
    if (typeof window !== 'undefined' && host && process.env.NEXT_PUBLIC_SHOPIFY_API_KEY) {
      const appInstance = createApp({
        apiKey: process.env.NEXT_PUBLIC_SHOPIFY_API_KEY,
        host,
        forceRedirect: true,
      }) as AppInstance;
      setApp(appInstance);

      // Auto-open modal when page loads
      setTimeout(() => {
        const modal = document.getElementById('create-quiz-modal') as HTMLElement & {
          show?: () => void;
        };
        if (modal && modal.show) {
          modal.show();
        }
      }, 500);
    }
  }, [host]);

  const handleSaveQuiz = () => {
    console.log('Creating quiz:', {
      title: quizTitle,
      description: quizDescription,
      type: quizType
    });
    
    // Navigate back to main page
    if (app) {
      const redirect = Redirect.create(app as Parameters<typeof Redirect.create>[0]);
      redirect.dispatch(Redirect.Action.APP, '/?host=' + host);
    }
  };

  const handleCancel = () => {
    // Navigate back to main page
    if (app) {
      const redirect = Redirect.create(app as Parameters<typeof Redirect.create>[0]);
      redirect.dispatch(Redirect.Action.APP, '/?host=' + host);
    }
  };

  const quizTypeOptions = [
    { label: 'Product Recommendation', value: 'product-recommendation' },
    { label: 'Customer Survey', value: 'customer-survey' },
    { label: 'Lead Generation', value: 'lead-generation' },
    { label: 'Brand Awareness', value: 'brand-awareness' }
  ];

  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Create Quiz">
        <Box padding="400">
          <div style={{ textAlign: 'center' }}>
            <Spinner size="large" />
            <p style={{ marginTop: '16px' }}>Opening quiz creation modal...</p>
          </div>
        </Box>

        {/* App Bridge Max Modal - Shopify admin seviyesinde açılır */}
        <Modal id="create-quiz-modal" variant="max">
          <div style={{ padding: '24px' }}>
            <FormLayout>
              <TextField
                label="Quiz Title"
                value={quizTitle}
                onChange={setQuizTitle}
                placeholder="Enter a catchy title for your quiz"
                autoComplete="off"
                requiredIndicator
              />
              
              <TextField
                label="Quiz Description"
                value={quizDescription}
                onChange={setQuizDescription}
                placeholder="Describe what your quiz is about"
                multiline={3}
                autoComplete="off"
              />
              
              <Select
                label="Quiz Type"
                options={quizTypeOptions}
                value={quizType}
                onChange={setQuizType}
              />
            </FormLayout>
          </div>
          
          <TitleBar title="Create New Quiz">
            <button 
              variant="primary" 
              onClick={handleSaveQuiz}
              disabled={!quizTitle.trim()}
            >
              Create Quiz
            </button>
            <button onClick={handleCancel}>
              Cancel
            </button>
          </TitleBar>
        </Modal>
      </Page>
    </AppProvider>
  );
}

export default function QuizCreatePage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner size="large" />
      </div>
    }>
      <QuizCreateContent />
    </Suspense>
  );
}