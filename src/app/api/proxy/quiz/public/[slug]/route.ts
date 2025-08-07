import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface AnswerData {
  id: string;
  text: string;
  answer_media: string;
  redirect_to_link: boolean;
  redirect_url: string;
  related_collections: unknown[];
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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json(
        { error: 'Quiz slug is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    console.log('Searching for quiz with slug:', slug);
    
    // Quiz'i önce slug ile getir, bulamazsa id ile dene
    let quiz, quizError;
    
    // İlk olarak slug ile ara
    const slugResult = await supabase
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

    quiz = slugResult.data;
    quizError = slugResult.error;

    // Eğer slug ile bulunamazsa, id ile dene (backward compatibility)
    if (quizError || !quiz) {
      console.log('Slug ile bulunamadı, ID ile deneniyor:', slug);
      
      const idResult = await supabase
        .from('quizzes')
        .select(`
          *,
          questions (
            *,
            answers (*)
          )
        `)
        .eq('id', slug)
        .eq('is_active', true)
        .single();
      
      quiz = idResult.data;
      quizError = idResult.error;
    }

    console.log('Quiz query result:', { quiz, quizError });

    if (quizError || !quiz) {
      console.error('Quiz not found error:', quizError);
      return NextResponse.json(
        { error: 'Quiz not found or not active', details: quizError?.message },
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