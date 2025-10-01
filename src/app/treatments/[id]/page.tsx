import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"
import { MapPin } from "lucide-react"

export default async function TreatmentPage({ params }: { params: Promise<{ id: string }> }) {
  await resetPreparedStatements()
  const { id } = await params
  const treatment = await prisma.treatment.findUnique({ where: { id } })
  if (!treatment) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-gray-500">Treatment not found.</p>
      </div>
    )
  }

  const locations = await prisma.treatmentLocation.findMany({
    where: { treatmentId: id },
    include: { location: true },
  })

  const heroImages = [
    "/twilight1.png",
    "/twilight2.png",
    "/twilight3.png",
    "/twilight4.png",
  ]
  const hash = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const heroUrl = heroImages[hash % heroImages.length]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-end overflow-hidden mx-2 sm:mx-3 md:mx-6 mt-6 rounded-3xl shadow-[0_8px_40px_rgba(54,195,240,0.12)]">
        <img src={heroUrl} alt="" aria-hidden className="absolute inset-0 z-0 w-full h-full object-cover" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/70 via-white/50 to-white/20" />
        <div className="relative z-20 mx-auto max-w-6xl px-6 py-16 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">{treatment.name}</h1>
          <p className="mt-3 text-gray-700 max-w-2xl">{treatment.description}</p>
          <div className="mt-5 inline-flex items-center rounded-full bg-[#36c3f0] text-white px-5 py-2 text-sm font-semibold hover:bg-[#2eb5e8]">£{treatment.price} · {treatment.duration} mins</div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900">About this treatment</h2>
              <p className="mt-3 text-gray-700 leading-7">
                {treatment.description || "This treatment is provided by our experienced pharmacists with a focus on safety and results."}
              </p>
              <div className="mt-8">
                <Link href={`/consultation?treatment=${treatment.id}`} className="inline-flex items-center rounded-full bg-[#36c3f0] text-white px-6 py-3 font-semibold hover:bg-[#2eb5e8]">
                  Book this treatment →
                </Link>
              </div>
            </div>
            <aside className="lg:col-span-1">
              <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/5 shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900">Available at</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {locations.map((l) => (
                    <li key={l.location.id} className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#36c3f0] mt-1" />
                      <span className="text-gray-700">{l.location.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
