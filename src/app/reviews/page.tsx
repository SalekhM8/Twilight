export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({ where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-extrabold text-[#36c3f0] mb-6">Customer Reviews</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map(r=> (
              <Card key={r.id} className="bg-white/90 backdrop-blur ring-1 ring-black/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{r.name}</span>
                    <span className="text-sm text-gray-500">{r.rating}/5</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{r.comment}</p>
                </CardContent>
              </Card>
            ))}
            {reviews.length===0 && (<p className="text-gray-600">No reviews yet.</p>)}
          </div>
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-2">Leave a review</h2>
            <form className="space-y-3" action={async (formData: FormData)=>{
              'use server'
              const name = String(formData.get('name')||'').trim()
              const email = String(formData.get('email')||'').trim()
              const rating = Number(formData.get('rating')||0)
              const comment = String(formData.get('comment')||'').trim()
              if (!name || !comment || rating<1 || rating>5) return
              await prisma.review.create({ data: { name, email: email||null, rating, comment } })
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input name="name" placeholder="Your name" className="h-10 rounded-md border px-3" required />
                <input name="email" placeholder="Email (optional)" className="h-10 rounded-md border px-3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select name="rating" className="h-10 rounded-md border px-3" required defaultValue="5">
                  {[1,2,3,4,5].map(n=> (<option key={n} value={n}>{n} / 5</option>))}
                </select>
              </div>
              <textarea name="comment" placeholder="Your feedback" className="min-h-[100px] w-full rounded-md border px-3 py-2" required />
              <button type="submit" className="inline-flex items-center rounded-full bg-[#36c3f0] text-white px-6 py-2 font-semibold hover:bg-[#2eb5e8]">Submit</button>
              <p className="text-xs text-gray-500">Submitted reviews appear after approval.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}


