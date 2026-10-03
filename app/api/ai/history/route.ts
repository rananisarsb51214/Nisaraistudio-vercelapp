export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserGenerationHistory, toggleFavoriteHistory, deleteHistoryItem 
} from '@/lib/firestore/history-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'default_user';
    const category = searchParams.get('category') as any;
    const toolId = searchParams.get('toolId') || undefined;
    const searchQuery = searchParams.get('q') || undefined;
    const onlyFavorites = searchParams.get('favorites') === 'true';

    const history = await getUserGenerationHistory(userId, {
      category,
      toolId,
      searchQuery,
      onlyFavorites,
      limit: 50,
    });

    return NextResponse.json({ success: true, history });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { historyId, isFavorite } = body;

    if (!historyId) {
      return NextResponse.json({ success: false, error: 'Missing historyId' }, { status: 400 });
    }

    await toggleFavoriteHistory(historyId, Boolean(isFavorite));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const historyId = searchParams.get('historyId');

    if (!historyId) {
      return NextResponse.json({ success: false, error: 'Missing historyId' }, { status: 400 });
    }

    await deleteHistoryItem(historyId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
