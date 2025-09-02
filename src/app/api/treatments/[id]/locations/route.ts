import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const treatmentLocations = await prisma.treatmentLocation.findMany({
      where: { treatmentId: id },
      include: { location: true },
    })

    const locations = treatmentLocations.map((tl) => tl.location)
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Failed to fetch treatment locations:', error)
    return NextResponse.json({ error: 'Failed to fetch treatment locations' }, { status: 500 })
  }
}
