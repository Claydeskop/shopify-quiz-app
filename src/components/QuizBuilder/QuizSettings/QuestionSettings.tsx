'use client';

import { Checkbox, Divider, Text, TextField } from '@shopify/polaris';
import MediaPicker from '../../pickers/MediaPicker';

interface Question {
  id: string;
  text: string;
  showAnswers: boolean;
  allowMultipleSelection: boolean;
  questionMedia: string | null;
}

interface QuestionSettingsProps {
  selectedQuestionId: string | null;
  questions: Question[];
  onQuestionTextChange: (questionId: string, text: string) => void;
  onQuestionShowAnswersChange: (questionId: string, value: boolean) => void;
  onQuestionAllowMultipleSelectionChange: (questionId: string, value: boolean) => void;
  onQuestionShowAnswerImagesChange: (questionId: string, value: boolean) => void;
  onQuestionMediaChange: (questionId: string, mediaUrl: string | null) => void;
}

export default function QuestionSettings({ 
  selectedQuestionId, 
  questions, 
  onQuestionTextChange,
  onQuestionShowAnswersChange,
  onQuestionAllowMultipleSelectionChange,
  onQuestionShowAnswerImagesChange,
  onQuestionMediaChange
}: QuestionSettingsProps) {
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  const handleQuestionMediaSelect = (mediaUrl: string) => {
    if (selectedQuestion) {
      onQuestionMediaChange(selectedQuestion.id, mediaUrl);
    }
  };

  const handleRemoveQuestionMedia = () => {
    if (selectedQuestion) {
      onQuestionMediaChange(selectedQuestion.id, null);
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Text variant='headingSm' as='h4'>Question Settings</Text>
      
      <TextField
        label="Question Metni"
        value={selectedQuestion.text}
        onChange={(value) => onQuestionTextChange(selectedQuestion.id, value)}
        placeholder="What is your question?"
        multiline={2}
        autoComplete="off"
      />

      <Divider />

      <Checkbox
        label="Birden fazla seçim yapılabilir mi?"
        checked={selectedQuestion.allowMultipleSelection}
        onChange={(value) => onQuestionAllowMultipleSelectionChange(selectedQuestion.id, value)}
      />


      <Divider />

      <Text variant='headingXs' as='h5'>Soru Görseli</Text>
      <MediaPicker
        selectedMedia={selectedQuestion.questionMedia}
        onMediaSelect={handleQuestionMediaSelect}
        onMediaRemove={handleRemoveQuestionMedia}
      />
    </div>
  );
}