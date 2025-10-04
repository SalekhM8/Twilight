"use client"

import { useState } from "react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Review = {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

export default function ReviewsSection({ reviews: initial }: { reviews: Review[] }) {
  const [open, setOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(initial)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", rating: 5, comment: "" })

  const submit = async () => {
    if (!form.name || !form.comment || form.rating < 1 || form.rating > 5) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (res.ok) {
        setForm({ name: "", email: "", rating: 5, comment: "" })
        setSubmitted(true)
      } else {
        alert("Could not submit review. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#36c3f0]">Reviews</h2>
            <p className="text-lg text-gray-600 mt-3">What our customers say</p>
          </div>
          <div>
            <Button className="rounded-full bg-[#36c3f0] hover:bg-[#2eb5e8]" onClick={()=> setOpen(true)}>Add your review</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r)=> (
            <div key={r.id} className="rounded-2xl bg-white/90 backdrop-blur ring-1 ring-black/5 shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-900">{r.name}</p>
                <span className="text-sm text-[#36c3f0]">{r.rating}/5</span>
              </div>
              <p className="text-sm text-gray-700 leading-6 whitespace-pre-line">{r.comment}</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-gray-600">No reviews yet. Be the first to leave one.</p>
          )}
        </div>

        <Modal open={open} onClose={()=> { setOpen(false); setSubmitted(false) }} title={submitted ? undefined : "Add your review"}>
          <div className="space-y-3">
            {submitted ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 grid place-items-center">
                  <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <p className="text-lg font-semibold text-gray-900">Thanks for submitting your review!</p>
                <div className="mt-4">
                  <Button className="rounded-full" onClick={()=> { setOpen(false); setSubmitted(false) }}>Close</Button>
                </div>
              </div>
            ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700">Name</label>
                <Input value={form.name} onChange={(e)=> setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-700">Email (optional)</label>
                <Input value={form.email} onChange={(e)=> setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700">Rating</label>
                <select className="h-10 w-full rounded-md border px-3 text-sm" value={form.rating} onChange={(e)=> setForm({ ...form, rating: Number(e.target.value) })}>
                  {[5,4,3,2,1].map((n)=> (<option key={n} value={n}>{n} / 5</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700">Comment</label>
              <Textarea value={form.comment} onChange={(e)=> setForm({ ...form, comment: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" className="rounded-full" onClick={()=> setOpen(false)}>Cancel</Button>
              <Button className="rounded-full bg-[#36c3f0] hover:bg-[#2eb5e8]" onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit'}</Button>
            </div>
            </>
            )}
          </div>
        </Modal>
      </div>
    </section>
  )
}


