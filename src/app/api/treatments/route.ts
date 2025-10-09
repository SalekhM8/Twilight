import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'

export async function GET() {
  try {
    await resetPreparedStatements()
    const now = new Date()
    const treatments = await prisma.treatment.findMany({
      where: {
        isActive: true,
        OR: [
          { seasonStart: null },
          { seasonEnd: null },
          {
            AND: [
              { seasonStart: { lte: now } },
              { seasonEnd: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(treatments)
  } catch (error) {
    console.error('Failed to fetch treatments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatments' },
      { status: 500 }
    )
  }
}
