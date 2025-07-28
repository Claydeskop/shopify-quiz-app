'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Text,
  Thumbnail,
  Card,
  Badge,
  Tag
} from '@shopify/polaris';
import { useEffect, useState } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  status: string;
  image?: string;
  price?: string;
}

interface ProductPickerProps {
  selectedProducts: Product[];
  onProductsChange: (products: Product[]) => void;
}

export default function ProductPicker({ selectedProducts, onProductsChange }: ProductPickerProps) {

  useEffect(() => {
    // Listen for messages from modal
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PRODUCT_SELECTION') {
        console.log('Received product selection:', event.data.selection);
        onProductsChange(event.data.selection);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProductsChange]);

  const handleOpenPicker = () => {
    console.log('Opening product picker in new window...');
    const popup = window.open('/product-picker-modal', 'productPickerModal', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (popup) {
      // Focus the popup window
      popup.focus();
    }
  };

  const removeProduct = (productId: string) => {
    onProductsChange(selectedProducts.filter(p => p.id !== productId));
  };

  return (
    <Box>
      <Text variant='headingSm' as='h4'>Product Selection</Text>
      <Box paddingBlockStart='200'>
        
        {/* Selected Products Preview */}
        {selectedProducts.length > 0 && (
          <Box paddingBlockEnd='300'>
            <Text variant='headingXs' as='h5' marginBlockEnd='200'>
              Selected products ({selectedProducts.length})
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedProducts.map((product) => (
                <Card key={product.id}>
                  <Box padding='300'>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {product.image ? (
                        <Thumbnail
                          source={product.image}
                          alt={product.title}
                          size="small"
                        />
                      ) : (
                        <div style={{
                          width: '40px',
                          height: '40px',
                          backgroundColor: '#f6f6f7',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}>
                          📦
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <Text variant='bodyMd' fontWeight="semibold" as='h6'>
                          {product.title}
                        </Text>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <Text variant='bodySm' tone='subdued'>
                            by {product.vendor}
                          </Text>
                          {product.price && (
                            <Badge tone='info'>
                              ${product.price}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        size='micro' 
                        variant='tertiary' 
                        onClick={() => removeProduct(product.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </Box>
                </Card>
              ))}
            </div>
          </Box>
        )}

        {/* Product Picker Button */}
        <div style={{
          border: '2px dashed #e1e3e5',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#fafbfb'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '32px', opacity: 0.4 }}>📦</div>
            <Text as='p' variant='bodyMd' tone='subdued'>
              {selectedProducts.length > 0 
                ? 'Add more products to your selection' 
                : 'Select products to connect to your quiz'}
            </Text>
            <Button onClick={handleOpenPicker}>
              {selectedProducts.length > 0 ? 'Add More Products' : 'Select from Products'}
            </Button>
          </div>
        </div>
      </Box>
    </Box>
  );
}