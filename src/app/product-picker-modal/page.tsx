'use client';

import {
  Box,
  Button,
  Text,
  Thumbnail,
  Spinner,
  Banner,
  Card,
  AppProvider,
  Badge,
  TextField
} from '@shopify/polaris';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  handle: string;
  vendor: string;
  status: string;
  image?: string;
  price?: string;
}

export default function ProductPickerModal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = async () => {
    console.log('Fetching products...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/products?limit=50');
      console.log('Products API response status:', response.status);
      
      const data = await response.json();
      console.log('Products API response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
      console.log('Products loaded:', data.products?.length || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('ProductPickerModal mounted');
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.handle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleSelectProduct = (product: Product) => {
    if (selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedProducts.length > 0) {
      // Send selection data to opener window
      if (window.opener) {
        window.opener.postMessage({
          type: 'PRODUCT_SELECTION',
          selection: selectedProducts
        }, '*');
        window.close();
      }
    }
  };

  const handleCancel = () => {
    // Close the modal window
    if (window.opener) {
      window.opener.postMessage({
        type: 'PRODUCT_CANCEL'
      }, '*');
    }
    window.close();
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spinner size="large" />
        <Box paddingBlockStart="200">
          <Text as="p" variant="bodyMd" tone="subdued">
            Loading products...
          </Text>
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Banner tone="critical" title="Error loading products">
          <p>{error}</p>
        </Banner>
      </div>
    );
  }

  return (
    <AppProvider i18n={{}}>
      <div style={{ padding: '20px', height: '100vh', overflow: 'hidden' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%' 
        }}>
          
          {/* Header */}
          <Box paddingBlockEnd="400">
            <Text variant="headingMd" as="h2">
              Select Products from Shopify
            </Text>
            <Box paddingBlockStart="200">
              <TextField
                label=""
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search products..."
                prefix="🔍"
                clearButton
                onClearButtonClick={() => setSearchTerm('')}
                autoComplete="off"
              />
            </Box>
          </Box>

          {/* Products Grid */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            marginBottom: '20px'
          }}>
            {filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text as="p" variant="bodyMd" tone="subdued">
                  {searchTerm ? `No products found matching "${searchTerm}"` : 'No products found in your Shopify store.'}
                </Text>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {filteredProducts.map((product) => {
                  const isSelected = selectedProducts.find(p => p.id === product.id);
                  return (
                    <Card key={product.id}>
                      <div
                        onClick={() => handleSelectProduct(product)}
                        style={{
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #007ace' : '2px solid transparent',
                          borderRadius: '8px',
                          padding: '12px',
                          backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          {product.image ? (
                            <Thumbnail
                              source={product.image}
                              alt={product.title}
                              size="medium"
                            />
                          ) : (
                            <div style={{
                              width: '60px',
                              height: '60px',
                              backgroundColor: '#f6f6f7',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px'
                            }}>
                              📦
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text variant="bodyMd" fontWeight="semibold" as="h6" truncate>
                              {product.title}
                            </Text>
                            <Box paddingBlockStart="100">
                              <Text variant="bodySm" tone="subdued" as="p">
                                by {product.vendor}
                              </Text>
                            </Box>
                            <Box paddingBlockStart="100">
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Badge tone={product.status === 'ACTIVE' ? 'success' : 'warning'}>
                                  {product.status}
                                </Badge>
                                {product.price && (
                                  <Badge tone="info">
                                    ${product.price}
                                  </Badge>
                                )}
                              </div>
                            </Box>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{
            borderTop: '1px solid #e1e3e5',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text variant="bodyMd" tone="subdued">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </Text>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleConfirmSelection}
                disabled={selectedProducts.length === 0}
              >
                Select Products ({selectedProducts.length})
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppProvider>
  );
}