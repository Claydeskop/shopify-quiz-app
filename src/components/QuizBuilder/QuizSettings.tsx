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

interface Question {
  id: string;
  text: string;
  showAnswers: boolean;
  allowMultipleSelection: boolean;
  questionMedia: string | null;
}

interface Answer {
  id: string;
  text: string;
  questionId: string;
  answerMedia: string | null;
  relatedCollections: any[];
  redirectToLink: boolean;
  redirectUrl: string;
  metafieldConditions: any[];
}

interface QuizSettingsProps {
  activeTab: string;
  selectedQuestionId: string | null;
  selectedAnswerId: string | null;
  questions: Question[];
  answers: Answer[];
  onQuestionTextChange: (questionId: string, text: string) => void;
  onAnswerTextChange: (answerId: string, text: string) => void;
  quizName: string;
  quizTitle: string;
  quizImage: string | null;
  onQuizNameChange: (value: string) => void;
  onQuizTitleChange: (value: string) => void;
  onQuizImageChange: (imageUrl: string | null) => void;
  internalQuizTitle: string;
  internalQuizDescription: string;
  onInternalQuizTitleChange: (value: string) => void;
  onInternalQuizDescriptionChange: (value: string) => void;
  onQuestionShowAnswersChange: (questionId: string, value: boolean) => void;
  onQuestionAllowMultipleSelectionChange: (questionId: string, value: boolean) => void;
  onQuestionMediaChange: (questionId: string, mediaUrl: string | null) => void;
  onAnswerMediaChange: (answerId: string, mediaUrl: string | null) => void;
  onAnswerCollectionsChange: (answerId: string, collections: any[]) => void;
  onAnswerRedirectToLinkChange: (answerId: string, value: boolean) => void;
  onAnswerRedirectUrlChange: (answerId: string, url: string) => void;
  onAnswerMetafieldConditionsChange: (answerId: string, conditions: any[]) => void;
}

export default function QuizSettings({ 
  activeTab, 
  selectedQuestionId,
  selectedAnswerId,
  questions,
  answers,
  onQuestionTextChange,
  onAnswerTextChange,
  quizName,
  quizTitle,
  quizImage,
  onQuizNameChange,
  onQuizTitleChange,
  onQuizImageChange,
  internalQuizTitle,
  internalQuizDescription,
  onInternalQuizTitleChange,
  onInternalQuizDescriptionChange,
  onQuestionShowAnswersChange,
  onQuestionAllowMultipleSelectionChange,
  onQuestionMediaChange,
  onAnswerMediaChange,
  onAnswerCollectionsChange,
  onAnswerRedirectToLinkChange,
  onAnswerRedirectUrlChange,
  onAnswerMetafieldConditionsChange
}: QuizSettingsProps) {

  const renderContent = () => {
    switch (activeTab) {
      case 'information':
        return (
          <InformationSettings 
            quizName={quizName}
            quizTitle={internalQuizTitle}
            quizDescription={internalQuizDescription}
            quizImage={quizImage}
            onQuizNameChange={onQuizNameChange}
            onQuizTitleChange={onInternalQuizTitleChange}
            onQuizDescriptionChange={onInternalQuizDescriptionChange}
            onQuizImageChange={onQuizImageChange}
          />
        );
      
      case 'style':
        return <StyleSettings />;
      
      case 'questions':
        // If an answer is selected, show answer settings
        if (selectedAnswerId) {
          return (
            <AnswerSettings
              selectedAnswerId={selectedAnswerId}
              answers={answers}
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
            onQuizNameChange={onQuizNameChange}
            onQuizTitleChange={onInternalQuizTitleChange}
            onQuizDescriptionChange={onInternalQuizDescriptionChange}
            onQuizImageChange={onQuizImageChange}
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
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
        className="quiz-settings-scroll"
      >
        <Text variant='headingMd' as='h3'>Quiz Settings</Text>
        
        <Box paddingBlockStart='400'>
          {renderContent()}
        </Box>
      </div>
    </Card>
  );
}