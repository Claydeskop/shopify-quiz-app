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

interface Metafield {
  id: string;
  key: string;
  namespace: string;
  name: string;
  description?: string;
  type: string;
  ownerType: string;
  validations: any[];
}

interface MetafieldCondition {
  id: string;
  metafield?: Metafield;
  operator: 'equals' | 'not_equals';
  value: string;
}

interface MetafieldPickerProps {
  conditions: MetafieldCondition[];
  onConditionsChange: (conditions: MetafieldCondition[]) => void;
}

export default function MetafieldPicker({ conditions, onConditionsChange }: MetafieldPickerProps) {
  const [allMetafields, setAllMetafields] = useState<Metafield[]>([]);
  const [metafieldValues, setMetafieldValues] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetafields();
  }, []);

  const fetchMetafields = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/shopify/metafields');
      if (!response.ok) {
        throw new Error('Failed to fetch metafields');
      }

      const data = await response.json();
      setAllMetafields(data.metafields || []);
    } catch (err) {
      console.error('Error fetching metafields:', err);
      setError('Failed to load metafields');
      setAllMetafields([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetafieldValues = async (metafieldKey: string, namespace: string) => {
    try {
      const response = await fetch(`/api/shopify/metafield-values?key=${metafieldKey}&namespace=${namespace}`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.values || [];
    } catch (err) {
      console.error('Error fetching metafield values:', err);
      return [];
    }
  };

  const addCondition = () => {
    const newCondition: MetafieldCondition = {
      id: Date.now().toString(),
      operator: 'equals',
      value: ''
    };
    onConditionsChange([...(conditions || []), newCondition]);
  };

  const removeCondition = (conditionId: string) => {
    onConditionsChange((conditions || []).filter(c => c.id !== conditionId));
  };

  const updateCondition = (conditionId: string, updates: Partial<MetafieldCondition>) => {
    onConditionsChange((conditions || []).map(c => 
      c.id === conditionId ? { ...c, ...updates } : c
    ));
  };

  const handleMetafieldSelect = async (conditionId: string, metafieldId: string) => {
    if (metafieldId === 'placeholder' || metafieldId === '') return;
    
    const metafield = allMetafields.find(m => m.id === metafieldId);
    if (!metafield) return;

    // Fetch values for this metafield
    const values = await fetchMetafieldValues(metafield.key, metafield.namespace);
    setMetafieldValues(prev => ({
      ...prev,
      [metafield.id]: values
    }));

    updateCondition(conditionId, { 
      metafield,
      value: '' // Reset value when metafield changes
    });
  };

  if (loading) {
    return (
      <Box>
        <Text variant='headingSm' as='h4'>Product Finder Conditions</Text>
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
        <Text variant='headingSm' as='h4'>Product Finder Conditions</Text>
        <Box paddingBlockStart='200'>
          <Text variant='bodyMd' tone='critical'>
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  const metafieldOptions = [
    { label: 'Select metafield...', value: 'placeholder', key: 'placeholder' },
    ...allMetafields.map((metafield, idx) => ({
      label: `${metafield.namespace}.${metafield.key} (${metafield.type})`,
      value: metafield.id,
      key: `metafield-${metafield.id}-${idx}`
    }))
  ];

  const operatorOptions = [
    { label: 'equals', value: 'equals', key: 'equals' },
    { label: 'not equals', value: 'not_equals', key: 'not_equals' }
  ];

  return (
    <Box>
      <Text variant='headingSm' as='h4'>Product Finder Conditions</Text>
      <Box paddingBlockStart='200'>
        
        {/* Existing Conditions */}
        {(conditions || []).map((condition, index) => {
          const valueOptions = condition.metafield 
            ? [
                { label: 'Select value...', value: '', key: `${condition.id}-placeholder` },
                ...(metafieldValues[condition.metafield.id] || []).map((value, idx) => ({
                  label: value,
                  value: value,
                  key: `${condition.metafield.id}-${value}-${idx}`
                }))
              ]
            : [{ label: 'Select metafield first...', value: '', key: `${condition.id}-no-metafield` }];

          return (
            <Card key={condition.id}>
              <Box padding='300'>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 120px 1fr 40px', 
                  gap: '12px', 
                  alignItems: 'center' 
                }}>
                  
                  {/* Metafield Selector */}
                  <Select
                    label=""
                    options={metafieldOptions}
                    onChange={(value) => handleMetafieldSelect(condition.id, value)}
                    value={condition.metafield?.id || 'placeholder'}
                    placeholder="Select metafield..."
                  />

                  {/* Operator Selector */}
                  <Select
                    label=""
                    options={operatorOptions}
                    onChange={(value) => updateCondition(condition.id, { operator: value as 'equals' | 'not_equals' })}
                    value={condition.operator}
                  />

                  {/* Value Selector */}
                  <Select
                    label=""
                    options={valueOptions}
                    onChange={(value) => updateCondition(condition.id, { value })}
                    value={condition.value}
                    disabled={!condition.metafield}
                    placeholder="Select value..."
                  />

                  {/* Delete Button */}
                  <Button
                    size="micro"
                    variant="tertiary"
                    icon={DeleteIcon}
                    onClick={() => removeCondition(condition.id)}
                    accessibilityLabel="Remove condition"
                  />
                </div>

                {/* Condition Summary */}
                {condition.metafield && condition.value && (
                  <Box paddingBlockStart='200'>
                    <Text variant='bodySm' tone='subdued'>
                      Find products where <strong>{condition.metafield.namespace}.{condition.metafield.key}</strong> {' '}
                      <strong>{condition.operator === 'equals' ? 'equals' : 'does not equal'}</strong> {' '}
                      <strong>"{condition.value}"</strong>
                    </Text>
                  </Box>
                )}
              </Box>
            </Card>
          );
        })}

        {/* Add Condition Button */}
        <Box paddingBlockStart={(conditions || []).length > 0 ? '300' : '0'}>
          <Button onClick={addCondition} fullWidth>
            Add Metafield Condition
          </Button>
        </Box>

        {(conditions || []).length > 0 && (
          <Box paddingBlockStart='200'>
            <Text variant='bodySm' tone='subdued'>
              {(conditions || []).length} condition{(conditions || []).length !== 1 ? 's' : ''} defined. Products must match ALL conditions.
            </Text>
          </Box>
        )}

        {allMetafields.length === 0 && (
          <Box paddingBlockStart='200'>
            <Text variant='bodyMd' tone='subdued'>
              No metafields found in your store. Create metafields in Shopify admin first.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}