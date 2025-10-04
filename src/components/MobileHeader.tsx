"use client"

import Link from "next/link"
import { useState } from "react"
import MobileMenu from "@/components/MobileMenu"

export default function MobileHeader() {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden sticky top-0 z-40">
      <div className="mx-2 mt-2 flex items-center justify-between rounded-full bg-white/90 backdrop-blur px-3 py-2 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <img src="/twilightnew.png" alt="Twilight Pharmacy" className="h-8 w-auto" />
        </Link>
        <button aria-label="Open menu" className="h-10 w-10 grid place-items-center rounded-full ring-1 ring-black/10 bg-white text-[#36c3f0]" onClick={()=> setOpen(true)}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
      <MobileMenu open={open} onClose={()=> setOpen(false)} />
    </div>
  )
}


