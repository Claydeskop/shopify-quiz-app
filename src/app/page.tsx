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
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import QuizBuilder from '../components/QuizBuilder';
import QuizList from '../components/QuizList';
import type { Quiz, QuizFormData } from '@/types';

interface QuizBuilderRef {
  getQuizData: () => QuizFormData;
  saveQuiz: () => Promise<void>;
  loadQuizData: (quizData: Partial<Quiz>) => void;
}

function AppContent() {
  const shopify = useAppBridge();
  const [quizTitle, setQuizTitle] = useState('');
  const [quizType, setQuizType] = useState('product-recommendation');
  const [isSaving, setIsSaving] = useState(false);
  const [refreshQuizList, setRefreshQuizList] = useState(0);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const quizBuilderRef = useRef<QuizBuilderRef>(null);
  
  const handleCreateQuiz = () => {
    setIsEditing(false);
    setEditingQuizId(null);
    setQuizTitle('');
    setQuizType('product-recommendation');
    shopify.modal.show('create-quiz-modal');
  };

  const handleEditQuiz = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}`);
      const result = await response.json();

      if (response.ok && result.quiz) {
        const quiz = result.quiz;
        setIsEditing(true);
        setEditingQuizId(quizId);
        setQuizTitle(quiz.title);
        setQuizType(quiz.quizType);
        
        // Load quiz data into QuizBuilder
        if (quizBuilderRef.current && quizBuilderRef.current.loadQuizData) {
          quizBuilderRef.current.loadQuizData(quiz);
        }
        
        shopify.modal.show('create-quiz-modal');
      } else {
        shopify.toast.show('Failed to load quiz data', { isError: true });
      }
    } catch (error) {
      console.error('Edit quiz error:', error);
      shopify.toast.show('Failed to load quiz', { isError: true });
    }
  };

  const handleDeleteQuiz = (quizId: string) => {
    setDeletingQuizId(quizId);
    shopify.modal.show('delete-quiz-modal');
  };

  const confirmDeleteQuiz = async () => {
    if (!deletingQuizId) return;
    
    try {
      setIsDeletingQuiz(true);
      
      const response = await fetch(`/api/quiz/${deletingQuizId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        shopify.modal.hide('delete-quiz-modal');
        shopify.toast.show('Quiz başarıyla silindi');
        setRefreshQuizList(prev => prev + 1);
        setDeletingQuizId(null);
      } else {
        const result = await response.json();
        throw new Error(result.error || 'Quiz silinemedi');
      }
    } catch (error) {
      console.error('Delete quiz error:', error);
      shopify.toast.show(
        error instanceof Error ? error.message : 'Quiz silinemedi',
        { isError: true }
      );
    } finally {
      setIsDeletingQuiz(false);
    }
  };

  const cancelDeleteQuiz = () => {
    shopify.modal.hide('delete-quiz-modal');
    setDeletingQuizId(null);
  };

  const handleSaveQuiz = async () => {
    if (!quizBuilderRef.current) {
      shopify.toast.show('Quiz builder not ready', { isError: true });
      return;
    }

    try {
      setIsSaving(true);
      
      // Get quiz data from QuizBuilder
      const quizData = quizBuilderRef.current.getQuizData();
      
      const saveData = {
        title: quizTitle.trim() || 'Untitled Quiz',
        quizType: quizType,
        ...quizData
      };

      console.log('Saving quiz data:', saveData);

      // Get shop domain from session
      const sessionResponse = await fetch('/api/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionResponse.ok) {
        throw new Error('Session alınamadı');
      }
      
      if (sessionData.requiresAuth && sessionData.installUrl) {
        // OAuth required, redirect to install URL
        window.top!.location.href = sessionData.installUrl;
        return;
      }
      
      if (!sessionData.shopDomain) {
        throw new Error('Shop domain alınamadı');
      }

      const url = isEditing && editingQuizId ? `/api/quiz/${editingQuizId}` : '/api/quiz/save';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'x-shopify-shop-domain': sessionData.shopDomain
        },
        body: JSON.stringify(saveData)
      });

      console.log('API Response status:', response.status);
      
      const responseText = await response.text();
      console.log('API Response text:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
      }

      if (response.ok) {
        // Close modal and reset form
        shopify.modal.hide('create-quiz-modal');
        setQuizTitle('');
        setQuizType('product-recommendation');
        setIsEditing(false);
        setEditingQuizId(null);
        
        // Clear QuizBuilder state
        if (quizBuilderRef.current && quizBuilderRef.current.loadQuizData) {
          quizBuilderRef.current.loadQuizData({
            questions: [],
            answers: [],
            internalQuizTitle: 'Bu quiz hangi ürün size en uygun olduğunu bulmanıza yardımcı olacak',
            internalQuizDescription: 'Kişisel tercihlerinizi ve ihtiyaçlarınızı anlayarak size özel ürün önerileri sunuyoruz. Sadece birkaç soruyu yanıtlayın ve size en uygun seçenekleri keşfedin.',
            quizImage: null,
            is_active: false,
            auto_transition: false,
            selected_collections: []
          });
        }
        
        // Show success toast
        shopify.toast.show(isEditing ? 'Quiz güncellendi!' : 'Quiz oluşturuldu!');
        
        // Refresh quiz list
        setRefreshQuizList(prev => prev + 1);
      } else {
        throw new Error(result.error || 'Failed to save quiz');
      }
    } catch (error) {
      console.error('Save error:', error);
      shopify.toast.show(
        error instanceof Error ? error.message : 'Failed to save quiz',
        { isError: true }
      );
    } finally {
      setIsSaving(false);
    }
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
        <Link href="/">🏠 Dashboard</Link>
        <Link href="/quizzes">📋 My Quizzes</Link>
        <Link href="/analytics">📊 Analytics</Link>
        <Link href="/templates">🎨 A/B Testing</Link>
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

        {/* Quiz List */}
        <Box paddingBlockStart="500">
          <QuizList
            key={refreshQuizList}
            onEditQuiz={handleEditQuiz}
            onDeleteQuiz={handleDeleteQuiz}
          />
        </Box>

        {/* Quiz Builder Modal */}
        <Modal id="create-quiz-modal" variant="max">
          <QuizBuilder
            ref={quizBuilderRef}
            quizTitle={quizTitle}
            quizType={quizType}
            onTitleChange={setQuizTitle}
            onTypeChange={setQuizType}
          />
          
          <TitleBar title={isEditing ? "Edit Quiz" : "Create New Quiz"}>
            <button 
              variant="primary" 
              onClick={handleSaveQuiz}
              disabled={isSaving}
            >
              {isSaving 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Quiz' : 'Create Quiz')
              }
            </button>
            <button onClick={() => {
              shopify.modal.hide('create-quiz-modal');
              // Reset form state when modal is cancelled
              setQuizTitle('');
              setQuizType('product-recommendation');
              setIsEditing(false);
              setEditingQuizId(null);
              // Clear QuizBuilder state
              if (quizBuilderRef.current && quizBuilderRef.current.loadQuizData) {
                quizBuilderRef.current.loadQuizData({
                  questions: [],
                  answers: [],
                  internalQuizTitle: 'Bu quiz hangi ürün size en uygun olduğunu bulmanıza yardımcı olacak',
                  internalQuizDescription: 'Kişisel tercihlerinizi ve ihtiyaçlarınızı anlayarak size özel ürün önerileri sunuyoruz. Sadece birkaç soruyu yanıtlayın ve size en uygun seçenekleri keşfedin.',
                  quizImage: null
                });
              }
            }}>
              Cancel
            </button>
          </TitleBar>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal id="delete-quiz-modal" variant="small">
          <Box padding="400">
            <Text variant="headingMd" as="h3">
              Quiz&apos;i Sil
            </Text>
            <Box paddingBlock="300">
              <Text as="p">
                Bu quiz&apos;i silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm quiz verileri kalıcı olarak silinecektir.
              </Text>
            </Box>
          </Box>
          
          <TitleBar title="Quiz'i Sil">
            <button 
              variant="primary" 
              tone="critical"
              onClick={confirmDeleteQuiz}
              disabled={isDeletingQuiz}
            >
              {isDeletingQuiz ? 'Siliniyor...' : 'Sil'}
            </button>
            <button onClick={cancelDeleteQuiz} disabled={isDeletingQuiz}>
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
  const searchParams = useSearchParams();
  
  const stableHost = useMemo(() => searchParams.get('host') || '', [searchParams]);
  const stableShop = useMemo(() => searchParams.get('shop') || '', [searchParams]); 
  const stableApiKey = useMemo(() => process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || '', []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Development mode - no host/shop params
    if ((!stableHost || !stableShop) && process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode - no host/shop params');
      setAppBridgeLoaded(true);
      return;
    }
    
    // Production mode - require host/shop params
    if (!stableHost || !stableShop) {
      console.error('Missing required host or shop parameters');
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