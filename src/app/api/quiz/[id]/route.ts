import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getShopFromRequest } from '@/lib/shopify-auth';

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
      relatedCollections: a.answer_collections?.map((ac: any) => ({
        id: ac.shopify_collection_id
      })) || [],
      metafieldConditions: a.metafield_conditions?.map((mc: any) => ({
        id: `${mc.metafield_namespace}-${mc.metafield_key}`,
        metafield: {
          id: `${mc.metafield_namespace}-${mc.metafield_key}`,
          key: mc.metafield_key,
          namespace: mc.metafield_namespace,
          name: mc.metafield_name,
          type: mc.metafield_type
        },
        operator: mc.operator,
        value: mc.expected_value
      })) || []
    }));

    const quizData = {
      id: quiz.id,
      title: quiz.title,
      quizType: quiz.quiz_type,
      internalQuizTitle: quiz.internal_quiz_title,
      internalQuizDescription: quiz.internal_quiz_description,
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

    const body = await request.json();
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
        internal_quiz_title: body.internalQuizTitle,
        internal_quiz_description: body.internalQuizDescription,
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
    const questionsToInsert = body.questions.map((question: any, index: number) => ({
      quiz_id: quizId,
      text: question.text,
      show_answers: question.showAnswers,
      allow_multiple_selection: question.allowMultipleSelection,
      question_media: question.questionMedia,
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
    body.questions.forEach((frontendQuestion: any, index: number) => {
      questionIdMap[frontendQuestion.id] = savedQuestions[index].id;
    });

    // Save new answers
    const answersToInsert = body.answers.map((answer: any, index: number) => ({
      question_id: questionIdMap[answer.questionId],
      text: answer.text,
      answer_media: answer.answerMedia,
      redirect_to_link: answer.redirectToLink,
      redirect_url: answer.redirectUrl,
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
    body.answers.forEach((frontendAnswer: any, index: number) => {
      answerIdMap[frontendAnswer.id] = savedAnswers[index].id;
    });

    // Save metafield conditions
    const metafieldConditionsToInsert: any[] = [];
    body.answers.forEach((answer: any) => {
      if (answer.metafieldConditions && answer.metafieldConditions.length > 0) {
        answer.metafieldConditions.forEach((condition: any) => {
          if (condition.metafield && condition.value) {
            metafieldConditionsToInsert.push({
              answer_id: answerIdMap[answer.id],
              metafield_namespace: condition.metafield.namespace,
              metafield_key: condition.metafield.key,
              metafield_name: condition.metafield.name,
              metafield_type: condition.metafield.type,
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
    const answerCollectionsToInsert: any[] = [];
    body.answers.forEach((answer: any) => {
      if (answer.relatedCollections && answer.relatedCollections.length > 0) {
        answer.relatedCollections.forEach((collection: any, index: number) => {
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