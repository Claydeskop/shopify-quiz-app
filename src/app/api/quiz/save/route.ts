import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  StyleSettings,
  AnswerCondition,
  ShopifyCollection,
  ShopifyProduct,
  ApiResponse
} from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate unique slug
function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateUniqueSlug(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const slug = generateSlug();
    
    // Check if slug already exists
    const { data, error } = await supabase
      .from('quizzes')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No row found, slug is unique
      return slug;
    }
    
    attempts++;
  }
  
  // Fallback with timestamp if all attempts fail
  return generateSlug() + Date.now().toString().slice(-4);
}

interface QuizData {
  title: string;
  quizType: string;
  internalTitle: string;
  internalDescription: string;
  quizImage: string | null;
  isActive: boolean;
  styles?: StyleSettings;
  questions: Array<{
    id: string;
    text: string;
    show_answers: boolean;
    allow_multiple_selection: boolean;
    question_media: string | null;
  }>;
  answers: Array<{
    id: string;
    text: string;
    questionId: string;
    answer_media: string | null;
    collections: ShopifyCollection[];
    redirect_to_link: boolean;
    redirect_url: string;
    conditions: AnswerCondition[];
    products: ShopifyProduct[];
    tags: string[];
    categories: string[];
  }>;
}


export async function POST(request: NextRequest) {
  try {
    const body: QuizData = await request.json();
    const shopDomain = request.headers.get('x-shopify-shop-domain') || 'demo-shop.myshopify.com';

    console.log('Received quiz save request:', {
      shopDomain,
      title: body.title,
      questionsCount: body.questions?.length || 0,
      answersCount: body.answers?.length || 0,
      quizImage: body.quizImage,
      internalTitle: body.internalTitle,
      internalDescription: body.internalDescription
    });

    // Generate unique slug
    const slug = await generateUniqueSlug();

    // Start transaction
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        shop_domain: shopDomain,
        title: body.title,
        slug: slug,
        quiz_type: body.quizType,
        is_active: body.isActive,
        internal_quiz_title: body.internalTitle,
        internal_quiz_description: body.internalDescription,
        quiz_image: body.quizImage,
        styles: body.styles || {
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
        },
        settings: {}
      })
      .select()
      .single();

    if (quizError) {
      console.error('Quiz creation error:', quizError);
      return NextResponse.json(
        { 
          error: 'Failed to create quiz',
          details: quizError.message,
          code: quizError.code 
        },
        { status: 500 }
      );
    }

    // Save questions
    const questionsToInsert = body.questions.map((question, index) => ({
      quiz_id: quiz.id,
      text: question.text,
      show_answers: question.show_answers,
      allow_multiple_selection: question.allow_multiple_selection,
      question_media: question.question_media,
      question_order: index + 1,
      is_required: true,
      is_skippable: false,
      auto_advance: false,
      styles: {}
    }));

    const { data: savedQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error('Questions creation error:', questionsError);
      return NextResponse.json(
        { 
          error: 'Failed to create questions',
          details: questionsError.message,
          code: questionsError.code 
        },
        { status: 500 }
      );
    }

    // Create a mapping from frontend question IDs to database question IDs
    const questionIdMap: Record<string, string> = {};
    body.questions.forEach((frontendQuestion, index) => {
      questionIdMap[frontendQuestion.id] = savedQuestions[index].id;
    });

    console.log('Question ID mapping:', questionIdMap);
    console.log('Answers to save:', body.answers?.length || 0);
    console.log('First few answers:', body.answers?.slice(0, 3));

    // Save answers
    const answersToInsert = (body.answers || []).map((answer, index) => {
      const mappedQuestionId = questionIdMap[answer.questionId];
      console.log(`Answer ${index}: questionId=${answer.questionId}, mapped to=${mappedQuestionId}`);
      
      return {
        question_id: mappedQuestionId,
        text: answer.text,
        answer_media: answer.answer_media,
        redirect_to_link: answer.redirect_to_link,
        redirect_url: answer.redirect_url,
        answer_order: index + 1,
        is_default: false,
        weight: 1
      };
    });

    console.log('Final answers to insert:', answersToInsert);

    const { data: savedAnswers, error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert)
      .select();

    if (answersError) {
      console.error('Answers creation error:', answersError);
      return NextResponse.json(
        { 
          error: 'Failed to create answers',
          details: answersError.message,
          code: answersError.code 
        },
        { status: 500 }
      );
    }

    // Create mapping from frontend answer IDs to database answer IDs
    const answerIdMap: Record<string, string> = {};
    (body.answers || []).forEach((frontendAnswer, index) => {
      answerIdMap[frontendAnswer.id] = savedAnswers[index].id;
    });

    // Save metafield conditions
    const metafieldConditionsToInsert: Array<{
      answer_id: string;
      metafield_namespace: string;
      metafield_key: string;
      metafield_name: string;
      metafield_type: string;
      operator: string;
      expected_value: string;
      weight: number;
    }> = [];
    (body.answers || []).forEach((answer) => {
      if (answer.conditions && answer.conditions.length > 0) {
        answer.conditions.forEach((condition) => {
          if (condition.metafield && condition.value) {
            metafieldConditionsToInsert.push({
              answer_id: answerIdMap[answer.id],
              metafield_namespace: condition.metafield!.namespace,
              metafield_key: condition.metafield!.key,
              metafield_name: condition.metafield!.description || condition.metafield!.key,
              metafield_type: condition.metafield!.type,
              operator: condition.operator,
              expected_value: condition.value,
              weight: 1
            });
          }
        });
      }
    });

    if (metafieldConditionsToInsert.length > 0) {
      const { error: metafieldConditionsError } = await supabase
        .from('metafield_conditions')
        .insert(metafieldConditionsToInsert);

      if (metafieldConditionsError) {
        console.error('Metafield conditions creation error:', metafieldConditionsError);
        return NextResponse.json(
          { error: 'Failed to create metafield conditions' },
          { status: 500 }
        );
      }
    }

    // Save answer-collection relationships
    const answerCollectionsToInsert: Array<{
      answer_id: string;
      shopify_collection_id: string;
      collection_order: number;
    }> = [];
    (body.answers || []).forEach((answer) => {
      if (answer.collections && answer.collections.length > 0) {
        answer.collections.forEach((collection: ShopifyCollection, index: number) => {
          if (collection.id) {
            answerCollectionsToInsert.push({
              answer_id: answerIdMap[answer.id],
              shopify_collection_id: collection.id,
              collection_order: index + 1
            });
          }
        });
      }
    });

    if (answerCollectionsToInsert.length > 0) {
      const { error: answerCollectionsError } = await supabase
        .from('answer_collections')
        .insert(answerCollectionsToInsert);

      if (answerCollectionsError) {
        console.error('Answer collections creation error:', answerCollectionsError);
        return NextResponse.json(
          { error: 'Failed to create answer collections' },
          { status: 500 }
        );
      }
    }

    // Collect unique collection IDs for quiz-level reference
    const allCollectionIds = new Set<string>();
    answerCollectionsToInsert.forEach((item) => {
      allCollectionIds.add(item.shopify_collection_id);
    });

    // Update quiz with collection IDs
    if (allCollectionIds.size > 0) {
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({
          shopify_collection_ids: Array.from(allCollectionIds)
        })
        .eq('id', quiz.id);

      if (updateError) {
        console.error('Quiz collection update error:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      quiz_id: quiz.id,
      message: 'Quiz saved successfully'
    });

  } catch (error) {
    console.error('Save quiz error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}