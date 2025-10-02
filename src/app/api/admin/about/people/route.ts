import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"

export async function GET() {
  try {
    await resetPreparedStatements()
    const list = await prisma.teamMember.findMany({ orderBy: { order: "asc" } })
    return NextResponse.json(list)
  } catch (e) {
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await resetPreparedStatements()
    const body = await req.json()
    const item = await prisma.teamMember.create({
      data: {
        name: body.name,
        role: body.role,
        bio: body.bio || null,
        order: typeof body.order === "number" ? body.order : 0,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 })
  }
}


