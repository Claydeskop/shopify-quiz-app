'use client';

import { Modal, TitleBar } from '@shopify/app-bridge-react';
import { useState } from 'react';
import QuizFormMain from './QuizFormMain';
import QuizFormPreview from './QuizFormPreview';
import QuizFormSidebar from './QuizFormSidebar';

export default function CreateQuizModal() {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizType, setQuizType] = useState('product-recommendation');
  const [currentStep, setCurrentStep] = useState(1);

  const handleSaveQuiz = () => {
    console.log('Creating quiz:', {
      title: quizTitle,
      description: quizDescription,
      type: quizType
    });
    
    console.log('Quiz created successfully!');
    
    // Modal kapat
    const modal = document.getElementById('create-quiz-modal') as any;
    if (modal) modal.hide();
    
    // Form resetle
    setQuizTitle('');
    setQuizDescription('');
    setQuizType('product-recommendation');
    setCurrentStep(1);
  };

  const handleCancel = () => {
    const modal = document.getElementById('create-quiz-modal') as any;
    if (modal) modal.hide();
  };

  return (
    <Modal id="create-quiz-modal" variant="max">
      {/* 3 Sütunlu Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 320px',
        gap: '0',
        minHeight: '600px',
        height: '80vh',
        maxHeight: '800px'
      }}>
        {/* Sol Sütun - Navigation & Steps */}
        <div style={{
          backgroundColor: '#f6f6f7',
          borderRight: '1px solid #e1e3e5',
          padding: '24px'
        }}>
          <QuizFormSidebar 
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
          />
        </div>
        
        {/* Orta Sütun - Ana Form */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '32px',
          overflowY: 'auto'
        }}>
          <QuizFormMain
            quizTitle={quizTitle}
            setQuizTitle={setQuizTitle}
            quizDescription={quizDescription}
            setQuizDescription={setQuizDescription}
            quizType={quizType}
            setQuizType={setQuizType}
            currentStep={currentStep}
          />
        </div>
        
        {/* Sağ Sütun - Preview & Settings */}
        <div style={{
          backgroundColor: '#f6f6f7',
          borderLeft: '1px solid #e1e3e5',
          padding: '24px'
        }}>
          <QuizFormPreview
            quizTitle={quizTitle}
            quizDescription={quizDescription}
            quizType={quizType}
          />
        </div>
      </div>
      
      <TitleBar title="Create New Quiz">
        <button 
          variant="primary" 
          onClick={handleSaveQuiz}
          disabled={!quizTitle.trim()}
        >
          Create Quiz
        </button>
        <button onClick={handleCancel}>
          Cancel
        </button>
      </TitleBar>
    </Modal>
  );
}