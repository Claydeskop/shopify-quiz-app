'use client';

import { BlockStack, Box, Card, Text, TextField } from '@shopify/polaris';
import { StyleChangeHandler, StyleSettings } from '../../../types';

interface ResultScreenProps {
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

export default function ResultScreen({ styles, onStyleChange }: ResultScreenProps) {
  return (
    <BlockStack gap="600">
      {/* Sonuç Ekranı Renkleri */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>🎨 Sonuç Ekranı Renkleri</Text>
          
          <ColorInput 
            label="Arka Plan Rengi" 
            value={styles.resultBackgroundColor} 
            onChange={(value) => onStyleChange('resultBackgroundColor', value)} 
          />
          
          <ColorInput 
            label="Metin Rengi" 
            value={styles.resultTextColor} 
            onChange={(value) => onStyleChange('resultTextColor', value)} 
          />
          
          <ColorInput 
            label="Buton Rengi" 
            value={styles.resultButtonColor} 
            onChange={(value) => onStyleChange('resultButtonColor', value)} 
          />
          
          <ColorInput 
            label="Buton Metin Rengi" 
            value={styles.resultButtonTextColor} 
            onChange={(value) => onStyleChange('resultButtonTextColor', value)} 
          />
        </BlockStack>
      </Card>

      {/* Bilgilendirme */}
      <Card>
        <BlockStack gap="200">
          <Text as='p' variant='bodySm' tone='subdued'>
            💡 <strong>Not:</strong> Sonuç ekranı ayarları quiz tamamlandığında gösterilen sonuç sayfasını etkiler.
          </Text>
          <Text as='p' variant='bodySm' tone='subdued'>
            Bu alanda kullanıcıya quiz sonuçları, önerilen ürünler ve tekrar quiz alma seçenekleri gösterilir.
          </Text>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}