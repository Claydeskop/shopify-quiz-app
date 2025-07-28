'use client';

import { Checkbox, Divider, Text, TextField } from '@shopify/polaris';
import { useState } from 'react';
import CollectionPicker from '../../pickers/CollectionPicker';
import MediaPicker from '../../pickers/MediaPicker';
import MetafieldPicker from '../../pickers/MetafieldPicker';

interface InformationSettingsProps {
  quizName: string;
  quizTitle: string;
  quizDescription: string;
  quizImage: string | null;
  onQuizNameChange: (value: string) => void;
  onQuizTitleChange: (value: string) => void;
  onQuizDescriptionChange: (value: string) => void;
  onQuizImageChange: (imageUrl: string | null) => void;
}

export default function InformationSettings({ 
  quizName,
  quizTitle,
  quizDescription,
  quizImage,
  onQuizNameChange,
  onQuizTitleChange,
  onQuizDescriptionChange,
  onQuizImageChange
}: InformationSettingsProps) {
  const [selectedCollections, setSelectedCollections] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [metafieldConditions, setMetafieldConditions] = useState<any[]>([]);
  const [metafieldsEnabled, setMetafieldsEnabled] = useState<boolean>(false);

  const handleMediaSelect = (mediaUrl: string) => {
    onQuizImageChange(mediaUrl);
  };

  const handleRemoveMedia = () => {
    onQuizImageChange(null);
  };

  const handleCollectionsChange = (collections: any[]) => {
    setSelectedCollections(collections);
  };

  const handleProductsChange = (products: any[]) => {
    setSelectedProducts(products);
  };

  const handleMetafieldConditionsChange = (conditions: any[]) => {
    setMetafieldConditions(conditions);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Text variant='headingSm' as='h4'>Quiz Information Settings</Text>
      
      <TextField
        label="Quiz Name"
        value={quizName}
        onChange={onQuizNameChange}
        placeholder="Enter quiz name"
        helpText="Bu ismi diğer kullanıcılar görmeyecektir"
        autoComplete="off"
      />

      <TextField
        label="Quiz Title"
        value={quizTitle}
        onChange={onQuizTitleChange}
        placeholder="Enter quiz title"
        helpText="Bu title preview alanında görünecektir"
        autoComplete="off"
      />

      <TextField
        label="Quiz Description"
        value={quizDescription}
        onChange={onQuizDescriptionChange}
        placeholder="Enter quiz description"
        helpText="Bu açıklama preview alanında görünecektir"
        multiline={3}
        autoComplete="off"
      />

      <Divider />

      <Text variant='headingXs' as='h5'>Quiz Image</Text>
      <MediaPicker
        selectedMedia={quizImage}
        onMediaSelect={handleMediaSelect}
        onMediaRemove={handleRemoveMedia}
      />

      <Divider />

      <Text variant='headingXs' as='h5'>Quiz Collection</Text>
      <CollectionPicker
        selectedCollections={selectedCollections}
        onCollectionsChange={handleCollectionsChange}
      />

      <Divider />

      <Divider />

      <Checkbox
        label="Metafields Enabled"
        checked={metafieldsEnabled}
        onChange={setMetafieldsEnabled}
      />

      {metafieldsEnabled && (
        <>
          <MetafieldPicker
            conditions={metafieldConditions}
            onConditionsChange={handleMetafieldConditionsChange}
          />
        </>
      )}
    </div>
  );
}