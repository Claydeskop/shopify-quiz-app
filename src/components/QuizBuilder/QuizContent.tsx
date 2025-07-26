'use client';

import { Box, Card, Text } from '@shopify/polaris';
import { useEffect, useRef } from 'react';
import QuestionBuilder from './QuestionBuilder';

interface Question {
  id: string;
  text: string;
}

interface Answer {
  id: string;
  text: string;
  questionId: string;
}

interface QuizContentProps {
  onTabChange: (tab: string) => void;
  activeTab: string;
  questions: Question[];
  answers: Answer[];
  onQuestionAdd: () => void;
  onQuestionSelect: (questionId: string) => void;
  onQuestionReorder: (dragIndex: number, hoverIndex: number) => void;
  onAnswerAdd: (questionId: string) => void;
  onAnswerSelect: (answerId: string) => void;
  onAnswerReorder: (questionId: string, dragIndex: number, hoverIndex: number) => void;
  selectedQuestionId: string | null;
  selectedAnswerId: string | null;
}

export default function QuizContent({ 
  onTabChange, 
  activeTab, 
  questions,
  answers,
  onQuestionAdd, 
  onQuestionSelect,
  onQuestionReorder,
  onAnswerAdd,
  onAnswerSelect,
  onAnswerReorder,
  selectedQuestionId,
  selectedAnswerId
}: QuizContentProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const questionsLengthRef = useRef(questions.length);

  useEffect(() => {
    // Yeni soru eklendiğinde en alta scroll et
    if (questions.length > questionsLengthRef.current && scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
    questionsLengthRef.current = questions.length;
  }, [questions.length]);

  return (
    <Card>
      <div 
        ref={scrollContainerRef}
        style={{ 
          padding: '4px', 
          height: '100%',
          maxHeight: '93vh',
          minHeight: '93vh',
          overflowY: 'auto',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none',  /* IE 10+ */
        }}>
        <Text variant='headingMd' as='h3'>Quiz</Text>
        
        <Box paddingBlockStart='400'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Quiz Information Section */}
            <div>
              <Text variant='headingSm' as='h4' >Quiz Information</Text>
              <Box paddingBlockStart='200'>
                <div 
                  onClick={() => onTabChange('information')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: activeTab === 'information' ? '2px solid #007ace' : '1px solid #e1e3e5',
                    backgroundColor: activeTab === 'information' ? '#f0f8ff' : '#fafbfb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '18px' }}>ℹ️</div>
                  <Text as='p' variant='bodyMd'>
                    Basic quiz settings and configuration
                  </Text>
                </div>
              </Box>
            </div>

            {/* Quiz Style Section */}
            <div>
              <Text variant='headingSm' as='h4' >Quiz Style</Text>
              <Box paddingBlockStart='200'>
                <div 
                  onClick={() => onTabChange('style')}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: activeTab === 'style' ? '2px solid #007ace' : '1px solid #e1e3e5',
                    backgroundColor: activeTab === 'style' ? '#f0f8ff' : '#fafbfb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div style={{ fontSize: '18px' }}>🎨</div>
                  <Text as='p' variant='bodyMd'>
                    Customize appearance and branding
                  </Text>
                </div>
              </Box>
            </div>

            {/* Questions Section */}
            <div>
              <Text variant='headingSm' as='h4'>Questions</Text>
              <Box paddingBlockStart='200'>
                <QuestionBuilder 
                  questions={questions}
                  answers={answers}
                  onQuestionAdd={onQuestionAdd}
                  onQuestionSelect={onQuestionSelect}
                  onQuestionReorder={onQuestionReorder}
                  onAnswerAdd={onAnswerAdd}
                  onAnswerSelect={onAnswerSelect}
                  onAnswerReorder={onAnswerReorder}
                  selectedQuestionId={selectedQuestionId}
                  selectedAnswerId={selectedAnswerId}
                />
              </Box>
            </div>
            
          </div>
        </Box>
      </div>
    </Card>
  );
}