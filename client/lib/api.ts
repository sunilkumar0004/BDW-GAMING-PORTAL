import { GamesResponse, Category } from '@/types/game';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchGames(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<GamesResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.category) qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);

  const res = await fetch(`${BASE_URL}/api/games?${qs.toString()}`, {
    next: { revalidate: 300 }, // 5 min cache for SSR
  });

  if (!res.ok) throw new Error('Failed to fetch games');
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE_URL}/api/games/meta/categories`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchGameById(id: string) {
  const res = await fetch(`${BASE_URL}/api/games/${id}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error('Game not found');
  return res.json();
}
