import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'
import { getOrSetCache } from '@/lib/cache'

export async function GET() {
  try {
    await resetPreparedStatements()
    const locations = await getOrSetCache('locations_all', 60_000, async () => {
      return prisma.location.findMany({ orderBy: { name: 'asc' } })
    })
    const res = NextResponse.json(locations)
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
    return res
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
