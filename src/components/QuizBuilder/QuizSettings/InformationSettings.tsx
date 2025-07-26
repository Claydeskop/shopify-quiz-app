'use client';

import { Box, Text, Divider } from '@shopify/polaris';
import { useState } from 'react';
import MediaPicker from '../MediaPicker';

export default function InformationSettings() {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const handleMediaSelect = (mediaUrl: string) => {
    setSelectedMedia(mediaUrl);
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant='headingSm' as='h4'>Quiz Information Settings</Text>
      <MediaPicker
        selectedMedia={selectedMedia}
        onMediaSelect={handleMediaSelect}
        onMediaRemove={handleRemoveMedia}
      />
      <Text as='p' tone='subdued'>
        Quiz Information içerikleri burada gösterilecek
      </Text>
    </div>
  );
}