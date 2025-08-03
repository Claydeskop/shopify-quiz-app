'use client';

import { Text, Button, BlockStack, Card } from '@shopify/polaris';
import { StyleSettings } from '../../../types';

interface TemplateSelectorProps {
  onTemplateSelect: (templateStyles: Partial<StyleSettings>) => void;
}

const templates = {
  teknoloji: {
    // Genel
    fontFamily: 'Roboto, sans-serif',
    animations: true,

    // Giriş Ekranı - Renkler
    introBackgroundColor: '#1a1a2e',
    introStartButtonColor: '#16213e',
    introStartButtonTextColor: '#ffffff',
    introQuestionTextColor: '#ffffff',
    introDescriptionTextColor: '#a0a0a0',
    introStartButtonBorderColor: '#0f3460',
    introImageBorderColor: '#16213e',

    // Giriş Ekranı - Borderlar
    introButtonBorderWidth: 2,
    introButtonBorderRadius: 8,
    introButtonBorderType: 'solid',
    introImageBorderWidth: 2,
    introImageBorderRadius: 12,
    introImageBorderType: 'solid',

    // Giriş Ekranı - Text
    introTitleSize: 36,
    introDescriptionSize: 18,
    introButtonTextSize: 16,
    introIconSize: 24,
    introImageHeight: 250,

    // Soru Ekranı - Renkler
    questionBackgroundColor: '#1a1a2e',
    questionOptionBackgroundColor: '#16213e',
    questionOptionBorderColor: '#0f3460',
    questionTextColor: '#ffffff',
    questionOptionTextColor: '#ffffff',
    questionImageBorderColor: '#16213e',
    questionSelectedOptionBackgroundColor: '#e94560',
    questionSelectedOptionTextColor: '#ffffff',
    questionSelectedOptionBorderColor: '#e94560',

    // Soru Ekranı - Borderlar
    questionOptionBorderWidth: 2,
    questionOptionBorderRadius: 8,
    questionOptionBorderType: 'solid',
    questionImageBorderWidth: 0,
    questionImageBorderRadius: 12,
    questionImageBorderType: 'solid',

    // Soru Ekranı - Text & Sizes
    questionTextSize: 28,
    questionImageHeight: 200,
    questionOptionTextSize: 16,
    questionOptionImageSize: 80,

    // Geçiş Butonları
    navButtonBorderWidth: 2,
    navButtonBorderColor: '#0f3460',
    navButtonBorderType: 'solid',
    navButtonBorderRadius: 8,
    navButtonTextSize: 16,
    navButtonTextType: 'bold',
    navPrevButtonColor: '#16213e',
    navPrevButtonTextColor: '#ffffff',
    navOkIconColor: '#e94560',

    // Soru Sayacı
    counterBackgroundColor: 'rgba(233, 69, 96, 0.2)',
    counterBorderColor: '#e94560',
    counterTextColor: '#ffffff',
    counterBorderWidth: 2,
    counterBorderRadius: 20,
    counterBorderType: 'solid',
    counterTextSize: 14,
    counterTextStyle: 'bold',

    // Sonuç Ekranı
    resultBackgroundColor: '#1a1a2e',
    resultTextColor: '#ffffff',
    resultButtonColor: '#e94560',
    resultButtonTextColor: '#ffffff',

    customCSS: ''
  },

  fashion: {
    // Genel
    fontFamily: 'Poppins, sans-serif',
    animations: true,

    // Giriş Ekranı - Renkler
    introBackgroundColor: '#f8f9fa',
    introStartButtonColor: '#d63384',
    introStartButtonTextColor: '#ffffff',
    introQuestionTextColor: '#212529',
    introDescriptionTextColor: '#6c757d',
    introStartButtonBorderColor: '#d63384',
    introImageBorderColor: '#dee2e6',

    // Giriş Ekranı - Borderlar
    introButtonBorderWidth: 0,
    introButtonBorderRadius: 25,
    introButtonBorderType: 'solid',
    introImageBorderWidth: 0,
    introImageBorderRadius: 20,
    introImageBorderType: 'solid',

    // Giriş Ekranı - Text
    introTitleSize: 32,
    introDescriptionSize: 16,
    introButtonTextSize: 16,
    introIconSize: 20,
    introImageHeight: 300,

    // Soru Ekranı - Renkler
    questionBackgroundColor: '#f8f9fa',
    questionOptionBackgroundColor: '#ffffff',
    questionOptionBorderColor: '#dee2e6',
    questionTextColor: '#212529',
    questionOptionTextColor: '#495057',
    questionImageBorderColor: '#dee2e6',
    questionSelectedOptionBackgroundColor: '#d63384',
    questionSelectedOptionTextColor: '#ffffff',
    questionSelectedOptionBorderColor: '#d63384',

    // Soru Ekranı - Borderlar
    questionOptionBorderWidth: 1,
    questionOptionBorderRadius: 15,
    questionOptionBorderType: 'solid',
    questionImageBorderWidth: 0,
    questionImageBorderRadius: 15,
    questionImageBorderType: 'solid',

    // Soru Ekranı - Text & Sizes
    questionTextSize: 24,
    questionImageHeight: 200,
    questionOptionTextSize: 16,
    questionOptionImageSize: 100,

    // Geçiş Butonları
    navButtonBorderWidth: 0,
    navButtonBorderColor: '#dee2e6',
    navButtonBorderType: 'solid',
    navButtonBorderRadius: 20,
    navButtonTextSize: 14,
    navButtonTextType: 'normal',
    navPrevButtonColor: '#6c757d',
    navPrevButtonTextColor: '#ffffff',
    navOkIconColor: '#d63384',

    // Soru Sayacı
    counterBackgroundColor: 'rgba(214, 51, 132, 0.1)',
    counterBorderColor: '#d63384',
    counterTextColor: '#d63384',
    counterBorderWidth: 1,
    counterBorderRadius: 15,
    counterBorderType: 'solid',
    counterTextSize: 12,
    counterTextStyle: 'normal',

    // Sonuç Ekranı
    resultBackgroundColor: '#f8f9fa',
    resultTextColor: '#212529',
    resultButtonColor: '#d63384',
    resultButtonTextColor: '#ffffff',

    customCSS: ''
  },

  home: {
    // Genel
    fontFamily: 'Georgia, serif',
    animations: true,

    // Giriş Ekranı - Renkler
    introBackgroundColor: '#f5f5dc',
    introStartButtonColor: '#8b4513',
    introStartButtonTextColor: '#ffffff',
    introQuestionTextColor: '#2f4f4f',
    introDescriptionTextColor: '#696969',
    introStartButtonBorderColor: '#8b4513',
    introImageBorderColor: '#d2b48c',

    // Giriş Ekranı - Borderlar
    introButtonBorderWidth: 2,
    introButtonBorderRadius: 10,
    introButtonBorderType: 'solid',
    introImageBorderWidth: 3,
    introImageBorderRadius: 15,
    introImageBorderType: 'solid',

    // Giriş Ekranı - Text
    introTitleSize: 28,
    introDescriptionSize: 18,
    introButtonTextSize: 16,
    introIconSize: 22,
    introImageHeight: 280,

    // Soru Ekranı - Renkler
    questionBackgroundColor: '#f5f5dc',
    questionOptionBackgroundColor: '#ffffff',
    questionOptionBorderColor: '#d2b48c',
    questionTextColor: '#2f4f4f',
    questionOptionTextColor: '#2f4f4f',
    questionImageBorderColor: '#d2b48c',
    questionSelectedOptionBackgroundColor: '#8b4513',
    questionSelectedOptionTextColor: '#ffffff',
    questionSelectedOptionBorderColor: '#8b4513',

    // Soru Ekranı - Borderlar
    questionOptionBorderWidth: 2,
    questionOptionBorderRadius: 10,
    questionOptionBorderType: 'solid',
    questionImageBorderWidth: 2,
    questionImageBorderRadius: 10,
    questionImageBorderType: 'solid',

    // Soru Ekranı - Text & Sizes
    questionTextSize: 22,
    questionImageHeight: 220,
    questionOptionTextSize: 16,
    questionOptionImageSize: 90,

    // Geçiş Butonları
    navButtonBorderWidth: 2,
    navButtonBorderColor: '#8b4513',
    navButtonBorderType: 'solid',
    navButtonBorderRadius: 10,
    navButtonTextSize: 16,
    navButtonTextType: 'normal',
    navPrevButtonColor: '#daa520',
    navPrevButtonTextColor: '#2f4f4f',
    navOkIconColor: '#8b4513',

    // Soru Sayacı
    counterBackgroundColor: 'rgba(139, 69, 19, 0.1)',
    counterBorderColor: '#8b4513',
    counterTextColor: '#8b4513',
    counterBorderWidth: 2,
    counterBorderRadius: 20,
    counterBorderType: 'solid',
    counterTextSize: 14,
    counterTextStyle: 'normal',

    // Sonuç Ekranı
    resultBackgroundColor: '#f5f5dc',
    resultTextColor: '#2f4f4f',
    resultButtonColor: '#8b4513',
    resultButtonTextColor: '#ffffff',

    customCSS: ''
  },

  skincare: {
    // Genel
    fontFamily: 'Lato, sans-serif',
    animations: true,

    // Giriş Ekranı - Renkler
    introBackgroundColor: '#fff8f8',
    introStartButtonColor: '#ff9a9e',
    introStartButtonTextColor: '#ffffff',
    introQuestionTextColor: '#4a5568',
    introDescriptionTextColor: '#718096',
    introStartButtonBorderColor: '#ff9a9e',
    introImageBorderColor: '#fbb6ce',

    // Giriş Ekranı - Borderlar
    introButtonBorderWidth: 0,
    introButtonBorderRadius: 30,
    introButtonBorderType: 'solid',
    introImageBorderWidth: 0,
    introImageBorderRadius: 25,
    introImageBorderType: 'solid',

    // Giriş Ekranı - Text
    introTitleSize: 30,
    introDescriptionSize: 16,
    introButtonTextSize: 16,
    introIconSize: 20,
    introImageHeight: 250,

    // Soru Ekranı - Renkler
    questionBackgroundColor: '#fff8f8',
    questionOptionBackgroundColor: '#ffffff',
    questionOptionBorderColor: '#fbb6ce',
    questionTextColor: '#4a5568',
    questionOptionTextColor: '#4a5568',
    questionImageBorderColor: '#fbb6ce',
    questionSelectedOptionBackgroundColor: '#ff9a9e',
    questionSelectedOptionTextColor: '#ffffff',
    questionSelectedOptionBorderColor: '#ff9a9e',

    // Soru Ekranı - Borderlar
    questionOptionBorderWidth: 1,
    questionOptionBorderRadius: 20,
    questionOptionBorderType: 'solid',
    questionImageBorderWidth: 0,
    questionImageBorderRadius: 20,
    questionImageBorderType: 'solid',

    // Soru Ekranı - Text & Sizes
    questionTextSize: 24,
    questionImageHeight: 180,
    questionOptionTextSize: 16,
    questionOptionImageSize: 80,

    // Geçiş Butonları
    navButtonBorderWidth: 0,
    navButtonBorderColor: '#fbb6ce',
    navButtonBorderType: 'solid',
    navButtonBorderRadius: 25,
    navButtonTextSize: 14,
    navButtonTextType: 'normal',
    navPrevButtonColor: '#e2e8f0',
    navPrevButtonTextColor: '#4a5568',
    navOkIconColor: '#ff9a9e',

    // Soru Sayacı
    counterBackgroundColor: 'rgba(255, 154, 158, 0.1)',
    counterBorderColor: '#ff9a9e',
    counterTextColor: '#ff9a9e',
    counterBorderWidth: 1,
    counterBorderRadius: 25,
    counterBorderType: 'solid',
    counterTextSize: 12,
    counterTextStyle: 'normal',

    // Sonuç Ekranı
    resultBackgroundColor: '#fff8f8',
    resultTextColor: '#4a5568',
    resultButtonColor: '#ff9a9e',
    resultButtonTextColor: '#ffffff',

    customCSS: ''
  }
};

