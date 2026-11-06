import { NextResponse } from 'next/server';

import { fetchHomeVideoFeed } from '@/domains/home/api/homeVideoFeed.server';

export async function GET() {
  try {
    return NextResponse.json(await fetchHomeVideoFeed());
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
