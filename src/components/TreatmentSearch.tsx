"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { slugify } from "@/lib/utils"

type Item = { id: string; name: string; price: number; category?: string | null }

export default function TreatmentSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const debounceRef = useRef<number | null>(null)

  const hasResults = open && items.length > 0

  const fetchResults = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setItems([])
      return
    }
    setLoading(true)
    try {
      const url = new URL("/api/treatments/search", window.location.origin)
      url.searchParams.set("query", q)
      url.searchParams.set("limit", "10")
      const res = await fetch(url.toString(), { cache: "no-store" })
      const data = await res.json()
      setItems(Array.isArray(data?.items) ? data.items : [])
      setActive(0)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    setOpen(true)
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => fetchResults(q), 200)
  }

  const go = (it: Item | undefined) => {
    if (!it) return
    const href = `/treatments/${slugify(it.name)}-${it.id}`
    setOpen(false)
    router.push(href)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(0, items.length - 1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      go(items[active])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!listRef.current || !inputRef.current) return
      if (listRef.current.contains(e.target as any) || inputRef.current.contains(e.target as any)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  return (
    <div className="relative z-40 w-full max-w-xl mx-auto" role="combobox" aria-expanded={open} aria-controls="treatment-search-list">
      <div
        className="relative z-10 h-12 rounded-full px-3 flex items-center backdrop-blur bg-white/30 ring-1 ring-white/40 shadow-[0_8px_30px_rgba(54,195,240,0.25)] focus-within:ring-2 focus-within:ring-[#e9f7fe]"
        style={{ WebkitBackdropFilter: "blur(8px)" }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={onChange}
          onFocus={() => { if (query.length >= 2) setOpen(true) }}
          onKeyDown={onKeyDown}
          placeholder="Find your treatment"
          aria-label="Search treatments"
          className="flex-1 h-full pl-1 pr-2 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-white"
          aria-autocomplete="list"
          aria-controls="treatment-search-list"
          aria-activedescendant={hasResults ? `treat-opt-${active}` : undefined}
        />
        <button
          type="button"
          aria-label="Search"
          onMouseDown={(e)=> e.preventDefault()}
          onClick={()=>{
            if (items.length > 0) {
              go(items[active] || items[0])
            } else {
              inputRef.current?.focus()
            }
          }}
          className="w-9 h-9 rounded-full bg-[#36c3f0] text-white flex items-center justify-center hover:bg-[#2eb5e8] focus:outline-none focus:ring-2 focus:ring-[#e9f7fe] shrink-0"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
      {open && (
        <div
          ref={listRef}
          id="treatment-search-list"
          role="listbox"
          className="absolute left-0 right-0 mt-2 rounded-xl bg-white shadow-xl ring-1 ring-black/5 max-h-80 overflow-auto z-50"
        >
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
          )}
          {!loading && items.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-3 text-sm text-gray-500">No matches</div>
          )}
          {!loading && items.map((it, idx) => (
            <button
              key={it.id}
              id={`treat-opt-${idx}`}
              role="option"
              aria-selected={idx === active}
              onMouseEnter={() => setActive(idx)}
              onClick={() => go(it)}
              className={`w-full px-4 py-3 flex items-center justify-between text-left ${idx === active ? "bg-[#f3fbff]" : "bg-white"} hover:bg-[#f3fbff]`}
            >
              <span className="font-medium text-gray-800">{it.name}</span>
              <span className="text-[#36c3f0] font-semibold">£{it.price}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


