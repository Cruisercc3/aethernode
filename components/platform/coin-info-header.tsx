"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { cn } from "@/lib/utils"
import { cryptoPairs } from "@/lib/data"
import { Search, Circle, ArrowUpRight, ArrowDownRight, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePairTicker } from "@/hooks/usePairTicker"
import { useMarketsTicker, formatPrice as mktFormatPrice, type MarketCoin } from "@/hooks/useMarketsTicker"
import { CryptoIcon } from "@/components/crypto-icon"

export type PlatformTab = "chart" | "details" | "news" | "trading-data"

// Format price for the header bar
function formatPrice(price: number): string {
  if (price >= 10_000) return price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  if (price >= 1_000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 4 })
  return price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })
}

// Flashing price cell for search results
function LivePriceCell({ coin }: { coin: MarketCoin }) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null)
  const prev = useRef(coin.price)
  useEffect(() => {
    if (coin.price !== prev.current) {
      setFlash(coin.price > prev.current ? "up" : "down")
      prev.current = coin.price
      const t = setTimeout(() => setFlash(null), 350)
      return () => clearTimeout(t)
    }
  }, [coin.price])
  return (
    <span className={cn(
      "font-mono text-sm tabular-nums transition-colors duration-150",
      flash === "up" ? "text-trading-green" : flash === "down" ? "text-trading-red" : "text-foreground"
    )}>
      ${mktFormatPrice(coin.price)}
    </span>
  )
}

interface CoinInfoHeaderProps {
  selectedPair: string
  activeTab: PlatformTab
  onTabChange: (tab: PlatformTab) => void
  onPairChange?: (pair: string) => void
}

