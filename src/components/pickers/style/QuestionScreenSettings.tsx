'use client';

import { BlockStack, Box, Card, Divider, RangeSlider, Select, Text, TextField } from '@shopify/polaris';
import { StyleChangeHandler, StyleSettings } from '../../../types';

interface QuestionScreenSettingsProps {
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

export default function QuestionScreenSettings({ styles, onStyleChange }: QuestionScreenSettingsProps) {
  const borderTypeOptions = [
    { label: 'Düz (Solid)', value: 'solid' },
    { label: 'Noktalı (Dotted)', value: 'dotted' },
    { label: 'Kesik (Dashed)', value: 'dashed' },
    { label: 'Çift (Double)', value: 'double' },
    { label: 'Oluklu (Groove)', value: 'groove' },
    { label: 'Çıkıntılı (Ridge)', value: 'ridge' }
  ];

  return (
    <BlockStack gap="600">
      {/* Renkler Bölümü */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>🎨 Renkler</Text>
          
          <ColorInput 
            label="Arka Plan Rengi" 
            value={styles.questionBackgroundColor} 
            onChange={(value) => onStyleChange('questionBackgroundColor', value)} 
          />
          
          <ColorInput 
            label="Şık Arka Plan Rengi" 
            value={styles.questionOptionBackgroundColor} 
            onChange={(value) => onStyleChange('questionOptionBackgroundColor', value)} 
          />
          
          <ColorInput 
            label="Şık Border Rengi" 
            value={styles.questionOptionBorderColor} 
            onChange={(value) => onStyleChange('questionOptionBorderColor', value)} 
          />
          
          <ColorInput 
            label="Soru Metni Rengi" 
            value={styles.questionTextColor} 
            onChange={(value) => onStyleChange('questionTextColor', value)} 
          />
          
          <ColorInput 
            label="Şık Metni Rengi" 
            value={styles.questionOptionTextColor} 
            onChange={(value) => onStyleChange('questionOptionTextColor', value)} 
          />
          
          <ColorInput 
            label="Görsel Border Rengi" 
            value={styles.questionImageBorderColor} 
            onChange={(value) => onStyleChange('questionImageBorderColor', value)} 
          />

          <Divider />
          
          <ColorInput 
            label="Seçili Şık Arka Plan Rengi" 
            value={styles.questionSelectedOptionBackgroundColor} 
            onChange={(value) => onStyleChange('questionSelectedOptionBackgroundColor', value)} 
          />
          
          <ColorInput 
            label="Seçili Şık Metni Rengi" 
            value={styles.questionSelectedOptionTextColor} 
            onChange={(value) => onStyleChange('questionSelectedOptionTextColor', value)} 
          />
          
          <ColorInput 
            label="Seçili Şık Border Rengi" 
            value={styles.questionSelectedOptionBorderColor} 
            onChange={(value) => onStyleChange('questionSelectedOptionBorderColor', value)} 
          />
        </BlockStack>
      </Card>

      {/* Borderlar Bölümü */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📐 Borderlar</Text>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Şık Border Kalınlık: {styles.questionOptionBorderWidth}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionOptionBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('questionOptionBorderWidth', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Şık Border Radius: {styles.questionOptionBorderRadius}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionOptionBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('questionOptionBorderRadius', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Şık Border Tipi</Text>
            </Box>
            <Select
              label="Şık Border Tipi"
              options={borderTypeOptions}
              value={styles.questionOptionBorderType}
              onChange={(value) => onStyleChange('questionOptionBorderType', value)}
            />
          </div>

          <Divider />
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Görsel Border Kalınlık: {styles.questionImageBorderWidth}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionImageBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('questionImageBorderWidth', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Görsel Border Radius: {styles.questionImageBorderRadius}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionImageBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('questionImageBorderRadius', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Görsel Border Tipi</Text>
            </Box>
            <Select
              label="Görsel Border Tipi"
              options={borderTypeOptions}
              value={styles.questionImageBorderType}
              onChange={(value) => onStyleChange('questionImageBorderType', value)}
            />
          </div>
        </BlockStack>
      </Card>

      {/* Text ve Boyutlar Bölümü */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📝 Text ve Boyutlar</Text>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Soru Text Boyutu: {styles.questionTextSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionTextSize}
              min={14}
              max={48}
              onChange={(value) => onStyleChange('questionTextSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Görsel Yüksekliği: {styles.questionImageHeight}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionImageHeight}
              min={100}
              max={500}
              onChange={(value) => onStyleChange('questionImageHeight', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Şık Metin Boyutu: {styles.questionOptionTextSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionOptionTextSize}
              min={12}
              max={32}
              onChange={(value) => onStyleChange('questionOptionTextSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Şık Görsel Boyutu: {styles.questionOptionImageSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.questionOptionImageSize}
              min={50}
              max={200}
              onChange={(value) => onStyleChange('questionOptionImageSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}