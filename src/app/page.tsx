import Image from 'next/image'
export const revalidate = 60
import { prisma } from '@/lib/prisma'
import { resetPreparedStatements } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Scale, 
  Users, 
  Activity, 
  Heart, 
  UserX, 
  Scissors, 
  Flower2, 
  Ear,
  Car,
  MapPin,
  Phone,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/utils'
import ReviewsSection from '@/components/ReviewsSection'
import { formatOpeningHours } from '@/lib/utils'
import TreatmentSearch from '@/components/TreatmentSearch'

const CLINIC = process.env.NEXT_PUBLIC_CLINIC_URL || 'https://clinic.twilightpharmacy.co.uk'

const treatmentIcons = {
  'Weight Loss': Scale,
  'Women\'s Health': Users,
  'Digestion': Activity,
  'Erectile Dysfunction': Heart,
  'Facial Hair Removal': Scissors,
  'Hair Loss': UserX,
  'Hay Fever and Allergy': Flower2,
  'Ear Wax Removal': Ear,
  'HGV, PCV & Taxi Medicals': Car,
}

export default async function HomePage() {
  await resetPreparedStatements()
  const now = new Date()
  const treatments = await prisma.treatment.findMany({
    where: {
      isActive: true,
      isTravel: false,
      isNhs: false,
      OR: [
        { seasonStart: null },
        { seasonEnd: null },
        { AND: [{ seasonStart: { lte: now } }, { seasonEnd: { gte: now } }] },
      ],
    },
    orderBy: { name: 'asc' }
  })

  const locations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  })
  let reviews: any[] = []
  try {
    reviews = await prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take: 12 })
  } catch {
    reviews = []
  }

  return (
    <div className="min-h-screen bg-[#f3fbff]">
      {/* HERO — clinic-style dark editorial hero */}
      <section id="home" className="relative overflow-hidden bg-[#155d7e]">
        {/* Subtle line-art background, matching the clinic hero */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <svg viewBox="0 0 1440 700" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
            <g stroke="#f3fbff" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <g transform="translate(80, 60) scale(2.8)" opacity="0.16" strokeWidth="0.7">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </g>
              <g transform="translate(1220, 80) scale(2.8) rotate(30)" opacity="0.15" strokeWidth="0.7">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                <path d="m8.5 8.5 7 7" />
              </g>
              <g transform="translate(50, 480) scale(2.8)" opacity="0.16" strokeWidth="0.7">
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                <path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
              </g>
              <g transform="translate(1280, 320) scale(2.8)" opacity="0.15" strokeWidth="0.7">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="M9 12h6" />
                <path d="M12 9v6" />
              </g>
            </g>
          </svg>
        </div>

        <div className="relative mx-auto flex min-h-[540px] max-w-[1410px] flex-col items-center justify-center px-6 py-20 text-center md:min-h-[600px]">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-[#f3fbff]/70">
            Pharmacist-Led Care &middot; Birmingham
          </p>
          <h1 className="mx-auto max-w-3xl text-[38px] font-medium leading-[0.95] text-[#f3fbff] md:text-[56px] lg:text-[72px]">
            Tune out the noise. Tune into your health.
          </h1>
          <p className="mt-6 mx-auto max-w-xl text-lg text-[#f3fbff]/80">
            Evidence-based treatments, NHS and travel services across our Birmingham branches.
          </p>
          <div className="mt-8 w-full max-w-xl">
            <TreatmentSearch />
          </div>
          {/* Weight Loss Clinic — the clinic's front door on the main site */}
          <a
            href={`${CLINIC}/treatments/mounjaro`}
            className="mt-10 flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border border-[#36c3f0]/60 bg-[#f3fbff]/10 px-6 py-5 text-left backdrop-blur-sm transition-colors duration-200 hover:bg-[#f3fbff]/15 sm:flex-row sm:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#36c3f0]">New · Online Weight Loss Clinic</p>
              <p className="mt-1 text-lg font-medium text-[#f3fbff]">Mounjaro &amp; Wegovy, prescribed online by our pharmacists</p>
              <p className="text-sm text-[#f3fbff]/75">Free online consultation · Prescriber review · Delivered to your door</p>
            </div>
            <span className="inline-flex h-[48px] shrink-0 items-center justify-center rounded-full bg-[#36c3f0] px-6 text-sm font-semibold text-white">
              Start Consultation
            </span>
          </a>

          <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#services" className="inline-flex h-[56px] w-full items-center justify-center rounded-lg bg-[#0b1220] px-10 text-base font-medium capitalize text-[#f3fbff] transition-colors duration-200 hover:bg-[#0b1220]/80 sm:w-auto">
              Pick a Service
            </a>
            <Link href="/travel" className="inline-flex h-[56px] w-full items-center justify-center rounded-lg border border-[#f3fbff]/40 bg-transparent px-10 text-base font-medium capitalize text-[#f3fbff] transition-colors duration-200 hover:bg-[#f3fbff] hover:text-[#155d7e] sm:w-auto">
              Travel Clinic
            </Link>
            <Link href="/nhs" className="inline-flex h-[56px] w-full items-center justify-center rounded-lg border border-[#f3fbff]/40 bg-transparent px-10 text-base font-medium capitalize text-[#f3fbff] transition-colors duration-200 hover:bg-[#f3fbff] hover:text-[#155d7e] sm:w-auto">
              NHS Services
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="relative py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#eef2ff,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#36c3f0]">Our Services</h2>
            <p className="text-lg text-gray-600 mt-3">Professional healthcare services tailored to your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((treatment) => {
              const IconComponent = (treatmentIcons as any)[treatment.category] || Activity
              return (
                <Card
                  key={treatment.id}
                  className="border border-white/70 bg-white/80 backdrop-blur-md ring-1 ring-black/5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition rounded-2xl"
                >
                  <CardHeader className="pb-3 text-center">
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#e9f7fe] to-[#dff3fd] text-[#36c3f0] ring-1 ring-[#e9f7fe] flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">{treatment.name}</CardTitle>
                    <CardDescription className="text-gray-600">{treatment.summary || treatment.description}</CardDescription>
                    {treatment.seasonStart && treatment.seasonEnd ? (
                      <span className="inline-block mt-2 text-[11px] font-semibold text-[#36c3f0] bg-[#f3fbff] ring-1 ring-[#e9f7fe] rounded-lg px-2 py-0.5">
                        Seasonal
                      </span>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-bold text-[#36c3f0]">£{treatment.price}</span>
                      <span className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600">{treatment.duration} mins</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/treatments/${slugify(treatment.name)}-${treatment.id}`} className="w-1/2">
                        <Button className="w-full rounded-lg border border-[#36c3f0] text-[#36c3f0] bg-white hover:bg-[#e9f7fe] h-11 text-[15px]">Learn More</Button>
                      </Link>
                      <Link href={`/consultation?treatment=${treatment.id}`} className="w-1/2">
                        <Button className="w-full rounded-lg bg-[#0b1220] hover:bg-[#155d7e] text-white h-11 text-[15px]">Book</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="relative py-28 bg-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#f2f7ff,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-[#36c3f0] mb-2">Our Locations</h2>
            <p className="text-lg text-gray-600">Visit us at any of our convenient Birmingham locations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <Card key={location.id} className="bg-white/90 backdrop-blur ring-1 ring-black/5 shadow-lg hover:shadow-xl transition rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#36c3f0]"><MapPin className="w-5 h-5" /><span>{location.name}</span></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-1" /><p className="text-gray-600"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{location.address}</a></p></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><p className="text-gray-600"><a href={`tel:${location.phone.replace(/[^\d+]/g, '')}`} className="hover:underline">{location.phone}</a></p></div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-1" />
                    <div className="text-gray-600">
                      <p className="font-semibold mb-1">Opening Hours</p>
                      {formatOpeningHours(location.openingHours).map((hours, index) => (
                        <p key={index} className="text-xs">{hours}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection reviews={reviews as any} />

      {/* FOOTER */}
      <footer id="contact" className="relative text-white py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_0%,#0b1220,transparent_70%)]" />
        <div className="absolute inset-0 -z-10 bg-[#155d7e]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/twilightnew.png" alt="Twilight Pharmacy" width={160} height={48} className="h-8 w-auto" />
              </div>
              <p className="text-gray-400 text-sm">More than just a Pharmacy</p>
              <a
                href="https://deliveroo.co.uk/menu/birmingham/kings-heath/twilight-pharmacy-128-130-high-street"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00CCBC] hover:bg-[#00b8aa] transition-colors text-white text-sm font-medium"
              >
                <img src="https://consumer-component-library.roocdn.com/30.2.0/static/images/logo-white.svg" alt="" className="h-4 w-auto" />
                Order now
              </a>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {treatments.slice(0,6).map((t)=> (
                  <li key={t.id}>
                    <Link href={`/treatments/${slugify(t.name)}-${t.id}`} className="hover:text-white">{t.name}</Link>
                  </li>
                ))}
                <li>
                  <a href={process.env.NEXT_PUBLIC_CLINIC_URL || "https://clinic.twilightpharmacy.co.uk"} className="hover:text-white">Weight Loss Clinic</a>
                </li>
                <li>
                  <Link href="/travel" className="hover:text-white">Travel Health</Link>
                </li>
                <li>
                  <Link href="/nhs" className="hover:text-white">NHS Services</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Locations</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                {locations.map((l) => (
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
                <li><a href={`tel:${locations[0]?.phone?.replace(/[^\d+]/g, '') || ''}`} className="hover:text-white">Call Us</a></li>
                <li><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locations[0]?.address || '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-white">Find Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">About Us</Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white">Sign in</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">© 2024 Twilight Pharmacy. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
