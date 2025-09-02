import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const treatment = await prisma.treatment.findUnique({
      where: { id },
    })
    if (!treatment) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const locations = await prisma.treatmentLocation.findMany({
      where: { treatmentId: id },
      include: { location: true },
    })
    const pharmacists = await prisma.pharmacistTreatment.findMany({
      where: { treatmentId: id },
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
