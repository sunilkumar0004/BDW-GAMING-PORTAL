'use client';
import useSWR from 'swr';
import { GamesResponse, Category } from '@/types/game';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useGames(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  ids?: string;
  type?: string;
  featured?: boolean;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.category && params.category !== 'all') qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  if (params?.ids) qs.set('ids', params.ids);
  if (params?.type) qs.set('type', params.type);
  if (params?.featured) qs.set('featured', 'true');

  const url = `${API}/api/games?${qs.toString()}`;
  const { data, error, isLoading } = useSWR<GamesResponse>(url, fetcher, {
    revalidateOnFocus: false,
  });

  return { data, error, isLoading };
}

export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>(
    `${API}/api/games/meta/categories`,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { categories: data, error, isLoading };
}

export function useGame(id: string) {
  const { data, error, isLoading, mutate } = useSWR<{ game: any, related: any[] }>(
    id ? `${API}/api/games/${id}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { game: data?.game, related: data?.related, error, isLoading, mutate };
}

export function useFeaturedGames() {
  const { data, error, isLoading } = useSWR<any[]>(
    `${API}/api/games/featured`,
    fetcher,
    { revalidateOnFocus: false }
  );
  return { games: data, error, isLoading };
}
