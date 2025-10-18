import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { resetPreparedStatements } from "@/lib/db"
import { MapPin, Clock, Phone, AlertCircle, CheckCircle2, Info } from "lucide-react"
import NavServicesDropdown from "@/components/NavServicesDropdown"
import MobileHeader from "@/components/MobileHeader"

export default async function TreatmentPage({ params }: { params: Promise<{ id: string }> }) {
  await resetPreparedStatements()
  const { id: raw } = await params
  // Support slug-id urls like "/treatments/covid-vaccination-<id>"
  const id = String(raw).split('-').pop() as string
  const treatment = await prisma.treatment.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      // @ts-ignore prisma types may lag after migration
      summary: true,
      description: true,
      category: true,
      price: true,
      duration: true,
      isActive: true,
      // @ts-ignore seasonal fields may lag right after migration
      seasonStart: true,
      // @ts-ignore
      seasonEnd: true,
      createdAt: true,
      updatedAt: true,
    },
  })
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

  const allLocations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
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
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image src="/twilightnew.png" alt="Twilight Pharmacy" width={280} height={85} className="h-16 w-auto" />
            </Link>
            <nav className="flex items-center gap-8 text-base text-gray-700 font-semibold">
              <NavServicesDropdown />
              <Link href="/about" className="hover:text-[#36c3f0]">About Us</Link>
              <a href="/#locations" className="hover:text-[#36c3f0]">Locations</a>
              <a href="/#contact" className="hover:text-[#36c3f0]">Contact</a>
            </nav>
            <Link href="/consultation" className="inline-flex items-center rounded-full bg-[#36c3f0] text-white px-5 py-2 font-semibold hover:bg-[#2eb5e8]">
              Start Consultation
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[45vh] flex items-end overflow-hidden mx-2 sm:mx-3 md:mx-6 mt-6 rounded-3xl shadow-[0_8px_40px_rgba(54,195,240,0.12)]">
        <img src={heroUrl} alt="" aria-hidden className="absolute inset-0 z-0 w-full h-full object-cover" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/70 via-white/50 to-white/20" />
        <div className="relative z-20 mx-auto max-w-6xl px-6 py-16 w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{treatment.name}</h1>
          {(treatment as any).summary && (
            <p className="mt-3 text-gray-800 max-w-2xl text-lg">{(treatment as any).summary}</p>
          )}
          <div className="mt-5 inline-flex items-center rounded-full bg-[#36c3f0] text-white px-5 py-2 text-sm font-semibold">£{treatment.price} · {treatment.duration} mins</div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this treatment</h2>
                {treatment.description && (
                  <p className="text-gray-700 leading-7">{treatment.description}</p>
                )}
                {!treatment.description && (
                  <p className="text-gray-700 leading-7">
                    Our experienced pharmacists provide professional {treatment.name.toLowerCase()} services. 
                    We ensure the highest standards of care and safety for all our patients.
                  </p>
                )}
              </div>

              {/* What to Expect */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#36c3f0]" />
                  What to Expect
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#36c3f0] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Professional consultation with a qualified pharmacist</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#36c3f0] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Treatment duration: approximately {treatment.duration} minutes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#36c3f0] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Private consultation room available</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#36c3f0] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Comprehensive aftercare advice provided</span>
                  </li>
                </ul>
              </div>

              {/* Important Information */}
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Important Information
                </h3>
                <div className="space-y-3 text-gray-700">
                  <p>
                    <strong>Before your appointment:</strong> Please inform our pharmacist if you have any allergies, 
                    medical conditions, or are taking any medications.
                  </p>
                  <p>
                    <strong>Side effects:</strong> While most treatments are well-tolerated, some patients may experience 
                    mild side effects. Our pharmacist will discuss these with you during your consultation.
                  </p>
                  <p>
                    <strong>Disclaimer:</strong> This service is provided by qualified healthcare professionals. 
                    If you have any concerns after your treatment, please contact us or seek medical advice.
                  </p>
                </div>
              </div>

              {/* Why Choose Twilight Pharmacy */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose Twilight Pharmacy?</h3>
                <div className="prose prose-gray max-w-none text-gray-700">
                  <ul className="space-y-2">
                    <li>Experienced and qualified pharmacists</li>
                    <li>Convenient locations across Birmingham</li>
                    <li>Extended opening hours to fit your schedule</li>
                    <li>Professional and confidential service</li>
                    <li>Competitive pricing with no hidden costs</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                {(() => {
                  const seasonStart = (treatment as any).seasonStart
                  const seasonEnd = (treatment as any).seasonEnd
                  if (seasonStart && seasonEnd) {
                    const now = new Date()
                    const inSeason = new Date(String(seasonStart)) <= now && new Date(String(seasonEnd)) >= now
                    if (!inSeason) {
                      return (
                        <div className="inline-flex items-center rounded-full bg-gray-200 text-gray-700 px-6 py-3 font-semibold cursor-not-allowed">
                          Currently unavailable (out of season)
                        </div>
                      )
                    }
                  }
                  return (
                    <Link href={`/consultation?treatment=${treatment.id}`} className="inline-flex items-center rounded-full bg-[#36c3f0] text-white px-6 py-3 font-semibold hover:bg-[#2eb5e8] text-lg">
                      Book this treatment →
                    </Link>
                  )
                })()}
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-black/5 shadow p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available at</h3>
                <ul className="space-y-4 text-sm">
                  {locations.map((l) => (
                    <li key={l.location.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <MapPin className="w-4 h-4 text-[#36c3f0] mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900">{l.location.name}</p>
                        <p className="text-gray-600 mt-1">{l.location.address}</p>
                        <p className="text-gray-600 mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {l.location.phone}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="relative text-white py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_0%,#0b1220,transparent_70%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-black opacity-90" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/twilightnew.png" alt="Twilight Pharmacy" width={160} height={48} className="h-8 w-auto" />
              </div>
              <p className="text-gray-400 text-sm">More than just a Pharmacy</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/travel" className="hover:text-white">Travel Health</Link></li>
                <li><Link href="/nhs" className="hover:text-white">NHS Services</Link></li>
                <li><a href="/#services" className="hover:text-white">Private Services</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Locations</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {allLocations.map((l) => (
                  <li key={l.id}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.address)}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">{l.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/consultation" className="hover:text-white">Book Online</Link></li>
                <li><a href={`tel:${allLocations[0]?.phone?.replace(/[^\d+]/g, '') || ''}`} className="hover:text-white">Call Us</a></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">© 2024 Twilight Pharmacy. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
