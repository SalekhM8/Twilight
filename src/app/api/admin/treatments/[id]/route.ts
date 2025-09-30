import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const updateData: any = {
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price !== undefined ? Number(body.price) : undefined,
      duration: body.duration !== undefined ? Number(body.duration) : undefined,
      isTravel: body.isTravel !== undefined ? Boolean(body.isTravel) : undefined,
      showSlots: body.showSlots !== undefined ? Boolean(body.showSlots) : undefined,
      isActive: body.isActive,
    }
    const updated = await prisma.treatment.update({
      where: { id },
      data: updateData,
    })

    if (Array.isArray(body.locationIds)) {
      await prisma.treatmentLocation.deleteMany({ where: { treatmentId: id } })
      await prisma.treatmentLocation.createMany({ data: body.locationIds.map((lid: string) => ({ treatmentId: id, locationId: lid })) })
    }

    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update treatment" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    await prisma.treatment.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete treatment" }, { status: 500 })
  }
}


