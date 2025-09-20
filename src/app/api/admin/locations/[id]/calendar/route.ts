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

    return NextResponse.json({ blocks, bookings })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to load calendar" }, { status: 500 })
  }
}


