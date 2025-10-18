import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrSetCache } from '@/lib/cache'

export async function GET() {
  try {
    const reviews = await getOrSetCache('reviews_public', 60_000, async () => {
      return prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take: 100 })
    })
    const res = NextResponse.json(reviews)
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
    return res
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rating = Number(body.rating)
    if (!body.name || !body.comment || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid review' }, { status: 400 })
    }
    const review = await prisma.review.create({
      data: {
        name: body.name,
        email: body.email || null,
        rating,
        comment: body.comment,
        locationId: body.locationId || null,
        isApproved: false,
      },
    })
    return NextResponse.json(review, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}


