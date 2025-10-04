"use client"

import Image from "next/image"
import { useState } from "react"
import MobileMenu from "@/components/MobileMenu"

export default function MobileHeroHeader() {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden absolute top-3 left-0 right-0 z-40">
      <div className="relative">
        <div className="flex justify-center">
          <Image src="/twilightnew.png" alt="Twilight Pharmacy" width={640} height={200} className="h-28 sm:h-32 w-auto drop-shadow-[0_3px_14px_rgba(0,0,0,0.55)]" />
        </div>
        <button
          aria-label="Open menu"
          className="absolute right-3 top-2 h-10 w-10 grid place-items-center rounded-full bg-white/90 ring-1 ring-black/10 text-[#36c3f0]"
          onClick={()=> setOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
      <MobileMenu open={open} onClose={()=> setOpen(false)} />
    </div>
  )
}


