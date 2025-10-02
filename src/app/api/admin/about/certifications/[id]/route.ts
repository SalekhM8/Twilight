import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await resetPreparedStatements()
    const { id } = await ctx.params
    const body = await req.json()
    const updated = await prisma.certification.update({
      where: { id },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        order: typeof body.order === "number" ? body.order : undefined,
        isActive: body.isActive,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    await prisma.certification.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 })
  }
}


