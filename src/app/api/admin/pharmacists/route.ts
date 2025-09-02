import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const list = await prisma.pharmacist.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load pharmacists" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const p = await prisma.pharmacist.create({ data: { name: body.name, email: body.email, phone: body.phone || null, bio: body.bio || null, isActive: true } })

    if (Array.isArray(body.locationIds)) {
      await prisma.pharmacistLocation.createMany({ data: body.locationIds.map((lid: string) => ({ pharmacistId: p.id, locationId: lid })) })
    }
    if (Array.isArray(body.treatmentIds)) {
      await prisma.pharmacistTreatment.createMany({ data: body.treatmentIds.map((tid: string) => ({ pharmacistId: p.id, treatmentId: tid })) })
    }
    return NextResponse.json(p, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create pharmacist" }, { status: 500 })
  }
}