export default function TemplateSelector({ onTemplateSelect }: TemplateSelectorProps) {
  const templateInfo = [
    {
      name: 'Teknoloji',
      key: 'teknoloji',
      description: 'Modern, koyu tema ile teknoloji ürünleri için ideal',
      colors: ['#1a1a2e', '#e94560', '#16213e']
    },
    {
      name: 'Fashion',
      key: 'fashion',
      description: 'Şık, minimal tasarım ile moda ürünleri için ideal',
      colors: ['#f8f9fa', '#d63384', '#ffffff']
    },
    {
      name: 'Home',
      key: 'home',
      description: 'Sıcak, doğal renkler ile ev dekorasyonu için ideal',
      colors: ['#f5f5dc', '#8b4513', '#d2b48c']
    },
    {
      name: 'Skincare',
      key: 'skincare',
      description: 'Yumuşak, pembe tonlar ile kozmetik ürünleri için ideal',
      colors: ['#fff8f8', '#ff9a9e', '#fbb6ce']
    }
  ];

  return (
    <BlockStack gap="400">
      {templateInfo.map((template) => (
        <Card key={template.key}>
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <Text variant='headingXs' as='h6' style={{ marginBottom: '4px' }}>{template.name}</Text>
                <Text variant='bodySm' color='subdued'>{template.description}</Text>
              </div>
              
              <div style={{ display: 'flex', gap: '4px', marginLeft: '16px' }}>
                {template.colors.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: color,
                      borderRadius: '50%',
                      border: '1px solid #dee2e6'
                    }}
                  />
                ))}
              </div>
            </div>
            
            <Button
              onClick={() => onTemplateSelect(templates[template.key as keyof typeof templates])}
              size="slim"
              variant="primary"
            >
              Bu Template&apos;i Kullan
            </Button>
          </div>
        </Card>
      ))}
      
      <Card>
        <div style={{ padding: '16px' }}>
          <Text variant='bodySm' color='subdued'>
            💡 <strong>Not:</strong> Template seçtiğinizde mevcut tüm stil ayarlarınız silinecek ve seçtiğiniz template&apos;in ayarları yüklenecektir.
          </Text>
        </div>
      </Card>
    </BlockStack>
  );
}