"use client"

import { useEffect, useRef, useState } from "react"
import { cryptoPairs } from "@/lib/data"
import { cn } from "@/lib/utils"

interface TickerBarProps {
  selectedPair?: string
  onPairChange?: (pair: string) => void
}

export function TickerBar({ selectedPair = "BTC/USDT", onPairChange }: TickerBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // Live 24h change from Bybit for the pairs in the strip, refreshed every 30 s.
  // Until it answers (or if it can't), the strip shows no percentage at all.
  const [live, setLive] = useState<Record<string, number>>({})

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch("https://api.bybit.com/v5/market/tickers?category=linear", { signal: AbortSignal.timeout(8000) })
        if (!res.ok) return
        const json = await res.json()
        const map: Record<string, number> = {}
        for (const t of json?.result?.list ?? []) {
          const pct = parseFloat(t.price24hPcnt) * 100
          if (Number.isFinite(pct)) map[t.symbol] = pct
        }
        if (alive) setLive(map)
      } catch { /* keep the last values */ }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => { alive = false; clearInterval(id) }
  }, [])

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollAmount = 0
    const scroll = () => {
      scrollAmount += 0.5
      if (scrollContainer) {
        scrollContainer.scrollLeft = scrollAmount
        if (scrollAmount >= scrollContainer.scrollWidth / 2) {
          scrollAmount = 0
        }
      }
    }

    const interval = setInterval(scroll, 30)
    return () => clearInterval(interval)
  }, [])

  // Duplicate the pairs for seamless loop
  const displayPairs = [...cryptoPairs, ...cryptoPairs]

  return (
    <div className="bg-background border-b border-border/30 overflow-hidden flex items-center h-7">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden scrollbar-hide py-0.5 px-2 flex-1"
        style={{ scrollBehavior: "auto" }}
      >
        {displayPairs.map((p, idx) => {
          const change = live[p.symbol.replace("/", "")]
          const isPositive = (change ?? 0) >= 0
          const isSelected = p.symbol === selectedPair
          return (
            <button
              key={`${p.symbol}-${idx}`}
              onClick={() => onPairChange?.(p.symbol)}
              className={cn(
                "flex items-center gap-1.5 shrink-0 rounded px-1.5 py-0.5 transition-colors hover:bg-secondary/50",
                isSelected && "bg-primary/10 ring-1 ring-primary/30"
              )}
            >
              <span className={cn(
                "text-[10px] font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {p.symbol.replace("/", "")}
              </span>
              <span className={cn(
                "text-[10px] font-mono tabular-nums font-medium",
                change === undefined ? "text-muted-foreground" : isPositive ? "text-trading-green" : "text-trading-red"
              )}>
                {change === undefined ? "--" : `${isPositive ? "+" : ""}${change.toFixed(2)}%`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
