'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  text: string;
  questionMedia: string | null;
  showAnswers: boolean;
  allowMultipleSelection: boolean;
  answers: Answer[];
}

interface Answer {
  id: string;
  text: string;
  answerMedia: string | null;
  redirectToLink: boolean;
  redirectUrl: string;
  relatedCollections: any[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  image: string | null;
  slug: string;
  style_settings: any;
  questions: Question[];
}

interface StyleSettings {
  backgroundColor: string;
  optionBackgroundColor: string;
  titleFontSize: number;
  questionFontSize: number;
  optionFontSize: number;
  quizBorderRadius: number;
  optionBorderRadius: number;
  quizBorderWidth: number;
  quizBorderColor: string;
  optionBorderWidth: number;
  optionBorderColor: string;
  buttonColor: string;
  customCSS: string;
}

interface StandaloneQuizProps {
  slug: string;
  onClose?: () => void;
  apiBaseUrl?: string;
}

export default function StandaloneQuiz({ 
  slug, 
  onClose,
  apiBaseUrl = window.location.origin 
}: StandaloneQuizProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'info' | 'question' | 'result'>('info');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [allAnswers, setAllAnswers] = useState<Record<string, string[]>>({});

  // Default style settings
  const defaultStyles: StyleSettings = {
    backgroundColor: '#2c5aa0',
    optionBackgroundColor: '#ffffff',
    titleFontSize: 32,
    questionFontSize: 24,
    optionFontSize: 18,
    quizBorderRadius: 24,
    optionBorderRadius: 12,
    quizBorderWidth: 0,
    quizBorderColor: '#ffffff',
    optionBorderWidth: 2,
    optionBorderColor: '#ffffff',
    buttonColor: '#ff6b6b',
    customCSS: ''
  };

  const currentStyles = { ...defaultStyles, ...(quiz?.style_settings || {}) };

  useEffect(() => {
    fetchQuiz();
  }, [slug]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/quiz/public/${slug}`);
      
      if (!response.ok) {
        throw new Error('Quiz bulunamadı');
      }

      const data = await response.json();
      
      if (data.success) {
        setQuiz(data.quiz);
      } else {
        throw new Error(data.error || 'Quiz yüklenemedi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (quiz && quiz.questions.length > 0) {
      setCurrentView('question');
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setAllAnswers({});
    }
  };

  const handlePrevious = () => {
    if (currentView === 'question' && currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Restore previous answers for this question
      const questionId = quiz!.questions[newIndex].id;
      setSelectedAnswers(allAnswers[questionId] || []);
    } else if (currentView === 'question' && currentQuestionIndex === 0) {
      setCurrentView('info');
      setSelectedAnswers([]);
    }
  };

  const handleNext = () => {
    if (!quiz) return;

    if (currentView === 'info') {
      if (quiz.questions.length > 0) {
        setCurrentView('question');
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
      }
    } else if (currentView === 'question') {
      // Save current answers
      const questionId = quiz.questions[currentQuestionIndex].id;
      setAllAnswers(prev => ({
        ...prev,
        [questionId]: selectedAnswers
      }));

      if (currentQuestionIndex < quiz.questions.length - 1) {
        const newIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(newIndex);
        
        // Load answers for next question
        const nextQuestionId = quiz.questions[newIndex].id;
        setSelectedAnswers(allAnswers[nextQuestionId] || []);
      } else {
        // Quiz completed
        setCurrentView('result');
      }
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    if (!quiz) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    if (currentQuestion.allowMultipleSelection) {
      if (selectedAnswers.includes(answerId)) {
        setSelectedAnswers(prev => prev.filter(id => id !== answerId));
      } else {
        setSelectedAnswers(prev => [...prev, answerId]);
      }
    } else {
      setSelectedAnswers([answerId]);
    }
  };

  const handleFinish = () => {
    if (onClose) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'rgba(0,0,0,0.8)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '2rem', 
            marginBottom: '1rem',
            animation: 'spin 1s linear infinite'
          }}>⏳</div>
          <p>Quiz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'rgba(0,0,0,0.8)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
          <p>{error}</p>
          {onClose && (
            <button 
              onClick={onClose}
              style={{
                marginTop: '1rem',
                padding: '10px 20px',
                background: '#ff6b6b',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Kapat
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!quiz) return null;

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
        minHeight: '70vh',
        background: currentStyles.backgroundColor,
        borderRadius: `${currentStyles.quizBorderRadius}px`,
        border: currentStyles.quizBorderWidth > 0 ? `${currentStyles.quizBorderWidth}px solid ${currentStyles.quizBorderColor}` : 'none',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Quiz Image */}
      {quiz.image && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ marginBottom: '32px' }}
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
          }}>
            <img
              src={quiz.image}
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

      {/* Quiz Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          fontSize: `${currentStyles.titleFontSize}px`,
          fontWeight: '700',
          color: 'white',
          marginBottom: '16px',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          lineHeight: '1.5',
        }}
      >
        {quiz.title}
      </motion.h1>

      {/* Quiz Description */}
      {quiz.description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            fontSize: '1.125rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '32px',
            maxWidth: '400px',
            lineHeight: '1.6',
          }}
        >
          {quiz.description}
        </motion.p>
      )}

      {/* Start Button */}
      {quiz.questions.length > 0 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          onClick={handleStartQuiz}
          style={{
            background: `linear-gradient(135deg, ${currentStyles.buttonColor} 0%, ${currentStyles.buttonColor}AA 100%)`,
            border: 'none',
            borderRadius: '50px',
            padding: '16px 48px',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)',
            transition: 'all 0.3s ease',
          }}
        >
          🚀 Quiz&apos;i Başlat
        </motion.button>
      )}
    </motion.div>
  );

  const renderQuestion = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
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
          background: currentStyles.backgroundColor,
          borderRadius: `${currentStyles.quizBorderRadius}px`,
          border: currentStyles.quizBorderWidth > 0 ? `${currentStyles.quizBorderWidth}px solid ${currentStyles.quizBorderColor}` : 'none',
          minHeight: '70vh',
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
            animate={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
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
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{ 
              color: 'white', 
              fontSize: '0.875rem', 
              fontWeight: '600' 
            }}>
              Soru {currentQuestionIndex + 1} / {quiz.questions.length}
            </span>
          </div>
        </motion.div>

        {/* Question Image */}
        {currentQuestion.questionMedia && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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

        {/* Question Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            fontSize: `${currentStyles.questionFontSize}px`,
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
          {currentQuestion.answers.map((answer, index) => (
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
                  ? currentStyles.backgroundColor
                  : currentStyles.optionBackgroundColor,
                border: currentStyles.optionBorderWidth > 0 
                  ? `${currentStyles.optionBorderWidth}px solid ${currentStyles.optionBorderColor}`
                  : selectedAnswers.includes(answer.id) 
                    ? '2px solid rgba(255,255,255,0.5)'
                    : '2px solid rgba(255,255,255,0.2)',
                borderRadius: `${currentStyles.optionBorderRadius}px`,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                width: '140px',
                height: '140px',
                position: 'relative',
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
              {answer.answerMedia && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
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

              {/* Answer Text */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: `${currentStyles.optionFontSize}px`,
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
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  };

  const renderResult = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px',
        minHeight: '70vh',
        background: currentStyles.backgroundColor,
        borderRadius: `${currentStyles.quizBorderRadius}px`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🎉</div>
      <h2 style={{
        fontSize: `${currentStyles.titleFontSize}px`,
        fontWeight: '700',
        color: 'white',
        marginBottom: '16px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}>
        Quiz Tamamlandı!
      </h2>
      <p style={{
        fontSize: '1.125rem',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: '32px',
        maxWidth: '400px',
        lineHeight: '1.6',
      }}>
        Tebrikler! Quiz&apos;i başarıyla tamamladınız.
      </p>
      
      <button
        onClick={handleFinish}
        style={{
          background: `linear-gradient(135deg, ${currentStyles.buttonColor} 0%, ${currentStyles.buttonColor}AA 100%)`,
          border: 'none',
          borderRadius: '50px',
          padding: '16px 48px',
          fontSize: '1.125rem',
          fontWeight: '600',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(255, 107, 107, 0.4)',
          transition: 'all 0.3s ease',
        }}
      >
        Kapat
      </button>
    </motion.div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '800px',
        position: 'relative'
      }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '-50px',
              right: '0',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
          >
            ×
          </button>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentView === 'info' && (
            <div key="quiz-info">{renderQuizInfo()}</div>
          )}
          {currentView === 'question' && (
            <div key={`question-${currentQuestionIndex}`}>{renderQuestion()}</div>
          )}
          {currentView === 'result' && (
            <div key="quiz-result">{renderResult()}</div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        {currentView !== 'result' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={currentView === 'info'}
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
                transition: 'all 0.3s ease',
                opacity: currentView === 'info' ? 0.5 : 1
              }}
            >
              ← Önceki
            </button>

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
              <span style={{ 
                fontWeight: '600',
                color: '#333',
                fontSize: '0.875rem'
              }}>
                {currentView === 'info' 
                  ? '🏠 Quiz Bilgileri' 
                  : `🔥 Soru ${currentQuestionIndex + 1}/${quiz.questions.length}`
                }
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={currentView === 'question' && currentQuestionIndex >= quiz.questions.length - 1 && selectedAnswers.length === 0}
              style={{
                background: (currentView === 'question' && selectedAnswers.length === 0)
                  ? 'rgba(0,0,0,0.1)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                color: (currentView === 'question' && selectedAnswers.length === 0) 
                  ? '#666' 
                  : 'white',
                fontWeight: '600',
                cursor: (currentView === 'question' && selectedAnswers.length === 0) 
                  ? 'not-allowed' 
                  : 'pointer',
                transition: 'all 0.3s ease',
                opacity: (currentView === 'question' && selectedAnswers.length === 0) 
                  ? 0.5 
                  : 1
              }}
            >
              {currentView === 'question' && currentQuestionIndex >= quiz.questions.length - 1 
                ? 'Bitir' 
                : 'Sonraki →'
              }
            </button>
          </motion.div>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          /* Custom CSS */
          ${currentStyles.customCSS}
        `}</style>
      </div>
    </div>
  );
}