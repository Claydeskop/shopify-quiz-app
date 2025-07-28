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
  relatedCollections: any[];
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
  onQuestionSelect,
  onTabChange
}: QuizPreviewProps) {
  const [currentView, setCurrentView] = useState<'info' | 'question'>('info');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  // Quiz settings - Bu gelecekte settings'den gelecek
  const [quizSettings, setQuizSettings] = useState({
    frameStyle: 'rounded',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    transitionAnimation: 'slide'
  });

  // Update current view based on selection - Force immediate updates
  useEffect(() => {
    // Clear selected answers when switching context
    setSelectedAnswers([]);
    
    // Information or Style tab selected - show quiz info
    if (activeTab === 'information' || activeTab === 'style') {
      if (!selectedQuestionId && !selectedAnswerId) {
        setCurrentView('info');
      }
    }
    
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
        background: '#2c5aa0',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.3)',
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
          fontSize: '2rem',
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          position: 'relative',
          zIndex: 2,
          lineHeight: '1.5',
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
              fontSize: '1.125rem',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '32px',
              maxWidth: '400px',
              lineHeight: '1.6',
              position: 'relative',
              zIndex: 2,
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
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
                border: 'none',
                borderRadius: '50px',
                padding: '16px 48px',
                fontSize: '1.125rem',
                fontWeight: '600',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
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
              <span style={{ position: 'relative', zIndex: 1 }}>🚀 Quiz'i Başlat</span>
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
              Quiz'inize soru ekleyerek başlayın
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
          background: '#2c5aa0',
          borderRadius: '24px',
          height: '70vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
            background: 'rgba(255,255,255,0.2)',
            padding: '8px 16px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '0.875rem', 
              fontWeight: '600' 
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
                borderRadius: '16px',
                overflow: 'hidden',
                border: '3px solid rgba(255,255,255,0.3)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                maxWidth: '300px'
              }}>
                <img
                  src={currentQuestion.questionMedia}
                  alt="Question image"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '200px',
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
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '32px',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            lineHeight: '1.5'
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
                  ? '#1a4480'
                  : 'rgba(255,255,255,0.95)',
                border: selectedAnswers.includes(answer.id) 
                  ? '2px solid rgba(255,255,255,0.5)'
                  : '2px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '140px',
                height: '140px',
                position: 'relative',
                backdropFilter: 'blur(10px)',
                boxShadow: selectedAnswers.includes(answer.id)
                  ? '0 8px 25px rgba(26, 68, 128, 0.3)'
                  : '0 4px 15px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                flex: '0 0 auto'
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
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: selectedAnswers.includes(answer.id) ? 'white' : '#1a1a1a',
                    lineHeight: '1.4',
                    textShadow: selectedAnswers.includes(answer.id) 
                      ? '0 1px 2px rgba(0,0,0,0.3)' 
                      : 'none'
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
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              color: currentView === 'info' ? '#666' : 'white',
              fontWeight: '600',
              cursor: currentView === 'info' ? 'not-allowed' : 'pointer',
              boxShadow: currentView === 'info' 
                ? 'none' 
                : '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              opacity: currentView === 'info' ? 0.5 : 1
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
                : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              color: (currentView === 'question' && currentQuestionIndex >= questions.length - 1) 
                ? '#666' 
                : 'white',
              fontWeight: '600',
              cursor: (currentView === 'question' && currentQuestionIndex >= questions.length - 1) 
                ? 'not-allowed' 
                : 'pointer',
              boxShadow: (currentView === 'question' && currentQuestionIndex >= questions.length - 1)
                ? 'none'
                : '0 4px 15px rgba(240, 147, 251, 0.3)',
              transition: 'all 0.3s ease',
              opacity: (currentView === 'question' && currentQuestionIndex >= questions.length - 1) 
                ? 0.5 
                : 1
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
        `}</style>
      </div>
    </Card>
  );
}