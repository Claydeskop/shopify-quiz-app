'use client';

import {
  Box,
  Text,
  Select,
  Tag,
  Spinner
} from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { ShopifyCollection } from '../../types';

interface Collection extends ShopifyCollection {
  productsCount: number;
}

interface CollectionPickerProps {
  selectedCollections: Collection[];
  onCollectionsChange: (collections: Collection[]) => void;
}

export default function CollectionPicker({ selectedCollections, onCollectionsChange }: CollectionPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/shopify/collections');

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      setAllCollections(data.collections || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections');
      // Fallback to empty array
      setAllCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = (allCollections || []).filter((collection) =>
    collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableCollections = filteredCollections.filter(
    collection => !(selectedCollections || []).find(sc => sc.id === collection.id)
  );

  const handleCollectionSelect = useCallback((collectionId: string) => {
    if (collectionId === 'placeholder' || collectionId === '') return;
    
    const collection = allCollections.find(c => c.id === collectionId);
    const currentSelected = selectedCollections || [];
    if (collection && !currentSelected.find(sc => sc.id === collection.id)) {
      onCollectionsChange([...currentSelected, collection]);
    }
  }, [selectedCollections, onCollectionsChange, allCollections]);

  const removeTag = useCallback((collectionId: string) => {
    onCollectionsChange((selectedCollections || []).filter(c => c.id !== collectionId));
  }, [selectedCollections, onCollectionsChange]);

  const selectOptions = [
    { label: 'Select a collection...', value: 'placeholder' },
    ...availableCollections.map(collection => ({
      label: `${collection.title} (${collection.productsCount} products)`,
      value: collection.id
    }))
  ];

  const selectedTagsMarkup = (selectedCollections || []).map((collection) => (
    <Tag key={collection.id} onRemove={() => removeTag(collection.id)}>
      {collection.title} ({collection.productsCount})
    </Tag>
  ));

  if (loading) {
    return (
      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <Text variant='bodyMd' fontWeight="medium" as="h4">Quiz Collection</Text>
        <Box paddingBlockStart='200'>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <Spinner size="small" />
          </div>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box paddingBlockStart="400" paddingBlockEnd="400">
        <Text variant='bodyMd' fontWeight="medium" as="h4">Quiz Collection</Text>
        <Box paddingBlockStart='200'>
          <Text variant='bodyMd' tone='critical' as='p'>
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box paddingBlockStart="400" paddingBlockEnd="400">
      <Text variant='bodyMd' fontWeight="medium" as="h4">Quiz Collection</Text>
      <Box paddingBlockStart='200'>
        
        {selectedCollections && selectedCollections.length > 0 && (
          <Box paddingBlockEnd='300'>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedTagsMarkup}
            </div>
          </Box>
        )}

        <Select
          label="Koleksiyon Seç"
          options={selectOptions}
          onChange={handleCollectionSelect}
          value="placeholder"
          placeholder="Select a collection..."
          disabled={allCollections.length === 0}
        />

        {availableCollections.length > 0 && (
          <Box paddingBlockStart='200'>
            <Text variant='bodySm' tone='subdued' as='p'>
              {availableCollections.length} collection{availableCollections.length !== 1 ? 's' : ''} available
            </Text>
          </Box>
        )}

        {allCollections.length === 0 && !loading && !error && (
          <Box paddingBlockStart='200'>
            <Text variant='bodyMd' tone='subdued' as='p'>
              No collections found in your store.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}