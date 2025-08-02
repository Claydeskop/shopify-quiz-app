/**
 * Utility functions for handling text and React entities
 */
import React from 'react';

/**
 * Component for displaying text with properly escaped entities
 */
export const EscapedText: React.FC<{ children: string }> = ({ children }) => {
  const escapedText = children
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
  
  return React.createElement('span', { 
    dangerouslySetInnerHTML: { __html: escapedText } 
  });
};

/**
 * Escape special characters for React JSX
 */
export const escapeForJSX = (text: string): string => {
  return text
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/&(?!apos;|quot;|amp;|lt;|gt;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

/**
 * Common text constants with proper escaping
 */
export const TEXTS = {
  QUIZ_DELETE: "Quiz'i Sil",
  QUIZ_DELETE_CONFIRM: "Bu quiz'i silmek istediğinizden emin misiniz?",
  CANT_BE_UNDONE: "Bu işlem geri alınamaz",
  DONT_SHOW_ANSWERS: "Şıkları gösterme",
  WHATS_YOUR_STYLE: "Tarzınız nedir?",
  LETS_FIND_OUT: "Hadi öğrenelim!",
  START_QUIZ: "Quiz'e Başla",
  NEXT_QUESTION: "Sonraki Soru",
  SEE_RESULTS: "Sonuçları Gör",
  QUIZ_RESULTS: "Quiz Sonuçlarınız",
  YOUR_RECOMMENDATIONS: "Size Özel Önerileriniz",
  NO_QUIZ_FOUND: "Quiz bulunamadı",
  HELPER_CSS_CLASSES: "Yardımcı CSS Sınıfları:",
  BRAND_AWARENESS: "Marka Bilinirliği",
  PRODUCT_RECOMMENDATION: "Ürün Önerisi",
} as const;

/**
 * Hook for using escaped text
 */
export const useEscapedText = (text: string) => {
  return escapeForJSX(text);
};