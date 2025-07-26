'use client';

import { Box, Text, TextField } from '@shopify/polaris';

interface Answer {
  id: string;
  text: string;
  questionId: string;
}

interface AnswerSettingsProps {
  selectedAnswerId: string | null;
  answers: Answer[];
  onAnswerTextChange: (answerId: string, text: string) => void;
}

export default function AnswerSettings({ 
  selectedAnswerId, 
  answers, 
  onAnswerTextChange 
}: AnswerSettingsProps) {
  const selectedAnswer = answers.find(a => a.id === selectedAnswerId);

  if (!selectedAnswer) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Text variant='headingSm' as='h4'>Answer Settings</Text>
        <Text as='p' tone='subdued'>
          Select an answer to edit its settings
        </Text>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant='headingSm' as='h4'>Answer Settings</Text>
      <TextField
        label="Answer Text"
        value={selectedAnswer.text}
        onChange={(value) => onAnswerTextChange(selectedAnswer.id, value)}
        placeholder="Enter answer option"
        autoComplete="off"
      />
    </div>
  );
}