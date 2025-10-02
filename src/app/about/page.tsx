export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function AboutPage() {
  const [certs, people] = await Promise.all([
    prisma.certification.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }).catch(()=>[] as any[]),
    prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }).catch(()=>[] as any[]),
  ])

  return (
    <div className="min-h-screen bg-white">
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
    </div>
  )
}


