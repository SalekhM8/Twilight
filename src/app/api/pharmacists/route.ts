import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'
import { getOrSetCache } from '@/lib/cache'

export async function GET() {
  try {
    await resetPreparedStatements()
    const pharmacists = await getOrSetCache('pharmacists_active', 60_000, async () => {
      return prisma.pharmacist.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
    })
    const res = NextResponse.json(pharmacists)
    res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60')
    return res
  } catch (error) {
    console.error('Failed to fetch pharmacists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pharmacists' },
      { status: 500 }
    )
  }
}
