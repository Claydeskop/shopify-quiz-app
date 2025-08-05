'use client';

import { BlockStack, Card, Collapsible, Icon, Text } from '@shopify/polaris';
import { ChevronDownIcon, ChevronUpIcon, CodeIcon } from '@shopify/polaris-icons';
import { useEffect, useRef, useState } from 'react';

import GeneralSettings from '../../pickers/style/GeneralSettings';
import IntroScreenSettings from '../../pickers/style/IntroScreenSettings';
import NavigationButtons from '../../pickers/style/NavigationButtons';
import QuestionCounter from '../../pickers/style/QuestionCounter';
import QuestionScreenSettings from '../../pickers/style/QuestionScreenSettings';
import ResultScreen from '../../pickers/style/ResultScreen';
import TemplateSelector from '../../pickers/style/TemplateSelector';

interface StyleSettings {
  // Genel
  fontFamily: string;
  animations: boolean;

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

  // Geçiş Butonları
  navButtonBorderWidth: number;
  navButtonBorderColor: string;
  navButtonBorderType: string;
  navButtonBorderRadius: number;
  navButtonTextSize: number;
  navButtonTextType: string;
  navPrevButtonColor: string;
  navPrevButtonTextColor: string;
  navOkIconColor: string;

  // Soru Sayacı
  counterBackgroundColor: string;
  counterBorderColor: string;
  counterTextColor: string;
  counterBorderWidth: number;
  counterBorderRadius: number;
  counterBorderType: string;
  counterTextSize: number;
  counterTextStyle: string;

  // Sonuç Ekranı
  resultBackgroundColor: string;
  resultTextColor: string;
  resultButtonColor: string;
  resultButtonTextColor: string;

  // Özel CSS
  customCSS: string;
}

interface StyleSettingsProps {
  styles?: StyleSettings;
  onStyleChange?: (styles: StyleSettings) => void;
}

