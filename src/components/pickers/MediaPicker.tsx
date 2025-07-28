'use client';

import {
  Box,
  Button,
  ButtonGroup,
  Text,
  Thumbnail
} from '@shopify/polaris';
import { useState } from 'react';
import MediaPickerModal from './MediaPickerModal';

interface MediaPickerProps {
  selectedMedia: string | null;
  onMediaSelect: (mediaUrl: string) => void;
  onMediaRemove: () => void;
}

export default function MediaPicker({ selectedMedia, onMediaSelect, onMediaRemove }: MediaPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenPicker = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleMediaSelect = (mediaUrl: string) => {
    onMediaSelect(mediaUrl);
    setIsModalOpen(false);
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

      {/* Media Picker Modal */}
      {isModalOpen && (
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
            <MediaPickerModal
              onMediaSelect={handleMediaSelect}
              onCancel={handleModalClose}
            />
          </div>
        </div>
      )}
    </Box>
  );
}