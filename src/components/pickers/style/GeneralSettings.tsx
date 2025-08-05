'use client';

import { BlockStack, Box, Checkbox, Select, Text } from '@shopify/polaris';
import { StyleChangeHandler, StyleSettings } from '../../../types';

interface GeneralSettingsProps {
  styles: StyleSettings;
  onStyleChange: StyleChangeHandler;
}

export default function GeneralSettings({ styles, onStyleChange }: GeneralSettingsProps) {
  const fontOptions = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { label: 'Courier New', value: 'Courier New, monospace' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Open Sans', value: 'Open Sans, sans-serif' },
    { label: 'Lato', value: 'Lato, sans-serif' },
    { label: 'Montserrat', value: 'Montserrat, sans-serif' },
    { label: 'Poppins', value: 'Poppins, sans-serif' }
  ];

  return (
    <BlockStack gap="400">
      <div>
        <Box paddingBlockEnd='200'>
          <Text variant='bodyMd' as='p'>Font Ailesi</Text>
        </Box>
        <Select
          label="Font Ailesi"
          options={fontOptions}
          value={styles.fontFamily}
          onChange={(value) => onStyleChange('fontFamily', value)}
        />
        <Box paddingBlockStart='100'>
          <Text as='p' variant='bodySm' tone='subdued'>
            Tüm quiz metinleri için kullanılacak font ailesi
          </Text>
        </Box>
      </div>

      <div>
        <Checkbox
          label="Animasyonları Etkinleştir"
          checked={styles.animations}
          onChange={(checked) => onStyleChange('animations', checked)}
        />
        <Box paddingBlockStart='100'>
          <Text as='p' variant='bodySm' tone='subdued'>
            Şık geçişleri, hover efektleri ve genel animasyonlar
          </Text>
        </Box>
      </div>
    </BlockStack>
  );
}