'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Modal from '@/components/ui/modal'

type Treatment = { id: string; name: string; price: number; duration: number; isActive: boolean }
type Pharmacist = { id: string; name: string; email: string }
type Location = { id: string; name: string }

export default function AdminManage() {
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [pharmacists, setPharmacists] = useState<Pharmacist[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/treatments').then(r=>r.json()),
      fetch('/api/admin/pharmacists').then(r=>r.json()),
      fetch('/api/locations').then(r=>r.json()),
    ]).then(([t, p, l]) => { setTreatments(t); setPharmacists(p); setLocations(l); setLoading(false) })
  }, [])

  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [newTreatment, setNewTreatment] = useState({ name: '', price: '', duration: '', description: '' })

  async function createTreatment() {
    const res = await fetch('/api/admin/treatments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...newTreatment, price: Number(newTreatment.price), duration: Number(newTreatment.duration) }) })
    if (res.ok) {
      const t = await res.json()
      setTreatments(prev => [...prev, t])
      setShowTreatmentModal(false)
      setNewTreatment({ name: '', price: '', duration: '', description: '' })
    }
  }

  if (loading) return <div className="p-8">Loading…</div>

  return (
    <div className="p-8 space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Treatments</h2>
          <Button className="rounded-full" onClick={()=>setShowTreatmentModal(true)}>Add Treatment</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {treatments.map(t => (
            <Card key={t.id} className="bg-white/80 backdrop-blur ring-1 ring-black/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t.name}</span>
                  <span className="text-sm text-emerald-600">£{t.price} · {t.duration}m</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" className="rounded-full">Edit</Button>
                <Button variant="outline" className="rounded-full">Locations</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Modal open={showTreatmentModal} onClose={()=>setShowTreatmentModal(false)} title="Add Treatment">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <input className="mt-1 w-full h-10 rounded-md border px-3" value={newTreatment.name} onChange={e=>setNewTreatment({...newTreatment,name:e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Price (£)</label>
              <input className="mt-1 w-full h-10 rounded-md border px-3" value={newTreatment.price} onChange={e=>setNewTreatment({...newTreatment,price:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Duration (mins)</label>
              <input className="mt-1 w-full h-10 rounded-md border px-3" value={newTreatment.duration} onChange={e=>setNewTreatment({...newTreatment,duration:e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <textarea className="mt-1 w-full min-h-[80px] rounded-md border px-3 py-2" value={newTreatment.description} onChange={e=>setNewTreatment({...newTreatment,description:e.target.value})} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=>setShowTreatmentModal(false)}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={createTreatment}>Save</Button>
          </div>
        </div>
      </Modal>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Pharmacists</h2>
          <Button className="rounded-full">Add Pharmacist</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pharmacists.map(p => (
            <Card key={p.id} className="bg-white/80 backdrop-blur ring-1 ring-black/5">
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" className="rounded-full">Edit</Button>
                <Button variant="outline" className="rounded-full">Schedule</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}


