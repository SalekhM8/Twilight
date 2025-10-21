"use client"

import { useEffect, useState } from "react"

export default function PaymentBadge({ bookingId, initial }: { bookingId: string; initial: string | null | undefined }) {
  const [status, setStatus] = useState(initial || "unpaid")

  useEffect(() => {
    if (status === "paid") return
    // If we arrived via success_url with a session_id, verify immediately
    try {
      const url = new URL(window.location.href)
      const sid = url.searchParams.get('session_id')
      if (sid) {
        fetch('/api/payments/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid, bookingId }) })
          .then(r=>r.json()).then(j=>{ if (j?.paid) setStatus('paid') })
          .catch(()=>{})
      }
    } catch {}
    let mounted = true
    let tries = 0
    const tick = async () => {
      try {
        const res = await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, { cache: "no-store" })
        if (!res.ok) return
        const b = await res.json()
        if (mounted && b?.paymentStatus) setStatus(b.paymentStatus)
        if (b?.paymentStatus === "paid") return
      } catch {}
      if (++tries < 12) setTimeout(tick, 1000)
    }
    tick()
    return () => { mounted = false }
  }, [bookingId, status])

  if (status === "paid") {
    return <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm font-medium">Paid</span>
  }
  if (status === "pending") {
    return <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm font-medium">Payment pending</span>
  }
  return <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-800 px-3 py-1 text-sm font-medium">Unpaid · Pay in store or online</span>
}


