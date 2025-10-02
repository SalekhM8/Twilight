import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function main() {
  const prisma = new PrismaClient()
  try {
    const email = "admin@twilightpharmacy.com"
    const password = "admin123"
    const hashed = await bcrypt.hash(password, 12)
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



