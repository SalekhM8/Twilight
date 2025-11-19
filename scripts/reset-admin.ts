import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  const prisma = new PrismaClient()
  try {
    // Accept credentials via env vars or CLI flags to avoid hardcoding secrets
    const email =
      process.env.ADMIN_EMAIL ||
      (process.argv.find(arg => arg.startsWith("--email="))?.split("=")[1]) ||
      "admin@twilightpharmacy.com"
    const plainPassword =
      process.env.ADMIN_PASSWORD ||
      (process.argv.find(arg => arg.startsWith("--password="))?.split("=")[1])

    if (!plainPassword) {
      throw new Error("Missing ADMIN_PASSWORD (or provide --password=...).")
    }
    if (plainPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.")
    }

    const hashed = await bcrypt.hash(plainPassword, 12)
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { password: hashed, isActive: true, name: "Admin User", role: "admin" },
      create: { email, password: hashed, name: "Admin User", role: "admin", isActive: true },
    })
    console.log("Admin upserted:", admin.email)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})







