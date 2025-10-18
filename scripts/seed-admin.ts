import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

async function run() {
  const prisma = new PrismaClient()
  try {
    const email = "admin@twilightpharmacy.com"
    const password = "admin123"
    const hashed = await bcrypt.hash(password, 12)
    const existing = await prisma.admin.findUnique({ where: { email } })
    if (existing) {
      console.log("Admin already exists:", existing.email)
      return
    }
    const admin = await prisma.admin.create({
      data: { email, password: hashed, name: "Admin User", role: "admin", isActive: true },
    })
    console.log("Created admin:", admin.email)
  } finally {
    await prisma.$disconnect()
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})






