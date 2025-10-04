import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const list = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const item = await prisma.review.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}


