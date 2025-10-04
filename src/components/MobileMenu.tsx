"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: ()=>void }) {
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    function onClick(e: MouseEvent) {
      if (!panelRef.current) return
      if (open && !panelRef.current.contains(e.target as Node)) onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.addEventListener('mousedown', onClick)
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute right-0 top-0 h-full w-5/6 max-w-sm bg-white shadow-2xl ring-1 ring-black/10" ref={panelRef}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-[#36c3f0]">Menu</span>
          <button aria-label="Close menu" onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full text-gray-500 hover:text-gray-700">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <nav className="p-5 text-[#36c3f0]">
          <ul className="space-y-4 text-lg">
            <li><Link href="/travel" onClick={onClose} className="block">Travel Services</Link></li>
            <li><Link href="/nhs" onClick={onClose} className="block">NHS Services</Link></li>
            <li><Link href="/about" onClick={onClose} className="block">About Us</Link></li>
            <li><a href="#services" onClick={onClose} className="block">Our Services</a></li>
            <li><a href="#locations" onClick={onClose} className="block">Locations</a></li>
            <li><a href="#contact" onClick={onClose} className="block">Contact</a></li>
            <li className="pt-2"><Link href="/consultation" onClick={onClose} className="inline-flex items-center rounded-full bg-[#36c3f0] text-white px-5 py-2 font-semibold hover:bg-[#2eb5e8]">Start Consultation</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  )
}


