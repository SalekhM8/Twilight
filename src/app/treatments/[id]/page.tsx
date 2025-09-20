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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.4), rgba(0,0,0,0)), url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">{treatment.name}</h1>
          <p className="mt-3 text-white/85 max-w-2xl">{treatment.description}</p>
          <div className="mt-5 inline-flex items-center rounded-full bg-emerald-500 text-white px-5 py-2 text-sm font-semibold hover:bg-emerald-400">
            £{treatment.price} · {treatment.duration} mins
          </div>
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
                <Link href={`/consultation?treatment=${treatment.id}`} className="inline-flex items-center rounded-full bg-emerald-600 text-white px-6 py-3 font-semibold hover:bg-emerald-700">
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
                      <MapPin className="w-4 h-4 text-emerald-600 mt-1" />
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
