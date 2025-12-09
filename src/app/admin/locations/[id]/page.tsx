'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

type Booking = { id: string; preferredDate: string; preferredTime: string; treatment: { name: string; duration: number }; pharmacist?: { id: string; name: string }; paymentStatus?: string; paymentAmount?: number }
type Block = { id: string; start: string; end: string; reason?: string }
type Treatment = { id: string; name: string }
type Pharmacist = { id: string; name: string }

function formatDate(d: Date) { return d.toISOString().slice(0,10) }

export default function LocationTimetablePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const search = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weekStart, setWeekStart] = useState<string>('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([])
  const [filters, setFilters] = useState<{ treatmentId: string; pharmacistId: string }>({ treatmentId: '', pharmacistId: '' })
  const [openAdd, setOpenAdd] = useState(false)
  const [openBlock, setOpenBlock] = useState(false)
  const [openDetail, setOpenDetail] = useState<any | null>(null)
  const [addForm, setAddForm] = useState({ treatmentId: '', pharmacistId: '', customerName: '', customerEmail: '', customerPhone: '', date: '', time: '', notes: '' })
  const [blockForm, setBlockForm] = useState({ start: '', end: '', reason: '' })

  const id = params.id

  useEffect(()=>{
    const today = new Date()
    const dow = (today.getDay() + 6) % 7
    const monday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
    monday.setUTCDate(monday.getUTCDate() - dow)
    setWeekStart(formatDate(monday))
  }, [])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const qs = new URLSearchParams()
      if (weekStart) qs.set('weekStart', weekStart)
      if (filters.treatmentId) qs.set('treatmentId', filters.treatmentId)
      if (filters.pharmacistId) qs.set('pharmacistId', filters.pharmacistId)
      const [cal, t, p] = await Promise.all([
        fetch(`/api/admin/locations/${id}/calendar?` + qs.toString()).then(r=>r.json()),
        fetch('/api/treatments').then(r=>r.json()),
        fetch('/api/pharmacists').then(r=>r.json()),
      ])
      setBookings(cal.bookings || [])
      setBlocks(cal.blocks || [])
      setTreatments(t || [])
      setPharmacists(p || [])
    } catch (e) {
      setError('Failed to load timetable')
    } finally { setLoading(false) }
  }

  useEffect(()=>{ if (id && weekStart) load() }, [id, weekStart, filters])

  const days = useMemo(()=>{
    if (!weekStart) return []
    const start = new Date(weekStart + 'T00:00:00Z')
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setUTCDate(start.getUTCDate() + i)
      return d
    })
  }, [weekStart])

  const groupedBookings = useMemo(()=>{
    const m = new Map<string, Booking[]>()
    for (const b of bookings) {
      const key = b.preferredDate.slice(0,10)
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(b)
    }
    return m
  }, [bookings])

  const groupedBlocks = useMemo(()=>{
    const m = new Map<string, Block[]>();
    for (const bl of blocks) {
      const d = new Date(bl.start)
      const key = formatDate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())))
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(bl)
    }
    return m
  }, [blocks])

  const nextWeek = () => {
    const d = new Date(weekStart + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() + 7)
    setWeekStart(formatDate(d))
  }
  const prevWeek = () => {
    const d = new Date(weekStart + 'T00:00:00Z')
    d.setUTCDate(d.getUTCDate() - 7)
    setWeekStart(formatDate(d))
  }

  const submitAdd = async () => {
    const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      treatmentId: addForm.treatmentId,
      locationId: id,
      pharmacistId: addForm.pharmacistId || undefined,
      customerName: addForm.customerName,
      customerEmail: addForm.customerEmail,
      customerPhone: addForm.customerPhone,
      preferredDate: addForm.date,
      preferredTime: addForm.time,
      notes: addForm.notes,
    }) })
    if (res.ok) { setOpenAdd(false); await load() } else { alert('Failed to add booking') }
  }

  const submitBlock = async () => {
    const res = await fetch(`/api/admin/locations/${id}/blocks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(blockForm) })
    if (res.ok) { setOpenBlock(false); await load() } else { alert('Failed to create block') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Location Timetable</h1>
            <p className="text-sm text-gray-600">Week starting {weekStart}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full" onClick={prevWeek}>Previous</Button>
            <Button className="rounded-full" onClick={nextWeek}>Next</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end mb-5">
          <div className="w-56">
            <label className="block text-sm text-gray-700 mb-1">Treatment</label>
            <Select value={filters.treatmentId} onChange={(e)=> setFilters((p)=> ({ ...p, treatmentId: e.target.value }))}>
              <option value="">All</option>
              {treatments.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </div>
          <div className="w-56">
            <label className="block text-sm text-gray-700 mb-1">Pharmacist</label>
            <Select value={filters.pharmacistId} onChange={(e)=> setFilters((p)=> ({ ...p, pharmacistId: e.target.value }))}>
              <option value="">All</option>
              {pharmacists.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </div>
          <div className="ml-auto flex gap-2">
            <Button className="rounded-full bg-emerald-600" onClick={()=> setOpenAdd(true)}>Add Booking</Button>
            <Button variant="outline" className="rounded-full" onClick={()=> setOpenBlock(true)}>Block Day/Range</Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {days.map((d)=>{
            const key = formatDate(d)
            const dayBookings = groupedBookings.get(key) || []
            const sortedBookings = [...dayBookings].sort((a,b)=> String(a.preferredTime).localeCompare(String(b.preferredTime)))
            const dayBlocks = groupedBlocks.get(key) || []
            const isToday = key === formatDate(new Date())
            return (
              <Card key={key} className={`bg-white ${isToday ? 'ring-2 ring-blue-400' : 'ring-1 ring-black/5'} overflow-hidden`}>
                <CardHeader className="p-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{new Date(key).toLocaleDateString(undefined,{ weekday:'short'})}</span>
                    <span className="text-sm text-gray-500">{new Date(key).toLocaleDateString()}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {dayBlocks.map(b=> (
                      <div key={b.id} className="px-3 py-2 bg-rose-50 text-rose-700 text-sm">Blocked: {new Date(b.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(b.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {b.reason ? `· ${b.reason}`:''}</div>
                    ))}
                    {sortedBookings.map((b)=> {
                      const status = (b as any).status || 'pending'
                      const cls = status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-50 text-gray-800 border border-gray-200'
                      return (
                        <button key={b.id} onClick={()=> setOpenDetail(b)} className={`w-full px-3 py-2 text-left text-sm ${cls}`}>
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate mr-2">{b.treatment?.name || 'Booking'}</p>
                            <span className="text-xs opacity-70 capitalize">{status}</span>
                          </div>
                          <p className="text-gray-600 text-xs">
                            {b.preferredTime} · {b.treatment?.duration ?? ''}m {b.pharmacist ? `· ${b.pharmacist.name}` : ''}
                          </p>
                        </button>
                      )
                    })}
                    {dayBlocks.length === 0 && dayBookings.length === 0 && (
                      <div className="px-3 py-6 text-center text-sm text-gray-400">No entries</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Modal open={!!openDetail} onClose={()=> setOpenDetail(null)} title="Booking Details">
        {openDetail && (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Status:</span> <span className="capitalize">{(openDetail as any).status}</span></p>
            <p>
              <span className="font-medium">Payment:</span>{" "}
              <span className="capitalize">
                {(openDetail as any).paymentStatus || "unpaid"}
                {typeof (openDetail as any).paymentAmount === "number"
                  ? ` · £${((openDetail as any).paymentAmount / 100).toFixed(2)}`
                  : ""}
              </span>
            </p>
            <p><span className="font-medium">Treatment:</span> {openDetail.treatment?.name}</p>
            <p><span className="font-medium">Pharmacist:</span> {openDetail.pharmacist?.name || 'Auto-assign'}</p>
            <p><span className="font-medium">Date:</span> {new Date(openDetail.preferredDate).toLocaleDateString()} {openDetail.preferredTime}</p>
            <p><span className="font-medium">Customer:</span> {openDetail.customerName}</p>
            <p><span className="font-medium">Email:</span> {openDetail.customerEmail}</p>
            <p><span className="font-medium">Phone:</span> {openDetail.customerPhone}</p>
            {openDetail.notes && (<p><span className="font-medium">Notes:</span> {openDetail.notes}</p>)}
            <div className="pt-2 text-xs text-gray-500">ID: {openDetail.id}</div>
          </div>
        )}
      </Modal>

      <Modal open={openAdd} onClose={()=> setOpenAdd(false)} title="Add Booking">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Treatment</label>
            <select className="w-full h-10 rounded-md border px-3" value={addForm.treatmentId} onChange={(e)=> setAddForm({ ...addForm, treatmentId: e.target.value })}>
              <option value="">Select</option>
              {treatments.map(t=> <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Pharmacist (optional)</label>
              <select className="w-full h-10 rounded-md border px-3" value={addForm.pharmacistId} onChange={(e)=> setAddForm({ ...addForm, pharmacistId: e.target.value })}>
                <option value="">Auto-assign</option>
                {pharmacists.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700">Date</label>
              <Input type="date" value={addForm.date} onChange={(e)=> setAddForm({ ...addForm, date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Time</label>
              <Input value={addForm.time} onChange={(e)=> setAddForm({ ...addForm, time: e.target.value })} placeholder="HH:MM" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Phone</label>
              <Input value={addForm.customerPhone} onChange={(e)=> setAddForm({ ...addForm, customerPhone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <Input value={addForm.customerName} onChange={(e)=> setAddForm({ ...addForm, customerName: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <Input value={addForm.customerEmail} onChange={(e)=> setAddForm({ ...addForm, customerEmail: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=> setOpenAdd(false)}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600" onClick={submitAdd}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openBlock} onClose={()=> setOpenBlock(false)} title="Block Day/Range">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Start</label>
              <Input type="datetime-local" value={blockForm.start} onChange={(e)=> setBlockForm({ ...blockForm, start: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">End</label>
              <Input type="datetime-local" value={blockForm.end} onChange={(e)=> setBlockForm({ ...blockForm, end: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Reason (optional)</label>
            <Input value={blockForm.reason} onChange={(e)=> setBlockForm({ ...blockForm, reason: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=> setOpenBlock(false)}>Cancel</Button>
            <Button className="rounded-full" onClick={submitBlock}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


