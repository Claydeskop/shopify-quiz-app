'use client';

import { BlockStack, Box, Card, RangeSlider, Select, Text, TextField } from '@shopify/polaris';
import { StyleChangeHandler, StyleSettings } from '../../../types';

interface QuestionCounterProps {
  styles: StyleSettings;
  onStyleChange: StyleChangeHandler;
}

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => (
  <div style={{ marginBottom: '16px' }}>
    <Box paddingBlockEnd='200'>
      <Text variant='bodyMd' as='p'>{label}</Text>
    </Box>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <TextField
        value={value}
        onChange={onChange}
        placeholder="#ffffff"
        autoComplete="off"
        label="color"
      />
      <div 
        style={{ 
          width: '40px', 
          height: '40px', 
          backgroundColor: value, 
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'color';
          input.value = value;
          input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
          input.click();
        }}
      />
    </div>
  </div>
);

export default function QuestionCounter({ styles, onStyleChange }: QuestionCounterProps) {
  const borderTypeOptions = [
    { label: 'Düz (Solid)', value: 'solid' },
    { label: 'Noktalı (Dotted)', value: 'dotted' },
    { label: 'Kesik (Dashed)', value: 'dashed' },
    { label: 'Çift (Double)', value: 'double' },
    { label: 'Oluklu (Groove)', value: 'groove' },
    { label: 'Çıkıntılı (Ridge)', value: 'ridge' }
  ];

  const textStyleOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Kalın (Bold)', value: 'bold' },
    { label: 'İtalik', value: 'italic' },
    { label: 'Kalın İtalik', value: 'bold italic' },
    { label: 'Büyük Harf', value: 'uppercase' },
    { label: 'Küçük Harf', value: 'lowercase' },
    { label: 'İlk Harf Büyük', value: 'capitalize' }
  ];

  return (
    <BlockStack gap="600">
      {/* Renkler */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>🎨 Renkler</Text>
          
          <ColorInput 
            label="Arka Plan Rengi" 
            value={styles.counterBackgroundColor} 
            onChange={(value) => onStyleChange('counterBackgroundColor', value)} 
          />
          
          <ColorInput 
            label="Border Rengi" 
            value={styles.counterBorderColor} 
            onChange={(value) => onStyleChange('counterBorderColor', value)} 
          />
          
          <ColorInput 
            label="Metin Rengi" 
            value={styles.counterTextColor} 
            onChange={(value) => onStyleChange('counterTextColor', value)} 
          />
        </BlockStack>
      </Card>

      {/* Borderlar */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📐 Borderlar</Text>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Border Kalınlık: {styles.counterBorderWidth}px</Text>
            </Box>
            <RangeSlider
              value={styles.counterBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('counterBorderWidth', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Border Radius: {styles.counterBorderRadius}px</Text>
            </Box>
            <RangeSlider
              value={styles.counterBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('counterBorderRadius', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Border Tipi</Text>
            </Box>
            <Select
              label="Border Tipi"
              options={borderTypeOptions}
              value={styles.counterBorderType}
              onChange={(value) => onStyleChange('counterBorderType', value)}
            />
          </div>
        </BlockStack>
      </Card>

      {/* Metin Ayarları */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📝 Metin Ayarları</Text>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Metin Boyutu: {styles.counterTextSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.counterTextSize}
              min={10}
              max={24}
              onChange={(value) => onStyleChange('counterTextSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Metin Stili</Text>
            </Box>
            <Select
              label="Metin Stili"
              options={textStyleOptions}
              value={styles.counterTextStyle}
              onChange={(value) => onStyleChange('counterTextStyle', value)}
            />
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}