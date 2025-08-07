import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getShopFromRequest } from '@/lib/shopify-auth';
import {
  Quiz,
  Question,
  Answer,
  StyleSettings,
  ShopifyCollection,
  ShopifyMetafield,
  AnswerCondition,
  ApiResponse
} from '@/types';

// Database schema interfaces
interface DatabaseQuiz {
  id: string;
  title: string;
  quiz_type: string;
  internal_quiz_title: string;
  internal_quiz_description: string;
  is_active: boolean;
  auto_transition: boolean;
  selected_collections: unknown[];
  quiz_image: string | null;
  styles: StyleSettings;
  shop_domain: string;
  shopify_collection_ids: string[];
  created_at: string;
  updated_at: string;
}

interface DatabaseQuestion {
  id: string;
  quiz_id: string;
  text: string;
  show_answers: boolean;
  allow_multiple_selection: boolean;
  question_media: string | null;
  question_order: number;
  is_required: boolean;
  is_skippable: boolean;
  auto_advance: boolean;
  styles: Record<string, unknown>;
}

interface DatabaseAnswer {
  id: string;
  question_id: string;
  text: string;
  answer_media: string | null;
  redirect_to_link: boolean;
  redirect_url: string | null;
  related_products: string[];
  related_tags: string[];
  related_categories: string[];
  answer_order: number;
  is_default: boolean;
  weight: number;
  answer_collections?: DatabaseAnswerCollection[];
  metafield_conditions?: DatabaseMetafieldCondition[];
}

interface DatabaseAnswerCollection {
  shopify_collection_id: string;
  collection_order: number;
}

interface DatabaseMetafieldCondition {
  metafield_namespace: string;
  metafield_key: string;
  metafield_name: string;
  metafield_type: string;
  operator: string;
  expected_value: string;
  weight: number;
}

interface QuizUpdateRequestBody {
  title: string;
  quizType: string;
  internalTitle: string;
  internalDescription: string;
  quizImage: string | null;
  isActive: boolean;
  styles: StyleSettings;
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
    redirect_to_link: boolean;
    redirect_url: string;
    products: string[];
    tags: string[];
    categories: string[];
    collections: ShopifyCollection[];
    conditions: AnswerCondition[];
  }>;
}

interface ShopifyCollectionResponse {
  collections: ShopifyCollection[];
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const shopDomain = await getShopFromRequest(request);
    
    if (!shopDomain) {
      return NextResponse.json(
        { error: 'Shop domain not found' },
        { status: 401 }
      );
    }

    const { id: quizId } = await params;

    // Fetch quiz with all related data
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .eq('shop_domain', shopDomain)
      .single();

