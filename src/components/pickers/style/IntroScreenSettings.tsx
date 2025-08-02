'use client';

import { Text, TextField, RangeSlider, Select, BlockStack, Card, Divider } from '@shopify/polaris';

interface StyleSettings {
  // Giriş Ekranı - Renkler
  introBackgroundColor: string;
  introStartButtonColor: string;
  introStartButtonTextColor: string;
  introQuestionTextColor: string;
  introDescriptionTextColor: string;
  introStartButtonBorderColor: string;
  introImageBorderColor: string;

  // Giriş Ekranı - Borderlar
  introButtonBorderWidth: number;
  introButtonBorderRadius: number;
  introButtonBorderType: string;
  introImageBorderWidth: number;
  introImageBorderRadius: number;
  introImageBorderType: string;

  // Giriş Ekranı - Text
  introTitleSize: number;
  introDescriptionSize: number;
  introButtonTextSize: number;
  introIconSize: number;
  introImageHeight: number;
  [key: string]: any;
}

interface IntroScreenSettingsProps {
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
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Buton Border Kalınlığı: {styles.introButtonBorderWidth}px</Text>
            <RangeSlider
              value={styles.introButtonBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('introButtonBorderWidth', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Buton Border Radius: {styles.introButtonBorderRadius}px</Text>
            <RangeSlider
              value={styles.introButtonBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('introButtonBorderRadius', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Buton Border Tipi</Text>
            <Select
              options={borderTypeOptions}
              value={styles.introButtonBorderType}
              onChange={(value) => onStyleChange('introButtonBorderType', value)}
            />
          </div>

          <Divider />
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Border Kalınlık: {styles.introImageBorderWidth}px</Text>
            <RangeSlider
              value={styles.introImageBorderWidth}
              min={0}
              max={10}
              onChange={(value) => onStyleChange('introImageBorderWidth', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Border Radius: {styles.introImageBorderRadius}px</Text>
            <RangeSlider
              value={styles.introImageBorderRadius}
              min={0}
              max={50}
              onChange={(value) => onStyleChange('introImageBorderRadius', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Border Tipi</Text>
            <Select
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
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Başlık Boyutu: {styles.introTitleSize}px</Text>
            <RangeSlider
              value={styles.introTitleSize}
              min={16}
              max={64}
              onChange={(value) => onStyleChange('introTitleSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Açıklama Boyutu: {styles.introDescriptionSize}px</Text>
            <RangeSlider
              value={styles.introDescriptionSize}
              min={12}
              max={32}
              onChange={(value) => onStyleChange('introDescriptionSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Buton Metin Boyutu: {styles.introButtonTextSize}px</Text>
            <RangeSlider
              value={styles.introButtonTextSize}
              min={12}
              max={28}
              onChange={(value) => onStyleChange('introButtonTextSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>İkon Boyutu: {styles.introIconSize}px</Text>
            <RangeSlider
              value={styles.introIconSize}
              min={16}
              max={48}
              onChange={(value) => onStyleChange('introIconSize', value)}
            />
          </div>
          
          <div>
            <Text variant='bodyMd' as='p' style={{ marginBottom: '8px' }}>Görsel Yüksekliği: {styles.introImageHeight}px</Text>
            <RangeSlider
              value={styles.introImageHeight}
              min={100}
              max={500}
              onChange={(value) => onStyleChange('introImageHeight', value)}
            />
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}