'use client';

import { Text, TextField, RangeSlider, Select, BlockStack, Card, Divider } from '@shopify/polaris';

interface StyleSettings {
  // Soru Ekranı - Renkler
  questionBackgroundColor: string;
  questionOptionBackgroundColor: string;
  questionOptionBorderColor: string;
  questionTextColor: string;
  questionOptionTextColor: string;
  questionImageBorderColor: string;
  questionSelectedOptionBackgroundColor: string;
  questionSelectedOptionTextColor: string;
  questionSelectedOptionBorderColor: string;

  // Soru Ekranı - Borderlar
  questionOptionBorderWidth: number;
  questionOptionBorderRadius: number;
  questionOptionBorderType: string;
  questionImageBorderWidth: number;
  questionImageBorderRadius: number;
  questionImageBorderType: string;

  // Soru Ekranı - Text & Sizes
  questionTextSize: number;
  questionImageHeight: number;
  questionOptionTextSize: number;
  questionOptionImageSize: number;
  [key: string]: any;
}

interface QuestionScreenSettingsProps {
  styles: StyleSettings;
  onStyleChange: (key: string, value: any) => void;
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
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Şık Border Kalınlık: {styles.questionOptionBorderWidth}px</Text>
            <RangeSlider
              value={styles.questionOptionBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('questionOptionBorderWidth', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Şık Border Radius: {styles.questionOptionBorderRadius}px</Text>
            <RangeSlider
              value={styles.questionOptionBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('questionOptionBorderRadius', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Şık Border Tipi</Text>
            <Select
              options={borderTypeOptions}
              value={styles.questionOptionBorderType}
              onChange={(value) => onStyleChange('questionOptionBorderType', value)}
            />
          </div>

          <Divider />
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Border Kalınlık: {styles.questionImageBorderWidth}px</Text>
            <RangeSlider
              value={styles.questionImageBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('questionImageBorderWidth', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Border Radius: {styles.questionImageBorderRadius}px</Text>
            <RangeSlider
              value={styles.questionImageBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('questionImageBorderRadius', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Border Tipi</Text>
            <Select
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
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Soru Text Boyutu: {styles.questionTextSize}px</Text>
            <RangeSlider
              value={styles.questionTextSize}
              min={14}
              max={48}
              onChange={(value) => onStyleChange('questionTextSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Yüksekliği: {styles.questionImageHeight}px</Text>
            <RangeSlider
              value={styles.questionImageHeight}
              min={100}
              max={500}
              onChange={(value) => onStyleChange('questionImageHeight', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Şık Metin Boyutu: {styles.questionOptionTextSize}px</Text>
            <RangeSlider
              value={styles.questionOptionTextSize}
              min={12}
              max={32}
              onChange={(value) => onStyleChange('questionOptionTextSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Şık Görsel Boyutu: {styles.questionOptionImageSize}px</Text>
            <RangeSlider
              value={styles.questionOptionImageSize}
              min={50}
              max={200}
              onChange={(value) => onStyleChange('questionOptionImageSize', value)}
            />
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}