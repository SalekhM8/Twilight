import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"

type ChatMessage = { role: "user" | "assistant" | "system"; content: string }

export async function POST(req: Request) {
  try {
    await resetPreparedStatements()
    const { messages } = (await req.json()) as { messages: ChatMessage[] }
    const userMessage = String(messages?.[messages.length - 1]?.content || "").slice(0, 2000)

    const now = new Date()
    // Load catalog: active + in-season treatments with locations
    const treatments = await prisma.treatment.findMany({
      where: {
        isActive: true,
        OR: [
          { seasonStart: null },
          { seasonEnd: null },
          { AND: [{ seasonStart: { lte: now } }, { seasonEnd: { gte: now } }] },
        ],
      },
      include: {
        locations: { include: { location: true } }, // TreatmentLocation -> Location
      },
      orderBy: { name: "asc" },
      take: 200,
    })

    const catalog = treatments.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      summary: (t as any).summary || "",
      price: Number(t.price),
      duration: t.duration,
      showSlots: (t as any).showSlots ?? true,
      locations: t.locations.map((tl) => ({ id: tl.location.id, name: tl.location.name, phone: tl.location.phone })),
    }))

    const apiKey = process.env.OPENAI_API_KEY || ""
    let reply = ""
    let recIds: string[] = []

    if (apiKey) {
      // Call OpenAI via fetch (no dependency)
      const system = [
        "You are a friendly UK pharmacy assistant for Twilight Pharmacy.",
        "Be warm, concise, and clear. Do not diagnose. For urgent symptoms advise calling 999.",
        "Recommend up to 3 relevant treatments from the provided catalog when appropriate.",
        "Return a JSON object ONLY with keys: reply (string) and recommendations (array of treatment ids).",
      ].join(" ")
      const model = process.env.ASSISTANT_MODEL || "gpt-4o-mini"
      const body = {
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Catalog JSON:\n${JSON.stringify(catalog).slice(0, 120000)}` },
          ...(messages || []),
          { role: "user", content: "Respond with pure JSON like {\"reply\":\"...\",\"recommendations\":[\"<treatmentId>\",\"<treatmentId>\"]}" },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        })
        const j = await r.json()
        const content = String(j?.choices?.[0]?.message?.content || "").trim()
        const parsed = JSON.parse(content)
        reply = String(parsed?.reply || "")
        recIds = Array.isArray(parsed?.recommendations) ? parsed.recommendations.map(String) : []
      } catch {
        // fallback to heuristic below
      }
    }

    // Heuristic fallback if no key or parse failed
    if (!reply) {
      const q = userMessage.toLowerCase()
      const scored = catalog
        .map((c) => {
          const base =
            (c.name.toLowerCase().startsWith(q) ? 3 : 0) +
            (c.name.toLowerCase().includes(q) ? 2 : 0) +
            (c.category?.toLowerCase().includes(q) ? 1 : 0) +
            (c.summary?.toLowerCase().includes(q) ? 1 : 0)
          return { id: c.id, score: base }
        })
        .sort((a, b) => b.score - a.score)
      recIds = scored.filter((s) => s.score > 0).slice(0, 3).map((s) => s.id)
      reply = recIds.length > 0
        ? "Thanks for sharing. Based on what you said, here are some suitable options. We can book you in straight away."
        : "Thanks for sharing. I can help you explore suitable treatments. Could you tell me a bit more about your symptoms and how long you’ve had them?"
    }

    const recommendations = catalog
      .filter((c) => recIds.includes(c.id))
      .slice(0, 3)
      .map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        locations: c.locations,
        learnUrl: `/treatments/${slugSafe(c.name)}-${c.id}`,
        bookUrl: `/consultation?treatment=${c.id}`,
      }))

    return NextResponse.json({
      reply: reply || "How can I help today?",
      recommendations,
      disclaimer: "Information only, not a diagnosis. For urgent symptoms call 999.",
    })
  } catch (e) {
    return NextResponse.json({ reply: "Sorry, I had trouble just now. Please try again.", recommendations: [] })
  }
}

function slugSafe(name: string): string {
  return String(name).toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-")
}


