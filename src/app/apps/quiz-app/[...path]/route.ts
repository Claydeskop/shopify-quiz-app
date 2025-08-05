import { NextRequest, NextResponse } from 'next/server';
import { GET as proxyQuizGet } from '@/app/api/proxy/quiz/public/[slug]/route';

// App proxy route handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path || [];
    
    console.log('App proxy request:', {
      path,
      fullPath: `/apps/quiz-app/${path.join('/')}`
    });

    // Handle quiz public endpoints: /apps/quiz-app/api/quiz/public/[slug]
    if (path.length === 4 && 
        path[0] === 'api' && 
        path[1] === 'quiz' && 
        path[2] === 'public' && 
        path[3]) {
      
      const slug = path[3];
      return proxyQuizGet(request, { params: Promise.resolve({ slug }) });
    }

    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('App proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return GET(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return GET(request, { params });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return GET(request, { params });
}

export async function OPTIONS(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return GET(request, { params });
}