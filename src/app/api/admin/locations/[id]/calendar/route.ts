import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(req.url)
    const start = new Date(String(searchParams.get("start")))
    const end = new Date(String(searchParams.get("end")))

    const blocks = await prisma.locationBlock.findMany({
      where: { locationId: id, date: { gte: start, lte: end } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    })

    const bookings = await prisma.booking.findMany({
      where: {
        locationId: id,
        preferredDate: { gte: start, lte: end },
        status: { in: ["pending", "confirmed"] },
      },
      select: {
        id: true,
        customerName: true,
        preferredDate: true,
        preferredTime: true,
        status: true,
        treatment: { select: { name: true } },
        pharmacist: { select: { name: true } },
      },
      orderBy: [{ preferredDate: "asc" }, { preferredTime: "asc" }],
    })

    // pharmacist schedules overlay (day-of-week based)
    const dayIndexes = Array.from({ length: 7 }).map((_, i) => i)
    const schedules = await prisma.pharmacistSchedule.findMany({
      where: {
        dayOfWeek: { in: dayIndexes },
        pharmacist: { locations: { some: { locationId: id } } },
        isActive: true,
      },
      select: {
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        pharmacist: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ blocks, bookings, schedules })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to load calendar" }, { status: 500 })
  }
}


