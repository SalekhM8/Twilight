import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
const db = prisma as any

function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay()
  const diff = (day + 6) % 7 // Monday as first day
  d.setUTCDate(d.getUTCDate() - diff)
  return d
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(req.url)
    const weekStartParam = searchParams.get('weekStart') // YYYY-MM-DD
    const treatmentId = searchParams.get('treatmentId') || undefined
    const pharmacistId = searchParams.get('pharmacistId') || undefined

    const today = new Date()
    const weekStart = weekStartParam ? new Date(weekStartParam + 'T00:00:00Z') : startOfWeek(today)
    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)

    const bookings = await prisma.booking.findMany({
      where: {
        locationId: id,
        preferredDate: { gte: weekStart, lt: weekEnd },
        ...(treatmentId ? { treatmentId } : {}),
        ...(pharmacistId ? { pharmacistId } : {}),
        status: { in: ['pending','confirmed'] },
      },
      include: { treatment: true, pharmacist: true },
      orderBy: { preferredDate: 'asc' },
    })

    let blocks: any[] = []
    try {
      blocks = await db.locationBlock.findMany({
        where: { locationId: id, NOT: [{ end: { lte: weekStart } }, { start: { gte: weekEnd } }] },
        orderBy: { start: 'asc' },
      })
    } catch {
      blocks = [] // table likely not migrated yet; degrade gracefully
    }

    return NextResponse.json({ weekStart, weekEnd, bookings, blocks })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load calendar' }, { status: 500 })
  }
}


