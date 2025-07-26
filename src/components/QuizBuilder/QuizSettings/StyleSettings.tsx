'use client';

import { Text } from '@shopify/polaris';

export default function StyleSettings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant='headingSm' as='h4'>Quiz Style Settings</Text>
      <Text as='p' tone='subdued'>
        Quiz Style içerikleri burada gösterilecek
      </Text>
    </div>
  );
}