export const dynamic = 'force-dynamic'
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import NavServicesDropdown from "@/components/NavServicesDropdown"
export const revalidate = 300
import MobileHeader from "@/components/MobileHeader"

export default async function AboutPage() {
  const [certs, people] = await Promise.all([
    prisma.certification.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }).catch(()=>[] as any[]),
    prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }).catch(()=>[] as any[]),
  ])

  const allLocations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  })

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
              <Link href="/about" className="hover:text-[#36c3f0] text-[#36c3f0]">About Us</Link>
              <a href="/#locations" className="hover:text-[#36c3f0]">Locations</a>
              <a href="/#contact" className="hover:text-[#36c3f0]">Contact</a>
            </nav>
            <Link href="/consultation" className="inline-flex items-center rounded-full bg-[#36c3f0] text-white px-5 py-2 font-semibold hover:bg-[#2eb5e8]">
              Start Consultation
            </Link>
          </div>
        </div>
      </header>

      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#36c3f0]">About Us</h1>
            <p className="text-lg text-gray-600 mt-3">Our accreditations and team</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {certs.map((c)=> (
              <Card key={c.id} className="bg-white/90 backdrop-blur ring-1 ring-black/5 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-[#36c3f0]">{c.title}</CardTitle>
                  <CardDescription className="font-semibold text-gray-700">{c.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-6">{c.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#36c3f0] mb-6">Our People</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {people.map((p)=> (
                <Card key={p.id} className="bg-white/90 backdrop-blur ring-1 ring-black/5 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{p.name}</span>
                      <span className="text-sm text-[#36c3f0]">{p.role}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 leading-6">{p.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
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


