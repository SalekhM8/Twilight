import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"

export async function GET() {
  try {
    await resetPreparedStatements()
    const locations = await prisma.location.findMany({ orderBy: { name: "asc" } })
    return NextResponse.json(locations)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to load locations" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const location = await prisma.location.create({
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        phone: body.phone,
        openingHours: body.openingHours || {
          monday: { open: "09:00", close: "17:00" },
          tuesday: { open: "09:00", close: "17:00" },
          wednesday: { open: "09:00", close: "17:00" },
          thursday: { open: "09:00", close: "17:00" },
          friday: { open: "09:00", close: "17:00" },
          saturday: { open: "10:00", close: "16:00" },
          sunday: { open: "closed", close: "closed" },
        },
      },
    })
    return NextResponse.json(location, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Failed to create location" }, { status: 500 })
  }
}


