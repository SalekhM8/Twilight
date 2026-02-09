"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const DISMISS_KEY = "deliveroo_banner_dismissed"

function DeliverooLogo({ className }: { className?: string }) {
  return (
    <img
      src="https://consumer-component-library.roocdn.com/30.2.0/static/images/logo-white.svg"
      alt="Deliveroo"
      className={className}
    />
  )
}

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Hide on admin pages
    if (window.location.pathname.startsWith("/admin")) return
    try {
      const dismissed = localStorage.getItem(DISMISS_KEY)
      if (!dismissed) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {}
  }

  if (!visible) return null

  return (
    <div className="bg-[#00CCBC] text-white">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm font-medium relative">
        <span className="flex items-center gap-2">
          <span className="text-base">🛵</span>
          <span>Now on</span>
          <DeliverooLogo className="h-4 w-auto inline-block" />
          <span className="hidden sm:inline">— Prescriptions &amp; essentials delivered to your door</span>
          <span className="sm:hidden">— Order now!</span>
        </span>
        <a
          href="https://deliveroo.co.uk/menu/birmingham/kings-heath/twilight-pharmacy-128-130-high-street"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 px-3 py-1 rounded-full bg-white text-[#00CCBC] text-xs font-semibold hover:bg-gray-100 transition-colors"
        >
          Order
        </a>
        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

