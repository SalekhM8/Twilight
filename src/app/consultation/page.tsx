"use client"

export const dynamic = "force-dynamic"
import { Suspense } from "react"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { useSearchParams } from "next/navigation"

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

interface Pharmacist {
	id: string
	name: string
	bio: string
}

export function ConsultationWizard() {
	const searchParams = useSearchParams()
	const preselectedTreatment = searchParams?.get("treatment") || ""

	const [treatments, setTreatments] = useState<Treatment[]>([])
	const [availableLocations, setAvailableLocations] = useState<Location[]>([])
	const [availablePharmacists, setAvailablePharmacists] = useState<Pharmacist[]>([])

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
	const [step, setStep] = useState(0)
	const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const selectedTreatment = useMemo(()=> treatments.find(t=> t.id === form.treatmentId), [treatments, form.treatmentId])
  const requiresSlots = !!selectedTreatment?.showSlots || selectedTreatment?.showSlots === undefined

  const steps = useMemo(() => {
    const base = [
      "treatment",
      "location",
      "pharmacist",
      "name",
      "email",
      "phone",
    ]
    const scheduling = requiresSlots ? ["date","time"] : []
    return [...base, ...scheduling, "notes", "review"]
  }, [requiresSlots])

	const totalSteps = steps.length
	const progress = Math.round((step / (totalSteps - 1)) * 100)

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
			setAvailablePharmacists([])
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

	// Load pharmacists for treatment + location
	useEffect(() => {
		if (!form.treatmentId || !form.locationId) {
			setAvailablePharmacists([])
			return
		}
		const run = async () => {
			const res = await fetch(
				`/api/treatments/${form.treatmentId}/pharmacists?locationId=${form.locationId}`
			)
			const data = await res.json()
			setAvailablePharmacists(data)
			if (!data.find((p: Pharmacist) => p.id === form.pharmacistId)) {
				setForm((pr) => ({ ...pr, pharmacistId: "" }))
			}
		}
		run()
	}, [form.treatmentId, form.locationId])

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
			if (form.pharmacistId) url.searchParams.set('pharmacistId', form.pharmacistId)
			const res = await fetch(url.toString())
			const data = await res.json()
			const slots = Array.isArray(data.slots) ? data.slots.map((s:any)=>(typeof s==='string'?s:s.time)) : []
			setAvailableSlots(slots)
		}
		fetchSlots()
	}, [form.treatmentId, form.locationId, form.pharmacistId, form.preferredDate])

	const canNext = () => {
		switch (steps[step]) {
			case "treatment":
				return !!form.treatmentId
			case "location":
				return !!form.locationId
			case "pharmacist":
				return true // optional ("Don't mind")
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
							<div className="w-8 h-8 rounded-full bg-emerald-600 text-white grid place-items-center font-bold">T</div>
							<span className="text-sm font-semibold text-gray-800">TWILIGHT</span>
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
											className={`text-left rounded-xl border p-4 hover:border-blue-500 hover:shadow ${form.treatmentId === t.id ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"}`}
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
											className={`text-left rounded-xl border p-4 hover:border-blue-500 hover:shadow ${form.locationId === loc.id ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"}`}
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

							{/* Step 2: Pharmacist */}
                            <section className="w-full px-6 py-10 shrink-0" style={{ width: `${100 / totalSteps}%` }}>
								<h2 className="text-2xl font-bold">Do you have a preferred pharmacist?</h2>
								<p className="text-gray-600 mt-1">Choose one or select "Don’t mind"</p>
								<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
									<button
										className={`text-left rounded-xl border p-4 hover:border-blue-500 hover:shadow ${form.pharmacistId === "" ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"}`}
										onClick={() => {
											setForm((p) => ({ ...p, pharmacistId: "" }))
											setTimeout(next, 100)
										}}
									>
										<p className="font-medium">Don’t mind</p>
										<p className="text-sm text-gray-500">Assign the next available expert</p>
									</button>
									{availablePharmacists.map((p) => (
										<button
											key={p.id}
											className={`text-left rounded-xl border p-4 hover:border-blue-500 hover:shadow ${form.pharmacistId === p.id ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200"}`}
											onClick={() => {
												setForm((pr) => ({ ...pr, pharmacistId: p.id }))
												setTimeout(next, 100)
											}}
										>
											<p className="font-medium">{p.name}</p>
											<p className="text-sm text-gray-500">{p.bio}</p>
										</button>
									))}
								</div>
							</section>

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
										placeholder="you@example.com"
									/>
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
                                          min={new Date().toISOString().split("T")[0]}
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
                                      {availableSlots.map((t)=> (
                                        <option key={t} value={t}>{t}</option>
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
									<li className="flex justify-between"><span>Pharmacist</span><span className="font-medium">{availablePharmacists.find((p) => p.id === form.pharmacistId)?.name || "Don’t mind"}</span></li>
									<li className="flex justify-between"><span>Name</span><span className="font-medium">{form.customerName}</span></li>
									<li className="flex justify-between"><span>Email</span><span className="font-medium">{form.customerEmail}</span></li>
									<li className="flex justify-between"><span>Phone</span><span className="font-medium">{form.customerPhone}</span></li>
									<li className="flex justify-between"><span>Date</span><span className="font-medium">{form.preferredDate}</span></li>
									<li className="flex justify-between"><span>Time</span><span className="font-medium">{form.preferredTime}</span></li>
								</ul>
								<div className="mt-8">
									<Button className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={submit} disabled={submitting}>
										{submitting ? "Booking…" : "Confirm Booking"}
									</Button>
								</div>
							</section>
						</div>
					</div>

					{/* Controls */}
					<div className="mt-6 flex items-center justify-between">
						<Button variant="outline" className="rounded-full" onClick={back} disabled={step === 0}>
							<ChevronLeft className="w-4 h-4 mr-2" /> Back
						</Button>
						<Button className="rounded-full bg-blue-600 hover:bg-blue-700" onClick={next} disabled={!canNext() || step >= totalSteps - 1}>
							Next <ChevronRight className="w-4 h-4 ml-2" />
						</Button>
					</div>
				</div>
			</main>
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
