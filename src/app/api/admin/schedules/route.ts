import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Create or replace weekly schedule entries for a pharmacist
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { pharmacistId, weekly } = body as { pharmacistId: string; weekly: Array<{ dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean }> }
    if (!pharmacistId || !Array.isArray(weekly)) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    await prisma.pharmacistSchedule.deleteMany({ where: { pharmacistId } })
    await prisma.pharmacistSchedule.createMany({ data: weekly.map((w) => ({ pharmacistId, dayOfWeek: w.dayOfWeek, startTime: w.startTime, endTime: w.endTime, isActive: w.isActive ?? true })) })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to save schedules" }, { status: 500 })
  }
}


