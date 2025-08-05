'use client';

import {
  Box,
  Card,
  Text
} from '@shopify/polaris';
import AnswerSettings from './QuizSettings/AnswerSettings';
import InformationSettings from './QuizSettings/InformationSettings';
import QuestionSettings from './QuizSettings/QuestionSettings';
import StyleSettings from './QuizSettings/StyleSettings';
import type { Question, Answer, StyleSettings as StyleSettingsType, ShopifyCollection, AnswerCondition } from '@/types';


interface QuizSettingsProps {
  activeTab: string;
  selectedQuestionId: string | null;
  selectedAnswerId: string | null;
  questions: Question[];
  onQuestionTextChange: (questionId: string, text: string) => void;
  onAnswerTextChange: (answerId: string, text: string) => void;
  quizName: string;
  quizTitle: string;
  quizImage: string | null;
  isActive: boolean;
  onQuizNameChange: (value: string) => void;
  onQuizTitleChange: (value: string) => void;
  onQuizImageChange: (imageUrl: string | null) => void;
  onIsActiveChange: (value: boolean) => void;
  internalQuizTitle: string;
  internalQuizDescription: string;
  onInternalQuizTitleChange: (value: string) => void;
  onInternalQuizDescriptionChange: (value: string) => void;
  onQuestionShowAnswersChange: (questionId: string, value: boolean) => void;
  onQuestionAllowMultipleSelectionChange: (questionId: string, value: boolean) => void;
  onQuestionShowAnswerImagesChange: (questionId: string, value: boolean) => void;
  onQuestionMediaChange: (questionId: string, mediaUrl: string | null) => void;
  onAnswerMediaChange: (answerId: string, mediaUrl: string | null) => void;
  onAnswerCollectionsChange: (answerId: string, collections: ShopifyCollection[]) => void;
  onAnswerRedirectToLinkChange: (answerId: string, value: boolean) => void;
  onAnswerRedirectUrlChange: (answerId: string, url: string) => void;
  onAnswerMetafieldConditionsChange: (answerId: string, conditions: AnswerCondition[]) => void;
  styleSettings?: StyleSettingsType;
  onStyleChange?: (styles: StyleSettingsType) => void;
}

export default function QuizSettings({ 
  activeTab, 
  selectedQuestionId,
  selectedAnswerId,
  questions,
  onQuestionTextChange,
  onAnswerTextChange,
  quizName,
  quizTitle,
  quizImage,
  isActive,
  onQuizNameChange,
  onQuizTitleChange,
  onQuizImageChange,
  onIsActiveChange,
  internalQuizTitle,
  internalQuizDescription,
  onInternalQuizTitleChange,
  onInternalQuizDescriptionChange,
  onQuestionShowAnswersChange,
  onQuestionAllowMultipleSelectionChange,
  onQuestionShowAnswerImagesChange,
  onQuestionMediaChange,
  onAnswerMediaChange,
  onAnswerCollectionsChange,
  onAnswerRedirectToLinkChange,
  onAnswerRedirectUrlChange,
  onAnswerMetafieldConditionsChange,
  styleSettings,
  onStyleChange
}: QuizSettingsProps) {
  
  // Create a flat answers array from nested structure
  const allAnswers: (Answer & { questionId: string })[] = (questions || []).flatMap(question => 
    (question.answers || []).map(answer => ({
      id: answer.id,
      text: answer.text,
      answer_media: answer.answer_media ?? null,
      redirect_to_link: answer.redirect_to_link ?? false,
      redirect_url: answer.redirect_url ?? null,
      collections: answer.collections || [],
      categories: answer.categories || [],
      products: answer.products || [],
      tags: answer.tags || [],
      conditions: answer.conditions || [],
      questionId: question.id
    }))
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'information':
        return (
          <InformationSettings 
            quizName={quizName}
            quizTitle={internalQuizTitle}
            quizDescription={internalQuizDescription}
            quizImage={quizImage}
            isActive={isActive}
            onQuizNameChange={onQuizNameChange}
            onQuizTitleChange={onInternalQuizTitleChange}
            onQuizDescriptionChange={onInternalQuizDescriptionChange}
            onQuizImageChange={onQuizImageChange}
            onIsActiveChange={onIsActiveChange}
          />
        );
      
      case 'style':
        return <StyleSettings styles={styleSettings} onStyleChange={onStyleChange} />;
      
      case 'questions':
        // If an answer is selected, show answer settings
        if (selectedAnswerId) {
          return (
            <AnswerSettings
              selectedAnswerId={selectedAnswerId}
              answers={allAnswers}
              onAnswerTextChange={onAnswerTextChange}
              onAnswerMediaChange={onAnswerMediaChange}
              onAnswerCollectionsChange={onAnswerCollectionsChange}
              onAnswerRedirectToLinkChange={onAnswerRedirectToLinkChange}
              onAnswerRedirectUrlChange={onAnswerRedirectUrlChange}
              onAnswerMetafieldConditionsChange={onAnswerMetafieldConditionsChange}
            />
          );
        }
        // Otherwise show question settings
        return (
          <QuestionSettings
            selectedQuestionId={selectedQuestionId}
            questions={questions}
            onQuestionTextChange={onQuestionTextChange}
            onQuestionShowAnswersChange={onQuestionShowAnswersChange}
            onQuestionAllowMultipleSelectionChange={onQuestionAllowMultipleSelectionChange}
            onQuestionShowAnswerImagesChange={onQuestionShowAnswerImagesChange}
            onQuestionMediaChange={onQuestionMediaChange}
          />
        );
      
      default:
        return (
          <InformationSettings 
            quizName={quizName}
            quizTitle={internalQuizTitle}
            quizDescription={internalQuizDescription}
            quizImage={quizImage}
            isActive={isActive}
            onQuizNameChange={onQuizNameChange}
            onQuizTitleChange={onInternalQuizTitleChange}
            onQuizDescriptionChange={onInternalQuizDescriptionChange}
            onQuizImageChange={onQuizImageChange}
            onIsActiveChange={onIsActiveChange}
          />
        );
    }
  };

  return (
    <Card>
      <div 
        style={{ 
          padding: '4px', 
          height: '93vh',
          overflowY: 'auto',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c8cd transparent'
        }}
        className="quiz-settings-scroll"
      >
        <style jsx>{`
          .quiz-settings-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .quiz-settings-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .quiz-settings-scroll::-webkit-scrollbar-thumb {
            background: #c1c8cd;
            border-radius: 4px;
          }
          .quiz-settings-scroll::-webkit-scrollbar-thumb:hover {
            background: #a8b1b8;
          }
        `}</style>
        <Text variant='headingMd' as='h3'>Quiz Settings</Text>
        
        <Box paddingBlockStart='400'>
          {renderContent()}
        </Box>
      </div>
    </Card>
  );
}