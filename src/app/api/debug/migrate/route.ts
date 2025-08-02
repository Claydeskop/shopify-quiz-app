import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database migration...');

    // Step 1: Check current columns
    const { data: existingQuizzes, error: fetchError } = await supabase
      .from('quizzes')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing quizzes:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to check existing data', 
        details: fetchError.message 
      }, { status: 500 });
    }

    console.log('Current quiz structure:', existingQuizzes?.[0] ? Object.keys(existingQuizzes[0]) : 'No existing quizzes');

    // Step 2: Try to add new columns using raw SQL
    try {
      // First try to add auto_transition column
      const { data: autoTransitionResult, error: autoTransitionError } = await supabase
        .from('quizzes')
        .select('auto_transition')
        .limit(1);

      if (autoTransitionError && autoTransitionError.code === '42703') {
        // Column doesn't exist, this is expected
        console.log('auto_transition column does not exist, this is expected');
      }

      // Try to add selected_collections column
      const { data: collectionsResult, error: collectionsError } = await supabase
        .from('quizzes')
        .select('selected_collections')
        .limit(1);

      if (collectionsError && collectionsError.code === '42703') {
        // Column doesn't exist, this is expected
        console.log('selected_collections column does not exist, this is expected');
      }

      // Step 3: Since we can't run DDL directly, let's try to insert a test record with new fields
      const testData = {
        shop_domain: 'test-migration.myshopify.com',
        title: 'Migration Test Quiz',
        quiz_type: 'test',
        is_active: false,
        auto_transition: false,
        selected_collections: [],
        quiz_image: null,
        internal_quiz_title: 'Test',
        internal_quiz_description: 'Test Description',
        shopify_collection_ids: [],
        styles: {},
        settings: {}
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('quizzes')
        .insert(testData)
        .select()
        .single();

      if (insertError) {
        console.error('Insert test failed:', insertError);
        
        // If columns don't exist, we need manual migration
        if (insertError.code === '42703') {
          return NextResponse.json({
            success: false,
            message: 'Migration needed',
            error: 'New columns do not exist in database',
            action: 'Please run the following SQL manually in Supabase:',
            sql: `
-- Add new columns to quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS auto_transition BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS selected_collections JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS quiz_image TEXT;

-- Remove slug column if it exists
ALTER TABLE quizzes DROP COLUMN IF EXISTS slug;

-- Update existing records
UPDATE quizzes 
SET auto_transition = false 
WHERE auto_transition IS NULL;

UPDATE quizzes 
SET selected_collections = '[]'::jsonb 
WHERE selected_collections IS NULL;
            `,
            details: insertError.message
          });
        }

        return NextResponse.json({
          success: false,
          error: 'Insert failed',
          details: insertError.message
        }, { status: 500 });
      }

      // Clean up test record
      if (insertResult) {
        await supabase
          .from('quizzes')
          .delete()
          .eq('id', insertResult.id);
      }

      return NextResponse.json({
        success: true,
        message: 'Migration appears to be complete - new columns are working',
        testResult: insertResult
      });

    } catch (error) {
      console.error('Migration step error:', error);
      return NextResponse.json({
        success: false,
        error: 'Migration step failed',
        details: error instanceof Error ? error.message : String(error)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}