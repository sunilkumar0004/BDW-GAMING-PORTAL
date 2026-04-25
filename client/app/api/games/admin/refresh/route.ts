import { NextResponse } from 'next/server';
import { invalidateCache } from '@/lib/gameService';

export async function POST() {
  invalidateCache();
  return NextResponse.json({ message: '✅ Cache cleared. Games will reload on next request.' });
}
