"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

const DISMISS_KEY = "deliveroo_banner_dismissed"

function DeliverooLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 134 24"
      fill="currentColor"
      className={className}
      aria-label="Deliveroo"
    >
      <path d="M29.398 5.27c-1.632 0-2.924.54-3.876 1.62v-1.35h-4.05v18h4.32v-6.48c.952 1.08 2.244 1.62 3.876 1.62 3.456 0 6.21-2.754 6.21-6.696s-2.754-6.714-6.48-6.714zm-.54 9.936c-1.728 0-3.06-1.35-3.06-3.24 0-1.872 1.332-3.222 3.06-3.222 1.746 0 3.078 1.35 3.078 3.222 0 1.89-1.332 3.24-3.078 3.24zM47.736 5.27c-3.924 0-6.966 2.79-6.966 6.714 0 3.942 3.042 6.696 6.966 6.696 2.448 0 4.536-1.026 5.76-2.754l-3.024-1.962c-.612.756-1.53 1.242-2.646 1.242-1.422 0-2.556-.72-2.97-1.962h9.288c.072-.432.108-.864.108-1.26 0-3.924-2.826-6.714-6.516-6.714zm-2.754 5.346c.36-1.188 1.35-1.944 2.664-1.944 1.332 0 2.322.756 2.682 1.944h-5.346zM55.044 0h4.32v18.41h-4.32zM61.56 5.54h4.32v12.87h-4.32zm2.16-5.54c1.35 0 2.448 1.098 2.448 2.448s-1.098 2.448-2.448 2.448-2.448-1.098-2.448-2.448S62.37 0 63.72 0zM77.94 5.54h4.32l-5.49 12.87h-4.59l-5.49-12.87h4.32l3.456 8.37 3.474-8.37zM93.78 5.27c-3.924 0-6.966 2.79-6.966 6.714 0 3.942 3.042 6.696 6.966 6.696 2.448 0 4.536-1.026 5.76-2.754l-3.024-1.962c-.612.756-1.53 1.242-2.646 1.242-1.422 0-2.556-.72-2.97-1.962h9.288c.072-.432.108-.864.108-1.26 0-3.924-2.826-6.714-6.516-6.714zm-2.754 5.346c.36-1.188 1.35-1.944 2.664-1.944 1.332 0 2.322.756 2.682 1.944h-5.346zM110.16 5.27c-1.53 0-2.79.594-3.6 1.674V5.54h-4.05v12.87h4.32v-6.714c0-1.764 1.026-2.754 2.52-2.754.324 0 .666.036 1.008.126l.27-4.014c-.162-.018-.324-.054-.468-.054v.27zM122.76 5.27c-3.942 0-7.02 2.79-7.02 6.714 0 3.942 3.078 6.696 7.02 6.696s7.02-2.754 7.02-6.696c0-3.924-3.078-6.714-7.02-6.714zm0 9.936c-1.764 0-3.096-1.35-3.096-3.24 0-1.872 1.332-3.222 3.096-3.222s3.096 1.35 3.096 3.222c0 1.89-1.332 3.24-3.096 3.24zM133.92 5.27c-3.942 0-7.02 2.79-7.02 6.714 0 3.942 3.078 6.696 7.02 6.696s7.02-2.754 7.02-6.696c0-3.924-3.078-6.714-7.02-6.714zm0 9.936c-1.764 0-3.096-1.35-3.096-3.24 0-1.872 1.332-3.222 3.096-3.222s3.096 1.35 3.096 3.222c0 1.89-1.332 3.24-3.096 3.24z" />
    </svg>
  )
}

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
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

