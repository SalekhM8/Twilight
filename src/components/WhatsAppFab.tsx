"use client"

import Link from "next/link"
import { useMemo } from "react"
import { usePathname } from "next/navigation"

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <path fill="#25D366" d="M19.11 5.41A10.59 10.59 0 0 0 4.9 20.72L3 29l8.5-1.85A10.61 10.61 0 1 0 19.1 5.41Z"/>
      <path fill="#fff" d="M24.9 20.44c-.36.99-1.79 1.82-2.49 1.88-.64.06-1.46.09-2.35-.14-.54-.14-1.24-.4-2.14-.78-3.76-1.62-6.2-5.38-6.39-5.63-.19-.25-1.52-2.03-1.52-3.87 0-1.84.97-2.74 1.31-3.11.36-.39.79-.49 1.05-.49.26 0 .52 0 .74.01.24.01.56-.09.88.67.36.86 1.22 2.98 1.33 3.2.11.22.19.48.03.77-.15.29-.22.48-.44.74-.22.26-.46.58-.66.78-.22.22-.45.46-.2.9.25.44 1.1 1.82 2.36 2.95 1.63 1.46 3 1.92 3.44 2.14.44.22.7.19.96-.11.26-.3 1.11-1.29 1.41-1.74.3-.45.6-.37.99-.22.41.15 2.58 1.22 3.02 1.44.45.22.74.33.85.52.11.2.11 1.15-.25 2.14Z"/>
    </svg>
  )
}

export default function WhatsAppFab() {
  // Hooks must be called in the same order across renders. Call them first, then branch.
  const pathname = usePathname()
  const number = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "" // e.g. +447123456789
    const digits = raw.replace(/[^\d]/g, "")
    return digits || "447123456789" // sensible default if unset
  }, [])
  if (pathname?.startsWith("/admin")) return null
  const link = `https://wa.me/${number}`
  return (
    <div className="fixed right-4 bottom-4 z-50">
      <Link href={link} target="_blank" className="group grid place-items-center h-12 w-12 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition">
        <WhatsAppIcon className="h-6 w-6" />
      </Link>
    </div>
  )
}


