import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await resetPreparedStatements()
    const { id } = await ctx.params
    const body = await req.json()
    const updated = await prisma.teamMember.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        bio: body.bio,
        order: typeof body.order === "number" ? body.order : undefined,
        isActive: body.isActive,
      },
    })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: "Failed to update team member" }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    await prisma.teamMember.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete team member" }, { status: 500 })
  }
}


