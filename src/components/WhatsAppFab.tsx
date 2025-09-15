"use client"

import { usePathname } from "next/navigation"

export default function WhatsAppFab() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  if (isAdmin) return null

  const phone = "447791581674" // UK number for +44 7791 581674
  const href = `https://wa.me/${phone}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 w-14 h-14 grid place-items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-7 h-7"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M19.11 17.59c-.24-.12-1.41-.7-1.63-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1-.37-1.9-1.2-.7-.62-1.18-1.39-1.32-1.63-.14-.24-.02-.38.1-.5.1-.1.24-.26.36-.4.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.48-.4-.42-.54-.42-.14 0-.3-.02-.46-.02-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.72 2.62 4.18 3.66.58.25 1.04.4 1.4.51.59.19 1.13.16 1.56.1.48-.07 1.41-.58 1.6-1.15.2-.57.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28z"/>
        <path d="M16.03 4.02c-6.6 0-11.96 5.36-11.96 11.96 0 2.11.55 4.17 1.6 5.98L4.02 28l6.24-1.63c1.73.94 3.68 1.44 5.76 1.44 6.6 0 11.96-5.36 11.96-11.96s-5.36-11.83-11.96-11.83zm0 21.48c-1.84 0-3.56-.5-5.06-1.36l-.36-.21-3.7.97.99-3.6-.24-.37c-1.02-1.62-1.56-3.5-1.56-5.41 0-5.64 4.59-10.23 10.23-10.23s10.23 4.59 10.23 10.23-4.59 10.23-10.23 10.23z"/>
      </svg>
    </a>
  )
}


