'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import QuizContent from './QuizContent';
import QuizPreview from './QuizPreview';
import QuizSettings from './QuizSettings';

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
  metafieldConditions: any[];
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

interface QuizBuilderProps {
  quizTitle: string;
  quizType: string;
  onTitleChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const QuizBuilder = forwardRef<any, QuizBuilderProps>((props, ref) => {
  const [activeTab, setActiveTab] = useState('information');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  
  // Quiz settings state
  const [internalQuizTitle, setInternalQuizTitle] = useState<string>('Bu quiz hangi ürün size en uygun olduğunu bulmanıza yardımcı olacak');
  const [internalQuizDescription, setInternalQuizDescription] = useState<string>('Kişisel tercihlerinizi ve ihtiyaçlarınızı anlayarak size özel ürün önerileri sunuyoruz. Sadece birkaç soruyu yanıtlayın ve size en uygun seçenekleri keşfedin.');
  const [quizImage, setQuizImage] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [autoTransition, setAutoTransition] = useState<boolean>(false);
  const [selectedCollections, setSelectedCollections] = useState<any[]>([]);
  
  // Style settings state
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
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
  });
  
  // Save state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<{
    active: boolean;
    message: string;
    error: boolean;
  }>({
    active: false,
    message: '',
    error: false
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedQuestionId(null);
    setSelectedAnswerId(null);
  };

  const handleQuestionAdd = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      text: 'What is your question?',
      showAnswers: true,
      allowMultipleSelection: false,
      questionMedia: null,
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
      questionId,
      answerMedia: null,
      relatedCollections: [],
      redirectToLink: false,
      redirectUrl: '',
      metafieldConditions: []
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



  const handleInternalQuizTitleChange = (value: string) => {
    setInternalQuizTitle(value);
  };

  const handleInternalQuizDescriptionChange = (value: string) => {
    setInternalQuizDescription(value);
  };

  const handleQuizImageChange = (imageUrl: string | null) => {
    setQuizImage(imageUrl);
  };

  const handleStyleChange = (styles: StyleSettings) => {
    setStyleSettings(styles);
  };

  // Question settings handlers
  const handleQuestionShowAnswersChange = (questionId: string, value: boolean) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, showAnswers: value } : q)
    );
  };

  const handleQuestionAllowMultipleSelectionChange = (questionId: string, value: boolean) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, allowMultipleSelection: value } : q)
    );
  };

  const handleQuestionMediaChange = (questionId: string, mediaUrl: string | null) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, questionMedia: mediaUrl } : q)
    );
  };

  // Answer settings handlers
  const handleAnswerMediaChange = (answerId: string, mediaUrl: string | null) => {
    setAnswers(prev => 
      prev.map(a => a.id === answerId ? { ...a, answerMedia: mediaUrl } : a)
    );
  };

  const handleAnswerCollectionsChange = (answerId: string, collections: any[]) => {
    setAnswers(prev => 
      prev.map(a => a.id === answerId ? { ...a, relatedCollections: collections } : a)
    );
  };

  const handleAnswerRedirectToLinkChange = (answerId: string, value: boolean) => {
    setAnswers(prev => 
      prev.map(a => a.id === answerId ? { ...a, redirectToLink: value } : a)
    );
  };

  const handleAnswerRedirectUrlChange = (answerId: string, url: string) => {
    setAnswers(prev => 
      prev.map(a => a.id === answerId ? { ...a, redirectUrl: url } : a)
    );
  };

  const handleAnswerMetafieldConditionsChange = (answerId: string, conditions: any[]) => {
    setAnswers(prev => 
      prev.map(a => a.id === answerId ? { ...a, metafieldConditions: conditions } : a)
    );
  };


  const handleSaveQuiz = async () => {
    try {
      setIsSaving(true);
      
      // Get shop domain from session
      const sessionResponse = await fetch('/api/session');
      const sessionData = await sessionResponse.json();
      
      if (!sessionResponse.ok || !sessionData.shopDomain) {
        throw new Error('Shop domain alınamadı');
      }
      
      const quizData = {
        title: props.quizTitle,
        description: props.quizDescription,
        quizType: props.quizType,
        internalQuizTitle,
        internalQuizDescription,
        quizImage,
        isActive,
        autoTransition,
        selectedCollections,
        questions,
        answers,
        styles: styleSettings
      };

      const response = await fetch('/api/quiz/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shopify-shop-domain': sessionData.shopDomain
        },
        body: JSON.stringify(quizData)
      });

      const result = await response.json();

      if (response.ok) {
        setSaveToast({
          active: true,
          message: 'Quiz başarıyla kaydedildi!',
          error: false
        });
      } else {
        throw new Error(result.error || 'Kaydetme işlemi başarısız');
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveToast({
        active: true,
        message: error instanceof Error ? error.message : 'Quiz kaydedilirken hata oluştu',
        error: true
      });
    } finally {
      setIsSaving(false);
    }
  };

  const loadQuizData = (quizData: any) => {
    setQuestions(quizData.questions || []);
    setAnswers(quizData.answers || []);
    setInternalQuizTitle(quizData.internalQuizTitle || '');
    setInternalQuizDescription(quizData.internalQuizDescription || '');
    setQuizImage(quizData.quizImage || null);
    setIsActive(quizData.is_active || false);
    setAutoTransition(quizData.auto_transition || false);
    setSelectedCollections(quizData.selected_collections || []);
    
    // Reset to default styles if no styles provided, don't use previous styleSettings
    const defaultStyles = {
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
    
    setStyleSettings(quizData.styles || defaultStyles);
    setSelectedQuestionId(null);
    setSelectedAnswerId(null);
    setActiveTab('information');
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getQuizData: () => ({
      internalQuizTitle,
      internalQuizDescription,
      quizImage,
      isActive,
      autoTransition,
      selectedCollections,
      questions,
      answers,
      styles: styleSettings
    }),
    saveQuiz: handleSaveQuiz,
    loadQuizData
  }), [internalQuizTitle, internalQuizDescription, quizImage, isActive, autoTransition, selectedCollections, questions, answers, styleSettings]);

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
        <QuizPreview 
          {...props}
          activeTab={activeTab}
          questions={questions}
          answers={answers}
          selectedQuestionId={selectedQuestionId}
          selectedAnswerId={selectedAnswerId}
          internalQuizTitle={internalQuizTitle}
          internalQuizDescription={internalQuizDescription}
          quizImage={quizImage}
          styles={styleSettings}
          onQuestionSelect={handleQuestionSelect}
          onTabChange={handleTabChange}
        />
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
          quizName={props.quizTitle}
          quizTitle={internalQuizTitle}
          quizImage={quizImage}
          isActive={isActive}
          autoTransition={autoTransition}
          selectedCollections={selectedCollections}
          onQuizNameChange={props.onTitleChange}
          onQuizTitleChange={handleInternalQuizTitleChange}
          onQuizImageChange={handleQuizImageChange}
          onIsActiveChange={setIsActive}
          onAutoTransitionChange={setAutoTransition}
          onCollectionsChange={setSelectedCollections}
          internalQuizTitle={internalQuizTitle}
          internalQuizDescription={internalQuizDescription}
          onInternalQuizTitleChange={handleInternalQuizTitleChange}
          onInternalQuizDescriptionChange={handleInternalQuizDescriptionChange}
          onQuestionShowAnswersChange={handleQuestionShowAnswersChange}
          onQuestionAllowMultipleSelectionChange={handleQuestionAllowMultipleSelectionChange}
          onQuestionMediaChange={handleQuestionMediaChange}
          onAnswerMediaChange={handleAnswerMediaChange}
          onAnswerCollectionsChange={handleAnswerCollectionsChange}
          onAnswerRedirectToLinkChange={handleAnswerRedirectToLinkChange}
          onAnswerRedirectUrlChange={handleAnswerRedirectUrlChange}
          onAnswerMetafieldConditionsChange={handleAnswerMetafieldConditionsChange}
          styleSettings={styleSettings}
          onStyleChange={handleStyleChange}
        />
      </div>
    </div>
  );
});

QuizBuilder.displayName = 'QuizBuilder';

export default QuizBuilder;