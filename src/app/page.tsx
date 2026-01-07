import Image from 'next/image'
export const revalidate = 60
import NavServicesDropdown from '@/components/NavServicesDropdown'
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
import MobileHeroHeader from '@/components/MobileHeroHeader'
import { formatOpeningHours } from '@/lib/utils'
import TreatmentSearch from '@/components/TreatmentSearch'

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
    <div className="min-h-screen bg-white">
      {/* HEADER moved onto hero (desktop only) */}

      {/* HERO */}
      <section id="home" className="relative mx-2 sm:mx-3 md:mx-6 mt-0 md:mt-0 rounded-3xl overflow-hidden min-h-[85vh]">
        <MobileHeroHeader />
        <div className="absolute inset-0 z-0">
          <video
            src="/main.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/twilightnew.png"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/40 to-black/10" />
        </div>

        {/* Desktop nav over video */}
        <div className="hidden md:block absolute top-0 inset-x-0 z-30">
          <div className="mx-auto max-w-7xl px-6 py-3 grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <Link href="/" className="inline-flex items-center">
                <Image src="/twilightnew.png" alt="Twilight Pharmacy" width={360} height={110} className="h-32 w-auto drop-shadow-[0_3px_14px_rgba(0,0,0,0.55)]" />
              </Link>
            </div>
            <nav className="flex items-center justify-center gap-8 text-base text-white font-semibold">
              <NavServicesDropdown />
              <Link href="/about" className="hover:text-white/90">About Us</Link>
              <a href="#locations" className="hover:text-white/90">Locations</a>
              <a href="#contact" className="hover:text-white/90">Contact</a>
            </nav>
            <div className="justify-self-end">
              <Link href="/consultation" className="inline-flex items-center rounded-full bg-[#36c3f0] text-white px-5 py-2 font-semibold hover:bg-[#2eb5e8]">Start Consultation</Link>
            </div>
          </div>
        </div>

        {/* Mobile header with hamburger inside hero is replaced by sticky header above */}

        

        <div className="relative z-20 mx-auto max-w-7xl px-6 w-full h-full">
          <div className="min-h-[85vh] grid place-items-center">
            <div className="max-w-3xl text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Tune out the noise.
              <br />
              Tune into your health.
              </h1>
              <p className="mt-6 mx-auto text-lg text-white/85 max-w-xl">
                Evidence-based treatments and pharmacist-led care across our Birmingham branches.
              </p>
              <div className="mt-6">
                <TreatmentSearch />
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-3">
                <a href="#services" className="inline-flex items-center justify-center rounded-full border border-[#36c3f0] bg-white text-[#36c3f0] hover:bg-[#e9f7fe] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium w-full">
                  View Services
                </a>
                <Link href="/travel" className="inline-flex items-center justify-center rounded-full border border-[#36c3f0] bg-white text-[#36c3f0] hover:bg-[#e9f7fe] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold w-full">
                  Travel Clinic
                </Link>
                <Link href="/consultation" className="inline-flex items-center justify-center rounded-full bg-[#36c3f0] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-[#2eb5e8] w-full">
                  Get Started
                </Link>
              </div>
            </div>
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
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e9f7fe] to-[#dff3fd] text-[#36c3f0] ring-1 ring-[#e9f7fe] flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">{treatment.name}</CardTitle>
                    <CardDescription className="text-gray-600">{treatment.summary || treatment.description}</CardDescription>
                    {treatment.seasonStart && treatment.seasonEnd ? (
                      <span className="inline-block mt-2 text-[11px] font-semibold text-[#36c3f0] bg-[#f3fbff] ring-1 ring-[#e9f7fe] rounded-full px-2 py-0.5">
                        Seasonal
                      </span>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-bold text-[#36c3f0]">£{treatment.price}</span>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{treatment.duration} mins</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/treatments/${slugify(treatment.name)}-${treatment.id}`} className="w-1/2">
                        <Button className="w-full rounded-full border border-[#36c3f0] text-[#36c3f0] bg-white hover:bg-[#e9f7fe] h-11 text-[15px]">Learn More</Button>
                      </Link>
                      <Link href={`/consultation?treatment=${treatment.id}`} className="w-1/2">
                        <Button className="w-full rounded-full bg-[#36c3f0] hover:bg-[#2eb5e8] text-white h-11 text-[15px]">Book</Button>
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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-black opacity-90" />
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
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                  <path d="M17.5 0h-11A6.5 6.5 0 0 0 0 6.5v11A6.5 6.5 0 0 0 6.5 24h11a6.5 6.5 0 0 0 6.5-6.5v-11A6.5 6.5 0 0 0 17.5 0zm-5.006 18.293c-.593 0-1.074-.481-1.074-1.074 0-.594.48-1.075 1.074-1.075.594 0 1.074.481 1.074 1.075 0 .593-.48 1.074-1.074 1.074zm4.713-4.106c0 .23-.187.417-.417.417h-8.58a.417.417 0 0 1-.417-.417V8.48c0-.23.187-.417.417-.417h8.58c.23 0 .417.187.417.417v5.707zm0-7.374a.417.417 0 0 1-.417.417h-8.58a.417.417 0 0 1-.417-.417V5.48c0-.23.187-.417.417-.417h8.58c.23 0 .417.187.417.417v1.333z"/>
                </svg>
                Order on Deliveroo
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
