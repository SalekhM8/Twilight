'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  MapPin, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import Modal from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalPharmacists: number
  totalTreatments: number
  totalLocations: number
}

interface RecentBooking {
  id: string
  customerName: string
  treatment: { name: string }
  location: { name: string }
  preferredDate: string
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalPharmacists: 0,
    totalTreatments: 0,
    totalLocations: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  // Shared data for management tabs
  const [treatments, setTreatments] = useState<any[]>([])
  const [pharmacists, setPharmacists] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [loadingMgmt, setLoadingMgmt] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem('admin_logged_in')
    if (!isLoggedIn) {
      router.push('/admin/login')
      return
    }
    setIsAuthenticated(true)

    const fetchDashboardData = async () => {
      try {
        const [bookingsRes, pharmacistsRes, treatmentsRes, locationsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/pharmacists'),
          fetch('/api/treatments'),
          fetch('/api/locations')
        ])

        const [bookingsJson, pharmacistsJson, treatmentsJson, locationsJson] = await Promise.all([
          bookingsRes.json(),
          pharmacistsRes.json(),
          treatmentsRes.json(),
          locationsRes.json()
        ])

        const bookings = Array.isArray(bookingsJson) ? bookingsJson : []
        const pharmacists = Array.isArray(pharmacistsJson) ? pharmacistsJson : []
        const treatments = Array.isArray(treatmentsJson) ? treatmentsJson : []
        const locations = Array.isArray(locationsJson) ? locationsJson : []

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter((b: any) => b.status === 'pending').length,
          confirmedBookings: bookings.filter((b: any) => b.status === 'confirmed').length,
          totalPharmacists: pharmacists.length,
          totalTreatments: treatments.length,
          totalLocations: locations.length
        })

        setRecentBookings(bookings.slice(0, 5))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [router])

  // Load base data when switching to management tabs
  useEffect(() => {
    const needMgmtData = ['treatments','pharmacists','locations'].includes(activeTab)
    if (!needMgmtData) return
    const load = async () => {
      setLoadingMgmt(true)
      setErrorMsg('')
      try {
        const reqs: Promise<Response>[] = []
        if (activeTab === 'treatments') {
          reqs.push(fetch('/api/admin/treatments'))
          reqs.push(fetch('/api/admin/locations'))
        } else if (activeTab === 'pharmacists') {
          reqs.push(fetch('/api/admin/pharmacists'))
          reqs.push(fetch('/api/admin/treatments'))
          reqs.push(fetch('/api/admin/locations'))
        } else if (activeTab === 'locations') {
          reqs.push(fetch('/api/admin/locations'))
        }
        const res = await Promise.all(reqs)
        const json = await Promise.all(res.map(r=>r.json()))
        if (activeTab === 'treatments') {
          setTreatments(Array.isArray(json[0]) ? json[0] : [])
          setLocations(Array.isArray(json[1]) ? json[1] : [])
        }
        if (activeTab === 'pharmacists') {
          setPharmacists(Array.isArray(json[0]) ? json[0] : [])
          setTreatments(Array.isArray(json[1]) ? json[1] : [])
          setLocations(Array.isArray(json[2]) ? json[2] : [])
        }
        if (activeTab === 'locations') {
          setLocations(Array.isArray(json[0]) ? json[0] : [])
        }
      } catch (e) {
        setErrorMsg('Failed to load data')
      } finally {
        setLoadingMgmt(false)
      }
    }
    load()
  }, [activeTab])

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'pharmacists', label: 'Pharmacists', icon: Users },
    { id: 'treatments', label: 'Treatments', icon: Stethoscope },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'reviews', label: 'Reviews', icon: CheckCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'about', label: 'About Us', icon: Users },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return AlertCircle
      case 'confirmed': return CheckCircle
      case 'completed': return CheckCircle
      case 'cancelled': return XCircle
      default: return Clock
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in')
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/90 backdrop-blur rounded-3xl shadow-[0_8px_40px_rgba(54,195,240,0.12)] m-4 flex flex-col">
        <div className="py-8 px-6">
          <div className="flex items-center justify-center">
            <img src="/twilightnew.png" alt="Twilight Pharmacy" className="h-24 w-auto" />
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const IconComponent = item.icon
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full">
              View Website
            </Button>
          </Link>
          <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col m-4">
        <div className="flex-1 rounded-3xl bg-white/70 backdrop-blur shadow-[0_8px_40px_rgba(54,195,240,0.12)] p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#155d7e] capitalize">{activeTab}</h2>
              <p className="text-[#155d7e]">Manage your pharmacy operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <QuickAdd onSelect={(tab)=> setActiveTab(tab)} />
            </div>
          </div>

          {/* Dashboard Content */}
          <main className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-[#f3fbff] to-[#e9f7fe] ring-1 ring-[#e9f7fe]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#36c3f0]">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-[#36c3f0]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#1d9fd0]">{stats.totalBookings}</div>
                    <p className="text-xs text-[#36c3f0] mt-1">
                      <TrendingUp className="inline w-3 h-3 mr-1" />
                      +12% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#f3fbff] to-[#e9f7fe] ring-1 ring-[#e9f7fe]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#36c3f0]">Confirmed Today</CardTitle>
                    <CheckCircle className="h-4 w-4 text-[#36c3f0]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#1d9fd0]">{stats.confirmedBookings}</div>
                    <p className="text-xs text-[#36c3f0] mt-1">
                      <TrendingUp className="inline w-3 h-3 mr-1" />
                      +8% from yesterday
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-700">Pending Review</CardTitle>
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-900">{stats.pendingBookings}</div>
                    <p className="text-xs text-amber-600 mt-1">Requires attention</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-700">Active Pharmacists</CardTitle>
                    <Users className="h-4 w-4 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">{stats.totalPharmacists}</div>
                    <p className="text-xs text-purple-600 mt-1">All locations</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-indigo-700">Available Treatments</CardTitle>
                    <Stethoscope className="h-4 w-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-indigo-900">{stats.totalTreatments}</div>
                    <p className="text-xs text-indigo-600 mt-1">Across all locations</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#f3fbff] to-[#e9f7fe] ring-1 ring-[#e9f7fe]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#36c3f0]">Pharmacy Locations</CardTitle>
                    <MapPin className="h-4 w-4 text-[#36c3f0]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#1d9fd0]">{stats.totalLocations}</div>
                    <p className="text-xs text-[#36c3f0] mt-1">Birmingham area</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#155d7e]">Recent Bookings</CardTitle>
                  <CardDescription className="text-[#155d7e]">Latest consultation requests from customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => {
                      const StatusIcon = getStatusIcon(booking.status)
                      return (
                        <button key={booking.id} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100"
                          onClick={()=>{ try { localStorage.setItem('open_booking_id', booking.id) } catch {} ; setActiveTab('bookings') }}>
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${getStatusColor(booking.status)}`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.customerName}</p>
                              <p className="text-sm text-gray-600">
                                {booking.treatment.name} at {booking.location.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(booking.preferredDate).toLocaleDateString()}
                            </p>
                            <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'bookings' && (
            <BookingsManager onReload={async()=>{ const b = await fetch('/api/bookings').then(r=>r.json()); setRecentBookings(b.slice(0,5)); setStats((s)=> ({ ...s, totalBookings: b.length, pendingBookings: b.filter((x:any)=>x.status==='pending').length, confirmedBookings: b.filter((x:any)=>x.status==='confirmed').length })) }} />
          )}

          {activeTab === 'treatments' && (
            <TreatmentsManager 
              treatments={treatments}
              locations={locations}
              onReload={async()=>{
                const [t,l] = await Promise.all([
                  fetch('/api/admin/treatments').then(r=>r.json()),
                  fetch('/api/admin/locations').then(r=>r.json()),
                ])
                setTreatments(t)
                setLocations(l)
              }}
            />
          )}

          {activeTab === 'pharmacists' && (
            <PharmacistsManager 
              pharmacists={pharmacists}
              treatments={treatments}
              locations={locations}
              onReload={async()=>{
                const [p,t,l] = await Promise.all([
                  fetch('/api/admin/pharmacists').then(r=>r.json()),
                  fetch('/api/admin/treatments').then(r=>r.json()),
                  fetch('/api/admin/locations').then(r=>r.json()),
                ])
                setPharmacists(p)
                setTreatments(t)
                setLocations(l)
              }}
            />
          )}

          {activeTab === 'locations' && (
            <LocationsManager 
              locations={locations}
              onReload={async()=>{
                const l = await fetch('/api/admin/locations').then(r=>r.json())
                setLocations(l)
              }}
            />
          )}
          {activeTab === 'reviews' && (
            <ReviewsManager />
          )}
          {activeTab === 'about' && (
            <AboutManager />
          )}
          </main>
        </div>
      </div>
    </div>
  )
}
// About Manager
function AboutManager() {
  const [certs, setCerts] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openCert, setOpenCert] = useState(false)
  const [openPerson, setOpenPerson] = useState(false)
  const [editingCert, setEditingCert] = useState<any | null>(null)
  const [editingPerson, setEditingPerson] = useState<any | null>(null)
  const [certForm, setCertForm] = useState<any>({ title: '', subtitle: '', description: '', order: 0, isActive: true })
  const [personForm, setPersonForm] = useState<any>({ name: '', role: '', bio: '', order: 0, isActive: true })

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [c,p] = await Promise.all([
        fetch('/api/admin/about/certifications').then(r=>r.json()),
        fetch('/api/admin/about/people').then(r=>r.json()),
      ])
      setCerts(Array.isArray(c)?c:[])
      setPeople(Array.isArray(p)?p:[])
    } catch { setError('Failed to load About data') }
    finally { setLoading(false) }
  }

  useEffect(()=>{ load() }, [])

  const saveCert = async () => {
    const method = editingCert ? 'PATCH' : 'POST'
    const url = editingCert ? `/api/admin/about/certifications/${editingCert.id}` : '/api/admin/about/certifications'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(certForm) })
    if (res.ok) { setOpenCert(false); setEditingCert(null); await load() }
  }
  const savePerson = async () => {
    const method = editingPerson ? 'PATCH' : 'POST'
    const url = editingPerson ? `/api/admin/about/people/${editingPerson.id}` : '/api/admin/about/people'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(personForm) })
    if (res.ok) { setOpenPerson(false); setEditingPerson(null); await load() }
  }

  const deleteCert = async (id: string) => {
    if (!confirm('Delete this certification?')) return
    const res = await fetch(`/api/admin/about/certifications/${id}`, { method: 'DELETE' })
    if (res.ok) await load()
  }
  const deletePerson = async (id: string) => {
    if (!confirm('Delete this person?')) return
    const res = await fetch(`/api/admin/about/people/${id}`, { method: 'DELETE' })
    if (res.ok) await load()
  }

  if (loading) return <div className="py-6">Loading…</div>
  if (error) return <div className="py-6 text-red-600">{error}</div>

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Certifications</h3>
          <Button className="rounded-full" onClick={()=>{ setEditingCert(null); setCertForm({ title:'', subtitle:'', description:'', order:0, isActive:true }); setOpenCert(true) }}>Add Certification</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certs.map((c)=> (
            <Card key={c.id} className="bg-white/80 backdrop-blur ring-1 ring-black/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{c.title}</span>
                  <span className="text-sm text-gray-500">#{c.order}</span>
                </CardTitle>
                <CardDescription>{c.subtitle}</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={()=>{ setEditingCert(c); setCertForm({ title:c.title, subtitle:c.subtitle||'', description:c.description||'', order:c.order||0, isActive:c.isActive }); setOpenCert(true) }}>Edit</Button>
                <Button variant="outline" className="rounded-full text-red-600" onClick={()=>deleteCert(c.id)}>Delete</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">People</h3>
          <Button className="rounded-full" onClick={()=>{ setEditingPerson(null); setPersonForm({ name:'', role:'', bio:'', order:0, isActive:true }); setOpenPerson(true) }}>Add Person</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((p)=> (
            <Card key={p.id} className="bg-white/80 backdrop-blur ring-1 ring-black/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between"><span>{p.name}</span><span className="text-sm text-gray-500">{p.role}</span></CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={()=>{ setEditingPerson(p); setPersonForm({ name:p.name, role:p.role, bio:p.bio||'', order:p.order||0, isActive:p.isActive }); setOpenPerson(true) }}>Edit</Button>
                <Button variant="outline" className="rounded-full text-red-600" onClick={()=>deletePerson(p.id)}>Delete</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Modal open={openCert} onClose={()=>setOpenCert(false)} title={editingCert? 'Edit Certification':'Add Certification'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Title</label>
            <Input value={certForm.title} onChange={e=>setCertForm({ ...certForm, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Subtitle</label>
            <Input value={certForm.subtitle} onChange={e=>setCertForm({ ...certForm, subtitle: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <Textarea value={certForm.description} onChange={e=>setCertForm({ ...certForm, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Order</label>
              <Input value={certForm.order} onChange={e=>setCertForm({ ...certForm, order: Number(e.target.value)||0 })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="cert-active" type="checkbox" checked={!!certForm.isActive} onChange={(e)=> setCertForm({ ...certForm, isActive: e.target.checked })} />
            <label htmlFor="cert-active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=>{ setOpenCert(false); setEditingCert(null) }}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={saveCert}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openPerson} onClose={()=>setOpenPerson(false)} title={editingPerson? 'Edit Person':'Add Person'}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <Input value={personForm.name} onChange={e=>setPersonForm({ ...personForm, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Role</label>
              <Input value={personForm.role} onChange={e=>setPersonForm({ ...personForm, role: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Bio</label>
            <Textarea value={personForm.bio} onChange={e=>setPersonForm({ ...personForm, bio: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Order</label>
              <Input value={personForm.order} onChange={e=>setPersonForm({ ...personForm, order: Number(e.target.value)||0 })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="person-active" type="checkbox" checked={!!personForm.isActive} onChange={(e)=> setPersonForm({ ...personForm, isActive: e.target.checked })} />
            <label htmlFor="person-active" className="text-sm text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=>{ setOpenPerson(false); setEditingPerson(null) }}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={savePerson}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}


// Quick Add button
function QuickAdd({ onSelect }: { onSelect: (tab: string)=>void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button className="bg-[#36c3f0] hover:bg-[#2eb5e8] rounded-full shadow-sm text-[#155d7e]" onClick={()=>setOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Quick Add
      </Button>
      <Modal open={open} onClose={()=>setOpen(false)} title="Quick Add">
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'bookings', label: 'Bookings' },
            { id: 'treatments', label: 'New Treatment' },
            { id: 'pharmacists', label: 'New Pharmacist' },
            { id: 'locations', label: 'New Location' },
          ].map((item)=> (
            <button
              key={item.id}
              onClick={()=>{ setOpen(false); onSelect(item.id) }}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-[#36c3f0] hover:bg-[#f3fbff] transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>
      </Modal>
    </>
  )
}

// Bookings Manager
function BookingsManager({ onReload }: { onReload: ()=>void }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<any | null>(null)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/bookings')
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } catch (e) { setError('Failed to load bookings') }
      finally { setLoading(false) }
    }
    run().then(()=>{
      try {
        const id = localStorage.getItem('open_booking_id')
        if (id) {
          const found = (items || []).find((b)=> b.id === id)
          if (found) setDetail(found)
          localStorage.removeItem('open_booking_id')
        }
      } catch {}
    })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    // include pending comment if present in detail state
    const payload: any = { status }
    if (detail && (detail as any)._pendingComment) payload.comment = (detail as any)._pendingComment
    const res = await fetch(`/api/admin/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      const next = items.map((b)=> b.id === id ? { ...b, status } : b)
      setItems(next)
      onReload()
    }
  }

  if (loading) return <div className="py-6">Loading…</div>
  if (error) return <div className="py-6 text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Bookings</h3>
      <div className="space-y-3">
        {items.map((b)=> (
          <Card key={b.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <button className="text-left" onClick={()=>setDetail(b)}>
                  <p className="font-medium text-gray-900">{b.customerName}</p>
                  <p className="text-sm text-gray-600">{b.treatment.name} at {b.location.name} — {new Date(b.preferredDate).toLocaleDateString()} {b.preferredTime}</p>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{b.status}</span>
                <Button variant="outline" onClick={()=>updateStatus(b.id,'confirmed')}>Confirm</Button>
                <Button variant="outline" onClick={()=>updateStatus(b.id,'cancelled')}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={!!detail} onClose={()=>setDetail(null)} title="Booking Details">
        {detail && (
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Customer:</span> {detail.customerName}</p>
            <p><span className="font-medium">Email:</span> {detail.customerEmail}</p>
            <p><span className="font-medium">Phone:</span> {detail.customerPhone}</p>
            <p><span className="font-medium">Treatment:</span> {detail.treatment.name}</p>
            <p><span className="font-medium">Location:</span> {detail.location.name}</p>
            <p><span className="font-medium">Date:</span> {new Date(detail.preferredDate).toLocaleDateString()} {detail.preferredTime}</p>
            {detail.pharmacist && (<p><span className="font-medium">Pharmacist:</span> {detail.pharmacist.name}</p>)}
            {detail.notes && (<p><span className="font-medium">Notes:</span> {detail.notes}</p>)}
            <div className="pt-3">
              <label className="block text-sm font-medium mb-1">Admin comment</label>
              <Textarea placeholder="Optional note (visible internally)" onChange={(e)=> (detail._pendingComment = e.target.value)} />
            </div>
            <div className="pt-3 flex items-center gap-2">
              <Button onClick={()=>{ updateStatus(detail.id,'confirmed'); setDetail(null) }}>Confirm</Button>
              <Button variant="outline" onClick={()=>{ updateStatus(detail.id,'cancelled'); setDetail(null) }}>Cancel</Button>
              <span className="ml-auto text-xs text-gray-500">Quick contact:</span>
              <a className="px-2 py-1 rounded-full bg-emerald-600 text-white text-xs" href={`sms:${detail.customerPhone}`} target="_blank" rel="noreferrer">SMS</a>
              <a className="px-2 py-1 rounded-full bg-emerald-600 text-white text-xs" href={`https://wa.me/${detail.customerPhone.replace(/[^\d]/g,'')}`} target="_blank" rel="noreferrer">WhatsApp</a>
              <a className="px-2 py-1 rounded-full bg-gray-900 text-white text-xs" href={`tel:${detail.customerPhone}`} target="_blank" rel="noreferrer">Call</a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// Treatments Manager
function TreatmentsManager({ treatments, locations, onReload }: { treatments: any[]; locations: any[]; onReload: ()=>void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<any>({ name: '', summary: '', description: '', category: '', price: '', duration: '', isActive: true, showSlots: true, isTravel: false, isNhs: false, seasonStart: '', seasonEnd: '', locationIds: [] as string[] })

  const startNew = () => {
    setEditing(null)
    setForm({ name: '', summary: '', description: '', category: '', price: '', duration: '', isActive: true, showSlots: true, isTravel: false, isNhs: false, seasonStart: '', seasonEnd: '', locationIds: [] })
    setOpen(true)
  }
  const startEdit = async (t: any) => {
    setEditing(t)
    try {
      const detail = await fetch(`/api/treatments/${t.id}`).then(r=>r.json())
      const locIds = Array.isArray(detail.locations) ? detail.locations.map((l:any)=> l.id) : []
      setForm({ name: t.name, summary: (detail.treatment?.summary ?? t.summary ?? ''), description: t.description || '', category: t.category || t.name, price: String(t.price), duration: String(t.duration), isActive: t.isActive, showSlots: (detail.treatment?.showSlots ?? t.showSlots ?? true), isTravel: (detail.treatment?.isTravel ?? t.isTravel ?? false), isNhs: (detail.treatment?.isNhs ?? t.isNhs ?? false), seasonStart: (detail.treatment?.seasonStart ? String(detail.treatment.seasonStart).slice(0,10) : ''), seasonEnd: (detail.treatment?.seasonEnd ? String(detail.treatment.seasonEnd).slice(0,10) : ''), locationIds: locIds })
    } catch {
      setForm({ name: t.name, summary: (t.summary ?? ''), description: t.description || '', category: t.category || t.name, price: String(t.price), duration: String(t.duration), isActive: t.isActive, showSlots: (t.showSlots ?? true), isTravel: (t.isTravel ?? false), isNhs: (t.isNhs ?? false), seasonStart: '', seasonEnd: '', locationIds: [] })
    }
    setOpen(true)
  }
  const save = async () => {
    if (!editing) {
      const res = await fetch('/api/admin/treatments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: Number(form.price), duration: Number(form.duration) }) })
      if (res.ok) { setOpen(false); await onReload() }
      return
    }
    const res = await fetch(`/api/admin/treatments/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: Number(form.price), duration: Number(form.duration) }) })
    if (res.ok) { setOpen(false); await onReload() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Treatments</h3>
        <Button className="rounded-full" onClick={startNew}><Plus className="w-4 h-4 mr-2"/>Add Treatment</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {treatments.map((t)=> (
          <Card key={t.id} className="bg-white/80 backdrop-blur ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.name}</span>
                <span className="text-sm text-emerald-600">£{t.price} · {t.duration}m</span>
              </CardTitle>
              <CardDescription>{t.description}</CardDescription>
              {t.seasonStart && t.seasonEnd ? (
                <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Seasonal {String(t.seasonStart).slice(0,10)}–{String(t.seasonEnd).slice(0,10)}</span>
              ) : null}
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="rounded-full" onClick={()=>startEdit(t)}>Edit</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={editing? 'Edit Treatment':'Add Treatment'}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700">Name</label>
            <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Summary</label>
            <Textarea value={form.summary} onChange={e=>setForm({ ...form, summary: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Description</label>
            <Textarea value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} />
          </div>
            <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Price (£)</label>
              <Input value={form.price} onChange={e=>setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Duration (mins)</label>
              <Input value={form.duration} onChange={e=>setForm({ ...form, duration: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Season starts (optional)</label>
              <Input type="date" value={form.seasonStart} onChange={e=> setForm({ ...form, seasonStart: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Season ends (optional)</label>
              <Input type="date" value={form.seasonEnd} onChange={e=> setForm({ ...form, seasonEnd: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input id="showSlots" type="checkbox" checked={!!form.showSlots} onChange={(e)=> setForm({ ...form, showSlots: e.target.checked })} />
            <label htmlFor="showSlots" className="text-sm text-gray-700">Show slots to customers</label>
          </div>
            <div className="flex items-center gap-2">
            <input id="isTravel" type="checkbox" checked={!!form.isTravel} onChange={(e)=> setForm({ ...form, isTravel: e.target.checked })} />
            <label htmlFor="isTravel" className="text-sm text-gray-700">Travel service</label>
          </div>
          <div className="flex items-center gap-2">
            <input id="isNhs" type="checkbox" checked={!!form.isNhs} onChange={(e)=> setForm({ ...form, isNhs: e.target.checked })} />
            <label htmlFor="isNhs" className="text-sm text-gray-700">NHS service</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available at locations</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
              {locations.map((l:any)=> (
                <label key={l.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.locationIds.includes(l.id)} onChange={(e)=>{
                    setForm((p:any)=> ({ ...p, locationIds: e.target.checked ? [...p.locationIds, l.id] : p.locationIds.filter((x:string)=>x!==l.id) }))
                  }} />
                  <span>{l.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Pharmacists Manager
function PharmacistsManager({ pharmacists, treatments, locations, onReload }: { pharmacists: any[]; treatments: any[]; locations: any[]; onReload: ()=>void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<any>({ name: '', email: '', phone: '', bio: '', isActive: true, treatmentIds: [] as string[], locationIds: [] as string[] })
  const [openSchedule, setOpenSchedule] = useState(false)
  const [schedulePharmacistId, setSchedulePharmacistId] = useState<string>('')
  const [weekly, setWeekly] = useState(Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, startTime: '09:00', endTime: '17:00', isActive: i < 5 })))

  const startNew = () => {
    setEditing(null)
    setForm({ name: '', email: '', phone: '', bio: '', isActive: true, treatmentIds: [], locationIds: [] })
    setOpen(true)
  }
  const startEdit = async (p: any) => {
    const details = await fetch(`/api/admin/pharmacists/${p.id}`).then(r=>r.json())
    setEditing(p)
    setForm({ name: p.name, email: p.email, phone: p.phone || '', bio: p.bio || '', isActive: p.isActive, treatmentIds: details.treatmentIds || [], locationIds: details.locationIds || [] })
    setOpen(true)
  }
  const save = async () => {
    if (!editing) {
      const res = await fetch('/api/admin/pharmacists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { setOpen(false); await onReload() }
      return
    }
    const res = await fetch(`/api/admin/pharmacists/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setOpen(false); await onReload() }
  }
  const openScheduleEditor = async (p: any) => {
    setSchedulePharmacistId(p.id)
    setOpenSchedule(true)
  }
  const saveSchedule = async () => {
    if (!schedulePharmacistId) return
    const res = await fetch('/api/admin/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pharmacistId: schedulePharmacistId, weekly }) })
    if (res.ok) setOpenSchedule(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Pharmacists</h3>
        <Button className="rounded-full" onClick={startNew}><Plus className="w-4 h-4 mr-2"/>Add Pharmacist</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pharmacists.map((p)=> (
          <Card key={p.id} className="bg-white/80 backdrop-blur ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.name}</span>
                <span className="text-sm text-gray-500">{p.email}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" className="rounded-full" onClick={()=>startEdit(p)}>Edit</Button>
              <Button variant="outline" className="rounded-full" onClick={()=>openScheduleEditor(p)}>Schedule</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={editing? 'Edit Pharmacist':'Add Pharmacist'}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <Input value={form.email} onChange={e=>setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Phone</label>
              <Input value={form.phone} onChange={e=>setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Bio</label>
              <Input value={form.bio} onChange={e=>setForm({ ...form, bio: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatments</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
              {treatments.map((t:any)=> (
                <label key={t.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.treatmentIds.includes(t.id)} onChange={(e)=>{
                    setForm((p:any)=> ({ ...p, treatmentIds: e.target.checked ? [...p.treatmentIds, t.id] : p.treatmentIds.filter((x:string)=>x!==t.id) }))
                  }} />
                  <span>{t.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Locations</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
              {locations.map((l:any)=> (
                <label key={l.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.locationIds.includes(l.id)} onChange={(e)=>{
                    setForm((p:any)=> ({ ...p, locationIds: e.target.checked ? [...p.locationIds, l.id] : p.locationIds.filter((x:string)=>x!==l.id) }))
                  }} />
                  <span>{l.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={openSchedule} onClose={()=>setOpenSchedule(false)} title="Edit Weekly Schedule">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {weekly.map((w, idx)=> (
              <div key={idx} className="flex items-center gap-3">
                <label className="w-24 text-sm capitalize">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][w.dayOfWeek]}</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={w.isActive} onChange={(e)=>{
                  const v=[...weekly]; v[idx]={...w,isActive:e.target.checked}; setWeekly(v)
                }} />Active</label>
                <Input className="w-28" value={w.startTime} onChange={(e)=>{ const v=[...weekly]; v[idx]={...w,startTime:e.target.value}; setWeekly(v) }} />
                <span className="text-gray-500">to</span>
                <Input className="w-28" value={w.endTime} onChange={(e)=>{ const v=[...weekly]; v[idx]={...w,endTime:e.target.value}; setWeekly(v) }} />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="rounded-full" onClick={()=>setOpenSchedule(false)}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={saveSchedule}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Locations Manager
function LocationsManager({ locations, onReload }: { locations: any[]; onReload: ()=>void }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState<any>({ name: '', code: '', address: '', phone: '', openingHours: {
    monday: { open: '09:00', close: '17:00' },
    tuesday: { open: '09:00', close: '17:00' },
    wednesday: { open: '09:00', close: '17:00' },
    thursday: { open: '09:00', close: '17:00' },
    friday: { open: '09:00', close: '17:00' },
    saturday: { open: '10:00', close: '16:00' },
    sunday: { open: 'closed', close: 'closed' },
  } })

  const startNew = () => { setEditing(null); setOpen(true) }
  const startEdit = (l:any) => { setEditing(l); setForm({ name: l.name, code: l.code, address: l.address, phone: l.phone, openingHours: l.openingHours }); setOpen(true) }
  const save = async () => {
    if (!editing) {
      const res = await fetch('/api/admin/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) { setOpen(false); await onReload() }
      return
    }
    const res = await fetch(`/api/admin/locations/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { setOpen(false); await onReload() }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Locations</h3>
        <Button className="rounded-full" onClick={startNew}><Plus className="w-4 h-4 mr-2"/>Add Location</Button>
      </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map((l)=> (
                <Card key={l.id} className="bg-white/80 backdrop-blur ring-1 ring-black/5">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{l.name}</span>
                      <span className="text-sm text-gray-500">{l.code}</span>
                    </CardTitle>
                    <CardDescription>{l.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button variant="outline" className="rounded-full" onClick={()=>startEdit(l)}>Edit</Button>
                    <Button className="rounded-full" onClick={()=>window.location.assign(`/admin/locations/${l.id}`)}>Open Timetable</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

      <Modal open={open} onClose={()=>setOpen(false)} title={editing? 'Edit Location':'Add Location'}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-700">Name</label>
              <Input value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Code</label>
              <Input value={form.code} onChange={e=>setForm({ ...form, code: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700">Address</label>
            <Textarea value={form.address} onChange={e=>setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-700">Phone</label>
            <Input value={form.phone} onChange={e=>setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(form.openingHours).map((day)=> (
              <div key={day} className="border rounded-md p-3">
                <p className="text-xs font-medium capitalize mb-1">{day}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    className="h-9 rounded-md border px-2 text-sm"
                    value={form.openingHours[day].open === 'closed' ? 'closed' : 'open'}
                    onChange={(e)=>{
                      const mode = e.target.value
                      setForm((p:any)=> ({
                        ...p,
                        openingHours: {
                          ...p.openingHours,
                          [day]: mode === 'closed' ? { open: 'closed', close: 'closed' } : { open: '09:00', close: '17:00' }
                        }
                      }))
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                  {form.openingHours[day].open !== 'closed' && (
                    <>
                      <input type="time" className="h-9 rounded-md border px-2 text-sm max-w-[120px]" value={form.openingHours[day].open}
                        onChange={(e)=>setForm((p:any)=>({ ...p, openingHours: { ...p.openingHours, [day]: { ...p.openingHours[day], open: e.target.value } } }))} />
                      <span className="text-gray-500">-</span>
                      <input type="time" className="h-9 rounded-md border px-2 text-sm max-w-[120px]" value={form.openingHours[day].close}
                        onChange={(e)=>setForm((p:any)=>({ ...p, openingHours: { ...p.openingHours, [day]: { ...p.openingHours[day], close: e.target.value } } }))} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-full" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={save}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Reviews Manager
function ReviewsManager() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/reviews')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
    } catch { setError('Failed to load reviews') }
    finally { setLoading(false) }
  }
  useEffect(()=>{ load() }, [])

  const setApproved = async (id: string, isApproved: boolean) => {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isApproved }) })
    if (res.ok) setItems((arr)=> arr.map((r)=> r.id===id? { ...r, isApproved }: r))
  }
  const del = async (id: string) => {
    if (!confirm('Delete this review?')) return
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
    if (res.ok) setItems((arr)=> arr.filter((r)=> r.id!==id))
  }

  if (loading) return <div className="py-6">Loading…</div>
  if (error) return <div className="py-6 text-red-600">{error}</div>

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Reviews</h3>
      <div className="space-y-3">
        {items.map((r)=> (
          <Card key={r.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900">{r.name} <span className="text-xs text-gray-500">({r.rating}/5)</span></p>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{r.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-full" onClick={()=> setApproved(r.id, !r.isApproved)}>{r.isApproved? 'Unapprove':'Approve'}</Button>
                  <Button variant="outline" className="rounded-full text-red-600" onClick={()=> del(r.id)}>Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length===0 && <div className="py-10 text-center text-gray-500">No reviews yet.</div>}
      </div>
    </div>
  )
}
