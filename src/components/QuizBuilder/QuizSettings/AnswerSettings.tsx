'use client';

import { Text, TextField, Checkbox, Divider } from '@shopify/polaris';
import MediaPicker from '../../pickers/MediaPicker';
import CollectionPicker from '../../pickers/CollectionPicker';
import MetafieldPicker from '../../pickers/MetafieldPicker';
import { ShopifyCollection, AnswerCondition, Answer } from '../../../types';

// Types for CollectionPicker compatibility
interface CollectionWithCount extends ShopifyCollection {
  productsCount: number;
}

// Create a simple adapter function to avoid type conflicts

// Extended Answer type that includes questionId for internal use
type AnswerWithQuestion = Answer & { questionId: string };

interface AnswerSettingsProps {
  selectedAnswerId: string | null;
  answers: AnswerWithQuestion[];
  onAnswerTextChange: (answerId: string, text: string) => void;
  onAnswerMediaChange: (answerId: string, mediaUrl: string | null) => void;
  onAnswerCollectionsChange: (answerId: string, collections: ShopifyCollection[]) => void;
  onAnswerRedirectToLinkChange: (answerId: string, value: boolean) => void;
  onAnswerRedirectUrlChange: (answerId: string, url: string) => void;
  onAnswerMetafieldConditionsChange: (answerId: string, conditions: AnswerCondition[]) => void;
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
  const selectedAnswer = (answers || []).find(a => a.id === selectedAnswerId);

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

  const handleCollectionsChange = (collections: CollectionWithCount[]) => {
    if (selectedAnswer) {
      // Convert Collection[] to ShopifyCollection[] by removing productsCount
      const shopifyCollections: ShopifyCollection[] = collections.map(({ productsCount: _, ...rest }) => rest);
      onAnswerCollectionsChange(selectedAnswer.id, shopifyCollections);
    }
  };

  const handleMetafieldConditionsChange = (conditions: unknown[]) => {
    if (selectedAnswer) {
      // Convert MetafieldPicker conditions to AnswerCondition[] 
      const answerConditions: AnswerCondition[] = (conditions as Array<{
        id: string;
        metafield?: {
          id: string;
          namespace: string;
          key: string;
          name: string;
          type: string;
          description?: string;
        };
        operator: 'equals' | 'not_equals';
        value: string;
      }>).map(({ metafield, operator, value }) => ({
        metafield: metafield ? {
          id: metafield.id,
          namespace: metafield.namespace,
          key: metafield.key,
          value: metafield.name,
          type: metafield.type,
          description: metafield.description
        } : undefined,
        operator,
        value
      }));
      onAnswerMetafieldConditionsChange(selectedAnswer.id, answerConditions);
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
        selectedMedia={selectedAnswer.answer_media ?? null}
        onMediaSelect={handleAnswerMediaSelect}
        onMediaRemove={handleRemoveAnswerMedia}
      />

      <Divider />

      <MetafieldPicker
        conditions={(selectedAnswer.conditions || []).map((condition, index) => ({
          id: `condition-${index}`, // Generate an ID since AnswerCondition doesn't have one
          metafield: condition.metafield ? {
            id: condition.metafield.id,
            key: condition.metafield.key,
            namespace: condition.metafield.namespace,
            name: condition.metafield.value || '',
            description: condition.metafield.description,
            type: condition.metafield.type,
            ownerType: 'PRODUCT',
            validations: []
          } : undefined,
          operator: condition.operator,
          value: condition.value
        }))}
        onConditionsChange={handleMetafieldConditionsChange as React.ComponentProps<typeof MetafieldPicker>['onConditionsChange']}
      />

      <Divider />

      <Checkbox
        label="Bu seçilirse direkt olarak linke gitsin"
        checked={selectedAnswer.redirect_to_link || false}
        onChange={(value) => onAnswerRedirectToLinkChange(selectedAnswer.id, value)}
      />

      {(selectedAnswer.redirect_to_link || false) && (
        <TextField
          label="Yönlendirme URL'si"
          value={selectedAnswer.redirect_url || ''}
          onChange={(value) => onAnswerRedirectUrlChange(selectedAnswer.id, value)}
          placeholder="https://example.com"
          autoComplete="off"
        />
      )}

      <Divider />

      <Text variant='headingXs' as='h5'>İlgili Koleksiyon</Text>
      <CollectionPicker
        selectedCollections={(selectedAnswer.collections || []).map(collection => ({
          ...collection,
          productsCount: 0 // Default value since we don't have this data
        }))}
        onCollectionsChange={handleCollectionsChange}
      />

    </div>
  );
}