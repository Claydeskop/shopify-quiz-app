'use client';

import { Text, TextField, Box } from '@shopify/polaris';
import { useState } from 'react';
import CollectionPicker from '../../pickers/CollectionPicker';
import MediaPicker from '../../pickers/MediaPicker';
import TogglePicker from '../../pickers/TogglePicker';
import CheckboxPicker from '../../pickers/CheckboxPicker';

interface InformationSettingsProps {
  quizName: string;
  quizTitle: string;
  quizDescription: string;
  quizImage: string | null;
  isActive: boolean;
  autoTransition: boolean;
  selectedCollections: any[];
  onQuizNameChange: (value: string) => void;
  onQuizTitleChange: (value: string) => void;
  onQuizDescriptionChange: (value: string) => void;
  onQuizImageChange: (imageUrl: string | null) => void;
  onIsActiveChange: (value: boolean) => void;
  onAutoTransitionChange: (value: boolean) => void;
  onCollectionsChange: (collections: any[]) => void;
}

export default function InformationSettings({ 
  quizName,
  quizTitle,
  quizDescription,
  quizImage,
  isActive,
  autoTransition,
  selectedCollections,
  onQuizNameChange,
  onQuizTitleChange,
  onQuizDescriptionChange,
  onQuizImageChange,
  onIsActiveChange,
  onAutoTransitionChange,
  onCollectionsChange
}: InformationSettingsProps) {

  const handleMediaSelect = (mediaUrl: string) => {
    onQuizImageChange(mediaUrl);
  };

  const handleRemoveMedia = () => {
    onQuizImageChange(null);
  };

  const handleCollectionsChange = (collections: any[]) => {
    onCollectionsChange(collections);
  };

  return (
    <Box>
      <Text variant='headingSm' as='h4'>Quiz Information Settings</Text>
      
      <TogglePicker
        label="Quiz Durumu"
        checked={isActive}
        onChange={onIsActiveChange}
        helpText="Aktif olan quizler mağaza önyüzünde görüntülenebilir"
      />

      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <TextField
          label="Quiz Name"
          value={quizName}
          onChange={onQuizNameChange}
          placeholder="Enter quiz name"
          helpText="Bu ismi diğer kullanıcılar görmeyecektir"
          autoComplete="off"
        />
      </Box>

      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <TextField
          label="Quiz Title"
          value={quizTitle}
          onChange={onQuizTitleChange}
          placeholder="Enter quiz title"
          helpText="Bu title preview alanında görünecektir"
          autoComplete="off"
        />
      </Box>

      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <TextField
          label="Quiz Description"
          value={quizDescription}
          onChange={onQuizDescriptionChange}
          placeholder="Enter quiz description"
          helpText="Bu açıklama preview alanında görünecektir"
          multiline={3}
          autoComplete="off"
        />
      </Box>

      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <Text variant='bodyMd' fontWeight="medium">Quiz Image</Text>
        <Box paddingBlockStart="200">
          <MediaPicker
            selectedMedia={quizImage}
            onMediaSelect={handleMediaSelect}
            onMediaRemove={handleRemoveMedia}
          />
        </Box>
      </Box>

      <CollectionPicker
        selectedCollections={selectedCollections}
        onCollectionsChange={handleCollectionsChange}
      />

      <CheckboxPicker
        label="Otomatik Geçiş"
        checked={autoTransition}
        onChange={onAutoTransitionChange}
        helpText="Kullanıcılar cevap seçtikten sonra otomatik olarak bir sonraki soruya geçsin"
      />
    </Box>
  );
}