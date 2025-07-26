'use client';

import { useState } from 'react';
import QuizContent from './QuizContent';
import QuizPreview from './QuizPreview';
import QuizSettings from './QuizSettings';

interface Question {
  id: string;
  text: string;
}

interface Answer {
  id: string;
  text: string;
  questionId: string;
}

interface QuizBuilderProps {
  quizTitle: string;
  quizDescription: string;
  quizType: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export default function QuizBuilder(props: QuizBuilderProps) {
  const [activeTab, setActiveTab] = useState('information');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleQuestionAdd = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      text: 'What is your question?'
    };
    setQuestions(prev => [...prev, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
    setActiveTab('questions');
  };

  const handleQuestionSelect = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setSelectedAnswerId(null); // Clear answer selection
    setActiveTab('questions');
  };

  const handleQuestionTextChange = (questionId: string, text: string) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, text } : q)
    );
  };

  const handleQuestionReorder = (dragIndex: number, hoverIndex: number) => {
    setQuestions(prev => {
      const newQuestions = [...prev];
      const draggedItem = newQuestions[dragIndex];
      newQuestions.splice(dragIndex, 1);
      newQuestions.splice(hoverIndex, 0, draggedItem);
      return newQuestions;
    });
  };

  const handleAnswerAdd = (questionId: string) => {
    const newAnswer: Answer = {
      id: `answer-${Date.now()}`,
      text: 'Enter answer option',
      questionId
    };
    setAnswers(prev => [...prev, newAnswer]);
    setSelectedAnswerId(newAnswer.id);
    setActiveTab('questions');
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswerId(answerId);
    // Keep the question selected but don't clear it
    const answer = answers.find(a => a.id === answerId);
    if (answer) {
      setSelectedQuestionId(answer.questionId);
    }
    setActiveTab('questions');
  };

  const handleAnswerReorder = (questionId: string, dragIndex: number, hoverIndex: number) => {
    const questionAnswers = answers.filter(a => a.questionId === questionId);
    const otherAnswers = answers.filter(a => a.questionId !== questionId);
    
    const newQuestionAnswers = [...questionAnswers];
    const draggedItem = newQuestionAnswers[dragIndex];
    newQuestionAnswers.splice(dragIndex, 1);
    newQuestionAnswers.splice(hoverIndex, 0, draggedItem);
    
    setAnswers([...otherAnswers, ...newQuestionAnswers]);
  };

  const handleAnswerTextChange = (answerId: string, text: string) => {
    setAnswers(prev => 
      prev.map(a => a.id === answerId ? { ...a, text } : a)
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      height: '100%',
      minHeight: '100vh',
      maxHeight: '100vh'
    }}>
      {/* Left Column - 20% */}
      <div style={{ width: '20%', height: '100%' }}>
        <QuizContent 
          onTabChange={handleTabChange} 
          activeTab={activeTab}
          questions={questions}
          answers={answers}
          onQuestionAdd={handleQuestionAdd}
          onQuestionSelect={handleQuestionSelect}
          onQuestionReorder={handleQuestionReorder}
          onAnswerAdd={handleAnswerAdd}
          onAnswerSelect={handleAnswerSelect}
          onAnswerReorder={handleAnswerReorder}
          selectedQuestionId={selectedQuestionId}
          selectedAnswerId={selectedAnswerId}
        />
      </div>
      
      {/* Middle Column - 60% */}
      <div style={{ width: '60%', height: '100%' }}>
        <QuizPreview {...props} />
      </div>
      
      {/* Right Column - 20% */}
      <div style={{ width: '20%', height: '100%' }}>
        <QuizSettings 
          activeTab={activeTab}
          selectedQuestionId={selectedQuestionId}
          selectedAnswerId={selectedAnswerId}
          questions={questions}
          answers={answers}
          onQuestionTextChange={handleQuestionTextChange}
          onAnswerTextChange={handleAnswerTextChange}
        />
      </div>
    </div>
  );
}