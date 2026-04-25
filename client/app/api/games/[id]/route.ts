import { NextResponse } from 'next/server';
import { fetchAllGames } from '@/lib/gameService';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const games = await fetchAllGames();
    const game = games.find((g) => g.id === params.id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    const related = games
      .filter((g) => g.category === game.category && g.id !== game.id)
      .slice(0, 12);
    return NextResponse.json({ game, related });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}
