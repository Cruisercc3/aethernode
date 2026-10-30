"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMarketData, useLiquidations } from "@/hooks/useMarketData"
import { useMarketsTicker } from "@/hooks/useMarketsTicker"
import { LiquidationMapCard } from "@/components/analytics/liquidation-map-card"
import { OpenInterestCard } from "@/components/analytics/open-interest-card"
import { LongShortCard } from "@/components/analytics/long-short-card"
import { FundingRateCard } from "@/components/analytics/funding-rate-card"
import { TakerVolumeCard } from "@/components/analytics/taker-volume-card"
import { MarketHeatmapCard } from "@/components/analytics/market-heatmap-card"

const TIMEFRAMES = [
  { value: "30min", label: "30M" },
  { value: "1h", label: "1H" },
  { value: "4h", label: "4H" },
  { value: "1d", label: "1D" },
]

function PairSearchPopup({
  value,
  onChange,
  allCoins,
  dynamicSectors,
}: {
  value: string
  onChange: (v: string) => void
  allCoins: ReturnType<typeof useMarketsTicker>["coins"]
  dynamicSectors: ReturnType<typeof useMarketsTicker>["dynamicSectors"]
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeSector, setActiveSector] = useState("All")
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const SECTOR_KEYS = useMemo(() => Object.keys(dynamicSectors), [dynamicSectors])

  const currentCoin = allCoins.find((c) => c.symbol === value)
  const isLoading = allCoins.length === 0

  const filtered = useMemo(() => {
    let list = allCoins
    if (activeSector !== "All") {
      const bases = dynamicSectors[activeSector] || []
      list = list.filter(c => bases.includes(c.baseAsset))
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        c => c.baseAsset.toLowerCase().includes(q) || c.displaySymbol.toLowerCase().includes(q)
      )
    }
    return list
  }, [allCoins, query, activeSector, dynamicSectors])

  const handleOpen = useCallback(() => {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 60)
  }, [])

  const handleSelect = useCallback(
    (sym: string) => {
      onChange(sym)
      setOpen(false)
      setQuery("")
      setActiveSector("All")
    },
    [onChange]
  )

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
        setActiveSector("All")
      }
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); setActiveSector("All") }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        onClick={handleOpen}
        className="flex h-9 items-center gap-2 rounded-lg border border-border/50 bg-card/80 px-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-card"
        aria-label="Select trading pair"
      >
        <span className="text-primary text-xs font-bold tracking-wide">
          {currentCoin?.baseAsset ?? value.replace("USDT", "")}
        </span>
        <span className="text-[10px] text-muted-foreground">/USDT</span>
        {currentCoin?.change24h !== undefined && (
          <span className={cn(
            "text-[10px] font-medium tabular-nums",
            currentCoin.change24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
          )}>
            {currentCoin.change24h >= 0 ? "+" : ""}{currentCoin.change24h.toFixed(2)}%
          </span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any crypto pair..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Sector chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/20 px-3 py-2 scrollbar-none">
              {SECTOR_KEYS.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSector(s)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1 text-[10px] font-medium transition-colors",
                    activeSector === s
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/30 border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/20 px-3 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Pair</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Price</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">24h</span>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/50"
                        style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No pairs match &quot;{query}&quot;
                </div>
              ) : (
                filtered.slice(0, 80).map((coin) => (
                  <button
                    key={coin.symbol}
                    onClick={() => handleSelect(coin.symbol)}
                    className={cn(
                      "grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-secondary/40",
                      coin.symbol === value && "bg-primary/10"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {coin.symbol === value && <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <span className={cn("text-sm font-semibold text-foreground", coin.symbol !== value && "pl-3.5")}>
                        {coin.baseAsset}
                      </span>
                      <span className="text-[10px] text-muted-foreground">/USDT</span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-foreground">
                      {coin.price > 1
                        ? `$${coin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                        : `$${coin.price.toFixed(6)}`}
                    </span>
                    <span className={cn(
                      "w-16 text-right text-[11px] font-mono tabular-nums",
                      coin.change24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                    )}>
                      {coin.change24h >= 0 ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border/30 px-3 py-2">
              <p className="text-[10px] text-muted-foreground/50">
                {filtered.length} pair{filtered.length !== 1 ? "s" : ""} · Powered by Bybit
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function AnalyticsPage() {
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [period, setPeriod] = useState("1h")
  const { data, loading, error, retry } = useMarketData(symbol, period)
  const liq = useLiquidations(symbol)
  const { coins: allCoins, dynamicSectors } = useMarketsTicker()

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Analytics
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance text-foreground md:text-4xl">
          Advanced Trading Tools
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
          Professional-grade analytics powered by real-time market data
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        {/* Searchable Pair Selector */}
        <PairSearchPopup value={symbol} onChange={setSymbol} allCoins={allCoins} dynamicSectors={dynamicSectors} />

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-0.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setPeriod(tf.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                period === tf.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Live dot */}
        {!loading && data && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[10px] text-muted-foreground">Live</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-xs text-muted-foreground flex-1">{error}</p>
          <button
            onClick={retry}
            className="shrink-0 rounded-md border border-border/50 bg-secondary/50 px-3 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Retry All
          </button>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <LiquidationMapCard
          data={liq.data}
          loading={liq.loading}
          error={!liq.loading && !liq.data && liq.error ? liq.error : null}
          onRetry={liq.retry}
          index={0}
          symbol={symbol}
          period={period}
          priceContext={data ? { currentPrice: data.currentPrice, klines: data.klines } : undefined}
        />
        <OpenInterestCard
          data={data?.oi ?? []}
          loading={loading}
          error={!loading && (data?.oi ?? []).length === 0 && error ? "Unable to load data" : null}
          onRetry={retry}
          index={1}
          symbol={symbol}
          period={period}
          priceContext={data ? { currentPrice: data.currentPrice, klines: data.klines } : undefined}
          resetKey={symbol + period}
        />
        <LongShortCard
          data={data?.longShort ?? []}
          loading={loading}
          error={!loading && (data?.longShort ?? []).length === 0 && error ? "Unable to load data" : null}
          onRetry={retry}
          index={2}
          symbol={symbol}
          period={period}
          priceContext={data ? { currentPrice: data.currentPrice, klines: data.klines } : undefined}
          resetKey={symbol + period}
        />
        <FundingRateCard
          data={data?.funding ?? []}
          loading={loading}
          error={!loading && (data?.funding ?? []).length === 0 && error ? "Unable to load data" : null}
          onRetry={retry}
          index={3}
          symbol={symbol}
          period={period}
          priceContext={data ? { currentPrice: data.currentPrice, klines: data.klines } : undefined}
          resetKey={symbol + period}
        />
        <TakerVolumeCard
          data={data?.tickers ?? []}
          snapshotAt={data?.tickersAt}
          loading={loading}
          error={!loading && (data?.tickers ?? []).length === 0 && error ? "Unable to load data" : null}
          onRetry={retry}
          index={4}
          symbol={symbol}
          period={period}
          priceContext={data ? { currentPrice: data.currentPrice, klines: data.klines } : undefined}
          resetKey={symbol + period}
        />
        <MarketHeatmapCard
          index={5}
          symbol={symbol}
          period={period}
          priceContext={data ? { currentPrice: data.currentPrice, klines: data.klines } : undefined}
        />
      </div>
    </div>
  )
}
