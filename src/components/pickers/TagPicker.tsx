'use client';

import {
  Box,
  Text,
  Select,
  Button,
  Card,
  Spinner,
  Icon
} from '@shopify/polaris';
import { useState, useCallback, useEffect } from 'react';
import { DeleteIcon } from '@shopify/polaris-icons';

interface TagCondition {
  id: string;
  tag: string;
  operator: 'equals' | 'not_equals';
}

interface TagPickerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagPicker({ selectedTags, onTagsChange }: TagPickerProps) {
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchTags();
    }
  }, [isMounted]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionResponse = await fetch('/api/session');
      const sessionData = await sessionResponse.json();
      
      if (sessionData.shopDomain) {
        const response = await fetch('/api/shopify/tags', {
          headers: {
            'x-shopify-shop-domain': sessionData.shopDomain
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAllTags(data.tags || []);
        }
      }
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
      setAllTags([]);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    const newCondition: TagCondition = {
      id: Date.now().toString(),
      tag: '',
      operator: 'equals'
    };
    // Convert to the format expected by parent
    onTagsChange([...selectedTags, '']);
  };

  const removeTag = (index: number) => {
    const newTags = selectedTags.filter((_, i) => i !== index);
    onTagsChange(newTags);
  };

  const updateTag = (index: number, newTag: string) => {
    const newTags = [...selectedTags];
    newTags[index] = newTag;
    onTagsChange(newTags);
  };

  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <Box>
        <Text variant='headingSm' as='h4'>Tag Filters</Text>
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
      <Box>
        <Text variant='headingSm' as='h4'>Tag Filters</Text>
        <Box paddingBlockStart='200'>
          <Text variant='bodyMd' tone='critical'>
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  const tagOptions = [
    { label: 'Select tag...', value: '', key: 'placeholder' },
    ...allTags.map((tag, idx) => ({
      label: tag,
      value: tag,
      key: `tag-${tag}-${idx}`
    }))
  ];

  return (
    <Box>
      <Text variant='headingSm' as='h4'>Tag Filters</Text>
      <Box paddingBlockStart='200'>
        
        {/* Existing Tag Conditions */}
        {selectedTags.map((tag, index) => (
          <Card key={`tag-condition-${index}`}>
            <Box padding='300'>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 40px', 
                gap: '12px', 
                alignItems: 'center' 
              }}>
                
                {/* Tag Selector */}
                <Select
                  label=""
                  options={tagOptions}
                  onChange={(value) => updateTag(index, value)}
                  value={tag}
                  placeholder="Select tag..."
                />

                {/* Delete Button */}
                <Button
                  size="micro"
                  variant="tertiary"
                  icon={DeleteIcon}
                  onClick={() => removeTag(index)}
                  accessibilityLabel="Remove tag"
                />
              </div>

              {/* Tag Summary */}
              {tag && (
                <Box paddingBlockStart='200'>
                  <Text variant='bodySm' tone='subdued'>
                    Find products with tag: <strong>"{tag}"</strong>
                  </Text>
                </Box>
              )}
            </Box>
          </Card>
        ))}

        {/* Add Tag Button */}
        <Box paddingBlockStart={selectedTags.length > 0 ? '300' : '0'}>
          <Button onClick={addTag} fullWidth>
            Add Tag Filter
          </Button>
        </Box>

        {selectedTags.length > 0 && (
          <Box paddingBlockStart='200'>
            <Text variant='bodySm' tone='subdued'>
              {selectedTags.filter(tag => tag.trim()).length} tag filter{selectedTags.filter(tag => tag.trim()).length !== 1 ? 's' : ''} defined. Products must have ALL tags.
            </Text>
          </Box>
        )}

        {allTags.length === 0 && !loading && (
          <Box paddingBlockStart='200'>
            <Text variant='bodyMd' tone='subdued'>
              No tags found in your store. Add tags to your products first.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}