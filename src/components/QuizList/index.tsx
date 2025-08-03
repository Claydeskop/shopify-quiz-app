'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  InlineStack,
  Text,
  BlockStack,
  Divider
} from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { ShopifyCollection } from '../../types';

interface Quiz {
  id: string;
  title: string;
  quiz_type: string;
  is_active: boolean;
  auto_transition: boolean;
  selected_collections: ShopifyCollection[];
  internal_quiz_title: string;
  internal_quiz_description: string;
  created_at: string;
  updated_at: string;
  questionCount: number;
  answerCount: number;
}

interface QuizListProps {
  onEditQuiz?: (quizId: string) => void;
  onDeleteQuiz?: (quizId: string) => void;
}

interface LoadingStates {
  [quizId: string]: boolean;
}

export default function QuizList({ onEditQuiz, onDeleteQuiz }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({});

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      
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

      console.log('Sending request with shop domain:', sessionData.shopDomain);
      
      const response = await fetch('/api/quiz/list', {
        headers: {
          'x-shopify-shop-domain': sessionData.shopDomain
        }
      });

      const result = await response.json();

      console.log('Quiz API response:', result);

      if (response.ok) {
        console.log('Setting quizzes:', result.quizzes);
        setQuizzes(result.quizzes || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch quizzes');
      }
    } catch (err) {
      console.error('Quiz fetch error:', err);
      setError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuizTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'product-recommendation': 'Ürün Önerisi',
      'customer-survey': 'Müşteri Anketi', 
      'lead-generation': 'Potansiyel Müşteri',
      'brand-awareness': 'Marka Bilinirliği'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <Card>
        <Box padding="400">
          <Text as="p">Quiz&apos;ler yükleniyor...</Text>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text as="p" tone="critical">
              Hata: {error}
            </Text>
            <Button onClick={fetchQuizzes}>Tekrar Dene</Button>
          </BlockStack>
        </Box>
      </Card>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card>
        <Box padding="400">
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">
              Henüz Quiz Yok
            </Text>
            <Text as="p" tone="subdued">
              İlk quiz&apos;inizi oluşturmak için yukarıdaki &quot;Create Quiz&quot; butonunu kullanın.
            </Text>
          </BlockStack>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <Box padding="400">
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">
            Mevcut Quiz&apos;ler ({quizzes.length})
          </Text>

          <BlockStack gap="300">
            {quizzes.map((quiz, index) => (
              <div key={quiz.id}>
                <Box padding="300">
                  <BlockStack gap="300">
                    {/* Quiz Header */}
                    <InlineStack align="space-between">
                      <BlockStack gap="100">
                        <InlineStack gap="200" align="start">
                          <Text variant="headingSm" as="h4">
                            {quiz.title}
                          </Text>
                          <Badge tone={quiz.is_active ? 'success' : 'subdued'}>
                            {quiz.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </InlineStack>
                        <Text as="p" tone="subdued" variant="bodySm">
                          {quiz.internal_quiz_description}
                        </Text>
                      </BlockStack>
                      
                      {/* Action Buttons */}
                      <InlineStack gap="200">
                        {onEditQuiz && (
                          <Button
                            size="micro"
                            loading={loadingStates[quiz.id]}
                            disabled={loadingStates[quiz.id]}
                            onClick={async () => {
                              setLoadingStates(prev => ({ ...prev, [quiz.id]: true }));
                              try {
                                await onEditQuiz(quiz.id);
                              } finally {
                                setLoadingStates(prev => ({ ...prev, [quiz.id]: false }));
                              }
                            }}
                          >
                            Düzenle
                          </Button>
                        )}
                        {onDeleteQuiz && (
                          <Button
                            size="micro"
                            variant="primary"
                            tone="critical"
                            onClick={() => onDeleteQuiz(quiz.id)}
                          >
                            Sil
                          </Button>
                        )}
                      </InlineStack>
                    </InlineStack>

                    {/* Quiz Details */}
                    <InlineStack gap="400">
                      <Text as="p" variant="bodySm">
                        <strong>Tür:</strong> {getQuizTypeLabel(quiz.quiz_type)}
                      </Text>
                      <Text as="p" variant="bodySm">
                        <strong>Soru:</strong> {quiz.questionCount}
                      </Text>
                      <Text as="p" variant="bodySm">
                        <strong>Cevap:</strong> {quiz.answerCount}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        <strong>Oluşturulma:</strong> {formatDate(quiz.created_at)}
                      </Text>
                    </InlineStack>

                    {/* Quiz Settings Info */}
                    <InlineStack gap="200">
                      {quiz.auto_transition && (
                        <Badge tone="info">
                          Otomatik Geçiş
                        </Badge>
                      )}
                      {quiz.selected_collections && quiz.selected_collections.length > 0 && (
                        <Badge tone="success">
                          {quiz.selected_collections.length} Koleksiyon
                        </Badge>
                      )}
                    </InlineStack>
                  </BlockStack>
                </Box>

                {/* Divider between quizzes */}
                {index < quizzes.length - 1 && <Divider />}
              </div>
            ))}
          </BlockStack>
        </BlockStack>
      </Box>
    </Card>
  );
}