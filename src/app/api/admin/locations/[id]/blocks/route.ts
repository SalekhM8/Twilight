import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
const db = prisma as any

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const blocks = await db.locationBlock.findMany({ where: { locationId: id }, orderBy: { start: 'asc' } })
    return NextResponse.json(blocks)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load blocks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { start, end, reason } = body as { start: string; end: string; reason?: string }
    if (!start || !end) return NextResponse.json({ error: 'Missing start/end' }, { status: 400 })
    const s = new Date(start)
    const e = new Date(end)
    if (isNaN(s.getTime()) || isNaN(e.getTime()) || s >= e) return NextResponse.json({ error: 'Invalid range' }, { status: 400 })

    const block = await db.locationBlock.create({ data: { locationId: id, start: s, end: e, reason: reason || null } })
    return NextResponse.json(block, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create block' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(req.url)
    const blockId = searchParams.get('blockId')
    if (!blockId) return NextResponse.json({ error: 'blockId required' }, { status: 400 })
    await db.locationBlock.delete({ where: { id: blockId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 })
  }
}


