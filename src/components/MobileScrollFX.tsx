"use client"

import { useEffect } from "react"

// Lightweight, mobile-only scroll effects using transform/opacity only
// - Parallax/scale video subtly
// - Fade/translate hero text
// - Shrink logo slightly
// - Reveal-on-scroll for service cards
export default function MobileScrollFX() {
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (isDesktop || reduceMotion) return

    const hero = document.getElementById("hero")
    if (!hero) return
    const video = document.getElementById("heroVideo") as HTMLElement | null
    const title = document.getElementById("heroTitle") as HTMLElement | null
    const sub = document.getElementById("heroSub") as HTMLElement | null
    const ctas = document.getElementById("heroCtas") as HTMLElement | null
    const logo = document.getElementById("heroLogo") as HTMLElement | null

    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect()
        const viewportH = window.innerHeight || 1
        const start = Math.max(0, -rect.top)
        const duration = Math.max(1, viewportH)
        const p = Math.min(1, start / duration)

        // Subtle video scale for parallax feel
        if (video) {
          const scale = 1 + p * 0.06
          video.style.transform = `scale(${scale})`
        }
        // Text fade/translate
        const y = p * 12 // px
        const opacity = 1 - p * 0.35
        if (title) { title.style.transform = `translateY(${y}px)`; title.style.opacity = String(opacity) }
        if (sub) { sub.style.transform = `translateY(${y}px)`; sub.style.opacity = String(Math.max(0, opacity - 0.05)) }
        if (ctas) { ctas.style.transform = `translateY(${y}px)`; ctas.style.opacity = String(Math.max(0, opacity - 0.1)) }
        // Logo slight shrink
        if (logo) {
          const ls = 1 - p * 0.08
          logo.style.transform = `scale(${ls})`
        }

        ticking = false
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })

    // Reveal-on-scroll for elements with .reveal
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"))
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in-view")
          io.unobserve(e.target)
        }
      }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 })
    revealEls.forEach((el) => io.observe(el))

    return () => {
      window.removeEventListener("scroll", onScroll)
      io.disconnect()
    }
  }, [])

  return null
}


