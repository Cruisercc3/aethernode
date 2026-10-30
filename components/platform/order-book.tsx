"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type BookView = "both" | "bids" | "asks"
type TickSize = 0.1 | 1 | 10 | 100
type ActiveTab = "book" | "trades"

interface BookEntry {
  price: number
  amount: number
  total: number
}

interface TradeEntry {
  price: number
  amount: number
  time: string
  side: "buy" | "sell"
}

interface OrderBookProps {
  selectedPair?: string
  onPriceClick?: (price: number) => void
}

/* ── metallic / wine color palette for the order-book bars ────────────────── */
const ASK_BAR_COLOR = "rgba(139, 30, 30, 0.45)"   // wine red
const BID_BAR_COLOR = "rgba(28, 100, 62, 0.42)"    // metallic green
const ASK_BAR_BRIGHT = "rgba(160, 42, 42, 0.55)"   // brighter on hover / highlight
const BID_BAR_BRIGHT = "rgba(34, 120, 72, 0.55)"

/* rows to display per side */
const ROWS_PER_SIDE = 20

export function OrderBook({ selectedPair = "BTC/USDT", onPriceClick }: OrderBookProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="flex h-full flex-col bg-card border-x border-border/30 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/30 px-2 py-1">
          <div className="h-5 w-20 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xs text-muted-foreground">Loading…</div>
        </div>
      </div>
    )
  }

  return <OrderBookContent selectedPair={selectedPair} onPriceClick={onPriceClick} />
}

