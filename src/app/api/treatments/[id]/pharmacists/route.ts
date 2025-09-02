import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const { searchParams } = new URL(request.url)
    const locationId = searchParams.get('locationId')

    const pharmacistTreatments = await prisma.pharmacistTreatment.findMany({
      where: { treatmentId: id },
      include: {
        pharmacist: {
          include: {
            locations: { where: locationId ? { locationId } : undefined },
          },
        },
      },
    })

    const availablePharmacists = pharmacistTreatments
      .filter((pt) => (locationId ? pt.pharmacist.locations.length > 0 : true))
      .map((pt) => pt.pharmacist)
      .filter((pharmacist) => pharmacist.isActive)

    return NextResponse.json(availablePharmacists)
  } catch (error) {
    console.error('Failed to fetch treatment pharmacists:', error)
    return NextResponse.json({ error: 'Failed to fetch treatment pharmacists' }, { status: 500 })
  }
}
