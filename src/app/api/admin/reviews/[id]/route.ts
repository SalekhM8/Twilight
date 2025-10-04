import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const updated = await prisma.review.update({ where: { id }, data: body })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}


