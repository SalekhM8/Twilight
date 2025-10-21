"use client"

export const dynamic = "force-dynamic"
import { Suspense } from "react"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface Treatment {
	id: string
	name: string
	description: string
	price: number
	duration: number
  showSlots?: boolean
}

interface Location {
	id: string
	name: string
	address: string
	phone: string
}

// Pharmacist selection removed; assignment handled server-side

export function ConsultationWizard() {
	const searchParams = useSearchParams()
	const preselectedTreatment = searchParams?.get("treatment") || ""
  const stepParam = Number(searchParams?.get("step") || 0)
  const router = useRouter()

	const [treatments, setTreatments] = useState<Treatment[]>([])
	const [availableLocations, setAvailableLocations] = useState<Location[]>([])

	const [form, setForm] = useState({
		treatmentId: preselectedTreatment,
		locationId: "",
		pharmacistId: "",
		customerName: "",
		customerEmail: "",
		customerPhone: "",
		preferredDate: "",
		preferredTime: "",
		notes: "",
	})

	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [paying, setPaying] = useState(false)
	const [step, setStep] = useState(Math.max(0, Math.min(stepParam || 0, 20)))
const [availableSlots, setAvailableSlots] = useState<{ time: string; count: number }[]>([])
  const selectedTreatment = useMemo(()=> treatments.find(t=> t.id === form.treatmentId), [treatments, form.treatmentId])
  const requiresSlots = !!selectedTreatment?.showSlots || selectedTreatment?.showSlots === undefined

	const steps = useMemo(() => {
		const base = [
			"treatment",
			"location",
			"name",
			"email",
			"phone",
		]
		const scheduling = requiresSlots ? ["date","time"] : []
		return [...base, ...scheduling, "notes", "review"]
	}, [requiresSlots])

	const totalSteps = steps.length
	const progress = Math.round((step / (totalSteps - 1)) * 100)

	// Sync step in URL to support OS back/forward
	useEffect(() => {
		try {
			const url = new URL(window.location.href)
			url.searchParams.set('step', String(step))
			router.push(url.pathname + '?' + url.searchParams.toString(), { scroll: false })
		} catch {}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [step])

	// Ensure viewport is at top when changing steps (mobile ergonomics)
	useEffect(() => {
		try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { window.scrollTo(0,0) }
	}, [step])

	useEffect(() => {
		const load = async () => {
			try {
				const tRes = await fetch("/api/treatments")
				const tData = await tRes.json()
				setTreatments(tData)
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	// Load locations for selected treatment
	useEffect(() => {
		if (!form.treatmentId) {
			setAvailableLocations([])
			return
		}
		const run = async () => {
			const res = await fetch(`/api/treatments/${form.treatmentId}/locations`)
			const data = await res.json()
			setAvailableLocations(data)
			if (!data.find((l: Location) => l.id === form.locationId)) {
				setForm((p) => ({ ...p, locationId: "", pharmacistId: "" }))
			}
		}
		run()
	}, [form.treatmentId])

	// (Pharmacist selection removed) Always auto-assign server-side

	// Load available time slots when inputs change
	useEffect(() => {
    const fetchSlots = async () => {
        if (!requiresSlots || !form.treatmentId || !form.locationId || !form.preferredDate) {
        setAvailableSlots([])
        return
      }
      const url = new URL('/api/availability', window.location.origin)
      url.searchParams.set('date', form.preferredDate)
      url.searchParams.set('treatmentId', form.treatmentId)
      url.searchParams.set('locationId', form.locationId)
      const res = await fetch(url.toString())
      const data = await res.json()
      const slots: { time: string; count: number }[] = Array.isArray(data.slots)
        ? data.slots.map((s:any)=> (typeof s === 'string' ? { time: s, count: 1 } : { time: s.time, count: Number(s.count)||0 }))
        : []
      const nonZero = slots.filter(s=> s.count>0)
      setAvailableSlots(nonZero)
      if (form.preferredTime && !nonZero.some(s=> s.time === form.preferredTime)) {
        setForm((p)=> ({ ...p, preferredTime: '' }))
      }
    }
		fetchSlots()
	}, [form.treatmentId, form.locationId, form.preferredDate])

	const canNext = () => {
			switch (steps[step]) {
			case "treatment":
				return !!form.treatmentId
			case "location":
				return !!form.locationId
			case "name":
				return form.customerName.trim().length > 1
			case "email":
				return /.+@.+\..+/.test(form.customerEmail)
			case "phone":
				return form.customerPhone.trim().length >= 7
      case "date":
        return requiresSlots ? !!form.preferredDate : true
      case "time":
        return requiresSlots ? !!form.preferredTime : true
			default:
				return true
		}
	}

	const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1))
	const back = () => setStep((s) => Math.max(s - 1, 0))

	const submit = async () => {
		setSubmitting(true)
		try {
			const res = await fetch("/api/bookings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // if no slots required, omit preferredTime and allow missing preferredDate
          ...(requiresSlots ? {} : { preferredTime: undefined, preferredDate: form.preferredDate || undefined })
        }),
			})
			if (!res.ok) throw new Error("Failed to create booking")
			const booking = await res.json()
			window.location.href = `/booking-confirmation/${booking.id}`
		} catch (e) {
			alert("There was a problem creating your booking. Please try again.")
		} finally {
			setSubmitting(false)
		}
	}

	const submitAndPay = async () => {
		setPaying(true)
		try {
			// 1) Create booking
			const res = await fetch("/api/bookings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					...(requiresSlots ? {} : { preferredTime: undefined, preferredDate: form.preferredDate || undefined })
				}),
			})
			if (!res.ok) throw new Error("Failed to create booking")
			const booking = await res.json()
			// 2) Create checkout session
			const cr = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: booking.id }) })
			if (!cr.ok) throw new Error("Failed to start payment")
			const data = await cr.json()
			if (data.url) {
				window.location.href = data.url
			} else {
				window.location.href = `/booking-confirmation/${booking.id}`
			}
		} catch (e) {
			alert("There was a problem starting payment. Your booking may still be saved. You can pay in store or try again from the confirmation page.")
		} finally {
			setPaying(false)
		}
	}

	if (loading) {
		return (
			<div className="min-h-screen grid place-items-center bg-white">
				<p className="text-gray-500">Loading…</p>
			</div>
		)
	}

	// Slide container width equals number of steps; translate by step index
	return (
		<div className="min-h-screen bg-white">
			{/* Top bar with brand to match FOH */}
			<header className="fixed inset-x-0 top-0 z-50">
				<div className="mx-auto max-w-4xl px-6 py-4">
                    <div className="flex items-center justify-between rounded-full bg-white/80 backdrop-blur px-4 py-2 shadow-sm">
                        <Link href="/" className="flex items-center gap-2">
                            <Image src="/twilightnew.png" alt="Twilight Pharmacy" width={200} height={60} className="h-8 sm:h-10 w-auto" />
                        </Link>
						<Link href="/" className="text-xs text-gray-600 hover:text-gray-900">Back to home</Link>
					</div>
				</div>
			</header>

			<main className="pt-24">
				<div className="mx-auto max-w-3xl px-6">
					{/* Progress bar */}
					<div className="mb-6">
						<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
							<div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
						</div>
						<p className="mt-2 text-xs text-gray-500">{progress}% complete</p>
					</div>

					{/* Slides viewport */}
					<div className="relative overflow-hidden rounded-2xl bg-white shadow-xl border">
						<div
							className="flex transition-transform duration-500"
							style={{ width: `${totalSteps * 100}%`, transform: `translateX(-${step * (100 / totalSteps)}%)` }}
						>
							{/* Step 0: Treatment */}
                            <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">Which treatment do you need?</h2>
								<p className="text-gray-600 mt-1">Choose one to continue</p>
								<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
									{treatments.map((t) => (
										<button
											key={t.id}
                                        className={`text-left rounded-xl border p-4 hover:border-[#36c3f0] hover:shadow ${form.treatmentId === t.id ? "border-[#36c3f0] ring-2 ring-[#e9f7fe]" : "border-gray-200"}`}
											onClick={() => {
												setForm((p) => ({ ...p, treatmentId: t.id }))
												setTimeout(next, 100)
											}}
										>
											<p className="font-medium">{t.name}</p>
											<p className="text-sm text-gray-500">£{t.price} · {t.duration} mins</p>
										</button>
									))}
								</div>
							</section>

							{/* Step 1: Location */}
                            <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">Where would you like to visit?</h2>
								<p className="text-gray-600 mt-1">Only locations offering your treatment are shown</p>
								<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
									{availableLocations.map((loc) => (
										<button
											key={loc.id}
                                        className={`text-left rounded-xl border p-4 hover:border-[#36c3f0] hover:shadow ${form.locationId === loc.id ? "border-[#36c3f0] ring-2 ring-[#e9f7fe]" : "border-gray-200"}`}
											onClick={() => {
												setForm((p) => ({ ...p, locationId: loc.id }))
												setTimeout(next, 100)
											}}
										>
											<p className="font-medium">{loc.name}</p>
											<p className="text-sm text-gray-500">{loc.address}</p>
										</button>
									))}
								</div>
							</section>

                            {/* Pharmacist step removed: auto-assigned by pharmacy */}

							{/* Step 3-5: Name, Email, Phone */}
                            <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">What’s your full name?</h2>
								<div className="mt-6 max-w-md">
									<Input
										value={form.customerName}
										onChange={(e) => setForm({ ...form, customerName: e.target.value })}
										placeholder="Jane Doe"
									/>
								</div>
							</section>

                            <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">What’s your email?</h2>
								<div className="mt-6 max-w-md">
									<Input
										type="email"
										value={form.customerEmail}
										onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
										onKeyDown={(e)=>{ if (e.key === 'Enter') { if (!/.+@.+\..+/.test(form.customerEmail)) { e.preventDefault(); e.stopPropagation(); } else { next() } } }}
										placeholder="you@example.com"
									/>
									{form.customerEmail && !/.+@.+\..+/.test(form.customerEmail) && (
										<p className="mt-1 text-xs text-red-600">Please enter a valid email address.</p>
									)}
								</div>
							</section>

                            <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">Best phone number?</h2>
								<div className="mt-6 max-w-md">
									<Input
										type="tel"
										value={form.customerPhone}
										onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
										placeholder="07xxxxxxxxx"
									/>
								</div>
							</section>

                            {/* Step 6-7: Date/Time (only when scheduling is required) */}
                            {requiresSlots && (
                              <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
                                  <h2 className="text-2xl font-bold">Preferred date?</h2>
                                  <div className="mt-6 max-w-md">
                                      <Input
                                          type="date"
                                          min={(() => { const d = new Date(); const tz = d.getTimezoneOffset()*60000; return new Date(d.getTime()-tz).toISOString().split('T')[0] })()}
                                          value={form.preferredDate}
                                          onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                                      />
                                  </div>
                              </section>
                            )}

                            {requiresSlots && (
                              <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
                                  <h2 className="text-2xl font-bold">Preferred time?</h2>
                                  <div className="mt-6 max-w-md">
                                    <select
                                      className="w-full h-10 rounded-md border border-gray-300 px-3 text-sm"
                                      value={form.preferredTime}
                                      onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                                    >
                                      <option value="">Select time</option>
                                      {availableSlots.map((s)=> (
                                        <option key={s.time} value={s.time}>{s.time}</option>
                                      ))}
                                    </select>
                                  </div>
                              </section>
                            )}

							{/* Step 8: Notes */}
                            <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">Any additional notes?</h2>
								<div className="mt-6 max-w-xl">
									<Textarea
										placeholder="Optional"
										value={form.notes}
										onChange={(e) => setForm({ ...form, notes: e.target.value })}
									/>
								</div>
							</section>

							{/* Step 9: Review */}
							<section className="w-full px-6 py-10" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">Review & confirm</h2>
								<ul className="mt-6 space-y-2 text-sm text-gray-700">
									<li className="flex justify-between"><span>Treatment</span><span className="font-medium">{treatments.find((t) => t.id === form.treatmentId)?.name}</span></li>
									<li className="flex justify-between"><span>Location</span><span className="font-medium">{availableLocations.find((l) => l.id === form.locationId)?.name}</span></li>
						<li className="flex justify-between"><span>Pharmacist</span><span className="font-medium">Assigned by pharmacy</span></li>
									<li className="flex justify-between"><span>Name</span><span className="font-medium">{form.customerName}</span></li>
									<li className="flex justify-between"><span>Email</span><span className="font-medium">{form.customerEmail}</span></li>
									<li className="flex justify-between"><span>Phone</span><span className="font-medium">{form.customerPhone}</span></li>
									<li className="flex justify-between"><span>Date</span><span className="font-medium">{form.preferredDate}</span></li>
									<li className="flex justify-between"><span>Time</span><span className="font-medium">{form.preferredTime}</span></li>
								</ul>
					<div className="mt-8 flex flex-wrap gap-3">
						<Button variant="outline" className="rounded-full border-[#36c3f0] text-[#36c3f0] hover:bg-[#e9f7fe]" onClick={submit} disabled={submitting || paying}>
							{submitting ? "Booking…" : "Book · Pay in store"}
						</Button>
						<Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={submitAndPay} disabled={submitting || paying}>
							{paying ? "Redirecting…" : "Book & Pay now"}
						</Button>
					</div>
							</section>
						</div>
					</div>

					{/* Controls */}
					<div className="mt-6 sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-100 px-0 py-3 flex items-center justify-between">
						<Button variant="outline" className="rounded-full" onClick={back} disabled={step === 0}>
							<ChevronLeft className="w-4 h-4 mr-2" /> Back
						</Button>
                        <Button className="rounded-full bg-[#36c3f0] hover:bg-[#2eb5e8]" onClick={next} disabled={!canNext() || step >= totalSteps - 1}>
							Next <ChevronRight className="w-4 h-4 ml-2" />
						</Button>
					</div>
				</div>
			</main>

			{/* Redirect overlay for Stripe */}
			{paying && (
				<div className="fixed inset-0 z-[100] backdrop-blur-sm bg-white/60 grid place-items-center">
					<div className="rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-xl px-8 py-6 text-center">
						<div className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-[#36c3f0] border-t-transparent animate-spin" />
						<p className="text-sm text-gray-700 font-medium">Redirecting to secure payment…</p>
						<p className="mt-1 text-xs text-gray-500">This can take a couple of seconds.</p>
					</div>
				</div>
			)}
		</div>
	)
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center">Loading…</div>}>
      <ConsultationWizard />
    </Suspense>
  )
}
