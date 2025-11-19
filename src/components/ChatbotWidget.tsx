"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MessageSquare, Send, X } from "lucide-react"

type Msg = { role: "assistant" | "user"; content: string }
type Rec = { id: string; name: string; price: number; locations: { id: string; name: string; phone: string }[]; learnUrl: string; bookUrl: string }

function TeaserBubble({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-24 z-50 flex items-center gap-2 px-4 h-12 rounded-full backdrop-blur bg-white/30 text-[#0b1220] ring-1 ring-white/40 shadow-[0_8px_30px_rgba(54,195,240,0.25)]"
      style={{ WebkitBackdropFilter: "blur(8px)" }}
      aria-label="Virtual consultation"
    >
      <span className="grid place-items-center h-8 w-8 rounded-full bg-[#36c3f0] text-white shadow">
        <MessageSquare className="w-4 h-4" />
      </span>
      <span className="text-sm font-semibold text-[#155d7e]">Virtual consultation here</span>
      <span className="absolute inset-0 rounded-full ring-2 ring-[#36c3f0]/30 animate-pulse" aria-hidden />
    </button>
  )
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi, I’m here to help. What brings you in today?" },
  ])
  const [recs, setRecs] = useState<Rec[]>([])
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return
      if (panelRef.current && !panelRef.current.contains(e.target as any)) {
        // keep open; close only by clicking X
      }
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    const nextHistory = [...messages, { role: "user" as const, content: text }]
    setMessages(nextHistory)
    setInput("")
    setLoading(true)
    try {
      const res = await fetch("/api/assist/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory }),
      })
      const data = await res.json()
      if (data?.reply) {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }])
      }
      setRecs(Array.isArray(data?.recommendations) ? data.recommendations : [])
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I had trouble just now. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && <TeaserBubble onClick={() => setOpen(true)} />}
      {open && (
        <div ref={panelRef} className="fixed right-4 bottom-24 z-50 w-[360px] max-w-[92vw] rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-[#e9f7fe] to-white">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center h-8 w-8 rounded-full bg-[#36c3f0] text-white shadow">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#155d7e]">Virtual Consultation</p>
                <p className="text-[11px] text-[#155d7e]/70">Information only · Not a diagnosis</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 py-3 space-y-3 overflow-y-auto max-h-[60vh]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "assistant" ? "" : "justify-end"}`}>
                <div className={`${m.role === "assistant" ? "bg-gray-100 text-gray-800" : "bg-[#36c3f0] text-white"} px-3 py-2 rounded-2xl max-w-[85%]`}>
                  {m.content}
                </div>
              </div>
            ))}
            {recs.length > 0 && (
              <div className="space-y-2">
                {recs.map((r) => (
                  <div key={r.id} className="rounded-xl border border-gray-100 bg-white shadow p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{r.name}</p>
                      <span className="text-[#36c3f0] font-semibold">£{r.price}</span>
                    </div>
                    {r.locations?.length > 0 && (
                      <p className="mt-1 text-xs text-gray-600">
                        Available at {r.locations.slice(0, 3).map((l) => l.name).join(", ")}
                        {r.locations.length > 3 ? " and more" : ""}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <a href={r.learnUrl} className="text-sm px-3 py-1 rounded-full border border-[#36c3f0] text-[#36c3f0] hover:bg-[#e9f7fe]">Learn more</a>
                      <a href={r.bookUrl} className="text-sm px-3 py-1 rounded-full bg-[#36c3f0] text-white hover:bg-[#2eb5e8]">Book</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {loading && <div className="text-xs text-gray-500">Thinking…</div>}
          </div>
          <div className="p-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e)=> { if (e.key === "Enter") send() }}
                placeholder="Type your message…"
                className="flex-1 h-10 rounded-full border px-3 text-sm"
              />
              <button onClick={send} className="h-10 w-10 rounded-full bg-[#36c3f0] text-white grid place-items-center">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


