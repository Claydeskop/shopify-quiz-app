import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        quiz_type,
        slug,
        is_active,
        internal_quiz_title,
        internal_quiz_description,
        created_at,
        updated_at,
        questions!inner(count)
      `)
      .eq('shop_domain', shopDomain)
      .order('created_at', { ascending: false });

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
        // Get question count
        const { count: questionCount } = await supabase
          .from('questions')
          .select('*', { count: 'exact', head: true })
          .eq('quiz_id', quiz.id);

        // Get answer count - join with questions to get quiz answers
        const { count: answerCount } = await supabase
          .from('answers')
          .select('*, questions!inner(*)', { count: 'exact', head: true })
          .eq('questions.quiz_id', quiz.id);

        return {
          ...quiz,
          questionCount: questionCount || 0,
          answerCount: answerCount || 0
        };
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