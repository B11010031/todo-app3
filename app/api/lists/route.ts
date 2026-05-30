import { NextRequest, NextResponse } from 'next/server';
import { getLists, createList } from '@/lib/notion';

export async function GET() {
  try {
    const lists = await getLists();
    return NextResponse.json(lists);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const list = await createList(body);
    return NextResponse.json(list, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
