import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'
const db = prisma as any

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      treatmentId,
      locationId,
      pharmacistId,
      customerName,
      customerEmail,
      customerPhone,
      preferredDate,
      preferredTime,
      notes
    } = body
    
    // Validate required fields
    if (!treatmentId || !locationId || !customerName || !customerEmail || !customerPhone || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // If no pharmacistId provided, auto-assign based on availability at the selected time
    let assignedPharmacistId: string | null = pharmacistId || null
    if (!assignedPharmacistId) {
      // find eligible pharmacists for treatment at location who are scheduled that day
      const jsDate = new Date(preferredDate + "T00:00:00")
      const dow = jsDate.getUTCDay()
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
      const candidates = eligible
        .filter((pt) => pt.pharmacist.locations.length > 0 && pt.pharmacist.schedules.length > 0)
        .map((pt) => pt.pharmacist)

      // filter by schedules covering the preferredTime
      const [hh, mm] = String(preferredTime).split(":").map(Number)
      const minutesOfDay = hh * 60 + mm
      const withinSchedule = candidates.filter((p) =>
        p.schedules.some((s) => {
          const [sh, sm] = s.startTime.split(":").map(Number)
          const [eh, em] = s.endTime.split(":").map(Number)
          const start = sh * 60 + sm
          const end = eh * 60 + em
          return minutesOfDay >= start && minutesOfDay < end
        })
      )
      if (withinSchedule.length > 0) {
        // exclude already booked at that time
        const existing = await prisma.booking.findMany({
          where: {
            preferredDate: new Date(preferredDate),
            preferredTime,
            locationId,
            treatmentId,
            pharmacistId: { in: withinSchedule.map((p) => p.id) },
            status: { in: ["pending", "confirmed"] },
          },
          select: { pharmacistId: true },
        })
        const busy = new Set(existing.map((b) => b.pharmacistId || ""))
        const free = withinSchedule.find((p) => !busy.has(p.id))
        assignedPharmacistId = free ? free.id : withinSchedule[0].id
      }
    }

    // Prevent booking inside a blocked interval
    const day = new Date(preferredDate + "T00:00:00")
    const [hh, mm] = String(preferredTime).split(":").map(Number)
    const slotStart = new Date(day)
    slotStart.setHours(hh, mm, 0, 0)
    const slotEnd = new Date(slotStart)
    slotEnd.setMinutes(slotEnd.getMinutes() + (typeof treatmentId === 'string' ? (await prisma.treatment.findUnique({ where: { id: treatmentId } }))?.duration || 30 : 30))
    const overlappingBlock = await db.locationBlock.findFirst({ where: { locationId, NOT: [{ end: { lte: slotStart } }, { start: { gte: slotEnd } }] } })
    if (overlappingBlock) {
      return NextResponse.json({ error: 'Selected time is blocked for this location' }, { status: 409 })
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        treatmentId,
        locationId,
        pharmacistId: assignedPharmacistId,
        customerName,
        customerEmail,
        customerPhone,
        preferredDate: new Date(preferredDate),
        preferredTime,
        notes: notes || null,
        status: 'pending'
      },
      include: {
        treatment: true,
        location: true,
        pharmacist: true
      }
    })
    
    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await resetPreparedStatements()
    const bookings = await prisma.booking.findMany({
      include: {
        treatment: true,
        location: true,
        pharmacist: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
