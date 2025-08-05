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
import { ShopifyMetafield } from '../../types';

interface Metafield {
  id: string;
  key: string;
  namespace: string;
  name: string;
  description?: string;
  type: string;
  ownerType: string;
  validations: ShopifyMetafield[];
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
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // Load metafield values for existing conditions when allMetafields is loaded
  useEffect(() => {
    if (allMetafields.length > 0 && conditions && conditions.length > 0) {
      conditions.forEach(async (condition) => {
        if (condition.metafield && !metafieldValues[condition.metafield.id]) {
          const values = await fetchMetafieldValues(condition.metafield.key, condition.metafield.namespace);
          setMetafieldValues(prev => ({
            ...prev,
            [condition.metafield!.id]: values
          }));
        }
      });
    }
  }, [allMetafields, conditions]);

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
          <Text variant='bodyMd' tone='critical' as='p'>
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  const metafieldOptions = [
    { label: 'Select metafield...', value: 'placeholder', key: 'placeholder' },
    ...allMetafields.map((metafield, idx) => {
      let label = metafield.name || `${metafield.namespace}.${metafield.key}`;
      // Truncate long labels
      if (label.length > 40) {
        label = label.substring(0, 37) + '...';
      }
      return {
        label,
        value: metafield.id,
        key: `metafield-${metafield.id}-${idx}`
      };
    })
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
                ...(metafieldValues[condition.metafield.id] || []).map((value, idx) => {
                  let label = value;
                  // Truncate long values
                  if (label.length > 25) {
                    label = label.substring(0, 22) + '...';
                  }
                  return {
                    label,
                    value: value,
                    key: `${condition.metafield!.id}-${value}-${idx}`
                  };
                })
              ]
            : [{ label: 'Select metafield first...', value: '', key: `${condition.id}-no-metafield` }];

          return (
            <Card key={`${condition.id}-${index}`}>
              <Box padding='300'>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  
                  {/* Header with delete button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant='bodyMd' fontWeight="semibold" as='h5'>
                      Condition {(conditions || []).indexOf(condition) + 1}
                    </Text>
                    <Button
                      size="micro"
                      variant="tertiary"
                      icon={DeleteIcon}
                      onClick={() => removeCondition(condition.id)}
                      accessibilityLabel="Remove condition"
                    />
                  </div>

                  {/* Metafield Selector */}
                  <div>
                    <Text variant='bodyXs' as='span' fontWeight="medium">Select Metafield</Text>
                    <Box paddingBlockStart='100'>
                      <div style={{ overflow: 'hidden' }}>
                        <Select
                          label="Metafield Seç"
                          options={metafieldOptions}
                          onChange={(value) => handleMetafieldSelect(condition.id, value)}
                          value={condition.metafield?.id || 'placeholder'}
                          placeholder="Select metafield..."
                        />
                      </div>
                    </Box>
                  </div>

                  {/* Operator and Value Row */}
                  {condition.metafield && (
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                      {/* Operator Selector */}
                      <div>
                        <Text variant='bodyXs' as='span' fontWeight="medium">Operator</Text>
                        <Box paddingBlockStart='100'>
                          <Select
                            label="Operatör Seç"
                            options={operatorOptions}
                            onChange={(value) => updateCondition(condition.id, { operator: value as 'equals' | 'not_equals' })}
                            value={condition.operator}
                          />
                        </Box>
                      </div>

                      {/* Value Selector */}
                      <div style={{ overflow: 'hidden' }}>
                        <Text variant='bodyXs' as='span' fontWeight="medium">Value</Text>
                        <Box paddingBlockStart='100'>
                          <Select
                            label="Değer Seç"
                            options={valueOptions}
                            onChange={(value) => updateCondition(condition.id, { value })}
                            value={condition.value}
                            disabled={!condition.metafield}
                            placeholder="Select value..."
                          />
                        </Box>
                      </div>
                    </div>
                  )}
                </div>

                {/* Condition Summary */}
                {condition.metafield && condition.value && (
                  <Box paddingBlockStart='200'>
                    <Text variant='bodySm' tone='subdued' as='p'>
                      Find products where <strong>{condition.metafield.namespace}.{condition.metafield.key}</strong> {' '}
                      <strong>{condition.operator === 'equals' ? 'equals' : 'does not equal'}</strong> {' '}
                      <strong>&quot;{condition.value}&quot;</strong>
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
            <Text variant='bodySm' tone='subdued' as='p'>
              {(conditions || []).length} condition{(conditions || []).length !== 1 ? 's' : ''} defined. Products must match ALL conditions.
            </Text>
          </Box>
        )}

        {allMetafields.length === 0 && (
          <Box paddingBlockStart='200'>
            <Text variant='bodyMd' tone='subdued' as='p'>
              No metafields found in your store. Create metafields in Shopify admin first.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}