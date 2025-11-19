import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"
import { getOrSetCache } from "@/lib/cache"

export async function GET(request: Request) {
  try {
    await resetPreparedStatements()
    const { searchParams } = new URL(request.url)
    const rawQuery = (searchParams.get("query") || "").trim()
    const limitParam = Number(searchParams.get("limit") || 10)
    const limit = Math.max(1, Math.min(20, isNaN(limitParam) ? 10 : limitParam))

    // Short queries return empty fast to avoid table scans
    if (rawQuery.length < 2) {
      return NextResponse.json({ items: [] })
    }
    const q = rawQuery.toLowerCase()
    const now = new Date()

    const items = await getOrSetCache(
      `treat_search_${q}_${limit}`,
      30_000,
      async () => {
        // Fetch a superset then rank in-memory
        const candidates = await prisma.treatment.findMany({
          where: {
            isActive: true,
            OR: [
              { seasonStart: null },
              { seasonEnd: null },
              { AND: [{ seasonStart: { lte: now } }, { seasonEnd: { gte: now } }] },
            ],
            AND: {
              OR: [
                { name: { contains: rawQuery, mode: "insensitive" } },
                { category: { contains: rawQuery, mode: "insensitive" } },
                // @ts-ignore: summary exists in schema; prisma types sometimes lag
                { summary: { contains: rawQuery, mode: "insensitive" } },
                { description: { contains: rawQuery, mode: "insensitive" } },
              ],
            },
          },
          select: { id: true, name: true, price: true, category: true },
          take: 50,
          orderBy: { name: "asc" },
        })

        // Simple ranking: startsWith > contains in name > contains in category/others
        const scored = candidates.map((t) => {
          const nameLc = t.name.toLowerCase()
          const catLc = (t.category || "").toLowerCase()
          let score = 0
          if (nameLc.startsWith(q)) score += 3
          if (nameLc.includes(q)) score += 2
          if (catLc.includes(q)) score += 1
          return { ...t, _score: score }
        })
        scored.sort((a, b) => b._score - a._score || a.name.localeCompare(b.name))
        return scored.slice(0, limit).map(({ _score, ...rest }) => rest)
      }
    )

    const res = NextResponse.json({ items })
    res.headers.set("Cache-Control", "public, max-age=15, s-maxage=30")
    return res
  } catch (e) {
    return NextResponse.json({ items: [] })
  }
}


