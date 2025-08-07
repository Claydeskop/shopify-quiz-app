'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import QuizContent from './QuizContent';
import QuizPreview from './QuizPreview';
import QuizSettings from './QuizSettings';
import type { Question, Answer, StyleSettings, QuizFormData, Quiz, ShopifyCollection, AnswerCondition, ApiQuestion, ApiAnswer, ApiQuiz } from '@/types';

interface QuizBuilderRef {
  getQuizData: () => QuizFormData;
  saveQuiz: () => Promise<void>;
  loadQuizData: (quizData: Partial<Quiz>) => void;
}

interface QuizBuilderProps {
  quizTitle: string;
  quizDescription: string;
  quizType: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const QuizBuilder = forwardRef<QuizBuilderRef, QuizBuilderProps>((props, ref) => {
  const [activeTab, setActiveTab] = useState('information');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  
  // Quiz settings state
  const [internalQuizTitle, setInternalQuizTitle] = useState<string>('Bu quiz hangi ürün size en uygun olduğunu bulmanıza yardımcı olacak');
  const [internalQuizDescription, setInternalQuizDescription] = useState<string>('Kişisel tercihlerinizi ve ihtiyaçlarınızı anlayarak size özel ürün önerileri sunuyoruz. Sadece birkaç soruyu yanıtlayın ve size en uygun seçenekleri keşfedin.');
  const [quizImage, setQuizImage] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Style settings state
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    fontFamily: 'Arial',
    animations: true,
    
    // Intro Screen
    introBackgroundColor: '#2c5aa0',
    introStartButtonColor: '#ff6b6b',
    introStartButtonTextColor: '#ffffff',
    introQuestionTextColor: '#ffffff',
    introDescriptionTextColor: '#ffffff',
    introStartButtonBorderColor: '#ffffff',
    introImageBorderColor: '#ffffff',
    introButtonBorderWidth: 0,
    introButtonBorderRadius: 12,
    introButtonBorderType: 'solid',
    introImageBorderWidth: 0,
    introImageBorderRadius: 12,
    introImageBorderType: 'solid',
    introTitleSize: 32,
    introDescriptionSize: 18,
    introButtonTextSize: 18,
    introIconSize: 24,
    introImageHeight: 200,
    
    // Question Screen
    questionBackgroundColor: '#2c5aa0',
    questionOptionBackgroundColor: '#ffffff',
    questionOptionBorderColor: '#ffffff',
    questionTextColor: '#ffffff',
    questionOptionTextColor: '#000000',
    questionImageBorderColor: '#ffffff',
    questionSelectedOptionBackgroundColor: '#ff6b6b',
    questionSelectedOptionTextColor: '#ffffff',
    questionSelectedOptionBorderColor: '#ffffff',
    questionOptionBorderWidth: 2,
    questionOptionBorderRadius: 12,
    questionOptionBorderType: 'solid',
    questionImageBorderWidth: 0,
    questionImageBorderRadius: 12,
    questionImageBorderType: 'solid',
    questionTextSize: 24,
    questionImageHeight: 200,
    questionOptionTextSize: 18,
    questionOptionImageSize: 100,
    
    // Navigation
    navButtonBorderWidth: 0,
    navButtonBorderColor: '#ffffff',
    navButtonBorderType: 'solid',
    navButtonBorderRadius: 12,
    navButtonTextSize: 18,
    navButtonTextType: 'normal',
    navPrevButtonColor: '#ffffff',
    navPrevButtonTextColor: '#000000',
    navOkIconColor: '#ff6b6b',
    
    // Counter
    counterBackgroundColor: '#ffffff',
    counterBorderColor: '#ffffff',
    counterTextColor: '#000000',
    counterBorderWidth: 0,
    counterBorderRadius: 12,
    counterBorderType: 'solid',
    counterTextSize: 14,
    counterTextStyle: 'normal',
    
    // Result Screen
    resultBackgroundColor: '#2c5aa0',
    resultTextColor: '#ffffff',
    resultButtonColor: '#ff6b6b',
    resultButtonTextColor: '#ffffff',
    
    // Custom CSS
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
      question_media: undefined,
      show_answers: true,
      allow_multiple_selection: false,
      answers: []
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
      answer_media: null,
      redirect_to_link: false,
      redirect_url: null,
      collections: [],
      categories: [],
      products: [],
      tags: [],
      conditions: []
    };
    
    // Add answer to the specific question
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId 
          ? { ...q, answers: [...(q.answers || []), newAnswer] }
          : q
      )
    );
    
    setSelectedAnswerId(newAnswer.id);
    setActiveTab('questions');
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswerId(answerId);
    // Note: Answer interface doesn't have questionId, need to find by checking question.answers
    const question = questions.find(q => (q.answers || []).some(a => a.id === answerId));
    if (question) {
      setSelectedQuestionId(question.id);
    }
    setActiveTab('questions');
  };

  const handleAnswerReorder = (questionId: string, dragIndex: number, hoverIndex: number) => {
    setQuestions(prev => 
      prev.map(q => {
        if (q.id === questionId) {
          const newAnswers = [...(q.answers || [])];
          const draggedItem = newAnswers[dragIndex];
          newAnswers.splice(dragIndex, 1);
          newAnswers.splice(hoverIndex, 0, draggedItem);
          return { ...q, answers: newAnswers };
        }
        return q;
      })
    );
  };

  const handleAnswerTextChange = (answerId: string, text: string) => {
    setQuestions(prev => 
      prev.map(q => ({
        ...q,
        answers: (q.answers || []).map(a => 
          a.id === answerId ? { ...a, text } : a
        )
      }))
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
      prev.map(q => q.id === questionId ? { ...q, show_answers: value } : q)
    );
  };

  const handleQuestionAllowMultipleSelectionChange = (questionId: string, value: boolean) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, allow_multiple_selection: value } : q)
    );
  };

  const handleQuestionShowAnswerImagesChange = (questionId: string, value: boolean) => {
    // This handler is currently not used but required by the interface
    console.log('Show answer images change:', questionId, value);
  };

  const handleQuestionMediaChange = (questionId: string, mediaUrl: string | null) => {
    setQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, question_media: mediaUrl } : q)
    );
  };

  // Answer settings handlers
  const handleAnswerMediaChange = (answerId: string, mediaUrl: string | null) => {
    setQuestions(prev => 
      prev.map(q => ({
        ...q,
        answers: (q.answers || []).map(a => 
          a.id === answerId ? { ...a, answer_media: mediaUrl } : a
        )
      }))
    );
  };

  const handleAnswerCollectionsChange = (answerId: string, collections: ShopifyCollection[]) => {
    setQuestions(prev => 
      prev.map(q => ({
        ...q,
        answers: (q.answers || []).map(a => 
          a.id === answerId ? { ...a, collections: collections } : a
        )
      }))
    );
  };

  const handleAnswerRedirectToLinkChange = (answerId: string, value: boolean) => {
    setQuestions(prev => 
      prev.map(q => ({
        ...q,
        answers: (q.answers || []).map(a => 
          a.id === answerId ? { ...a, redirect_to_link: value } : a
        )
      }))
    );
  };

  const handleAnswerRedirectUrlChange = (answerId: string, url: string) => {
    setQuestions(prev => 
      prev.map(q => ({
        ...q,
        answers: (q.answers || []).map(a => 
          a.id === answerId ? { ...a, redirect_url: url } : a
        )
      }))
    );
  };

  const handleAnswerMetafieldConditionsChange = (answerId: string, conditions: AnswerCondition[]) => {
    setQuestions(prev => 
      prev.map(q => ({
        ...q,
        answers: (q.answers || []).map(a => 
          a.id === answerId ? { ...a, conditions: conditions } : a
        )
      }))
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
      
      // Create flat answers array from nested structure for API compatibility
      const flatAnswers = questions.flatMap(question => 
        (question.answers || []).map(answer => ({
          ...answer,
          questionId: question.id
        }))
      );
      
      // Return questions without nested answers for API compatibility
      const questionsForAPI = questions.map(question => {
        const { answers, ...questionWithoutAnswers } = question;
        return questionWithoutAnswers;
      });

      const quizData = {
        title: props.quizTitle,
        quizType: props.quizType,
        internalTitle: internalQuizTitle,
        internalDescription: internalQuizDescription,
        quizImage,
        isActive,
        questions: questionsForAPI,
        answers: flatAnswers,
        styles: styleSettings
      };

      console.log('Quiz kaydetme verisi:', {
        title: props.quizTitle,
        internalTitle: internalQuizTitle,
        internalDescription: internalQuizDescription,
        quizImage,
        isActive,
        questionsCount: questionsForAPI.length,
        answersCount: flatAnswers.length
      });

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

  const loadQuizData = (quizData: Partial<ApiQuiz>) => {
    console.log('Loading quiz data:', quizData);
    
    // Transform questions to match frontend format
    const transformedQuestions = (quizData.questions || []).map((question: ApiQuestion) => ({
      id: question.id,
      text: question.text,
      question_media: question.questionMedia || question.question_media,
      show_answers: question.showAnswers !== undefined ? question.showAnswers : question.show_answers !== undefined ? question.show_answers : true,
      allow_multiple_selection: question.allowMultipleSelection !== undefined ? question.allowMultipleSelection : question.allow_multiple_selection !== undefined ? question.allow_multiple_selection : false,
      answers: []
    }));

    // Transform answers and merge into questions
    const transformedAnswers = (quizData.answers || []).map((answer: ApiAnswer) => ({
      id: answer.id,
      text: answer.text,
      answer_media: answer.answerMedia || answer.answer_media,
      redirect_to_link: answer.redirectToLink || answer.redirect_to_link || false,
      redirect_url: answer.redirectUrl || answer.redirect_url,
      collections: answer.relatedCollections || answer.collections || [],
      categories: answer.relatedCategories || answer.categories || [],
      products: answer.relatedProducts || answer.products || [],
      tags: answer.relatedTags || answer.tags || [],
      conditions: answer.metafieldConditions || answer.conditions || [],
      questionId: answer.questionId
    }));

    // Merge answers into questions
    const questionsWithAnswers = transformedQuestions.map(question => ({
      ...question,
      answers: transformedAnswers.filter(answer => answer.questionId === question.id)
    }));
    
    setQuestions(questionsWithAnswers);
    
    // Set quiz metadata
    const title = quizData.internal_quiz_title || '';
    const description = quizData.internal_quiz_description || '';
    const image = quizData.quiz_image || null;
    const active = quizData.is_active || false;
    
    console.log('Setting quiz state:', { title, description, image, active });
    console.log('Full quizData received:', quizData);
    
    setInternalQuizTitle(title);
    setInternalQuizDescription(description);
    setQuizImage(image);
    setIsActive(active);
    
    // Set styles with fallback to defaults
    const defaultStyles = {
      fontFamily: 'Arial',
      animations: true,
      
      // Intro Screen
      introBackgroundColor: '#2c5aa0',
      introStartButtonColor: '#ff6b6b',
      introStartButtonTextColor: '#ffffff',
      introQuestionTextColor: '#ffffff',
      introDescriptionTextColor: '#ffffff',
      introStartButtonBorderColor: '#ffffff',
      introImageBorderColor: '#ffffff',
      introButtonBorderWidth: 0,
      introButtonBorderRadius: 12,
      introButtonBorderType: 'solid',
      introImageBorderWidth: 0,
      introImageBorderRadius: 12,
      introImageBorderType: 'solid',
      introTitleSize: 32,
      introDescriptionSize: 18,
      introButtonTextSize: 18,
      introIconSize: 24,
      introImageHeight: 200,
      
      // Question Screen
      questionBackgroundColor: '#2c5aa0',
      questionOptionBackgroundColor: '#ffffff',
      questionOptionBorderColor: '#ffffff',
      questionTextColor: '#ffffff',
      questionOptionTextColor: '#000000',
      questionImageBorderColor: '#ffffff',
      questionSelectedOptionBackgroundColor: '#ff6b6b',
      questionSelectedOptionTextColor: '#ffffff',
      questionSelectedOptionBorderColor: '#ffffff',
      questionOptionBorderWidth: 2,
      questionOptionBorderRadius: 12,
      questionOptionBorderType: 'solid',
      questionImageBorderWidth: 0,
      questionImageBorderRadius: 12,
      questionImageBorderType: 'solid',
      questionTextSize: 24,
      questionImageHeight: 200,
      questionOptionTextSize: 18,
      questionOptionImageSize: 100,
      
      // Navigation
      navButtonBorderWidth: 0,
      navButtonBorderColor: '#ffffff',
      navButtonBorderType: 'solid',
      navButtonBorderRadius: 12,
      navButtonTextSize: 18,
      navButtonTextType: 'normal',
      navPrevButtonColor: '#ffffff',
      navPrevButtonTextColor: '#000000',
      navOkIconColor: '#ff6b6b',
      
      // Counter
      counterBackgroundColor: '#ffffff',
      counterBorderColor: '#ffffff',
      counterTextColor: '#000000',
      counterBorderWidth: 0,
      counterBorderRadius: 12,
      counterBorderType: 'solid',
      counterTextSize: 14,
      counterTextStyle: 'normal',
      
      // Result Screen
      resultBackgroundColor: '#2c5aa0',
      resultTextColor: '#ffffff',
      resultButtonColor: '#ff6b6b',
      resultButtonTextColor: '#ffffff',
      
      // Custom CSS
      customCSS: ''
    };
    
    setStyleSettings(quizData.styles || defaultStyles);
    setSelectedQuestionId(null);
    setSelectedAnswerId(null);
    setActiveTab('information');
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getQuizData: () => {
      // Flatten all answers from questions into a single array
      const allAnswers = questions.flatMap(question => 
        question.answers.map(answer => ({
          ...answer,
          questionId: question.id
        }))
      );
      
      console.log('getQuizData - Questions:', questions.length);
      console.log('getQuizData - All answers:', allAnswers.length);
      console.log('getQuizData - First few answers:', allAnswers.slice(0, 3));
      
      return {
        title: props.quizTitle,
        description: undefined,
        internalTitle: internalQuizTitle,
        internalDescription: internalQuizDescription,
        quizImage,
        isActive,
        styles: styleSettings,
        questions: questions,
        answers: allAnswers
      };
    },
    saveQuiz: handleSaveQuiz,
    loadQuizData
  }), [internalQuizTitle, internalQuizDescription, quizImage, isActive, questions, styleSettings, props.quizTitle]);

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
          onQuestionTextChange={handleQuestionTextChange}
          onAnswerTextChange={handleAnswerTextChange}
          quizName={props.quizTitle}
          quizTitle={internalQuizTitle}
          quizImage={quizImage}
          isActive={isActive}
          onQuizNameChange={props.onTitleChange}
          onQuizTitleChange={handleInternalQuizTitleChange}
          onQuizImageChange={handleQuizImageChange}
          onIsActiveChange={setIsActive}
          internalQuizTitle={internalQuizTitle}
          internalQuizDescription={internalQuizDescription}
          onInternalQuizTitleChange={handleInternalQuizTitleChange}
          onInternalQuizDescriptionChange={handleInternalQuizDescriptionChange}
          onQuestionShowAnswersChange={handleQuestionShowAnswersChange}
          onQuestionAllowMultipleSelectionChange={handleQuestionAllowMultipleSelectionChange}
          onQuestionShowAnswerImagesChange={handleQuestionShowAnswerImagesChange}
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