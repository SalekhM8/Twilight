import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function* generateSlots(start: string, end: string, minutes: number) {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  let current = sh * 60 + sm
  const stop = eh * 60 + em
  while (current + minutes <= stop) {
    const h = Math.floor(current / 60).toString().padStart(2, "0")
    const m = (current % 60).toString().padStart(2, "0")
    yield `${h}:${m}`
    current += minutes
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") // YYYY-MM-DD
    const treatmentId = searchParams.get("treatmentId")!
    const locationId = searchParams.get("locationId")!
    const pharmacistId = searchParams.get("pharmacistId") || undefined

    if (!date || !treatmentId || !locationId) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 })
    }

    const treatment = await prisma.treatment.findUnique({ where: { id: treatmentId } })
    if (!treatment) return NextResponse.json({ error: "Treatment not found" }, { status: 404 })

    const jsDate = new Date(date + "T00:00:00")
    const dow = jsDate.getUTCDay() // 0-6

    // Find eligible pharmacists (by treatment + location)
    const eligible = await prisma.pharmacistTreatment.findMany({
      where: { treatmentId },
      include: {
        pharmacist: {
          include: {
            locations: { where: { locationId } },
            schedules: { where: { dayOfWeek: dow, isActive: true } },
          },
        },
      },
    })

    let pharmacists = eligible
      .filter((pt) => pt.pharmacist.locations.length > 0 && pt.pharmacist.schedules.length > 0)
      .map((pt) => pt.pharmacist)

    if (pharmacistId) pharmacists = pharmacists.filter((p) => p.id === pharmacistId)
    if (pharmacists.length === 0) return NextResponse.json({ slots: [] })

    // Collect booked times for the date per pharmacist
    const bookings = await prisma.booking.findMany({
      where: {
        preferredDate: jsDate,
        locationId,
        pharmacistId: pharmacistId || undefined,
        treatmentId,
        status: { in: ["pending", "confirmed"] },
      },
    })

    const bookedByPharm = new Map<string, Set<string>>()
    for (const b of bookings) {
      if (!b.pharmacistId) continue
      if (!bookedByPharm.has(b.pharmacistId)) bookedByPharm.set(b.pharmacistId, new Set())
      bookedByPharm.get(b.pharmacistId)!.add(b.preferredTime)
    }

    const slotMinutes = treatment.duration

    // Exclude location blocks for that date
    const dayStart = new Date(jsDate)
    const dayEnd = new Date(jsDate)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const blocks = await prisma.locationBlock.findMany({ where: { locationId, NOT: [{ end: { lte: dayStart } }, { start: { gte: dayEnd } }] } })
    const results: { time: string; pharmacistId: string }[] = []

    for (const p of pharmacists) {
      for (const s of p.schedules) {
        for (const time of generateSlots(s.startTime, s.endTime, slotMinutes)) {
          const taken = bookedByPharm.get(p.id)?.has(time)
          if (taken) continue
          // Exclude times that fall within any block interval
          const [hh, mm] = time.split(":").map(Number)
          const slotStart = new Date(jsDate)
          slotStart.setHours(hh, mm, 0, 0)
          const slotEnd = new Date(slotStart)
          slotEnd.setMinutes(slotEnd.getMinutes() + slotMinutes)
          const blocked = blocks.some(b => !(slotEnd <= b.start || slotStart >= b.end))
          if (!blocked) results.push({ time, pharmacistId: p.id })
        }
      }
    }

    // If "don't mind" requested, group by time and allow if any pharmacist free
    if (!pharmacistId) {
      const grouped = new Map<string, number>()
      for (const r of results) grouped.set(r.time, (grouped.get(r.time) || 0) + 1)
      return NextResponse.json({ slots: Array.from(grouped.entries()).map(([time, count]) => ({ time, count })) })
    }

    return NextResponse.json({ slots: results })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
