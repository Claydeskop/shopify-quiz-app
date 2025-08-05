'use client';

import { Button, Text } from '@shopify/polaris';
import { DragHandleIcon, PlusIcon } from '@shopify/polaris-icons';
import { useState } from 'react';
import { Answer } from '../../types';

interface AnswerBuilderProps {
  answers: (Answer & { questionId?: string })[];
  questionId: string;
  onAnswerAdd: (questionId: string) => void;
  onAnswerSelect: (answerId: string) => void;
  onAnswerReorder: (questionId: string, dragIndex: number, hoverIndex: number) => void;
  selectedAnswerId: string | null;
}

export default function AnswerBuilder({ 
  answers, 
  questionId,
  onAnswerAdd, 
  onAnswerSelect,
  onAnswerReorder,
  selectedAnswerId 
}: AnswerBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const questionAnswers = answers || [];
  
  const truncateText = (text: string, maxLength: number = 24) => {
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
      onAnswerReorder(questionId, draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <div style={{ 
      paddingLeft: '24px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4px',
      marginTop: '8px'
    }}>
      {questionAnswers.map((answer, index) => (
        <div key={answer.id}>
          {/* Drop Zone Indicator */}
          {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
            <div style={{
              height: '1px',
              backgroundColor: '#007ace',
              borderRadius: '1px',
              marginBottom: '2px'
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
              padding: '8px 12px',
              borderRadius: '4px',
              border: selectedAnswerId === answer.id ? '1px solid #007ace' : '1px solid #e1e3e5',
              backgroundColor: selectedAnswerId === answer.id ? '#f0f8ff' : '#ffffff',
              cursor: 'default',
              transition: 'all 0.2s ease',
              opacity: draggedIndex === index ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transform: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index 
                ? 'translateY(4px)' : 'translateY(0)',
              marginBottom: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index 
                ? '8px' : '0',
              fontSize: '14px'
            }}
          >
            <div 
              onMouseDown={(e) => e.stopPropagation()}
              style={{ 
                color: '#9ca3af',
                display: 'flex', 
                alignItems: 'center',
                cursor: 'grab',
                padding: '2px',
                minWidth: '16px',
                justifyContent: 'center'
              }}
            >
              <DragHandleIcon />
            </div>
            <div 
              onClick={(e) => {
                if (!isDragging) {
                  onAnswerSelect(answer.id);
                }
              }}
              style={{ flex: 1, cursor: 'pointer' }}
            >
              <Text as='p' variant='bodySm' truncate>
                {String.fromCharCode(65 + index)}. {truncateText(answer.text)}
              </Text>
            </div>
          </div>
        </div>
      ))}
      
      {/* Add New Answer Button */}
      <div style={{ marginTop: '4px' }}>
        <Button
          onClick={() => onAnswerAdd(questionId)}
          variant="tertiary"
          size="micro"
          icon={PlusIcon}
          fullWidth
          textAlign="left"
        >
          Add Answer
        </Button>
      </div>
    </div>
  );
}