    if (quizError) {
      console.error('Quiz fetch error:', quizError);
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Fetch questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('question_order');

    if (questionsError) {
      console.error('Questions fetch error:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    // Fetch answers
    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select(`
        *,
        answer_collections(
          shopify_collection_id,
          collection_order
        ),
        metafield_conditions(
          metafield_namespace,
          metafield_key,
          metafield_name,
          metafield_type,
          operator,
          expected_value,
          weight
        )
      `)
      .in('question_id', questions.map(q => q.id))
      .order('answer_order');

    if (answersError) {
      console.error('Answers fetch error:', answersError);
      return NextResponse.json(
        { error: 'Failed to fetch answers' },
        { status: 500 }
      );
    }

    // Get all unique collection IDs from answers
    const collectionIds = new Set<string>();
    answers.forEach(answer => {
      if (answer.answer_collections) {
        answer.answer_collections.forEach((ac: DatabaseAnswerCollection) => {
          collectionIds.add(ac.shopify_collection_id);
        });
      }
    });

    // Fetch collection details from Shopify if we have collection IDs
    const collectionsMap: Record<string, ShopifyCollection> = {};
    if (collectionIds.size > 0) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/shopify/collections`, {
          headers: {
            'x-shopify-shop-domain': shopDomain
          }
        });
        if (response.ok) {
          const responseData = await response.json() as ShopifyCollectionResponse;
          const collections = responseData.collections || [];
          collections.forEach((collection: ShopifyCollection) => {
            collectionsMap[collection.id] = collection;
          });
        }
      } catch (error) {
        console.error('Failed to fetch collection details:', error);
      }
    }

    // Transform data to match frontend format
    const transformedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      showAnswers: q.show_answers,
      allowMultipleSelection: q.allow_multiple_selection,
      questionMedia: q.question_media
    }));

    const transformedAnswers = answers.map(a => ({
      id: a.id,
      text: a.text,
      questionId: a.question_id,
      answerMedia: a.answer_media,
      redirectToLink: a.redirect_to_link,
      redirectUrl: a.redirect_url || '',
      relatedCollections: a.answer_collections?.map((ac: DatabaseAnswerCollection) => {
        const collection = collectionsMap[ac.shopify_collection_id];
        return {
          id: ac.shopify_collection_id,
          title: collection?.title || 'Unknown Collection',
          handle: collection?.handle || '',
          description: collection?.description
        };
      }) || [],
      relatedProducts: a.related_products || [],
      relatedTags: a.related_tags || [],
      relatedCategories: a.related_categories || [],
      metafieldConditions: a.metafield_conditions?.map((mc: DatabaseMetafieldCondition): AnswerCondition => ({
        metafield: {
          id: `${mc.metafield_namespace}-${mc.metafield_key}`,
          key: mc.metafield_key,
          namespace: mc.metafield_namespace,
          value: mc.expected_value,
          type: mc.metafield_type,
          description: mc.metafield_name
        },
        operator: mc.operator as 'equals' | 'not_equals',
        value: mc.expected_value
      })) || []
    }));

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      quizType: quiz.quiz_type,
      internal_quiz_title: quiz.internal_quiz_title,
      internal_quiz_description: quiz.internal_quiz_description,
      is_active: quiz.is_active,
      auto_transition: quiz.auto_transition || false,
      selected_collections: quiz.selected_collections || [],
      quiz_image: quiz.quiz_image,
      styles: quiz.styles || {
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
      questions: transformedQuestions,
      answers: transformedAnswers
    };

    return NextResponse.json({
      success: true,
      quiz: quizData
    });

  } catch (error) {
    console.error('Get quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const shopDomain = await getShopFromRequest(request);
    
    if (!shopDomain) {
      return NextResponse.json(
        { error: 'Shop domain not found' },
        { status: 401 }
      );
    }

    const body = await request.json() as QuizUpdateRequestBody;
    const { id: quizId } = await params;

    // Verify quiz ownership
    const { data: existingQuiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('shop_domain', shopDomain)
      .single();

    if (quizError || !existingQuiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Update quiz
    const { data: updatedQuiz, error: updateError } = await supabase
      .from('quizzes')
      .update({
        title: body.title,
        quiz_type: body.quizType,
        internal_quiz_title: body.internalTitle,
        internal_quiz_description: body.internalDescription,
        quiz_image: body.quizImage,
        is_active: body.isActive,
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
        updated_at: new Date().toISOString()
      })
      .eq('id', quizId)
      .select()
      .single();

    if (updateError) {
      console.error('Quiz update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quiz' },
        { status: 500 }
      );
    }

    // Delete existing questions and answers (cascade delete)
    await supabase.from('questions').delete().eq('quiz_id', quizId);

    // Save new questions
    const questionsToInsert = body.questions.map((question, index: number) => ({
      quiz_id: quizId,
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
      console.error('Questions update error:', questionsError);
      return NextResponse.json(
        { error: 'Failed to update questions' },
        { status: 500 }
      );
    }

    // Create question ID mapping
    const questionIdMap: Record<string, string> = {};
    body.questions.forEach((frontendQuestion, index: number) => {
      questionIdMap[frontendQuestion.id] = savedQuestions[index].id;
    });

    // Save new answers
    const answersToInsert = (body.answers || []).map((answer, index: number) => ({
      question_id: questionIdMap[answer.questionId],
      text: answer.text,
      answer_media: answer.answer_media,
      redirect_to_link: answer.redirect_to_link,
      redirect_url: answer.redirect_url,
      answer_order: index + 1,
      is_default: false,
      weight: 1
    }));

    const { data: savedAnswers, error: answersError } = await supabase
      .from('answers')
      .insert(answersToInsert)
      .select();

    if (answersError) {
      console.error('Answers update error:', answersError);
      return NextResponse.json(
        { error: 'Failed to update answers' },
        { status: 500 }
      );
    }

    // Handle metafield conditions and collections (similar to save route)
    const answerIdMap: Record<string, string> = {};
    (body.answers || []).forEach((frontendAnswer, index: number) => {
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
      await supabase.from('metafield_conditions').insert(metafieldConditionsToInsert);
    }

    // Save answer-collection relationships
    const answerCollectionsToInsert: Array<{
      answer_id: string;
      shopify_collection_id: string;
      collection_order: number;
    }> = [];
    (body.answers || []).forEach((answer) => {
      if (answer.collections && answer.collections.length > 0) {
        answer.collections.forEach((collection, index: number) => {
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
      await supabase.from('answer_collections').insert(answerCollectionsToInsert);
    }

    return NextResponse.json({
      success: true,
      quiz_id: quizId,
      message: 'Quiz updated successfully'
    });

  } catch (error) {
    console.error('Update quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const shopDomain = await getShopFromRequest(request);
    
    if (!shopDomain) {
      return NextResponse.json(
        { error: 'Shop domain not found' },
        { status: 401 }
      );
    }

    const { id: quizId } = await params;

    // Verify quiz ownership
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('id')
      .eq('id', quizId)
      .eq('shop_domain', shopDomain)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Delete quiz (cascade will delete related data)
    const { error: deleteError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId);

    if (deleteError) {
      console.error('Quiz delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete quiz' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });

  } catch (error) {
    console.error('Delete quiz error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}