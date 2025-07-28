'use client';

import { Box, Text, TextField, Checkbox, Divider, Select } from '@shopify/polaris';
import { useState } from 'react';
import MediaPicker from '../../pickers/MediaPicker';
import CollectionPicker from '../../pickers/CollectionPicker';
import MetafieldPicker from '../../pickers/MetafieldPicker';

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

interface AnswerSettingsProps {
  selectedAnswerId: string | null;
  answers: Answer[];
  onAnswerTextChange: (answerId: string, text: string) => void;
  onAnswerMediaChange: (answerId: string, mediaUrl: string | null) => void;
  onAnswerCollectionsChange: (answerId: string, collections: any[]) => void;
  onAnswerRedirectToLinkChange: (answerId: string, value: boolean) => void;
  onAnswerRedirectUrlChange: (answerId: string, url: string) => void;
  onAnswerMetafieldConditionsChange: (answerId: string, conditions: any[]) => void;
}

export default function AnswerSettings({ 
  selectedAnswerId, 
  answers, 
  onAnswerTextChange,
  onAnswerMediaChange,
  onAnswerCollectionsChange,
  onAnswerRedirectToLinkChange,
  onAnswerRedirectUrlChange,
  onAnswerMetafieldConditionsChange
}: AnswerSettingsProps) {
  const selectedAnswer = answers.find(a => a.id === selectedAnswerId);

  const handleAnswerMediaSelect = (mediaUrl: string) => {
    if (selectedAnswer) {
      onAnswerMediaChange(selectedAnswer.id, mediaUrl);
    }
  };

  const handleRemoveAnswerMedia = () => {
    if (selectedAnswer) {
      onAnswerMediaChange(selectedAnswer.id, null);
    }
  };

  const handleCollectionsChange = (collections: any[]) => {
    if (selectedAnswer) {
      onAnswerCollectionsChange(selectedAnswer.id, collections);
    }
  };

  const handleMetafieldConditionsChange = (conditions: any[]) => {
    if (selectedAnswer) {
      onAnswerMetafieldConditionsChange(selectedAnswer.id, conditions);
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Text variant='headingSm' as='h4'>Answer Settings</Text>
      
      <TextField
        label="Şık Metni"
        value={selectedAnswer.text}
        onChange={(value) => onAnswerTextChange(selectedAnswer.id, value)}
        placeholder="Enter answer option"
        autoComplete="off"
      />

      <Divider />

      <Text variant='headingXs' as='h5'>Şık Görseli</Text>
      <MediaPicker
        selectedMedia={selectedAnswer.answerMedia}
        onMediaSelect={handleAnswerMediaSelect}
        onMediaRemove={handleRemoveAnswerMedia}
      />

      <Divider />

      <Text variant='headingXs' as='h5'>İlgili Koleksiyon</Text>
      <CollectionPicker
        selectedCollections={selectedAnswer.relatedCollections}
        onCollectionsChange={handleCollectionsChange}
      />

      <Divider />

      <MetafieldPicker
        conditions={selectedAnswer.metafieldConditions}
        onConditionsChange={handleMetafieldConditionsChange}
      />

      <Divider />

      <Checkbox
        label="Bu seçilirse direkt olarak linke gitsin"
        checked={selectedAnswer.redirectToLink}
        onChange={(value) => onAnswerRedirectToLinkChange(selectedAnswer.id, value)}
      />

      {selectedAnswer.redirectToLink && (
        <TextField
          label="Yönlendirme URL'si"
          value={selectedAnswer.redirectUrl}
          onChange={(value) => onAnswerRedirectUrlChange(selectedAnswer.id, value)}
          placeholder="https://example.com"
          autoComplete="off"
        />
      )}
    </div>
  );
}