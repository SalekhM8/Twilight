import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const pharmacist = await prisma.pharmacist.findUnique({ where: { id } })
    if (!pharmacist) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const locations = await prisma.pharmacistLocation.findMany({ where: { pharmacistId: id } })
    const treatments = await prisma.pharmacistTreatment.findMany({ where: { pharmacistId: id } })
    return NextResponse.json({ pharmacist, locationIds: locations.map(l=>l.locationId), treatmentIds: treatments.map(t=>t.treatmentId) })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load pharmacist' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const updated = await prisma.pharmacist.update({ where: { id }, data: { name: body.name, email: body.email, phone: body.phone, bio: body.bio, isActive: body.isActive } })

    if (Array.isArray(body.locationIds)) {
      await prisma.pharmacistLocation.deleteMany({ where: { pharmacistId: id } })
      await prisma.pharmacistLocation.createMany({ data: body.locationIds.map((lid: string) => ({ pharmacistId: id, locationId: lid })) })
    }
    if (Array.isArray(body.treatmentIds)) {
      await prisma.pharmacistTreatment.deleteMany({ where: { pharmacistId: id } })
      await prisma.pharmacistTreatment.createMany({ data: body.treatmentIds.map((tid: string) => ({ pharmacistId: id, treatmentId: tid })) })
    }
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update pharmacist" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    await prisma.pharmacist.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete pharmacist" }, { status: 500 })
  }
}


