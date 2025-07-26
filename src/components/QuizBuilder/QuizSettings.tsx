'use client';

import {
  Box,
  Card,
  Text
} from '@shopify/polaris';
import InformationSettings from './QuizSettings/InformationSettings';
import StyleSettings from './QuizSettings/StyleSettings';
import QuestionSettings from './QuizSettings/QuestionSettings';
import AnswerSettings from './QuizSettings/AnswerSettings';

interface Question {
  id: string;
  text: string;
}

interface Answer {
  id: string;
  text: string;
  questionId: string;
}

interface QuizSettingsProps {
  activeTab: string;
  selectedQuestionId: string | null;
  selectedAnswerId: string | null;
  questions: Question[];
  answers: Answer[];
  onQuestionTextChange: (questionId: string, text: string) => void;
  onAnswerTextChange: (answerId: string, text: string) => void;
}

export default function QuizSettings({ 
  activeTab, 
  selectedQuestionId,
  selectedAnswerId,
  questions,
  answers,
  onQuestionTextChange,
  onAnswerTextChange
}: QuizSettingsProps) {

  const renderContent = () => {
    switch (activeTab) {
      case 'information':
        return <InformationSettings />;
      
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
            />
          );
        }
        // Otherwise show question settings
        return (
          <QuestionSettings
            selectedQuestionId={selectedQuestionId}
            questions={questions}
            onQuestionTextChange={onQuestionTextChange}
          />
        );
      
      default:
        return <InformationSettings />;
    }
  };

  return (
    <Card>
      <div style={{ 
        padding: '16px', 
        height: '100%',
        minHeight: '93vh',
        overflowY: 'auto'
      }}>
        <Text variant='headingMd' as='h3'>Quiz Settings</Text>
        
        <Box paddingBlockStart='400'>
          {renderContent()}
        </Box>
      </div>
    </Card>
  );
}