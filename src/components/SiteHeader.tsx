'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { ShoppingBag, User, Menu, X } from 'lucide-react'

// Mirrors the clinic's header exactly (dark bar, TWILIGHT wordmark, same nav)
// so moving between the clinic and this site feels like staying on one site.
// The pharmacy site is presented as the "Pharmacy Services" section of it.
const CLINIC = process.env.NEXT_PUBLIC_CLINIC_URL || 'https://clinic.twilightpharmacy.co.uk'

const NAV_LINKS = [
  { href: `${CLINIC}/`, label: 'Home' },
  { href: `${CLINIC}/treatments/mounjaro`, label: 'Mounjaro' },
  { href: `${CLINIC}/treatments/wegovy`, label: 'Wegovy' },
  { href: `${CLINIC}/collections/weight-loss`, label: 'Weight Loss' },
  { href: `${CLINIC}/supplements`, label: 'Supplements' },
  { href: `${CLINIC}/guides`, label: 'Guides' },
  { href: '/', label: 'Pharmacy Services', local: true },
  { href: '/about', label: 'About', local: true },
] as const

function Wordmark() {
  return (
    <Link href="/" className="flex flex-col items-start" aria-label="Twilight Pharmacy home">
      <span className="text-2xl font-black uppercase leading-none tracking-tighter text-[#f3fbff]">
        TWILIGHT
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#f3fbff]/80">
        Pharmacy
      </span>
    </Link>
  )
}

export default function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname?.startsWith('/admin')) return null

  return (
    <>
      <header className="sticky top-0 z-50 h-20 bg-[#155d7e]">
        <div className="mx-auto flex h-full max-w-[1410px] items-center justify-between px-4 sm:px-6 lg:px-12">
          <Wordmark />

          {/* Desktop navigation — same items as the clinic */}
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium tracking-tight text-[#f3fbff] transition-opacity duration-200 hover:opacity-80"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <a
              href={`${CLINIC}/sign-in`}
              className="text-[#f3fbff] transition-opacity duration-200 hover:opacity-80"
              aria-label="Sign in"
            >
              <User className="h-5 w-5" />
            </a>
            <a
              href={`${CLINIC}/cart`}
              className="text-[#f3fbff] transition-opacity duration-200 hover:opacity-80"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
            </a>
            <button
              type="button"
              className="text-[#f3fbff] lg:hidden"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav overlay — same treatment as the clinic */}
      <div
        className={`fixed inset-0 z-40 bg-[#155d7e] transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ top: '80px' }}
      >
        <nav className="mx-auto flex max-w-[1410px] flex-col gap-1 px-4 pt-6 sm:px-6" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="border-b border-[#f3fbff]/20 py-4 text-lg font-medium text-[#f3fbff] transition-opacity duration-200 hover:opacity-80"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  )
}
