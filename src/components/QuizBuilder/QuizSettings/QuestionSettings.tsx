'use client';

import { Box, Text, TextField } from '@shopify/polaris';

interface Question {
  id: string;
  text: string;
}

interface QuestionSettingsProps {
  selectedQuestionId: string | null;
  questions: Question[];
  onQuestionTextChange: (questionId: string, text: string) => void;
}

export default function QuestionSettings({ 
  selectedQuestionId, 
  questions, 
  onQuestionTextChange 
}: QuestionSettingsProps) {
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  if (!selectedQuestion) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Text variant='headingSm' as='h4'>Question Settings</Text>
        <Text as='p' tone='subdued'>
          Select a question to edit its settings
        </Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant='headingSm' as='h4'>Question Settings</Text>
      <TextField
        label="Question Text"
        value={selectedQuestion.text}
        onChange={(value) => onQuestionTextChange(selectedQuestion.id, value)}
        placeholder="What is your question?"
        autoComplete="off"
      />
    </div>
  );
}