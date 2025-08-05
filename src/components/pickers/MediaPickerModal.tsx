'use client';

import {
  Box,
  Button,
  Text,
  Thumbnail,
  Spinner,
  Banner,
  Card,
  ButtonGroup
} from '@shopify/polaris';
import { useState, useEffect } from 'react';

interface MediaFile {
  id: string;
  alt: string;
  url: string;
  width: number;
  height: number;
}

interface MediaPickerModalProps {
  onMediaSelect: (mediaUrl: string) => void;
  onCancel: () => void;
}

export default function MediaPickerModal({ onMediaSelect, onCancel }: MediaPickerModalProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const fetchMediaFiles = async () => {
    console.log('Fetching media files...');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/media?limit=50');
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
    fetchMediaFiles();
  }, []);

  const handleSelectFile = (file: MediaFile) => {
    setSelectedFile(file);
  };

  const handleConfirmSelection = () => {
    if (selectedFile) {
      console.log('Media selected:', selectedFile);
      onMediaSelect(selectedFile.url);
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spinner size="large" />
        <Box paddingBlockStart="400">
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
        <Box paddingBlockStart="400">
          <Button onClick={fetchMediaFiles}>
            Try Again
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      
      {/* Media Grid */}
      <div style={{ 
        flex: 1, 
        marginBottom: '20px'
      }}>
        {mediaFiles.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>📁</div>
            <Text as="p" variant="bodyLg" tone="subdued">
              No media files found in your Shopify store.
            </Text>
            <Box paddingBlockStart="200">
              <Text as="p" variant="bodySm" tone="subdued">
                Upload images to your Shopify admin to use them here.
              </Text>
            </Box>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '16px',
            padding: '8px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {mediaFiles.map((file) => (
              <Card key={file.id}>
                <div
                  onClick={() => handleSelectFile(file)}
                  style={{
                    cursor: 'pointer',
                    border: selectedFile?.id === file.id ? '3px solid #007ace' : '3px solid transparent',
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
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text variant="bodySm" tone="subdued" as="p">
          {selectedFile ? `Selected: ${selectedFile.alt || 'Untitled'}` : 'Select an image to continue'}
        </Text>
        
        <ButtonGroup>
          <Button onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirmSelection}
            disabled={!selectedFile}
          >
            Select Image
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}