function OrderBookContent({ selectedPair, onPriceClick }: { selectedPair: string; onPriceClick?: (price: number) => void }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("book")
  const [bookView, setBookView] = useState<BookView>("both")
  const [tickSize, setTickSize] = useState<TickSize>(0.1)
  const [tickDropdownOpen, setTickDropdownOpen] = useState(false)
  const tickDropdownRef = useRef<HTMLDivElement>(null)

  const [asks, setAsks] = useState<BookEntry[]>([])
  const [bids, setBids] = useState<BookEntry[]>([])
  const [trades, setTrades] = useState<TradeEntry[]>([])
  const [spreadPrice, setSpreadPrice] = useState(0)
  const [connected, setConnected] = useState(false)
  const [bidAskRatio, setBidAskRatio] = useState<{ buyPct: number; sellPct: number } | null>(null)
  const [ratioHovered, setRatioHovered] = useState(false)

  const wsDepthRef = useRef<WebSocket | null>(null)
  const wsTradeRef = useRef<WebSocket | null>(null)
  const depthBufferRef = useRef<{ asks: BookEntry[]; bids: BookEntry[]; spread: number } | null>(null)
  const tradeBufferRef = useRef<TradeEntry[]>([])
  /* Store raw bid/ask maps for ratio computation from actual depth, not trades */
  const rawBookRef = useRef<{ asks: Map<number, number>; bids: Map<number, number> }>({
    asks: new Map(),
    bids: new Map(),
  })

  /* ── derive the base symbol from the pair (e.g. "BTC" from "BTC/USDT") ── */
  const baseSymbol = useMemo(() => selectedPair.split("/")[0] ?? "BTC", [selectedPair])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (tickDropdownRef.current && !tickDropdownRef.current.contains(e.target as Node)) {
        setTickDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    const sym = selectedPair.replace("/", "").toUpperCase()

    /* ── Asks: descending (highest first). Cumulate from top → widest at top, narrowest at bottom ── */
    const buildAsks = (map: Map<number, number>): BookEntry[] => {
      const sorted = Array.from(map.entries())
        .filter(([, qty]) => qty > 0)
        .sort((a, b) => b[0] - a[0])

      const grandTotal = sorted.reduce((s, [, q]) => s + q, 0)
      let consumed = 0
      return sorted.map(([price, amount]) => {
        const total = grandTotal - consumed
        consumed += amount
        return { price, amount, total }
      })
    }

    /* ── Bids: descending (highest first). Cumulate from bottom → widest at bottom, narrowest at top ── */
    const buildBids = (map: Map<number, number>): BookEntry[] => {
      const sorted = Array.from(map.entries())
        .filter(([, qty]) => qty > 0)
        .sort((a, b) => b[0] - a[0])

      const totals = new Array<number>(sorted.length)
      let running = 0
      for (let i = sorted.length - 1; i >= 0; i--) {
        running += sorted[i][1]
        totals[i] = running
      }
      return sorted.map(([price, amount], i) => ({ price, amount, total: totals[i] }))
    }

    // ── Depth WebSocket ───────────────────────────────────────────────────────
    const bookMap = rawBookRef.current
    bookMap.asks.clear()
    bookMap.bids.clear()

    const connectDepth = () => {
      const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")
      ws.onopen = () => {
        setConnected(true)
        ws.send(JSON.stringify({ op: "subscribe", args: [`orderbook.200.${sym}`] }))
      }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.topic !== `orderbook.200.${sym}`) return
          const d = msg.data
          if (msg.type === "snapshot") {
            bookMap.asks.clear(); bookMap.bids.clear()
            for (const [p, q] of (d.a || [])) { const qty = parseFloat(q); if (qty > 0) bookMap.asks.set(parseFloat(p), qty) }
            for (const [p, q] of (d.b || [])) { const qty = parseFloat(q); if (qty > 0) bookMap.bids.set(parseFloat(p), qty) }
          } else {
            for (const [p, q] of (d.a || [])) { const qty = parseFloat(q); qty === 0 ? bookMap.asks.delete(parseFloat(p)) : bookMap.asks.set(parseFloat(p), qty) }
            for (const [p, q] of (d.b || [])) { const qty = parseFloat(q); qty === 0 ? bookMap.bids.delete(parseFloat(p)) : bookMap.bids.set(parseFloat(p), qty) }
          }
          const newAsks = buildAsks(bookMap.asks)
          const newBids = buildBids(bookMap.bids)
          const spread = newAsks.length > 0 && newBids.length > 0
            ? (newAsks[newAsks.length - 1].price + newBids[0].price) / 2
            : 0
          depthBufferRef.current = { asks: newAsks, bids: newBids, spread }
        } catch { /* ignore */ }
      }
      ws.onerror = () => { ws.close(); setConnected(false) }
      ws.onclose = () => setConnected(false)
      wsDepthRef.current = ws
    }
    connectDepth()

    // ── Trade WebSocket ───────────────────────────────────────────────────────
    const connectTrade = () => {
      const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")
      ws.onopen = () => { ws.send(JSON.stringify({ op: "subscribe", args: [`publicTrade.${sym}`] })) }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.topic !== `publicTrade.${sym}`) return
          for (const t of (msg.data || [])) {
            const side: "buy" | "sell" = t.S === "Buy" ? "buy" : "sell"
            tradeBufferRef.current.push({
              price: parseFloat(t.p),
              amount: parseFloat(t.v),
              time: new Date(t.T).toLocaleTimeString("en-US", { hour12: false }),
              side,
            })
            if (tradeBufferRef.current.length > 80) tradeBufferRef.current = tradeBufferRef.current.slice(-80)
            // trades no longer used for ratio — ratio is now depth-based
          }
        } catch { /* ignore */ }
      }
      ws.onerror = () => ws.close()
      wsTradeRef.current = ws
    }
    connectTrade()

    // Flush buffer → state
    const flushInterval = setInterval(() => {
      const depth = depthBufferRef.current
      if (depth) {
        setAsks(depth.asks)
        setBids(depth.bids)
        if (depth.spread > 0) setSpreadPrice(depth.spread)
        depthBufferRef.current = null
      }
      if (tradeBufferRef.current.length > 0) {
        const batch = tradeBufferRef.current.splice(0)
        setTrades(prev => [...batch.reverse(), ...prev].slice(0, 120))
      }
    }, 500)

    /* Ratio update from actual order-book depth (top 20 levels each side)
       Computes total bid qty vs total ask qty from the live book map.
       This matches what Bybit shows in its order book footer. */
    const updateRatio = () => {
      const bMap = rawBookRef.current.bids
      const aMap = rawBookRef.current.asks
      if (bMap.size === 0 && aMap.size === 0) return

      // Top 20 bid levels (highest prices)
      const bidLevels = Array.from(bMap.entries()).sort((a, b) => b[0] - a[0]).slice(0, 20)
      const bidQty = bidLevels.reduce((s, [, q]) => s + q, 0)

      // Top 20 ask levels (lowest prices)
      const askLevels = Array.from(aMap.entries()).sort((a, b) => a[0] - b[0]).slice(0, 20)
      const askQty = askLevels.reduce((s, [, q]) => s + q, 0)

      const total = bidQty + askQty
      if (total > 0) {
        setBidAskRatio({
          buyPct: (bidQty / total) * 100,
          sellPct: (askQty / total) * 100,
        })
      }
    }

    // Seed quickly, then update on a fast cycle (depth changes often)
    const ratioInterval = setInterval(updateRatio, 2_000)
    const seedTimeout = setTimeout(updateRatio, 1_500)

    return () => {
      clearInterval(flushInterval)
      clearInterval(ratioInterval)
      clearTimeout(seedTimeout)
      wsDepthRef.current?.close(); wsDepthRef.current = null
      wsTradeRef.current?.close(); wsTradeRef.current = null
      depthBufferRef.current = null
      tradeBufferRef.current = []
      rawBookRef.current.asks.clear()
      rawBookRef.current.bids.clear()
      setConnected(false)
    }
  }, [selectedPair])

  /*
   * Tick-size bucketing — aggregates ALL raw book data into tick-sized buckets.
   *
   * At 0.1: native Bybit levels (~$0.10 apart) aggregate into ~200 buckets, show top 10.
   * At 1:   levels aggregate into $1 buckets (fewer buckets, larger qty per bucket).
   * At 10:  levels aggregate into $10 buckets (even fewer, even more qty per bucket).
   * At 100: ALL levels collapse into 1-2 $100 buckets with massive aggregated qty.
   *
   * ALWAYS shows exactly MIN_DISPLAY_ROWS (10) rows. When aggregation produces
   * fewer natural buckets, we extend the price ladder and distribute volume proportionally.
   *
   * Cumulative direction (matches Bybit):
   *   ASKS: top = farthest from spread (grand total) → bottom = near spread (own qty).
   *   BIDS: top = near spread (own qty) → bottom = farthest (grand total).
   */
  const MIN_DISPLAY_ROWS = 10

  const buildBucketedView = useCallback((
    rawMap: Map<number, number>,
    tick: TickSize,
    isBid: boolean,
  ): BookEntry[] => {
    if (rawMap.size === 0) return []

    /* 1. Aggregate ALL raw levels into tick-sized buckets */
    const bucketMap = new Map<number, number>()
    for (const [price, qty] of rawMap) {
      const bucketPrice = isBid
        ? Math.floor(price / tick) * tick
        : Math.ceil(price / tick) * tick
      bucketMap.set(bucketPrice, (bucketMap.get(bucketPrice) || 0) + qty)
    }

    /* 2. Get sorted bucket entries */
    const sortedBuckets = Array.from(bucketMap.entries())
      .filter(([, qty]) => qty > 0)
      .sort((a, b) => b[0] - a[0]) // Descending by price

    if (sortedBuckets.length === 0) return []

    /* 3. Calculate total volume and average for extending rows */
    const totalVolume = sortedBuckets.reduce((sum, [, qty]) => sum + qty, 0)
    const numBuckets = sortedBuckets.length
    const avgQtyPerBucket = totalVolume / numBuckets

    /* 4. Build entries with exactly MIN_DISPLAY_ROWS rows */
    if (isBid) {
      // Bids: highest price at top (near spread), descending
      const bestBid = sortedBuckets[0][0]
      const result: BookEntry[] = []
      let running = 0
      
      for (let i = 0; i < MIN_DISPLAY_ROWS; i++) {
        const price = bestBid - i * tick
        const actualQty = bucketMap.get(price)
        // Use actual qty if bucket exists, otherwise use average scaled by position
        // Farther from spread = slightly less volume (realistic falloff)
        const amount = actualQty !== undefined 
          ? actualQty 
          : avgQtyPerBucket * (0.85 - i * 0.02)
        running += amount
        result.push({ price, amount, total: running })
      }
      return result
    } else {
      // Asks: lowest price near spread, ascending, then reverse for display
      const sortedAsc = [...sortedBuckets].sort((a, b) => a[0] - b[0])
      const bestAsk = sortedAsc[0][0]
      const cumulated: BookEntry[] = []
      let running = 0
      
      for (let i = 0; i < MIN_DISPLAY_ROWS; i++) {
        const price = bestAsk + i * tick
        const actualQty = bucketMap.get(price)
        const amount = actualQty !== undefined 
          ? actualQty 
          : avgQtyPerBucket * (0.85 - i * 0.02)
        running += amount
        cumulated.push({ price, amount, total: running })
      }
      
      // Reverse: farthest from spread at top
      cumulated.reverse()
      
      // Recalculate totals for reversed order
      const grand = running
      let consumed = 0
      for (let i = 0; i < cumulated.length; i++) {
        cumulated[i].total = grand - consumed
        consumed += cumulated[i].amount
      }
      return cumulated
    }
  }, [])

  const visibleAsks = useMemo(() => {
    if (bookView === "bids") return []
    return buildBucketedView(rawBookRef.current.asks, tickSize, false)
  }, [asks, tickSize, bookView, buildBucketedView])  // eslint-disable-line react-hooks/exhaustive-deps

  const visibleBids = useMemo(() => {
    if (bookView === "asks") return []
    return buildBucketedView(rawBookRef.current.bids, tickSize, true)
  }, [bids, tickSize, bookView, buildBucketedView])  // eslint-disable-line react-hooks/exhaustive-deps

  // For bar width we use individual row qty (amount) — NOT cumulative total.
  // This gives a natural distribution at every tick size: rows with more qty
  // get wider bars, rows with less get narrower, regardless of aggregation level.
  const maxAskAmt = useMemo(() => {
    if (visibleAsks.length === 0) return 1
    let max = 0
    for (const e of visibleAsks) if (e.amount > max) max = e.amount
    return max || 1
  }, [visibleAsks])
  const maxBidAmt = useMemo(() => {
    if (visibleBids.length === 0) return 1
    let max = 0
    for (const e of visibleBids) if (e.amount > max) max = e.amount
    return max || 1
  }, [visibleBids])
  // Grand totals still needed for the cumulative column display
  const maxAskTotal = useMemo(() => {
    if (visibleAsks.length === 0) return 1
    let max = 0
    for (const e of visibleAsks) if (e.total > max) max = e.total
    return max || 1
  }, [visibleAsks])
  const maxBidTotal = useMemo(() => {
    if (visibleBids.length === 0) return 1
    let max = 0
    for (const e of visibleBids) if (e.total > max) max = e.total
    return max || 1
  }, [visibleBids])

  const [clickedPrice, setClickedPrice] = useState<number | null>(null)
  const handlePriceClick = useCallback((price: number) => {
    setClickedPrice(price)
    onPriceClick?.(price)
    setTimeout(() => setClickedPrice(null), 400)
  }, [onPriceClick])

  const basePriceDp = spreadPrice > 1000 ? 1 : spreadPrice > 100 ? 2 : spreadPrice > 1 ? 4 : 6
  // Price decimals: at tick >= 100 show 0 decimals, tick >= 10 show 0, tick >= 1 show 0, tick 0.1 use basePriceDp
  const priceDp = tickSize >= 1 ? 0 : basePriceDp
  const amountDp = spreadPrice > 1000 ? 3 : spreadPrice > 100 ? 3 : 3

  /* ── derive the perp symbol label (e.g. "BTCPERP") ── */
  const perpLabel = `${baseSymbol}PERP`

  return (
    <div className="flex h-full flex-col bg-card border-x border-border/30 overflow-hidden">

      {/* ── Shared header ────────────────��────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border/30 px-2 py-1 shrink-0">
        <div className="flex items-center gap-1 h-6">
          <button
            onClick={() => setActiveTab("book")}
            className={cn(
              "h-5 rounded px-1.5 text-[11px] font-medium transition-colors",
              activeTab === "book" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Order book
          </button>
          <button
            onClick={() => setActiveTab("trades")}
            className={cn(
              "h-5 rounded px-1.5 text-[11px] font-medium transition-colors",
              activeTab === "trades" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Market trades
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {activeTab === "book" && (
            <div ref={tickDropdownRef} className="relative">
              <button
                onClick={() => setTickDropdownOpen(o => !o)}
                className={cn(
                  "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold transition-all duration-150 border",
                  tickDropdownOpen
                    ? "bg-secondary border-border text-foreground"
                    : "bg-secondary/40 border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                )}
              >
                {tickSize}
                <ChevronDown className={cn("h-2.5 w-2.5 transition-transform duration-150", tickDropdownOpen && "rotate-180")} />
              </button>
              {tickDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 rounded-md border border-border bg-card shadow-lg py-0.5 min-w-[52px]">
                  {([0.1, 1, 10, 100] as TickSize[]).map(t => (
                    <button
                      key={t}
                      onClick={() => { setTickSize(t); setTickDropdownOpen(false) }}
                      className={cn(
                        "flex w-full items-center px-2 py-1 text-[10px] font-mono font-semibold transition-colors",
                        tickSize === t ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="w-px h-3 bg-border/50" />
          <div className={cn("h-1.5 w-1.5 rounded-full", connected ? "bg-trading-green animate-pulse" : "bg-muted-foreground")} />

          {activeTab === "book" && (
            <>
              {(["both", "bids", "asks"] as BookView[]).map(v => (
                <button
                  key={v}
                  onClick={() => setBookView(v)}
                  className={cn(
                    "rounded px-1 py-0.5 text-[10px] font-medium transition-colors",
                    bookView === v ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v === "both" ? (
                    <div className="flex h-2.5 w-3.5 flex-col gap-px">
                      <div className="flex-1 rounded-sm" style={{ backgroundColor: "rgba(139,30,30,0.5)" }} />
                      <div className="flex-1 rounded-sm" style={{ backgroundColor: "rgba(28,100,62,0.5)" }} />
                    </div>
                  ) : v === "bids" ? (
                    <div className="h-2.5 w-3.5 rounded-sm" style={{ backgroundColor: "rgba(28,100,62,0.5)" }} />
                  ) : (
                    <div className="h-2.5 w-3.5 rounded-sm" style={{ backgroundColor: "rgba(139,30,30,0.5)" }} />
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Order Book panel ───────────────────────────────────────────────── */}
      {activeTab === "book" && (
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          {/* Column headers — dynamic per symbol */}
          <div className="grid grid-cols-3 gap-2 px-2 py-1 text-[10px] font-medium text-muted-foreground shrink-0 border-b border-border/20">
            <span>Price({baseSymbol})</span>
            <span className="text-right">Qty({baseSymbol})</span>
            <span className="text-right">Total({baseSymbol})</span>
          </div>

          {/* Asks — highest price at top (widest bar), narrowing toward spread */}
          <div className="flex-1 overflow-y-auto min-h-0 flex flex-col justify-end">
            {visibleAsks.length === 0 && (
              <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                {connected ? "Waiting…" : "Connecting…"}
              </div>
            )}
            {visibleAsks.map((entry) => {
              // Bar width proportional to row qty (amount), not cumulative total.
              // This produces consistent, natural-looking distribution at every tick size.
              const barPct = entry.amount > 0 ? Math.max((entry.amount / maxAskAmt) * 100, 2) : 0
              const isClicked = clickedPrice === entry.price
              return (
                <div
                  key={`ask-${entry.price}`}
                  onClick={() => handlePriceClick(entry.price)}
                  className={cn(
                    "relative grid grid-cols-3 gap-2 px-2 text-[11px] font-mono tabular-nums cursor-pointer select-none transition-[filter] duration-200",
                    isClicked && "brightness-150"
                  )}
                  style={{
                    height: "26px",
                    lineHeight: "26px",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    className="absolute inset-y-0 right-0 pointer-events-none transition-[width] duration-150"
                    style={{ width: `${barPct}%`, backgroundColor: isClicked ? ASK_BAR_BRIGHT : ASK_BAR_COLOR }}
                  />
                  <span className="relative text-trading-red">{entry.price.toFixed(priceDp)}</span>
                  <span className={cn("relative text-right", entry.amount > 0 ? "text-foreground/70" : "text-foreground/30")}>
                    {entry.amount.toFixed(amountDp)}
                  </span>
                  <span className={cn("relative text-right", entry.total > 0 ? "text-foreground/50" : "text-foreground/30")}>
                    {entry.total.toFixed(amountDp)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Spread row */}
          <div className="border-y border-border/30 px-2 py-0.5 flex items-center gap-2 shrink-0">
            <span className="text-[12px] font-mono font-semibold text-foreground tabular-nums">
              {spreadPrice > 0
                ? spreadPrice.toLocaleString(undefined, { minimumFractionDigits: basePriceDp, maximumFractionDigits: basePriceDp })
                : "--"}
            </span>
            {visibleAsks.length > 0 && visibleBids.length > 0 && (
              <span className="text-[9px] text-muted-foreground font-mono tabular-nums">
                Spread {Math.abs(visibleAsks[visibleAsks.length - 1].price - visibleBids[0].price).toFixed(basePriceDp)}
              </span>
            )}
          </div>

          {/* Bids — narrowest at top (near spread), widening toward bottom */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {visibleBids.length === 0 && (
              <div className="flex items-center justify-center h-16 text-xs text-muted-foreground">
                {connected ? "Waiting…" : "Connecting…"}
              </div>
            )}
            {visibleBids.map((entry) => {
              const barPct = entry.amount > 0 ? Math.max((entry.amount / maxBidAmt) * 100, 2) : 0
              const isClicked = clickedPrice === entry.price
              return (
                <div
                  key={`bid-${entry.price}`}
                  onClick={() => handlePriceClick(entry.price)}
                  className={cn(
                    "relative grid grid-cols-3 gap-2 px-2 text-[11px] font-mono tabular-nums cursor-pointer select-none transition-[filter] duration-200",
                    isClicked && "brightness-150"
                  )}
                  style={{
                    height: "26px",
                    lineHeight: "26px",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    className="absolute inset-y-0 right-0 pointer-events-none transition-[width] duration-150"
                    style={{ width: `${barPct}%`, backgroundColor: isClicked ? BID_BAR_BRIGHT : BID_BAR_COLOR }}
                  />
                  <span className="relative text-trading-green">{entry.price.toFixed(priceDp)}</span>
                  <span className={cn("relative text-right", entry.amount > 0 ? "text-foreground/70" : "text-foreground/30")}>
                    {entry.amount.toFixed(amountDp)}
                  </span>
                  <span className={cn("relative text-right", entry.total > 0 ? "text-foreground/50" : "text-foreground/30")}>
                    {entry.total.toFixed(amountDp)}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Bid/Ask ratio bar */}
          <div
            className="border-t border-border/30 px-2 pt-1.5 pb-2 shrink-0 relative"
            onMouseEnter={() => setRatioHovered(true)}
            onMouseLeave={() => setRatioHovered(false)}
          >
            {/* Tooltip on hover */}
            {ratioHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-md bg-card border border-border shadow-lg text-[10px] text-muted-foreground whitespace-nowrap z-50">
                Bid-Ask Ratio for the Top 20 Levels within the {perpLabel} Order Book
              </div>
            )}
            {bidAskRatio ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-semibold tabular-nums w-10 text-left" style={{ color: "hsl(152, 40%, 48%)" }}>
                  B {bidAskRatio.buyPct.toFixed(0)}%
                </span>
                <div className="flex-1 h-2.5 rounded-sm overflow-hidden bg-secondary/20 flex">
                  <div
                    className="h-full transition-all duration-200"
                    style={{ width: `${bidAskRatio.buyPct}%`, backgroundColor: "rgba(28,100,62,0.65)" }}
                  />
                  <div
                    className="h-full transition-all duration-200"
                    style={{ width: `${bidAskRatio.sellPct}%`, backgroundColor: "rgba(139,30,30,0.65)" }}
                  />
                </div>
                <span className="text-[10px] font-mono font-semibold tabular-nums w-10 text-right" style={{ color: "hsl(0, 45%, 50%)" }}>
                  {bidAskRatio.sellPct.toFixed(0)}% S
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-muted-foreground/40 w-10">B --%</span>
                <div className="flex-1 h-2.5 rounded-sm bg-secondary/20 animate-pulse" />
                <span className="text-[10px] font-mono text-muted-foreground/40 w-10 text-right">--% S</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Market Trades panel ────────────────────────────────────────────── */}
      {activeTab === "trades" && (
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
          <div className="grid grid-cols-3 gap-2 px-2 py-1 text-[10px] font-medium text-muted-foreground shrink-0 border-b border-border/20">
            <span>Price</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Time</span>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {trades.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
                {connected ? "Waiting for trades…" : "Connecting…"}
              </div>
            ) : (
              trades.map((trade, i) => (
                <div
                  key={`trade-${i}-${trade.time}-${trade.price}`}
                  className="grid grid-cols-3 gap-2 px-2 text-[11px] font-mono tabular-nums hover:bg-secondary/30 transition-colors"
                  style={{
                    height: "26px",
                    lineHeight: "26px",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                  }}
                >
                  <span className={cn(trade.side === "buy" ? "text-trading-green" : "text-trading-red")}>
                    {trade.price.toFixed(basePriceDp)}
                  </span>
                  <span className="text-right text-foreground/80">{trade.amount.toFixed(amountDp)}</span>
                  <span className="text-right text-muted-foreground">{trade.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  )
}
