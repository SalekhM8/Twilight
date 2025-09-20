import Image from 'next/image'
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
import { formatOpeningHours } from '@/lib/utils'

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
  const treatments = await prisma.treatment.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  const locations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* HERO (unchanged from prior step) */}
      <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.65), rgba(0,0,0,0.4), rgba(0,0,0,0)), url('https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=2400&q=80')",
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/55 via-black/35 to-transparent" />

        <div className="absolute top-0 inset-x-0 z-20">
          <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
            <Link href="#" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/90 text-emerald-600 flex items-center justify-center font-bold">T</div>
              <div className="leading-tight text-white">
                <span className="block text-sm font-semibold">TWILIGHT</span>
                <span className="block text-[11px] text-white/80">More than just a Pharmacy</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm text-white/90">
              <a href="#home" className="hover:text-white">Home</a>
              <a href="#services" className="hover:text-white">Services</a>
              <a href="#locations" className="hover:text-white">Locations</a>
              <a href="#contact" className="hover:text-white">Contact</a>
              <Link href="/admin" className="hover:text-white">Sign in</Link>
              <Link href="/consultation" className="ml-2 inline-flex items-center rounded-full bg-white text-gray-900 px-5 py-2 font-medium hover:bg-gray-100">Start Consultation</Link>
            </nav>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Tune out the noise.
                <br />
                Tune into your health.
              </h1>
              <p className="mt-6 text-lg text-white/85 max-w-xl">
                Evidence-based treatments and pharmacist-led care across our Birmingham branches.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <a href="#services" className="inline-flex items-center rounded-full border border-white/30 text-white px-5 py-2 text-sm font-medium hover:bg-white/10">View Services</a>
                <Link href="/consultation" className="inline-flex items-center rounded-full bg-emerald-500 text-white px-5 py-2 text-sm font-semibold hover:bg-emerald-400">Get Started →</Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white rounded-2xl shadow-2xl p-6 rotate-3 w-[520px]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Travel Health</p>
                    <p className="text-sm text-gray-500">Professional consultation</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Vaccinations</span><span className="text-emerald-600 font-semibold">Available</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Malaria Prevention</span><span className="text-emerald-600 font-semibold">Available</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Health Advice</span><span className="text-emerald-600 font-semibold">Included</span></div>
                </div>
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
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Our Services</h2>
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
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 ring-1 ring-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">{treatment.name}</CardTitle>
                    <CardDescription className="text-gray-600">{treatment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-bold text-emerald-600">£{treatment.price}</span>
                      <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{treatment.duration} mins</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/treatments/${treatment.id}`} className="w-1/2">
                        <Button className="w-full rounded-full bg-gray-900 hover:bg-gray-800 text-white h-11 text-[15px]">Learn More</Button>
                      </Link>
                      <Link href={`/consultation?treatment=${treatment.id}`} className="w-1/2">
                        <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 h-11 text-[15px]">Book</Button>
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
      <section id="locations" className="relative py-28 bg-gray-50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_50%_0%,#f2f7ff,transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Our Locations</h2>
            <p className="text-lg text-gray-600">Visit us at any of our convenient Birmingham locations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <Card key={location.id} className="bg-white/90 backdrop-blur ring-1 ring-black/5 shadow-lg hover:shadow-xl transition rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-600"><MapPin className="w-5 h-5" /><span>{location.name}</span></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-400 mt-1" /><p className="text-gray-600">{location.address}</p></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><p className="text-gray-600">{location.phone}</p></div>
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

      {/* FOOTER */}
      <footer id="contact" className="relative text-white py-14">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_70%_at_50%_0%,#0b1220,transparent_70%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900 to-black opacity-90" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">T</div>
                <span className="text-xl font-bold">TWILIGHT</span>
              </div>
              <p className="text-gray-400 text-sm">More than just a Pharmacy</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Weight Loss</li>
                <li>Women&apos;s Health</li>
                <li>Men&apos;s Health</li>
                <li>Travel Health</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Locations</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Small Health</li>
                <li>Kings Heath</li>
                <li>Billesley</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Book Online</li>
                <li>Call Us</li>
                <li>Find Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-gray-400">© 2024 Twilight Pharmacy. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
