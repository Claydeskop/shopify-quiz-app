import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Try to select new columns to see if they exist
    const { data: testQuery, error: testError } = await supabase
      .from('quizzes')
      .select('auto_transition, selected_collections, quiz_image')
      .limit(1);

    if (testError) {
      return NextResponse.json({
        success: false,
        error: 'New columns do not exist',
        details: testError.message,
        migrationNeeded: true,
        sql: `
-- Run this SQL in Supabase to add missing columns:
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS auto_transition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS selected_collections JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS quiz_image TEXT;

-- Remove slug if exists
ALTER TABLE quizzes DROP COLUMN IF EXISTS slug;

-- Update existing records
UPDATE quizzes 
SET auto_transition = false 
WHERE auto_transition IS NULL;

UPDATE quizzes 
SET selected_collections = '[]'::jsonb 
WHERE selected_collections IS NULL;
        `
      });
    }

    // Check existing quiz data
    const { data: existingQuizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(3);

    return NextResponse.json({
      success: true,
      message: 'All columns exist',
      migrationCompleted: true,
      sampleData: existingQuizzes,
      columnCheck: {
        auto_transition: existingQuizzes?.[0]?.hasOwnProperty('auto_transition'),
        selected_collections: existingQuizzes?.[0]?.hasOwnProperty('selected_collections'),
        quiz_image: existingQuizzes?.[0]?.hasOwnProperty('quiz_image')
      }
    });

  } catch (error) {
    console.error('Column check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}