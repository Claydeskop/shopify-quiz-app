'use client';

import { BlockStack, Box, Card, RangeSlider, Select, Text, TextField } from '@shopify/polaris';
import { StyleChangeHandler, StyleSettings } from '../../../types';

interface NavigationButtonsProps {
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
        label="Color"
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

export default function NavigationButtons({ styles, onStyleChange }: NavigationButtonsProps) {
  const borderTypeOptions = [
    { label: 'Düz (Solid)', value: 'solid' },
    { label: 'Noktalı (Dotted)', value: 'dotted' },
    { label: 'Kesik (Dashed)', value: 'dashed' },
    { label: 'Çift (Double)', value: 'double' },
    { label: 'Oluklu (Groove)', value: 'groove' },
    { label: 'Çıkıntılı (Ridge)', value: 'ridge' }
  ];

  const textTypeOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Kalın (Bold)', value: 'bold' },
    { label: 'İtalik', value: 'italic' },
    { label: 'Kalın İtalik', value: 'bold italic' }
  ];

  return (
    <BlockStack gap="600">
      {/* Border ve Genel Ayarlar */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📐 Border Ayarları</Text>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Border Kalınlık: {styles.navButtonBorderWidth}px</Text>
            </Box>
            <RangeSlider
              value={styles.navButtonBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('navButtonBorderWidth', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <ColorInput 
            label="Border Rengi" 
            value={styles.navButtonBorderColor} 
            onChange={(value) => onStyleChange('navButtonBorderColor', value)} 
          />
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Border Tipi</Text>
            </Box>
            <Select
              label="Border Tipi"
              options={borderTypeOptions}
              value={styles.navButtonBorderType}
              onChange={(value) => onStyleChange('navButtonBorderType', value)}
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Border Radius: {styles.navButtonBorderRadius}px</Text>
            </Box>
            <RangeSlider
              value={styles.navButtonBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('navButtonBorderRadius', Array.isArray(value) ? value[0] : value)}
              label="Slider"
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
              <Text variant='bodyMd' as='p'>Metin Boyutu: {styles.navButtonTextSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.navButtonTextSize}
              min={12}
              max={24}
              onChange={(value) => onStyleChange('navButtonTextSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Metin Tipi</Text>
            </Box>
            <Select
              label="Metin Tipi"
              options={textTypeOptions}
              value={styles.navButtonTextType}
              onChange={(value) => onStyleChange('navButtonTextType', value)}
            />
          </div>
        </BlockStack>
      </Card>

      {/* Özel Buton Renkleri */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>🎨 Buton Renkleri</Text>
          
          <ColorInput 
            label="Geri Butonu Rengi" 
            value={styles.navPrevButtonColor} 
            onChange={(value) => onStyleChange('navPrevButtonColor', value)} 
          />
          
          <ColorInput 
            label="Geri Butonu Metin Rengi" 
            value={styles.navPrevButtonTextColor} 
            onChange={(value) => onStyleChange('navPrevButtonTextColor', value)} 
          />
          
          <ColorInput 
            label="Tamam İkonu Rengi" 
            value={styles.navOkIconColor} 
            onChange={(value) => onStyleChange('navOkIconColor', value)} 
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}