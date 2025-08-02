import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface AnswerData {
  id: string;
  text: string;
  answer_media: string;
  collections: unknown[];
  categories: unknown[];
  products: unknown[];
  tags: unknown[];
}

interface QuestionData {
  id: string;
  text: string;
  question_media: string;
  show_answers: boolean;
  allow_multiple_selection: boolean;
  answers?: AnswerData[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Quiz slug is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Quiz'i slug ile getir
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          *,
          answers (*)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (quizError || !quiz) {
      return NextResponse.json(
        { error: 'Quiz not found or not active' },
        { status: 404 }
      );
    }

    // CORS headers ekle
    const response = NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.internal_quiz_title || quiz.title,
        description: quiz.internal_quiz_description || quiz.description,
        image: quiz.quiz_image || null,
        slug: quiz.slug,
        style_settings: quiz.styles,
        questions: quiz.questions?.map((question: QuestionData) => ({
          id: question.id,
          text: question.text,
          questionMedia: question.question_media,
          showAnswers: question.show_answers,
          allowMultipleSelection: question.allow_multiple_selection,
          answers: question.answers?.map((answer: AnswerData) => ({
            id: answer.id,
            text: answer.text,
            answerMedia: answer.answer_media,
            redirectToLink: answer.redirect_to_link,
            redirectUrl: answer.redirect_url,
            relatedCollections: answer.related_collections || []
          })) || []
        })) || []
      }
    });

    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;

  } catch (error) {
    console.error('Error fetching public quiz via proxy:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}