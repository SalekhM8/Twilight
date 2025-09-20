import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json().catch(()=> ({}))
    const { searchParams } = new URL(req.url)
    const blockId = (body as any).blockId || searchParams.get('blockId')

    if (blockId) {
      // Update a block
      // Guardrail: prevent overlap on same date
      const candidate = {
        startTime: (body as any).startTime as string,
        endTime: (body as any).endTime as string,
        date: (body as any).date ? new Date((body as any).date + 'T00:00:00') : undefined,
      }
      if (candidate.date && candidate.startTime && candidate.endTime) {
        const overlaps = await prisma.locationBlock.findFirst({
          where: {
            id: { not: String(blockId) },
            locationId: id,
            date: candidate.date,
            OR: [
              { AND: [{ startTime: { lte: candidate.startTime } }, { endTime: { gt: candidate.startTime } }] },
              { AND: [{ startTime: { lt: candidate.endTime } }, { endTime: { gte: candidate.endTime } }] },
              { AND: [{ startTime: { gte: candidate.startTime } }, { endTime: { lte: candidate.endTime } }] },
            ],
          },
        })
        if (overlaps) return NextResponse.json({ error: 'Overlaps existing block' }, { status: 409 })
      }
      const updated = await prisma.locationBlock.update({ where: { id: String(blockId) }, data: {
        date: (body as any).date ? new Date((body as any).date + 'T00:00:00') : undefined,
        startTime: (body as any).startTime,
        endTime: (body as any).endTime,
        isClosedDay: (body as any).isClosedDay,
        reason: (body as any).reason,
      }})
      return NextResponse.json(updated)
    }

    // Update location fields
    const updatedLoc = await prisma.location.update({
      where: { id },
      data: {
        name: (body as any).name,
        code: (body as any).code,
        address: (body as any).address,
        phone: (body as any).phone,
        openingHours: (body as any).openingHours,
      },
    })
    return NextResponse.json(updatedLoc)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(_req.url)
    const blockId = searchParams.get('blockId')
    if (blockId) {
      await prisma.locationBlock.delete({ where: { id: blockId } })
      return NextResponse.json({ ok: true })
    }
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

    // Guardrail: closed day cannot be created if bookings exist
    if (body.isClosedDay) {
      const count = await prisma.booking.count({ where: { locationId: id, preferredDate: date, status: { in: ['pending','confirmed'] } } })
      if (count > 0) return NextResponse.json({ error: 'Closed day conflicts with existing bookings', count }, { status: 409 })
    }

    // Guardrail: overlap detection with existing blocks
    if (!body.isClosedDay) {
      const overlap = await prisma.locationBlock.findFirst({
        where: {
          locationId: id,
          date,
          OR: [
            { AND: [{ startTime: { lte: body.startTime } }, { endTime: { gt: body.startTime } }] },
            { AND: [{ startTime: { lt: body.endTime } }, { endTime: { gte: body.endTime } }] },
            { AND: [{ startTime: { gte: body.startTime } }, { endTime: { lte: body.endTime } }] },
          ],
        },
      })
      if (overlap) return NextResponse.json({ error: 'Overlaps existing block' }, { status: 409 })
    }
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

// Note: block updates are handled via PATCH with blockId; block deletes via DELETE with ?blockId


