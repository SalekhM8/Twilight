import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const updated = await prisma.location.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        phone: body.phone,
        openingHours: body.openingHours,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    await prisma.location.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to delete location" }, { status: 500 })
  }
}

// Blocks management for location calendar
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    // body: { date: 'YYYY-MM-DD', startTime: 'HH:MM', endTime: 'HH:MM', isClosedDay?: boolean, reason?: string }
    const date = new Date(body.date + 'T00:00:00')
    const block = await prisma.locationBlock.create({
      data: {
        locationId: id,
        date,
        startTime: body.startTime || '00:00',
        endTime: body.endTime || '23:59',
        isClosedDay: !!body.isClosedDay,
        reason: body.reason || null,
      },
    })
    return NextResponse.json(block, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create block" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    // expects { blockId, ...updates }
    const updated = await prisma.locationBlock.update({ where: { id: body.blockId }, data: {
      date: body.date ? new Date(body.date + 'T00:00:00') : undefined,
      startTime: body.startTime,
      endTime: body.endTime,
      isClosedDay: body.isClosedDay,
      reason: body.reason,
    }})
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update block" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  // alias to PUT for convenience
  return PUT(req, ctx)
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const _ = await ctx.params
    const { searchParams } = new URL(req.url)
    const blockId = searchParams.get('blockId')!
    await prisma.locationBlock.delete({ where: { id: blockId } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to delete block" }, { status: 500 })
  }
}


