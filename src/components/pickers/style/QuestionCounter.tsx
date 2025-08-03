'use client';

import { Text, TextField, RangeSlider, Select, BlockStack, Card } from '@shopify/polaris';
import { StyleSettings, StyleChangeHandler } from '../../../types';

interface QuestionCounterProps {
  styles: StyleSettings;
  onStyleChange: StyleChangeHandler;
}

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => (
  <div style={{ marginBottom: '16px' }}>
    <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>{label}</Text>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <TextField
        value={value}
        onChange={onChange}
        placeholder="#ffffff"
        autoComplete="off"
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
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Border Kalınlık: {styles.counterBorderWidth}px</Text>
            <RangeSlider
              value={styles.counterBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('counterBorderWidth', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Border Radius: {styles.counterBorderRadius}px</Text>
            <RangeSlider
              value={styles.counterBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('counterBorderRadius', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Border Tipi</Text>
            <Select
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
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Metin Boyutu: {styles.counterTextSize}px</Text>
            <RangeSlider
              value={styles.counterTextSize}
              min={10}
              max={24}
              onChange={(value) => onStyleChange('counterTextSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Metin Stili</Text>
            <Select
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