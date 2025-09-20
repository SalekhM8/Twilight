import { prisma } from "@/lib/prisma"

export async function resetPreparedStatements(): Promise<void> {
  try {
    await prisma.$executeRawUnsafe("DEALLOCATE ALL")
  } catch {
    // ignore in environments that don't support DEALLOCATE
  }
}


