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
    return digits || "447791581674"
  }, [])
  // Hide FAB when on admin or booking form or when number is missing/clearly invalid
  if (pathname?.startsWith("/admin")) return null
  if (pathname === "/consultation" || pathname?.startsWith("/consultation")) return null
  if (!number || number.length < 10) return null
  const link = `https://api.whatsapp.com/send?phone=${number}`
  return (
    <div className="fixed right-4 bottom-4 z-50">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#25D366] hover:bg-[#1DA851] text-white p-3 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 grid place-items-center h-14 w-14"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
      </a>
    </div>
  )
}


