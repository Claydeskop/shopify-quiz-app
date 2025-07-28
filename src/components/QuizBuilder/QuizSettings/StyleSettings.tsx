'use client';

import { Text, Select, ColorPicker, TextField, Divider } from '@shopify/polaris';
import { useState } from 'react';

export default function StyleSettings() {
  const [frameStyle, setFrameStyle] = useState<string>('rounded');
  const [textColor, setTextColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [transitionAnimation, setTransitionAnimation] = useState<string>('slide');

  const frameOptions = [
    { label: 'Rounded', value: 'rounded' },
    { label: 'Square', value: 'square' },
    { label: 'Circle', value: 'circle' },
    { label: 'Bordered', value: 'bordered' }
  ];

  const animationOptions = [
    { label: 'Slide', value: 'slide' },
    { label: 'Fade', value: 'fade' },
    { label: 'Scale', value: 'scale' },
    { label: 'None', value: 'none' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Text variant='headingSm' as='h4'>Quiz Style Settings</Text>
      
      <Select
        label="Çerçeve"
        options={frameOptions}
        value={frameStyle}
        onChange={setFrameStyle}
      />

      <Divider />

      <Text variant='headingXs' as='h5'>Metin Rengi</Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <TextField
          value={textColor}
          onChange={setTextColor}
          placeholder="#000000"
          autoComplete="off"
        />
        <div 
          style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: textColor, 
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <Divider />

      <Text variant='headingXs' as='h5'>Arka Plan Rengi</Text>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <TextField
          value={backgroundColor}
          onChange={setBackgroundColor}
          placeholder="#ffffff"
          autoComplete="off"
        />
        <div 
          style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: backgroundColor, 
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
        />
      </div>

      <Divider />

      <Select
        label="Soru Geçiş Animasyonu"
        options={animationOptions}
        value={transitionAnimation}
        onChange={setTransitionAnimation}
      />
    </div>
  );
}