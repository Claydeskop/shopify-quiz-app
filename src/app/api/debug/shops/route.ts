// Debug route to check stored shops
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  // Only allow debug endpoints in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  try {
    const { data, error } = await supabase
      .from('shops')
      .select('shop_domain, scope, installed_at, updated_at')
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      shops: data,
      count: data?.length || 0,
      message: 'These are the shops that have installed your app'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shops' },
      { status: 500 }
    );
  }
}