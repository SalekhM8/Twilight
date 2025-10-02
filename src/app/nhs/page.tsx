import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function NhsServicesPage() {
  const treatments = await prisma.treatment.findMany({ where: { isActive: true, isNhs: true }, orderBy: { name: "asc" } })

  return (
    <div className="min-h-screen bg-white">
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
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600">{t.duration} mins</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/treatments/${t.id}`} className="w-full">
                      <Button className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-[15px]">Learn More</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}



