"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function ClientScrollTop() {
  const pathname = usePathname()
  useEffect(() => {
    if (!pathname) return
    // Skip when navigating to in-page anchors
    if (typeof window !== 'undefined' && window.location.hash) return
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }) } catch { window.scrollTo(0,0) }
  }, [pathname])
  return null
}


