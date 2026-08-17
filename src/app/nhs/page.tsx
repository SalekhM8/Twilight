import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { slugify } from "@/lib/utils"

export const revalidate = 60
export default async function NhsServicesPage() {
  const now = new Date()
  const treatments = await prisma.treatment.findMany({ where: { isActive: true, isNhs: true, OR: [{ seasonStart: null }, { seasonEnd: null }, { AND: [{ seasonStart: { lte: now } }, { seasonEnd: { gte: now } }] }] }, orderBy: { name: "asc" } })

  const allLocations = await prisma.location.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-[#f3fbff]">
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-700">NHS Services</h1>
            <p className="text-lg text-gray-600 mt-3">NHS-funded services available at our branches</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {treatments.map((t) => (
              <Card key={t.id} className="border border-white/70 bg-white/80 backdrop-blur-md ring-1 ring-black/5 shadow-xl rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-semibold text-gray-900">{t.name}</CardTitle>
                  <CardDescription className="text-gray-600">{t.description}</CardDescription>
                  {t.seasonStart && t.seasonEnd ? (
                    <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-0.5">Seasonal</span>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600">{t.duration} mins</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/treatments/${slugify(t.name)}-${t.id}`} className="w-full">
                      <Button className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-[15px]">Learn More</Button>
                    </Link>
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
        <div className="absolute inset-0 -z-10 bg-[#155d7e]" />
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





