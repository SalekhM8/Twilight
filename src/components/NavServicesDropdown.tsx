"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"

export default function NavServicesDropdown() {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    if (open) document.addEventListener("keydown", onEsc)
    return () => document.removeEventListener("keydown", onEsc)
  }, [open, close])

  const safeOpen = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
    setOpen(true)
  }
  const safeClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 150)
  }

  return (
    <div
      className="relative"
      onMouseEnter={safeOpen}
      onMouseLeave={safeClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        className="inline-flex items-center gap-1 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded"
      >
        Services
        <ChevronDown className="w-4 h-4" />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full mt-0 min-w-[240px] rounded-xl bg-white text-[15px] text-[#4aa0d5] shadow-xl ring-1 ring-black/5 p-2"
        >
          <Link href="/travel" className="block px-4 py-2 rounded-md hover:bg-gray-50" role="menuitem" onClick={close}>
            Travel Services
          </Link>
          <Link href="/nhs" className="block px-4 py-2 rounded-md hover:bg-gray-50" role="menuitem" onClick={close}>
            NHS Services
          </Link>
          <a href="#services" className="block px-4 py-2 rounded-md hover:bg-gray-50" role="menuitem" onClick={close}>
            Other Private Services
          </a>
        </div>
      ) : null}
    </div>
  )
}


