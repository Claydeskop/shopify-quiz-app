import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const shopDomain = request.headers.get('x-shopify-shop-domain') || 'demo-shop.myshopify.com';

    console.log('Fetching quizzes for shop:', shopDomain);

    // Fetch quizzes with basic info
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        id,
        title,
        slug,
        quiz_type,
        quiz_image,
        is_active,
        auto_transition,
        selected_collections,
        internal_quiz_title,
        internal_quiz_description,
        created_at,
        updated_at
      `)
      .eq('shop_domain', shopDomain)
      .order('created_at', { ascending: false });

    console.log('Quiz query result:', { quizzes, error, count: quizzes?.length });

    if (error) {
      console.error('Quiz fetch error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch quizzes',
          details: error.message,
          code: error.code 
        },
        { status: 500 }
      );
    }

    // Get question and answer counts for each quiz
    const quizzesWithCounts = await Promise.all(
      quizzes.map(async (quiz) => {
        try {
          // Get question count
          const { count: questionCount, error: qError } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('quiz_id', quiz.id);

          // Get answer count - join with questions to get quiz answers
          const { count: answerCount, error: aError } = await supabase
            .from('answers')
            .select('*, questions!inner(*)', { count: 'exact', head: true })
            .eq('questions.quiz_id', quiz.id);

          console.log(`Quiz ${quiz.id} counts:`, { questionCount, answerCount, qError, aError });

          return {
            ...quiz,
            questionCount: questionCount || 0,
            answerCount: answerCount || 0
          };
        } catch (error) {
          console.error(`Error getting counts for quiz ${quiz.id}:`, error);
          return {
            ...quiz,
            questionCount: 0,
            answerCount: 0
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      quizzes: quizzesWithCounts
    });

  } catch (error) {
    console.error('Quiz list error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}