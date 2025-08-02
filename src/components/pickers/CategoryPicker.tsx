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

interface CategoryCondition {
  id: string;
  category: string;
  operator: 'equals' | 'not_equals';
}

interface CategoryPickerProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export default function CategoryPicker({ selectedCategories, onCategoriesChange }: CategoryPickerProps) {
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchCategories();
    }
  }, [isMounted]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sessionResponse = await fetch('/api/session');
      const sessionData = await sessionResponse.json();
      
      if (sessionData.shopDomain) {
        const response = await fetch('/api/shopify/categories', {
          headers: {
            'x-shopify-shop-domain': sessionData.shopDomain
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAllCategories(data.categories || []);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = () => {
    const newCondition: CategoryCondition = {
      id: Date.now().toString(),
      category: '',
      operator: 'equals'
    };
    // Convert to the format expected by parent
    onCategoriesChange([...selectedCategories, '']);
  };

  const removeCategory = (index: number) => {
    const newCategories = selectedCategories.filter((_, i) => i !== index);
    onCategoriesChange(newCategories);
  };

  const updateCategory = (index: number, newCategory: string) => {
    const newCategories = [...selectedCategories];
    newCategories[index] = newCategory;
    onCategoriesChange(newCategories);
  };

  if (!isMounted) {
    return null;
  }

  if (loading) {
    return (
      <Box>
        <Text variant='headingSm' as='h4'>Category Filters</Text>
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
        <Text variant='headingSm' as='h4'>Category Filters</Text>
        <Box paddingBlockStart='200'>
          <Text variant='bodyMd' tone='critical'>
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  const categoryOptions = [
    { label: 'Select category...', value: '', key: 'placeholder' },
    ...allCategories.map((category, idx) => ({
      label: category,
      value: category,
      key: `category-${category}-${idx}`
    }))
  ];

  return (
    <Box>
      <Text variant='headingSm' as='h4'>Category Filters</Text>
      <Box paddingBlockStart='200'>
        
        {/* Existing Category Conditions */}
        {selectedCategories.map((category, index) => (
          <Card key={`category-condition-${index}`}>
            <Box padding='300'>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 40px', 
                gap: '12px', 
                alignItems: 'center' 
              }}>
                
                {/* Category Selector */}
                <Select
                  label=""
                  options={categoryOptions}
                  onChange={(value) => updateCategory(index, value)}
                  value={category}
                  placeholder="Select category..."
                />

                {/* Delete Button */}
                <Button
                  size="micro"
                  variant="tertiary"
                  icon={DeleteIcon}
                  onClick={() => removeCategory(index)}
                  accessibilityLabel="Remove category"
                />
              </div>

              {/* Category Summary */}
              {category && (
                <Box paddingBlockStart='200'>
                  <Text variant='bodySm' tone='subdued'>
                    Find products with category: <strong>"{category}"</strong>
                  </Text>
                </Box>
              )}
            </Box>
          </Card>
        ))}

        {/* Add Category Button */}
        <Box paddingBlockStart={selectedCategories.length > 0 ? '300' : '0'}>
          <Button onClick={addCategory} fullWidth>
            Add Category Filter
          </Button>
        </Box>

        {selectedCategories.length > 0 && (
          <Box paddingBlockStart='200'>
            <Text variant='bodySm' tone='subdued'>
              {selectedCategories.filter(category => category.trim()).length} category filter{selectedCategories.filter(category => category.trim()).length !== 1 ? 's' : ''} defined. Products must match ALL categories.
            </Text>
          </Box>
        )}

        {allCategories.length === 0 && !loading && (
          <Box paddingBlockStart='200'>
            <Text variant='bodyMd' tone='subdued'>
              No categories found in your store. Add product types to your products first.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}