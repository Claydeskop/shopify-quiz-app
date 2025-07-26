'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Text,
  Thumbnail
} from '@shopify/polaris';
import { useEffect, useState } from 'react';

interface MediaPickerProps {
  selectedMedia: string | null;
  onMediaSelect: (mediaUrl: string) => void;
  onMediaRemove: () => void;
}

export default function MediaPicker({ selectedMedia, onMediaSelect, onMediaRemove }: MediaPickerProps) {

  useEffect(() => {
    // Listen for messages from modal
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MEDIA_SELECTION') {
        console.log('Received media selection:', event.data.selection);
        onMediaSelect(event.data.selection.url);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMediaSelect]);

  const handleOpenPicker = () => {
    console.log('Opening media picker in new window...');
    const popup = window.open('/media-picker-modal', 'mediaPickerModal', 'width=800,height=600,scrollbars=yes,resizable=yes');
    
    if (popup) {
      // Focus the popup window
      popup.focus();
    }
  };
  return (
    <Box>
      <Text variant='headingSm' as='h4'>Quiz Image</Text>
      <Box paddingBlockStart='200'>
        
        {/* Media Preview Area */}
        <div style={{
          border: '2px dashed #e1e3e5',
          borderRadius: '8px',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#fafbfb'
        }}>
          
          {selectedMedia ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <Thumbnail
                source={selectedMedia}
                alt="Selected quiz image"
                size="large"
              />
              <ButtonGroup>
                <Button size='slim' onClick={handleOpenPicker}>
                  Change Image
                </Button>
                <Button size='slim' variant='tertiary' onClick={onMediaRemove}>
                  Remove
                </Button>
              </ButtonGroup>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontSize: '32px', opacity: 0.4 }}>📸</div>
              <Text as='p' variant='bodyMd' tone='subdued'>
                Add an image to your quiz
              </Text>
              <Button onClick={handleOpenPicker}>
                Select from Shopify Media
              </Button>
            </div>
          )}
          
        </div>
      </Box>

    </Box>
  );
}