export default function StyleSettingsComponent({ styles, onStyleChange }: StyleSettingsProps) {
  const [styleState, setStyleState] = useState<StyleSettings>({
    // Genel
    fontFamily: 'Arial, sans-serif',
    animations: true,

    // Giriş Ekranı - Renkler
    introBackgroundColor: '#2c5aa0',
    introStartButtonColor: '#ff6b6b',
    introStartButtonTextColor: '#ffffff',
    introQuestionTextColor: '#ffffff',
    introDescriptionTextColor: '#ffffff',
    introStartButtonBorderColor: '#ffffff',
    introImageBorderColor: '#ffffff',

    // Giriş Ekranı - Borderlar
    introButtonBorderWidth: 2,
    introButtonBorderRadius: 12,
    introButtonBorderType: 'solid',
    introImageBorderWidth: 0,
    introImageBorderRadius: 8,
    introImageBorderType: 'solid',

    // Giriş Ekranı - Text
    introTitleSize: 32,
    introDescriptionSize: 18,
    introButtonTextSize: 16,
    introIconSize: 24,
    introImageHeight: 200,

    // Soru Ekranı - Renkler
    questionBackgroundColor: '#2c5aa0',
    questionOptionBackgroundColor: '#ffffff',
    questionOptionBorderColor: '#ffffff',
    questionTextColor: '#ffffff',
    questionOptionTextColor: '#333333',
    questionImageBorderColor: '#ffffff',
    questionSelectedOptionBackgroundColor: '#ff6b6b',
    questionSelectedOptionTextColor: '#ffffff',
    questionSelectedOptionBorderColor: '#ff6b6b',

    // Soru Ekranı - Borderlar
    questionOptionBorderWidth: 2,
    questionOptionBorderRadius: 12,
    questionOptionBorderType: 'solid',
    questionImageBorderWidth: 0,
    questionImageBorderRadius: 8,
    questionImageBorderType: 'solid',

    // Soru Ekranı - Text & Sizes
    questionTextSize: 24,
    questionImageHeight: 200,
    questionOptionTextSize: 18,
    questionOptionImageSize: 100,

    // Geçiş Butonları
    navButtonBorderWidth: 2,
    navButtonBorderColor: '#ffffff',
    navButtonBorderType: 'solid',
    navButtonBorderRadius: 8,
    navButtonTextSize: 16,
    navButtonTextType: 'normal',
    navPrevButtonColor: '#6c757d',
    navPrevButtonTextColor: '#ffffff',
    navOkIconColor: '#28a745',

    // Soru Sayacı
    counterBackgroundColor: 'rgba(255,255,255,0.2)',
    counterBorderColor: '#ffffff',
    counterTextColor: '#ffffff',
    counterBorderWidth: 1,
    counterBorderRadius: 20,
    counterBorderType: 'solid',
    counterTextSize: 14,
    counterTextStyle: 'normal',

    // Sonuç Ekranı
    resultBackgroundColor: '#2c5aa0',
    resultTextColor: '#ffffff',
    resultButtonColor: '#ff6b6b',
    resultButtonTextColor: '#ffffff',

    // Özel CSS
    customCSS: '',
    ...styles
  });

  const [activeSection, setActiveSection] = useState<string>('general');

  useEffect(() => {
    if (onStyleChange) {
      onStyleChange(styleState);
    }
  }, [styleState, onStyleChange]);

  const handleStyleChange = (key: keyof StyleSettings, value: string | number | boolean) => {
    setStyleState(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const sections = [
    { id: 'general', title: 'Genel Ayarlar', component: GeneralSettings },
    { id: 'intro', title: 'Giriş Ekranı', component: IntroScreenSettings },
    { id: 'question', title: 'Soru Ekranı', component: QuestionScreenSettings },
    { id: 'navigation', title: 'Geçiş Butonları', component: NavigationButtons },
    { id: 'counter', title: 'Soru Sayacı', component: QuestionCounter },
    { id: 'result', title: 'Sonuç Ekranı', component: ResultScreen }
  ];

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? '' : sectionId);
  };

  // CSS Editor Component
  const CSSEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    useEffect(() => {
      setTempValue(value);
    }, [value]);

    const handleBlur = () => {
      onChange(tempValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newValue = tempValue.substring(0, start) + '  ' + tempValue.substring(end);
          setTempValue(newValue);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
          }, 0);
        }
      }
    };

    const insertTemplate = (template: string) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = tempValue.substring(0, start) + template + tempValue.substring(end);
        setTempValue(newValue);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + template.length;
          textarea.focus();
        }, 0);
      }
    };

    const cssTemplates = [
      {
        name: 'Quiz Container',
        code: `.quiz-container {\n  /* Özel stilleriniz */\n  \n}`
      },
      {
        name: 'Quiz Başlığı',
        code: `.quiz-title {\n  /* Başlık stilleri */\n  \n}`
      },
      {
        name: 'Şık Kutusu',
        code: `.answer-option {\n  /* Şık kutusu stilleri */\n  \n}`
      },
      {
        name: 'Hover Efekti',
        code: `.answer-option:hover {\n  /* Fare üzerine gelince */\n  transform: scale(1.05);\n  transition: all 0.3s ease;\n}`
      }
    ];

    return (
      <div>
        <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cssTemplates.map((template, index) => (
            <button
              key={index}
              type="button"
              onClick={() => insertTemplate(template.code)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundColor: '#f6f6f7',
                border: '1px solid #e1e3e5',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#e1e3e5';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#f6f6f7';
              }}
            >
              + {template.name}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={`/* CSS kodlarınızı buraya yazın */\n.quiz-container {\n  /* Ana quiz alanı */\n  box-shadow: 0 4px 20px rgba(0,0,0,0.1);\n}\n\n.answer-option:hover {\n  /* Şık hover efekti */\n  transform: translateY(-2px);\n  transition: all 0.3s ease;\n}`}
            style={{
              width: '100%',
              minHeight: isExpanded ? '300px' : '180px',
              padding: '12px',
              fontSize: '13px',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              border: '1px solid #404040',
              borderRadius: '6px',
              resize: 'vertical',
              lineHeight: '1.5',
              tabSize: 2,
              outline: 'none'
            }}
          />
          
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              color: '#d4d4d4',
              cursor: 'pointer'
            }}
          >
            {isExpanded ? '📝 Küçült' : '📝 Genişlet'}
          </button>
        </div>
        
        <div style={{ 
          marginTop: '8px', 
          fontSize: '11px', 
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span>💡 Tab tuşu ile girinti yapabilirsiniz</span>
          <span>Değişiklikler otomatik kaydedilir</span>
        </div>
      </div>
    );
  };

  return (
    <BlockStack gap="600">
      <Text variant='headingSm' as='h4'>Quiz Stil Ayarları</Text>
      
      {/* Accordion Sections */}
      {sections.map((section) => {
        const Component = section.component;
        const isActive = activeSection === section.id;
        
        return (
          <Card key={section.id}>
            <div>
              <button
                onClick={() => toggleSection(section.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <Text variant='headingXs' as='h5'>{section.title}</Text>
                <Icon source={isActive ? ChevronUpIcon : ChevronDownIcon} />
              </button>
              
              <Collapsible id={`style-section-${section.id}`} open={isActive}>
                <div style={{ padding: '0 16px 16px 16px' }}>
                  <Component 
                    styles={styleState} 
                    onStyleChange={handleStyleChange}
                  />
                </div>
              </Collapsible>
            </div>
          </Card>
        );
      })}

      {/* Özel CSS - Always visible */}
      <Card>
        <BlockStack gap="400">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon source={CodeIcon} />
            <Text variant='headingXs' as='h5'>Özel CSS</Text>
          </div>
          
          <div style={{ position: 'relative' }}>
            <CSSEditor 
              value={styleState.customCSS}
              onChange={(value) => handleStyleChange('customCSS', value)}
            />
          </div>
          
          <div style={{ 
            backgroundColor: '#f6f6f7', 
            padding: '12px', 
            borderRadius: '8px',
            border: '1px solid #e1e3e5'
          }}>
            <Text variant='bodySm' tone='subdued' as='p'>
              💡 <strong>Yardımcı CSS Sınıfları:</strong><br />
              <code>.quiz-container</code> - Ana quiz alanı<br />
              <code>.quiz-title</code> - Quiz başlığı<br />
              <code>.question-title</code> - Soru başlıkları<br />
              <code>.answer-option</code> - Şık kutusu<br />
              <code>.answer-text</code> - Şık metni<br />
              <code>.quiz-start-button</code> - Başlat butonu<br />
              <code>#quiz-start-btn</code> - Başlat butonu (ID)
            </Text>
          </div>
        </BlockStack>
      </Card>

      {/* Template Selector - Always visible */}
      <Card>
        <BlockStack gap="400">
          <Text variant='headingXs' as='h5'>Mevcut Template&apos;ler</Text>
          <TemplateSelector 
            onTemplateSelect={(templateStyles) => {
              if (window.confirm('Emin misiniz? Mevcut ayarlarınız silinip seçtiğiniz template ayarları eklenecektir.')) {
                setStyleState(prev => ({ ...prev, ...templateStyles }));
              }
            }}
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}