'use client';

import {
  Box,
  Button,
  Card,
  Checkbox,
  Text,
  Thumbnail
} from '@shopify/polaris';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopifyCollection, StyleSettings } from '../../types';

interface Question {
  id: string;
  text: string;
  showAnswers: boolean;
  allowMultipleSelection: boolean;
  questionMedia: string | null;
}

interface Answer {
  id: string;
  text: string;
  questionId: string;
  answerMedia: string | null;
  relatedCollections: ShopifyCollection[];
  redirectToLink: boolean;
  redirectUrl: string;
}

interface QuizPreviewProps {
  quizTitle: string;
  quizDescription: string;
  quizType: string;
  activeTab: string;
  questions: Question[];
  answers: Answer[];
  selectedQuestionId: string | null;
  selectedAnswerId: string | null;
  internalQuizTitle: string;
  internalQuizDescription: string;
  quizImage: string | null;
  styles?: StyleSettings;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onQuestionSelect?: (questionId: string) => void;
  onTabChange?: (tab: string) => void;
}

export default function QuizPreview({ 
  quizTitle, 
  quizDescription, 
  activeTab,
  questions,
  answers,
  selectedQuestionId,
  selectedAnswerId,
  internalQuizTitle,
  internalQuizDescription,
  quizImage,
  styles,
  onQuestionSelect,
  onTabChange
}: QuizPreviewProps) {
  const [currentView, setCurrentView] = useState<'info' | 'question'>('info');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  // Default style settings
  const defaultStyles: StyleSettings = {
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

    customCSS: ''
  };

  // Backward compatibility ve yeni stil ayarlarını birleştir
  const currentStyles = { 
    ...defaultStyles, 
    ...styles,
    // Backward compatibility için eski alanları yeni alanlara map et
    ...(styles?.backgroundColor && !styles?.introBackgroundColor && { introBackgroundColor: styles.backgroundColor }),
    ...(styles?.backgroundColor && !styles?.questionBackgroundColor && { questionBackgroundColor: styles.backgroundColor }),
    ...(styles?.optionBackgroundColor && !styles?.questionOptionBackgroundColor && { questionOptionBackgroundColor: styles.optionBackgroundColor }),
    ...(styles?.titleFontSize && !styles?.introTitleSize && { introTitleSize: styles.titleFontSize }),
    ...(styles?.questionFontSize && !styles?.questionTextSize && { questionTextSize: styles.questionFontSize }),
    ...(styles?.optionFontSize && !styles?.questionOptionTextSize && { questionOptionTextSize: styles.optionFontSize }),
    ...(styles?.buttonColor && !styles?.introStartButtonColor && { introStartButtonColor: styles.buttonColor }),
    ...(styles?.quizBorderRadius && !styles?.introButtonBorderRadius && { introButtonBorderRadius: styles.quizBorderRadius }),
    ...(styles?.optionBorderRadius && !styles?.questionOptionBorderRadius && { questionOptionBorderRadius: styles.optionBorderRadius }),
  };

  // Update current view based on selection - Force immediate updates
  useEffect(() => {
    // Clear selected answers when switching context (except for style tab)
    if (activeTab !== 'style') {
      setSelectedAnswers([]);
    }
    
    // Only Information tab selected - show quiz info
    if (activeTab === 'information') {
      if (!selectedQuestionId && !selectedAnswerId) {
        setCurrentView('info');
      }
    }
    
    // Style tab selected - don't change current view, keep it as is
    
    // Question or Answer selected - show question view
    if ((selectedQuestionId && selectedQuestionId !== '') || (selectedAnswerId && selectedAnswerId !== '')) {
      setCurrentView('question');
      
      if (selectedQuestionId && selectedQuestionId !== '') {
        const questionIndex = questions.findIndex(q => q.id === selectedQuestionId);
        if (questionIndex !== -1) {
          setCurrentQuestionIndex(questionIndex);
        }
      } else if (selectedAnswerId && selectedAnswerId !== '') {
        const answer = answers.find(a => a.id === selectedAnswerId);
        if (answer) {
          const questionIndex = questions.findIndex(q => q.id === answer.questionId);
          if (questionIndex !== -1) {
            setCurrentQuestionIndex(questionIndex);
          }
        }
      }
    }
    
    // No selection and not info/style tab - default behavior
    if (!selectedQuestionId && !selectedAnswerId && activeTab !== 'information' && activeTab !== 'style') {
      if (questions.length > 0) {
        setCurrentView('question');
        setCurrentQuestionIndex(0);
      } else {
        setCurrentView('info');
      }
    }
  }, [activeTab, selectedQuestionId, selectedAnswerId, questions, answers]);

  const handleStartQuiz = () => {
    if (questions.length > 0) {
      setCurrentView('question');
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      
      // Trigger left menu and right settings update
      if (onQuestionSelect) {
        onQuestionSelect(questions[0].id);
      }
    }
  };

  const handlePrevious = () => {
    if (currentView === 'question' && currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      setSelectedAnswers([]);
      if (onQuestionSelect && questions[newIndex]) {
        onQuestionSelect(questions[newIndex].id);
      }
    } else if (currentView === 'question' && currentQuestionIndex === 0) {
      setCurrentView('info');
      setSelectedAnswers([]);
      
      // Clear selections and update settings
      if (onQuestionSelect) {
        onQuestionSelect('');
      }
      if (onTabChange) {
        onTabChange('information');
      }
    }
  };

  const handleNext = () => {
    if (currentView === 'info') {
      if (questions.length > 0) {
        setCurrentView('question');
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
        if (onQuestionSelect) {
          onQuestionSelect(questions[0].id);
        }
      }
    } else if (currentView === 'question' && currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setSelectedAnswers([]);
      if (onQuestionSelect && questions[newIndex]) {
        onQuestionSelect(questions[newIndex].id);
      }
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswers.includes(answerId)) {
      setSelectedAnswers(prev => prev.filter(id => id !== answerId));
    } else {
      setSelectedAnswers(prev => [...prev, answerId]);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionAnswers = answers.filter(a => a.questionId === currentQuestion?.id);

  const renderQuizInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px',
        height: '70vh',
        background: currentStyles.introBackgroundColor || currentStyles.backgroundColor || '#2c5aa0',
        borderRadius: `${currentStyles.introButtonBorderRadius || 24}px`,
        border: currentStyles.introImageBorderWidth > 0 ? `${currentStyles.introImageBorderWidth}px ${currentStyles.introImageBorderType} ${currentStyles.introImageBorderColor}` : 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
      }}
    >
      {/* Background Decoration */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
        animation: 'float 6s ease-in-out infinite',
      }} />
      
      {/* Quiz Image */}
      <AnimatePresence>
        {quizImage && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: '32px', position: 'relative', zIndex: 2 }}
          >
            <div style={{
              width: '120px',
              height: `${currentStyles.introImageHeight || 200}px`,
              borderRadius: `${currentStyles.introImageBorderRadius}px`,
              overflow: 'hidden',
              border: currentStyles.introImageBorderWidth > 0 ? `${currentStyles.introImageBorderWidth}px ${currentStyles.introImageBorderType} ${currentStyles.introImageBorderColor}` : '4px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <img
                src={quizImage}
                alt="Quiz image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiz Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="quiz-title"
        style={{
          fontSize: `${currentStyles.introTitleSize || currentStyles.titleFontSize || 32}px`,
          fontWeight: '700',
          color: currentStyles.introQuestionTextColor || 'white',
          marginBottom: '16px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 2,
          lineHeight: '1.5',
          fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
        }}
      >
        {internalQuizTitle || 'Quiz Title'}
      </motion.h1>

      {/* Quiz Description */}
      <AnimatePresence>
        {internalQuizDescription && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              fontSize: `${currentStyles.introDescriptionSize || 18}px`,
              color: currentStyles.introDescriptionTextColor || 'rgba(255,255,255,0.9)',
              marginBottom: '32px',
              maxWidth: '400px',
              lineHeight: '1.6',
              position: 'relative',
              zIndex: 2,
              fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
            }}
          >
            {internalQuizDescription}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Start Button */}
      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <button
              onClick={handleStartQuiz}
              style={{
                background: `linear-gradient(135deg, ${currentStyles.introStartButtonColor || currentStyles.buttonColor || '#ff6b6b'} 0%, ${currentStyles.introStartButtonColor || currentStyles.buttonColor || '#ff6b6b'}AA 100%)`,
                border: currentStyles.introButtonBorderWidth > 0 ? `${currentStyles.introButtonBorderWidth}px ${currentStyles.introButtonBorderType} ${currentStyles.introStartButtonBorderColor}` : 'none',
                borderRadius: `${currentStyles.introButtonBorderRadius || 50}px`,
                padding: '16px 48px',
                fontSize: `${currentStyles.introButtonTextSize || 18}px`,
                fontWeight: '600',
                color: currentStyles.introStartButtonTextColor || 'white',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(255, 107, 107, 0.5)';
                const shimmer = e.currentTarget.querySelector('div:last-child');
                if (shimmer) shimmer.style.left = '100%';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 107, 107, 0.4)';
                const shimmer = e.currentTarget.querySelector('div:last-child');
                if (shimmer) shimmer.style.left = '-100%';
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>🚀 Quiz&apos;i Başlat</span>
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                transition: 'left 0.6s',
              }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      <AnimatePresence>
        {questions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '24px',
              borderRadius: '16px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '1rem',
              margin: 0 
            }}>
              Quiz&apos;inize soru ekleyerek başlayın
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }
      `}</style>
    </motion.div>
  );

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          padding: '32px',
          background: currentStyles.questionBackgroundColor || currentStyles.backgroundColor || '#2c5aa0',
          borderRadius: `${currentStyles.questionOptionBorderRadius || currentStyles.quizBorderRadius || 24}px`,
          border: currentStyles.questionImageBorderWidth > 0 ? `${currentStyles.questionImageBorderWidth}px ${currentStyles.questionImageBorderType} ${currentStyles.questionImageBorderColor}` : 'none',
          height: '70vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
        }}
      >
        {/* Progress Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '24px 24px 0 0'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #00d4ff, #ff9a9e)',
              borderRadius: '4px',
            }}
          />
        </div>

        {/* Question Counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            marginTop: '12px'
          }}
        >
          <div style={{
            background: currentStyles.counterBackgroundColor || 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: `${currentStyles.counterBorderRadius || 20}px`,
            backdropFilter: 'blur(10px)',
            border: currentStyles.counterBorderWidth > 0 ? `${currentStyles.counterBorderWidth}px ${currentStyles.counterBorderType} ${currentStyles.counterBorderColor}` : '1px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{ 
              color: currentStyles.counterTextColor || 'white', 
              fontSize: `${currentStyles.counterTextSize || 14}px`, 
              fontWeight: currentStyles.counterTextStyle === 'bold' ? '600' : '400',
              fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
              textTransform: currentStyles.counterTextStyle === 'uppercase' ? 'uppercase' : currentStyles.counterTextStyle === 'lowercase' ? 'lowercase' : currentStyles.counterTextStyle === 'capitalize' ? 'capitalize' : 'none',
              fontStyle: currentStyles.counterTextStyle === 'italic' ? 'italic' : 'normal'
            }}>
              Soru {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
        </motion.div>

        {/* Question Image */}
        <AnimatePresence>
          {currentQuestion.questionMedia && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ 
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <div style={{
                borderRadius: `${currentStyles.questionImageBorderRadius || 16}px`,
                overflow: 'hidden',
                border: currentStyles.questionImageBorderWidth > 0 ? `${currentStyles.questionImageBorderWidth}px ${currentStyles.questionImageBorderType} ${currentStyles.questionImageBorderColor}` : '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                maxWidth: '300px'
              }}>
                <img
                  src={currentQuestion.questionMedia}
                  alt="Question image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: `${currentStyles.questionImageHeight || 200}px`,
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="question-title"
          style={{
            fontSize: `${currentStyles.questionTextSize || currentStyles.questionFontSize || 24}px`,
            fontWeight: '700',
            color: currentStyles.questionTextColor || 'white',
            marginBottom: '32px',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            lineHeight: '1.5',
            fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
          }}
        >
          {currentQuestion.text}
        </motion.h2>

        {/* Answer Options */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="answer-grid"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '20px',
            maxWidth: '800px',
            margin: '20px auto 0'
          }}
        >
          {currentQuestionAnswers.map((answer, index) => (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswerSelect(answer.id)}
              style={{
                padding: '16px',
                background: selectedAnswers.includes(answer.id) 
                  ? currentStyles.questionSelectedOptionBackgroundColor || currentStyles.backgroundColor || '#ff6b6b'
                  : currentStyles.questionOptionBackgroundColor || currentStyles.optionBackgroundColor || '#ffffff',
                border: currentStyles.questionOptionBorderWidth > 0 
                  ? `${currentStyles.questionOptionBorderWidth}px ${currentStyles.questionOptionBorderType} ${selectedAnswers.includes(answer.id) ? currentStyles.questionSelectedOptionBorderColor : currentStyles.questionOptionBorderColor}`
                  : selectedAnswers.includes(answer.id) 
                    ? '2px solid rgba(255,255,255,0.5)'
                    : '2px solid rgba(255,255,255,0.2)',
                borderRadius: `${currentStyles.questionOptionBorderRadius || currentStyles.optionBorderRadius || 12}px`,
                cursor: 'pointer',
                transition: currentStyles.animations ? 'all 0.3s ease' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: `${currentStyles.questionOptionImageSize || 140}px`,
                height: `${currentStyles.questionOptionImageSize || 140}px`,
                position: 'relative',
                backdropFilter: 'blur(10px)',
                boxShadow: selectedAnswers.includes(answer.id)
                  ? '0 8px 25px rgba(26, 68, 128, 0.3)'
                  : '0 4px 15px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                flex: '0 0 auto',
                fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
              }}
            >
              {/* Selection Indicator */}
              <div style={{ 
                position: 'absolute', 
                top: '12px', 
                right: '12px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: selectedAnswers.includes(answer.id) 
                  ? '#ffffff'
                  : 'rgba(255,255,255,0.3)',
                border: '2px solid rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}>
                {selectedAnswers.includes(answer.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2c5aa0'
                    }}
                  />
                )}
              </div>

              {/* Answer Image */}
              <AnimatePresence>
                {answer.answerMedia && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    style={{ width: '100%' }}
                  >
                    <div style={{
                      width: '100%',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(255,255,255,0.1)',
                      marginBottom: '4px'
                    }}>
                      <img
                        src={answer.answerMedia}
                        alt="Answer image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Answer Text */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span 
                  className="answer-text"
                  style={{
                    fontSize: `${currentStyles.questionOptionTextSize || currentStyles.optionFontSize || 18}px`,
                    fontWeight: '600',
                    color: selectedAnswers.includes(answer.id) 
                      ? currentStyles.questionSelectedOptionTextColor || 'white' 
                      : currentStyles.questionOptionTextColor || '#1a1a1a',
                    lineHeight: '1.4',
                    textShadow: selectedAnswers.includes(answer.id) 
                      ? '0 1px 2px rgba(0,0,0,0.3)' 
                      : 'none',
                    fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
                  }}>
                  {answer.text}
                </span>
              </div>

              {/* Hover Effect */}
              <div 
                className="answer-shimmer"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: 'left 0.6s',
                  pointerEvents: 'none'
                }} 
                onMouseEnter={(e) => {
                  e.currentTarget.parentElement.style.transform = 'scale(1.02) translateY(-2px)';
                  e.currentTarget.style.left = '100%';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.parentElement.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.left = '-100%';
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Decorations */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          animation: 'float 4s ease-in-out infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          animation: 'float 6s ease-in-out infinite reverse',
          zIndex: 0
        }} />
      </motion.div>
    );
  };

  return (
    <Card>
      <div style={{ 
        padding: '4px', 
        height: '93vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          padding: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            animation: 'pulse 2s infinite'
          }} />
          <Text variant='headingMd' as='h3' style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            ✨ Live Preview
          </Text>
        </div>
        
        {/* Main Preview Area */}
        <div style={{ 
          flex: 1,
          marginBottom: '12px'
        }}>
          <AnimatePresence mode="wait">
            {currentView === 'info' ? (
              <div key="quiz-info">{renderQuizInfo()}</div>
            ) : (
              <div key={`question-${selectedQuestionId || selectedAnswerId || currentQuestionIndex}`}>
                {renderQuestion()}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Modern Navigation Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <motion.button
            onClick={handlePrevious}
            disabled={currentView === 'info'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: currentView === 'info' 
                ? 'rgba(0,0,0,0.1)' 
                : currentStyles.navPrevButtonColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: currentStyles.navButtonBorderWidth > 0 ? `${currentStyles.navButtonBorderWidth}px ${currentStyles.navButtonBorderType} ${currentStyles.navButtonBorderColor}` : 'none',
              borderRadius: `${currentStyles.navButtonBorderRadius || 12}px`,
              padding: '12px 24px',
              color: currentView === 'info' ? '#666' : currentStyles.navPrevButtonTextColor || 'white',
              fontWeight: currentStyles.navButtonTextType === 'bold' ? '600' : '400',
              fontStyle: currentStyles.navButtonTextType === 'italic' ? 'italic' : 'normal',
              fontSize: `${currentStyles.navButtonTextSize || 16}px`,
              cursor: currentView === 'info' ? 'not-allowed' : 'pointer',
              boxShadow: currentView === 'info' 
                ? 'none' 
                : '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: currentStyles.animations ? 'all 0.3s ease' : 'none',
              opacity: currentView === 'info' ? 0.5 : 1,
              fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
            }}
          >
            ← Önceki
          </motion.button>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(102, 126, 234, 0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: currentView === 'info' 
                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }} />
            <Text variant="bodyXs" style={{ 
              fontWeight: '600',
              color: '#333'
            }}>
              {currentView === 'info' 
                ? '🏠 Quiz Bilgileri' 
                : `🔥 Soru ${currentQuestionIndex + 1}/${questions.length}`
              }
            </Text>
          </div>

          <motion.button
            onClick={handleNext}
            disabled={currentView === 'question' && currentQuestionIndex >= questions.length - 1}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: (currentView === 'question' && currentQuestionIndex >= questions.length - 1)
                ? 'rgba(0,0,0,0.1)'
                : currentStyles.navOkIconColor || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: currentStyles.navButtonBorderWidth > 0 ? `${currentStyles.navButtonBorderWidth}px ${currentStyles.navButtonBorderType} ${currentStyles.navButtonBorderColor}` : 'none',
              borderRadius: `${currentStyles.navButtonBorderRadius || 12}px`,
              padding: '12px 24px',
              color: (currentView === 'question' && currentQuestionIndex >= questions.length - 1) 
                ? '#666' 
                : 'white',
              fontWeight: currentStyles.navButtonTextType === 'bold' ? '600' : '400',
              fontStyle: currentStyles.navButtonTextType === 'italic' ? 'italic' : 'normal',
              fontSize: `${currentStyles.navButtonTextSize || 16}px`,
              cursor: (currentView === 'question' && currentQuestionIndex >= questions.length - 1) 
                ? 'not-allowed' 
                : 'pointer',
              boxShadow: (currentView === 'question' && currentQuestionIndex >= questions.length - 1)
                ? 'none'
                : '0 4px 15px rgba(240, 147, 251, 0.3)',
              transition: currentStyles.animations ? 'all 0.3s ease' : 'none',
              opacity: (currentView === 'question' && currentQuestionIndex >= questions.length - 1) 
                ? 0.5 
                : 1,
              fontFamily: currentStyles.fontFamily || 'Arial, sans-serif',
            }}
          >
            Sonraki →
          </motion.button>
        </motion.div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          
          @media (max-width: 768px) {
            .quiz-preview-container {
              padding: 20px !important;
            }
            
            .answer-grid {
              justify-content: center !important;
            }
            
            .quiz-title {
              font-size: 1.75rem !important;
            }
            
            .question-title {
              font-size: 1.25rem !important;
            }
          }
          
          @media (max-width: 480px) {
            .quiz-title {
              font-size: 1.5rem !important;
            }
            
            .question-title {
              font-size: 1.125rem !important;
            }
            
            .answer-text {
              font-size: 0.875rem !important;
            }
          }

          /* Custom CSS */
          ${currentStyles.customCSS}
        `}</style>
      </div>
    </Card>
  );
}