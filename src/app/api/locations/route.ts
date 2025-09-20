import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'

export async function GET() {
  try {
    await resetPreparedStatements()
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(locations)
  } catch (error) {
    console.error('Failed to fetch locations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