export function CoinInfoHeader({ selectedPair, activeTab, onTabChange, onPairChange }: CoinInfoHeaderProps) {
  const staticPair = cryptoPairs.find((p) => p.symbol === selectedPair) || cryptoPairs[0]
  const live = usePairTicker(selectedPair)

  // Full live market list — same source as the Markets page
  const { coins: marketCoins, dynamicSectors } = useMarketsTicker()

  const price = live?.price ?? staticPair.price
  const change24h = live?.change24h ?? staticPair.change24h
  const high24h = live?.high24h ?? staticPair.high24h
  const low24h = live?.low24h ?? staticPair.low24h
  const markPrice = live?.markPrice ?? staticPair.price
  const indexPrice = live?.indexPrice ?? staticPair.price * 0.9998
  const fundingRate = live?.fundingRate ?? staticPair.fundingRate
  const fundingCountdown = live?.fundingCountdown ?? "08:00:00"
  const volumeBase = live?.volumeBase ?? staticPair.volume24h
  const volumeQuote = live?.volume24h ?? "—"
  const isLive = live?.isLive ?? false
  const positive = change24h >= 0
  const fundingPositive = fundingRate.startsWith("+")

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSector, setActiveSector] = useState("All")
  const inputRef = useRef<HTMLInputElement>(null)
  const SECTOR_KEYS = Object.keys(dynamicSectors)

  // Focus input when dialog opens
  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    } else {
      setSearchQuery("")
      setActiveSector("All")
    }
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setSearchOpen(false) }
    if (searchOpen) document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [searchOpen])

  const selectedBase = selectedPair.split("/")[0]

  const filteredCoins = useMemo(() => {
    let list = marketCoins
    if (activeSector !== "All") {
      const bases = dynamicSectors[activeSector] || []
      list = list.filter(c => bases.includes(c.baseAsset))
    }
    const q = searchQuery.toLowerCase().trim()
    if (!q) return list
    return list.filter(c =>
      c.baseAsset.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.displaySymbol.toLowerCase().includes(q)
    )
  }, [marketCoins, searchQuery, activeSector, dynamicSectors])

  return (
    <>
      <div className="flex flex-col bg-card border-b border-border/20">
        {/* Row 1: Pair name + live price + trading stats */}
        <div className="flex items-center gap-4 px-3 py-1.5 border-b border-border/10">
          <div className="flex items-center gap-2.5 shrink-0">
            <CryptoIcon base={selectedBase} size="sm" />
            <div className="flex flex-col leading-none gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground">{selectedPair.replace("/", "")}</span>
                <span className="text-[9px] text-muted-foreground bg-muted/50 rounded px-1 py-px">Perpetual</span>
                <span className={cn("flex items-center gap-0.5 text-[8px]", isLive ? "text-trading-green" : "text-muted-foreground")}>
                  <Circle className={cn("h-1.5 w-1.5 fill-current", isLive ? "text-trading-green" : "text-muted-foreground")} />
                  {isLive ? "LIVE" : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Price + 24h change */}
          <div className="flex items-center gap-2 shrink-0 border-r border-border/20 pr-4">
            <span className={cn("text-sm font-bold tabular-nums font-mono transition-colors", positive ? "text-trading-green" : "text-trading-red")}>
              {formatPrice(price)}
            </span>
            <span className={cn("text-[10px] tabular-nums font-mono", positive ? "text-trading-green" : "text-trading-red")}>
              {positive ? "+" : ""}{change24h.toFixed(2)}%
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-4 overflow-x-auto text-[10px] scrollbar-none">
            <div className="shrink-0">
              <span className="text-muted-foreground">Mark </span>
              <span className="font-mono tabular-nums text-foreground">{formatPrice(markPrice)}</span>
            </div>
            <div className="shrink-0">
              <span className="text-muted-foreground">Index </span>
              <span className="font-mono tabular-nums text-foreground">{formatPrice(indexPrice)}</span>
            </div>
            <div className="shrink-0">
              <span className="text-muted-foreground">24h high </span>
              <span className="font-mono tabular-nums text-foreground">{formatPrice(high24h)}</span>
            </div>
            <div className="shrink-0">
              <span className="text-muted-foreground">24h low </span>
              <span className="font-mono tabular-nums text-foreground">{formatPrice(low24h)}</span>
            </div>
            <div className="shrink-0">
              <span className="text-muted-foreground">24h qty </span>
              <span className="font-mono tabular-nums text-foreground">{volumeBase}</span>
            </div>
            <div className="shrink-0">
              <span className="text-muted-foreground">24h vol </span>
              <span className="font-mono tabular-nums text-foreground">{volumeQuote}</span>
            </div>
            <div className="shrink-0">
              <span className="text-muted-foreground">Funding / Countdown </span>
              <span className={cn("font-mono tabular-nums", fundingPositive ? "text-trading-green" : "text-trading-red")}>
                {fundingRate}
              </span>
              <span className="text-muted-foreground ml-0.5">/ {fundingCountdown}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Searchable pair selector + tabs */}
        <div className="flex items-center border-b border-border/10">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1.5 shrink-0 hover:bg-secondary/50 px-3 transition-colors group border-r border-border/20 h-full py-1.5"
          >
            <CryptoIcon base={selectedBase} size="sm" />
            <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
              {selectedPair}
            </span>
            <Search className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors ml-0.5" />
          </button>

          <div className="flex items-center gap-4 px-3 py-1">
            {([
              { key: "chart" as const, label: "Chart" },
              { key: "details" as const, label: "About" },
              { key: "news" as const, label: "News" },
              { key: "trading-data" as const, label: "Trading data" },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "text-xs pb-0.5 transition-colors",
                  activeTab === tab.key
                    ? "font-medium text-foreground border-b border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search overlay — custom full-screen panel, no Dialog wrapper */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-card border border-border/50 rounded-xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search coins — BTC, Ethereum, SOL..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setSearchOpen(false)}
                className="text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border/40 rounded px-1.5 py-0.5 transition-colors ml-1"
              >
                ESC
              </button>
            </div>

            {/* Sector chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-b border-border/20 scrollbar-none">
              {SECTOR_KEYS.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSector(s)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-[10px] font-medium border transition-colors",
                    activeSector === s
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-secondary/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border/20">
              <span>Pair</span>
              <span className="text-right">Price</span>
              <span className="text-right w-20">24h Change</span>
            </div>

            {/* Coin list */}
            <div className="max-h-[420px] overflow-y-auto">
              {filteredCoins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">No results for &quot;{searchQuery}&quot;</p>
                </div>
              ) : filteredCoins.map((coin) => {
                const pos = coin.change24h >= 0
                const isCurrent = coin.displaySymbol === selectedPair
                return (
                  <button
                    key={coin.symbol}
                    onClick={() => {
                      onPairChange?.(coin.displaySymbol)
                      setSearchOpen(false)
                    }}
                    className={cn(
                      "w-full grid grid-cols-[1fr_auto_auto] gap-4 items-center px-4 py-2.5 hover:bg-secondary/40 transition-colors text-left",
                      isCurrent && "bg-primary/5 border-l-2 border-primary"
                    )}
                  >
                    {/* Coin identity */}
                    <div className="flex items-center gap-2.5">
                      <CryptoIcon base={coin.baseAsset} size="lg" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground leading-tight">
                          {coin.baseAsset}
                          <span className="text-muted-foreground font-normal">/USDT</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{coin.name}</div>
                      </div>
                    </div>

                    {/* Live price with flash */}
                    <LivePriceCell coin={coin} />

                    {/* 24h change */}
                    <div className={cn(
                      "flex items-center justify-end gap-0.5 text-xs font-mono tabular-nums font-medium w-20",
                      pos ? "text-trading-green" : "text-trading-red"
                    )}>
                      {pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {pos ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border/20 px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground/60">
              <span>{filteredCoins.length} pairs</span>
              <span>Prices from Bybit · live</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
