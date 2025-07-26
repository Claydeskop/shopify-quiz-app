'use client';

import { Card, Text } from '@shopify/polaris';

export default function QuizPreview() {
  return (
    <Card>
      <div style={{ 
        padding: '16px', 
        height: '100%',
        minHeight: '93vh',
        overflowY: 'auto'  // Scrollable if content exceeds
      }}>
        <Text variant='headingMd' as='h3'>Preview</Text>
        <div style={{ marginTop: '12px' }}>
          <Text as='p'>This is the quiz preview panel where the quiz will be displayed as customers will see it.</Text>
        </div>
      </div>
    </Card>
  );
}