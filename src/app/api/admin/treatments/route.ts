import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const treatments = await prisma.treatment.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(treatments)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load treatments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const treatment = await prisma.treatment.create({
      data: {
        name: body.name,
        description: body.description || null,
        category: body.category || body.name,
        price: Number(body.price),
        duration: Number(body.duration) || 30,
        isTravel: body.isTravel ? true : false,
        isNhs: body.isNhs ? true : false,
        showSlots: body.showSlots !== undefined ? Boolean(body.showSlots) : true,
        isActive: body.isActive ?? true,
      },
    })

    // Assign locations if provided
    if (Array.isArray(body.locationIds) && body.locationIds.length > 0) {
      await prisma.treatmentLocation.createMany({
        data: body.locationIds.map((id: string) => ({ treatmentId: treatment.id, locationId: id })),
      })
    }

    return NextResponse.json(treatment, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create treatment" }, { status: 500 })
  }
}


