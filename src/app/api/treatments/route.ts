import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'
import { getOrSetCache } from '@/lib/cache'

export async function GET() {
  try {
    await resetPreparedStatements()
    const now = new Date()
    const treatments = await getOrSetCache('treatments_active', 60_000, async () => {
      return prisma.treatment.findMany({
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
    })
    const res = NextResponse.json(treatments)
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
    return res
  } catch (error) {
    console.error('Failed to fetch treatments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treatments' },
      { status: 500 }
    )
  }
}
