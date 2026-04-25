import { NextResponse } from 'next/server';
import { fetchAllGames } from '@/lib/gameService';

export async function GET(request: Request) {
  try {
    let games = await fetchAllGames();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '60';
    const ids = searchParams.get('ids');

    if (ids) {
      const idList = ids.split(',').map(id => id.trim());
      games = games.filter(g => idList.includes(g.id));
    }

    if (category && category !== 'all' && !ids) {
      const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const reqSlug = slugify(decodeURIComponent(category));
      games = games.filter((g) => slugify(g.category) === reqSlug);
    }

    if (search) {
      const term = search.toLowerCase();
      games = games.filter(
        (g) =>
          g.title.toLowerCase().includes(term) ||
          g.category.toLowerCase().includes(term) ||
          (g.description || '').toLowerCase().includes(term)
      );
    }

    const total = games.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(2000, Math.max(1, parseInt(limit, 10)));
    const start = (pageNum - 1) * limitNum;
    const paginated = games.slice(start, start + limitNum);

    return NextResponse.json({
      games: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    console.error('Error in /api/games:', error.message);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
