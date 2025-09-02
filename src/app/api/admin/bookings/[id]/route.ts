import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await req.json()
    const { status, comment } = body as { status?: string; comment?: string }

    // Optionally append admin comment to notes for now (separate field could be added later)
    let notesUpdate: string | undefined
    if (typeof comment === 'string' && comment.trim().length > 0) {
      const existing = await prisma.booking.findUnique({ where: { id }, select: { notes: true } })
      const prefix = existing?.notes ? existing.notes + "\n" : ''
      notesUpdate = `${prefix}[Admin] ${comment.trim()}`
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: status,
        ...(notesUpdate ? { notes: notesUpdate } : {}),
      },
      include: { treatment: true, location: true, pharmacist: true },
    })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}


