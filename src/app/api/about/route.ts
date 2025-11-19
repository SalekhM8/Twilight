import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [certs, people] = await Promise.all([
      prisma.certification.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
      prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    ])
    return NextResponse.json({ certifications: certs, people })
  } catch (e) {
    return NextResponse.json({ error: "Failed to load about" }, { status: 500 })
  }
}






