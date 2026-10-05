import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/categories';

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json(
      { success: true, data: categories },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}