import { prisma } from "@/lib/prisma"

export async function resetPreparedStatements(): Promise<void> {
  try {
    const dbUrl = process.env.DATABASE_URL || ""
    // Only run DEALLOCATE when using Prisma dev server URL to avoid clearing
    // prepared statements on standard Postgres connections.
    if (!dbUrl.startsWith("prisma+postgres://")) return
    await prisma.$executeRawUnsafe("DEALLOCATE ALL")
  } catch {
    // ignore in environments that don't support DEALLOCATE
  }
}


