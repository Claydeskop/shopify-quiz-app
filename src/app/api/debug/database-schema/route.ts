import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check current table structure
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'quizzes' })
      .select();

    if (error) {
      console.error('Schema check error:', error);
    }

    // Alternatively, query information_schema
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'quizzes')
      .eq('table_schema', 'public');

    return NextResponse.json({
      success: true,
      columns: columns || [],
      tableInfo: tableInfo || [],
      errors: {
        rpcError: error?.message,
        tableError: tableError?.message
      }
    });

  } catch (error) {
    console.error('Database schema debug error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Run migration
    const migrationSQL = `
      -- Quiz settings güncellemeleri için veritabanı migrasyonu
      
      -- 1. Slug kolonunu kaldır (eğer varsa)
      ALTER TABLE quizzes DROP COLUMN IF EXISTS slug;
      
      -- 2. Yeni kolonları ekle
      ALTER TABLE quizzes 
      ADD COLUMN IF NOT EXISTS auto_transition BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS selected_collections JSONB DEFAULT '[]'::jsonb;
      
      -- 3. Mevcut kayıtları güncelle (null değerleri düzelt)
      UPDATE quizzes 
      SET auto_transition = false 
      WHERE auto_transition IS NULL;
      
      UPDATE quizzes 
      SET selected_collections = '[]'::jsonb 
      WHERE selected_collections IS NULL;
    `;

    // Execute migration (this might not work directly, we might need to do it step by step)
    const steps = [
      'ALTER TABLE quizzes DROP COLUMN IF EXISTS slug',
      'ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS auto_transition BOOLEAN DEFAULT false',
      'ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS selected_collections JSONB DEFAULT \'[]\'::jsonb',
      'UPDATE quizzes SET auto_transition = false WHERE auto_transition IS NULL',
      'UPDATE quizzes SET selected_collections = \'[]\'::jsonb WHERE selected_collections IS NULL'
    ];

    const results = [];
    for (const step of steps) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: step });
        results.push({
          sql: step,
          success: !error,
          error: error?.message,
          data
        });
      } catch (err) {
        results.push({
          sql: step,
          success: false,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration attempted',
      results
    });

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