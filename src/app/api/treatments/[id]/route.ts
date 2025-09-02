import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const treatment = await prisma.treatment.findUnique({
      where: { id: params.id },
    })
    if (!treatment) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const locations = await prisma.treatmentLocation.findMany({
      where: { treatmentId: params.id },
      include: { location: true },
    })
    const pharmacists = await prisma.pharmacistTreatment.findMany({
      where: { treatmentId: params.id },
      include: { pharmacist: true },
    })

    return NextResponse.json({
      treatment,
      locations: locations.map((l) => l.location),
      pharmacists: pharmacists.map((p) => p.pharmacist),
    })
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
