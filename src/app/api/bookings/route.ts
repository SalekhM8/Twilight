import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'
import { renderBookingEmail, sendMail } from '@/lib/email'

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
    
    // Validate required fields (allow slotless bookings when treatment.showSlots=false)
    if (!treatmentId || !locationId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    const treatment = await prisma.treatment.findUnique({ where: { id: treatmentId } })
    if (!treatment) return NextResponse.json({ error: 'Treatment not found' }, { status: 404 })
    const requiresSlots = !!treatment.showSlots
    // Enforce seasonal window
    const tAny = treatment as any
    if (tAny.seasonStart && tAny.seasonEnd) {
      // When slots are required we expect a preferredDate; otherwise allow booking only if now is within season
      const targetDate = requiresSlots && preferredDate ? new Date(preferredDate + 'T00:00:00') : new Date()
      if (!(new Date(tAny.seasonStart) <= targetDate && new Date(tAny.seasonEnd) >= targetDate)) {
        return NextResponse.json({ error: 'Treatment is out of season' }, { status: 400 })
      }
    }
    if (requiresSlots) {
      if (!preferredDate || !preferredTime) {
        return NextResponse.json({ error: 'Date and time are required for this treatment' }, { status: 400 })
      }
    }
    
    // If no pharmacistId provided, auto-assign based on availability (only when a concrete time exists)
    let assignedPharmacistId: string | null = pharmacistId || null
    if (!assignedPharmacistId && requiresSlots) {
      // find eligible pharmacists for treatment at location who are scheduled that day
      const jsDate = new Date(preferredDate + "T00:00:00")
      // Use local day-of-week to match how admins configure weekly schedules
      const dow = jsDate.getDay()
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
      const atLocation = eligible.filter((pt) => pt.pharmacist.locations.length > 0).map((pt)=> pt.pharmacist)
      const candidates = atLocation.length > 0 ? atLocation : []

      // filter by schedules covering the preferredTime
      const [hh, mm] = String(preferredTime).split(":").map(Number)
      const minutesOfDay = hh * 60 + mm
      const withinSchedule = candidates.filter((p) => p.schedules.some((s) => {
        const [sh, sm] = s.startTime.split(":").map(Number)
        const [eh, em] = s.endTime.split(":").map(Number)
        const start = sh * 60 + sm
        const end = eh * 60 + em
        return minutesOfDay >= start && minutesOfDay < end
      }))
      const pool = withinSchedule.length > 0 ? withinSchedule : candidates
      if (pool.length > 0) {
        // exclude already booked at that time
        const existing = await prisma.booking.findMany({
          where: {
            preferredDate: new Date(preferredDate),
            preferredTime,
            locationId,
            treatmentId,
            pharmacistId: { in: pool.map((p) => p.id) },
            status: { in: ["pending", "confirmed"] },
          },
          select: { pharmacistId: true },
        })
        const busy = new Set(existing.map((b) => b.pharmacistId || ""))
        const free = pool.find((p) => !busy.has(p.id))
        assignedPharmacistId = free ? free.id : pool[0].id
      }
    }

    // Prevent booking inside a blocked interval (only when a time is provided)
    if (requiresSlots) {
      const day = new Date(preferredDate + "T00:00:00")
      const [hh, mm] = String(preferredTime).split(":").map(Number)
      const slotStart = new Date(day)
      slotStart.setHours(hh, mm, 0, 0)
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + (typeof treatmentId === 'string' ? (await prisma.treatment.findUnique({ where: { id: treatmentId } }))?.duration || 30 : 30))
      const overlappingBlock = await prisma.locationBlock.findFirst({ where: { locationId, NOT: [{ end: { lte: slotStart } }, { start: { gte: slotEnd } }] } })
      if (overlappingBlock) {
        return NextResponse.json({ error: 'Selected time is blocked for this location' }, { status: 409 })
      }
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
        preferredDate: requiresSlots ? new Date(preferredDate) : new Date(),
        preferredTime: requiresSlots ? preferredTime : 'TBD',
        notes: notes || null,
        status: 'pending'
      },
      include: {
        treatment: true,
        location: true,
        pharmacist: true
      }
    })
    // Fire-and-forget email send (never block response)
    ;(async ()=>{
      try {
        const html = renderBookingEmail({
          customerName,
          treatmentName: booking.treatment.name,
          locationName: booking.location.name,
          locationPhone: booking.location.phone,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          durationMins: booking.treatment.duration,
          price: booking.treatment.price,
          notes: booking.notes,
          bookingId: booking.id,
        })
        await sendMail({
          to: booking.customerEmail,
          subject: `Booking received: ${booking.treatment.name}`,
          html,
        })
      } catch (e) {
        console.error('email send failed', e)
      }
    })()

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    await resetPreparedStatements()
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id') || searchParams.get('bookingId')
    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { treatment: true, location: true, pharmacist: true },
      })
      if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      return NextResponse.json(booking)
    }
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
