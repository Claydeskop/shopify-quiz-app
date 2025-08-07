import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Query to get the column information for the answers table
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'answers')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (error) {
      console.error('Error fetching answers table schema:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch table schema',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Check if the problematic columns exist
    const columnNames = columns?.map(col => col.column_name) || [];
    const missingColumns: string[] = [];
    const existingColumns: string[] = [];

    const requiredColumns = ['related_products', 'related_tags', 'related_categories'];
    
    requiredColumns.forEach(colName => {
      if (columnNames.includes(colName)) {
        existingColumns.push(colName);
      } else {
        missingColumns.push(colName);
      }
    });

    // Also try a simple select to see what happens
    let sampleError = null;
    try {
      await supabase
        .from('answers')
        .select('related_products, related_tags, related_categories')
        .limit(1);
    } catch (selectError) {
      sampleError = selectError;
    }

    return NextResponse.json({
      success: true,
      table_name: 'answers',
      all_columns: columns,
      total_columns: columns?.length || 0,
      required_columns_check: {
        existing: existingColumns,
        missing: missingColumns,
        all_required: requiredColumns
      },
      sample_select_error: sampleError,
      analysis: {
        problem_identified: missingColumns.length > 0,
        description: missingColumns.length > 0 
          ? `The save route is trying to insert into columns (${missingColumns.join(', ')}) that don't exist in the answers table.`
          : 'All required columns exist in the answers table.',
        recommendation: missingColumns.length > 0
          ? 'Either add these columns to the answers table or modify the save route to not insert into these columns.'
          : 'No schema changes needed.'
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}