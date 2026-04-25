import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/gameService';

export async function GET() {
  try {
    const cats = await getCategories();
    return NextResponse.json(cats);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
