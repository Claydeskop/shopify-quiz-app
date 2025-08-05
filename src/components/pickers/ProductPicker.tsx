'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Text,
  Thumbnail,
  Card,
  Badge
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Listen for messages from modal
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PRODUCT_SELECTION') {
        console.log('Received product selection:', event.data.selection);
        onProductsChange(event.data.selection);
        setIsModalOpen(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onProductsChange]);

  const handleOpenPicker = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const removeProduct = (productId: string) => {
    onProductsChange((selectedProducts || []).filter(p => p.id !== productId));
  };

  const removeAllProducts = () => {
    onProductsChange([]);
  };

  return (
    <Box>
      {/* Selected Products Preview */}
      {(selectedProducts || []).length > 0 ? (
        <Box paddingBlockEnd='300'>
          <Box paddingBlockEnd='200'>
            <Text variant='headingXs' as='h5'>
              Seçili ürünler ({(selectedProducts || []).length})
            </Text>
          </Box>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            {(selectedProducts || []).slice(0, 3).map((product) => (
              <div key={product.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px', backgroundColor: '#f6f6f7', borderRadius: '6px' }}>
                {product.image ? (
                  <Thumbnail
                    source={product.image}
                    alt={product.title}
                    size="small"
                  />
                ) : (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px'
                  }}>
                    📦
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <Text variant='bodySm' fontWeight="semibold" as='h6'>
                    {product.title}
                  </Text>
                  <Text variant='bodyXs' tone='subdued' as='p'>
                    {product.vendor}
                  </Text>
                </div>
                <Button 
                  size='micro' 
                  variant='tertiary' 
                  onClick={() => removeProduct(product.id)}
                >
                  ×
                </Button>
              </div>
            ))}
            {(selectedProducts || []).length > 3 && (
              <Text variant='bodyXs' tone='subdued' as='p'>
                +{(selectedProducts || []).length - 3} more products
              </Text>
            )}
          </div>
          <ButtonGroup>
            <Button size='slim' onClick={handleOpenPicker}>
              Ürün Değiştir
            </Button>
            <Button size='slim' variant='tertiary' onClick={removeAllProducts}>
              Tümünü Kaldır
            </Button>
          </ButtonGroup>
        </Box>
      ) : (
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
              Ürün seçin
            </Text>
            <Button onClick={handleOpenPicker}>
              Ürünlerden Seç
            </Button>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {isMounted && isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90%',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <iframe
              src="/product-picker-modal"
              style={{
                width: '100%',
                height: '600px',
                border: 'none'
              }}
              title="Product Picker"
            />
            <div style={{ padding: '16px', borderTop: '1px solid #e1e3e5' }}>
              <Button onClick={handleModalClose}>
                Kapat
              </Button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}