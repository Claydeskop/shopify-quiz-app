'use client';

import { Button, Text } from '@shopify/polaris';
import { DragHandleIcon, PlusIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import AnswerBuilder from './AnswerBuilder';

interface Question {
  id: string;
  text: string;
}

interface Answer {
  id: string;
  text: string;
  questionId: string;
}

interface QuestionBuilderProps {
  questions: Question[];
  answers: Answer[];
  onQuestionAdd: () => void;
  onQuestionSelect: (questionId: string) => void;
  onQuestionReorder: (dragIndex: number, hoverIndex: number) => void;
  onAnswerAdd: (questionId: string) => void;
  onAnswerSelect: (answerId: string) => void;
  onAnswerReorder: (questionId: string, dragIndex: number, hoverIndex: number) => void;
  selectedQuestionId: string | null;
  selectedAnswerId: string | null;
}

export default function QuestionBuilder({ 
  questions,
  answers,
  onQuestionAdd, 
  onQuestionSelect,
  onQuestionReorder,
  onAnswerAdd,
  onAnswerSelect,
  onAnswerReorder,
  selectedQuestionId,
  selectedAnswerId
}: QuestionBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const truncateText = (text: string, maxLength: number = 28) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index && dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear dragOverIndex if we're actually leaving the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      onQuestionReorder(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => setIsDragging(false), 100); // Delay to prevent click after drag
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {questions.map((question, index) => (
        <div key={question.id}>
          {/* Drop Zone Indicator */}
          {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
            <div style={{
              height: '2px',
              backgroundColor: '#007ace',
              borderRadius: '1px',
              marginBottom: '4px',
              animation: 'pulse 1s infinite'
            }} />
          )}
          
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={(e) => handleDragLeave(e)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            style={{
              padding: '12px',
              borderRadius: '6px',
              border: selectedQuestionId === question.id && !selectedAnswerId ? '2px solid #007ace' : '1px solid #e1e3e5',
              backgroundColor: selectedQuestionId === question.id && !selectedAnswerId ? '#f0f8ff' : '#ffffff',
              cursor: 'default',
              transition: 'all 0.2s ease',
              opacity: draggedIndex === index ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transform: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index 
                ? 'translateY(8px)' : 'translateY(0)',
              marginBottom: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index 
                ? '12px' : '0'
            }}
          >
            <div 
              onMouseDown={(e) => e.stopPropagation()}
              style={{ 
                color: '#6b7280',
                display: 'flex', 
                alignItems: 'center',
                cursor: 'grab',
                padding: '6px',
                borderRadius: '4px',
                minWidth: '24px',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              <DragHandleIcon />
            </div>
            <div 
              onClick={(e) => {
                if (!isDragging) {
                  onQuestionSelect(question.id);
                }
              }}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              <Text as='p' variant='bodyMd' truncate>
                {index + 1}. {truncateText(question.text)}
              </Text>
            </div>
          </div>
          
          {/* Accordion - Show answers only for selected question */}
          <div style={{
            maxHeight: selectedQuestionId === question.id && draggedIndex === null ? '1000px' : '0',
            overflow: 'hidden',
            transition: 'max-height 0.3s ease-in-out'
          }}>
            {selectedQuestionId === question.id && (
              <AnswerBuilder
                answers={answers}
                questionId={question.id}
                onAnswerAdd={onAnswerAdd}
                onAnswerSelect={onAnswerSelect}
                onAnswerReorder={onAnswerReorder}
                selectedAnswerId={selectedAnswerId}
              />
            )}
          </div>
        </div>
      ))}
      
      {/* Add New Question Button */}
      <div style={{ marginTop: '8px' }}>
        <Button
          onClick={onQuestionAdd}
          variant="tertiary"
          icon={PlusIcon}
          fullWidth
          textAlign="left"
        >
          Add Question
        </Button>
      </div>
    </div>
  );
}