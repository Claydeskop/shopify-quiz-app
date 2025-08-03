'use client';

import { Text, TextField, RangeSlider, Select, BlockStack, Card } from '@shopify/polaris';
import { StyleSettings, StyleChangeHandler } from '../../../types';

interface NavigationButtonsProps {
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
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Border Kalınlık: {styles.navButtonBorderWidth}px</Text>
            <RangeSlider
              value={styles.navButtonBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('navButtonBorderWidth', value)}
            />
          </div>
          
          <ColorInput 
            label="Border Rengi" 
            value={styles.navButtonBorderColor} 
            onChange={(value) => onStyleChange('navButtonBorderColor', value)} 
          />
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Border Tipi</Text>
            <Select
              options={borderTypeOptions}
              value={styles.navButtonBorderType}
              onChange={(value) => onStyleChange('navButtonBorderType', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Border Radius: {styles.navButtonBorderRadius}px</Text>
            <RangeSlider
              value={styles.navButtonBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('navButtonBorderRadius', value)}
            />
          </div>
        </BlockStack>
      </Card>

      {/* Metin Ayarları */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📝 Metin Ayarları</Text>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Metin Boyutu: {styles.navButtonTextSize}px</Text>
            <RangeSlider
              value={styles.navButtonTextSize}
              min={12}
              max={24}
              onChange={(value) => onStyleChange('navButtonTextSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Metin Tipi</Text>
            <Select
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