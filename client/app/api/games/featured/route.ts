import { NextResponse } from 'next/server';
import { fetchAllGames } from '@/lib/gameService';

export async function GET() {
  try {
    const games = await fetchAllGames();
    return NextResponse.json(games.filter((g) => g.isFeatured).slice(0, 10));
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch featured games' }, { status: 500 });
  }
}
