'use client';

import {
  Box,
  Button,
  Text,
  Thumbnail,
  Spinner,
  Banner,
  Card,
  AppProvider
} from '@shopify/polaris';
import { useState, useEffect } from 'react';

interface MediaFile {
  id: string;
  alt: string;
  url: string;
  width: number;
  height: number;
}

export default function MediaPickerModal() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const fetchMediaFiles = async () => {
    console.log('Fetching media files...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/media?limit=20');
      console.log('Media API response status:', response.status);
      
      const data = await response.json();
      console.log('Media API response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch media files');
      }
      
      setMediaFiles(data.files || []);
      console.log('Media files loaded:', data.files?.length || 0);
    } catch (err) {
      console.error('Error fetching media files:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('MediaPickerModal mounted');
    fetchMediaFiles();
  }, []);

  const handleSelectFile = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const handleConfirmSelection = () => {
    if (selectedFile) {
      // Send selection data to opener window
      if (window.opener) {
        window.opener.postMessage({
          type: 'MEDIA_SELECTION',
          selection: {
            id: selectedFile.id,
            url: selectedFile.url,
            alt: selectedFile.alt
          }
        }, '*');
        window.close();
      }
    }
  };

  const handleCancel = () => {
    // Close the modal window
    if (window.opener) {
      window.opener.postMessage({
        type: 'MEDIA_CANCEL'
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
            Loading media files...
          </Text>
        </Box>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Banner tone="critical" title="Error loading media files">
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
              Select Media from Shopify
            </Text>
          </Box>

          {/* Media Grid */}
          <div style={{ 
            flex: 1, 
            overflowY: 'auto',
            marginBottom: '20px'
          }}>
            {mediaFiles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text as="p" variant="bodyMd" tone="subdued">
                  No media files found in your Shopify store.
                </Text>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px'
              }}>
                {mediaFiles.map((file) => (
                  <Card key={file.id}>
                    <div
                      onClick={() => handleSelectFile(file)}
                      style={{
                        cursor: 'pointer',
                        border: selectedFile?.id === file.id ? '2px solid #007ace' : '2px solid transparent',
                        borderRadius: '8px',
                        padding: '8px',
                        backgroundColor: selectedFile?.id === file.id ? '#f0f8ff' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Thumbnail
                        source={file.url}
                        alt={file.alt || 'Media file'}
                        size="large"
                      />
                      {file.alt && (
                        <Box paddingBlockStart="200">
                          <Text as="p" variant="bodyXs" tone="subdued" truncate>
                            {file.alt}
                          </Text>
                        </Box>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{
            borderTop: '1px solid #e1e3e5',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmSelection}
              disabled={!selectedFile}
            >
              Select Image
            </Button>
          </div>
        </div>
      </div>
    </AppProvider>
  );
}