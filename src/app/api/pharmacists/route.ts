import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'

export async function GET() {
  try {
    await resetPreparedStatements()
    const pharmacists = await prisma.pharmacist.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(pharmacists)
  } catch (error) {
    console.error('Failed to fetch pharmacists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pharmacists' },
      { status: 500 }
    )
  }
}
