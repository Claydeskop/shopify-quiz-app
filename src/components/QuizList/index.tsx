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
  slug: string;
  quiz_type: string;
  quiz_image: string | null;
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
                  <InlineStack gap="300" align="start">
                    {/* Quiz Image - Sol taraf */}
                    <div style={{ 
                      width: '80px', 
                      height: '80px',
                      minWidth: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f6f6f7',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {quiz.quiz_image ? (
                        <img 
                          src={quiz.quiz_image} 
                          alt={quiz.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                        />
                      ) : (
                        <Text as="span" variant="bodySm" tone="subdued">
                          Quiz
                        </Text>
                      )}
                    </div>

                    {/* Quiz Content - Orta kısım */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <BlockStack gap="200">
                        {/* Quiz Header */}
                        <InlineStack gap="200" align="start" wrap={false}>
                          <Text variant="headingSm" as="h4" breakWord>
                            {quiz.title}
                          </Text>
                          <Badge tone={quiz.is_active ? 'success' : undefined}>
                            {quiz.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </InlineStack>

                        {/* Quiz Description - Max width ile sınırlı */}
                        <div style={{ maxWidth: '400px' }}>
                          <Text as="p" tone="subdued" variant="bodySm" breakWord>
                            {quiz.internal_quiz_description}
                          </Text>
                        </div>

                        {/* Quiz Details */}
                        <InlineStack gap="300" wrap>
                          <Text as="p" variant="bodySm">
                            <strong>Slug:</strong> {quiz.slug}
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
                              {`${quiz.selected_collections.length} Koleksiyon`}
                            </Badge>
                          )}
                        </InlineStack>
                      </BlockStack>
                    </div>
                    
                    {/* Action Buttons - Sağ taraf */}
                    <div style={{ minWidth: '160px' }}>
                      <InlineStack gap="200">
                        {onEditQuiz && (
                          <Button
                            size="slim"
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
                            size="slim"
                            variant="primary"
                            tone="critical"
                            onClick={() => onDeleteQuiz(quiz.id)}
                          >
                            Sil
                          </Button>
                        )}
                      </InlineStack>
                    </div>
                  </InlineStack>
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