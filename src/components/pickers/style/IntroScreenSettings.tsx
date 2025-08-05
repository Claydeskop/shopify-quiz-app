'use client';

import { BlockStack, Box, Card, Divider, RangeSlider, Select, Text, TextField } from '@shopify/polaris';
import { StyleChangeHandler, StyleSettings } from '../../../types';

interface IntroScreenSettingsProps {
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

export default function IntroScreenSettings({ styles, onStyleChange }: IntroScreenSettingsProps) {
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
            value={styles.introBackgroundColor} 
            onChange={(value) => onStyleChange('introBackgroundColor', value)} 
          />
          
          <ColorInput 
            label="Başlat Butonu Rengi" 
            value={styles.introStartButtonColor} 
            onChange={(value) => onStyleChange('introStartButtonColor', value)} 
          />
          
          <ColorInput 
            label="Başlat Butonu Metin Rengi" 
            value={styles.introStartButtonTextColor} 
            onChange={(value) => onStyleChange('introStartButtonTextColor', value)} 
          />
          
          <ColorInput 
            label="Soru ve Açıklama Metni Rengi" 
            value={styles.introQuestionTextColor} 
            onChange={(value) => onStyleChange('introQuestionTextColor', value)} 
          />
          
          <ColorInput 
            label="Açıklama Metni Rengi" 
            value={styles.introDescriptionTextColor} 
            onChange={(value) => onStyleChange('introDescriptionTextColor', value)} 
          />
          
          <ColorInput 
            label="Başlat Butonu Border Rengi" 
            value={styles.introStartButtonBorderColor} 
            onChange={(value) => onStyleChange('introStartButtonBorderColor', value)} 
          />
          
          <ColorInput 
            label="Görsel Border Rengi" 
            value={styles.introImageBorderColor} 
            onChange={(value) => onStyleChange('introImageBorderColor', value)} 
          />
        </BlockStack>
      </Card>

      {/* Borderlar Bölümü */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📐 Borderlar</Text>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Buton Border Kalınlığı: {styles.introButtonBorderWidth}px</Text>
            </Box>
            <RangeSlider
              value={styles.introButtonBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('introButtonBorderWidth', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Buton Border Radius: {styles.introButtonBorderRadius}px</Text>
            </Box>
            <RangeSlider
              value={styles.introButtonBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('introButtonBorderRadius', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Buton Border Tipi</Text>
            </Box>
            <Select
              label="Buton Border Tipi"
              options={borderTypeOptions}
              value={styles.introButtonBorderType}
              onChange={(value) => onStyleChange('introButtonBorderType', value)}
            />
          </div>

          <Divider />
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Görsel Border Kalınlık: {styles.introImageBorderWidth}px</Text>
            </Box>
            <RangeSlider
              value={styles.introImageBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('introImageBorderWidth', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Görsel Border Radius: {styles.introImageBorderRadius}px</Text>
            </Box>
            <RangeSlider
              value={styles.introImageBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('introImageBorderRadius', Array.isArray(value) ? value[0] : value)}
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
              value={styles.introImageBorderType}
              onChange={(value) => onStyleChange('introImageBorderType', value)}
            />
          </div>
        </BlockStack>
      </Card>

      {/* Text Ayarları Bölümü */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h6'>📝 Text Ayarları</Text>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Başlık Boyutu: {styles.introTitleSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.introTitleSize}
              min={16}
              max={64}
              onChange={(value) => onStyleChange('introTitleSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Açıklama Boyutu: {styles.introDescriptionSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.introDescriptionSize}
              min={12}
              max={32}
              onChange={(value) => onStyleChange('introDescriptionSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Buton Metin Boyutu: {styles.introButtonTextSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.introButtonTextSize}
              min={12}
              max={28}
              onChange={(value) => onStyleChange('introButtonTextSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>İkon Boyutu: {styles.introIconSize}px</Text>
            </Box>
            <RangeSlider
              value={styles.introIconSize}
              min={16}
              max={48}
              onChange={(value) => onStyleChange('introIconSize', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
          
          <div>
            <Box paddingBlockEnd='200'>
              <Text variant='bodyMd' as='p'>Görsel Yüksekliği: {styles.introImageHeight}px</Text>
            </Box>
            <RangeSlider
              value={styles.introImageHeight}
              min={100}
              max={500}
              onChange={(value) => onStyleChange('introImageHeight', Array.isArray(value) ? value[0] : value)}
              label="Slider"
            />
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}