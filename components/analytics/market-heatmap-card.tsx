"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { formatUtc } from "@/lib/time-window"
import { ToolCard } from "./tool-card"

interface HeatmapItem {
  symbol: string
  name: string
  change: number
  price: number
  volume: number
}

/**
 * Maps the analytics page period to a Bybit kline interval + count
 * so we can compute the actual % change over that exact window.
 */
function periodToKlineParams(period: string): { interval: string; count: number } {
  switch (period) {
    case "30min": return { interval: "1", count: 30 }    // 30 x 1min candles
    case "1h":    return { interval: "5", count: 12 }    // 12 x 5min candles
    case "4h":    return { interval: "15", count: 16 }   // 16 x 15min candles
    case "1d":    return { interval: "60", count: 24 }   // 24 x 60min candles
    default:      return { interval: "5", count: 12 }
  }
}

// What each heatmap change really measures, for the AI prompt
const PERIOD_WINDOWS: Record<string, string> = {
  "30min": "the last 30 minutes (thirty 1-minute candles, first open to latest price)",
  "1h": "the last hour (twelve 5-minute candles, first open to latest price)",
  "4h": "the last 4 hours (sixteen 15-minute candles, first open to latest price)",
  "1d": "rolling 24 hours (Bybit's 24h ticker change)",
}

const PERIOD_LABELS: Record<string, string> = {
  "30min": "30M",
  "1h": "1H",
  "4h": "4H",
  "1d": "24H",
}

function getHeatColor(change: number): string {
  if (change > 6) return "bg-[#16a34a] text-white"
  if (change > 3) return "bg-[#22c55e]/80 text-white"
  if (change > 1) return "bg-[#22c55e]/40 text-foreground"
  if (change > 0) return "bg-[#22c55e]/20 text-foreground"
  if (change > -1) return "bg-[#ef4444]/20 text-foreground"
  if (change > -3) return "bg-[#ef4444]/40 text-foreground"
  if (change > -6) return "bg-[#ef4444]/80 text-white"
  return "bg-[#dc2626] text-white"
}

function getBlockSpan(vol: number, maxVol: number): string {
  const ratio = vol / maxVol
  if (ratio > 0.35) return "col-span-3 row-span-2"
  if (ratio > 0.15) return "col-span-2 row-span-2"
  if (ratio > 0.06) return "col-span-2 row-span-1"
  return "col-span-1 row-span-1"
}

interface Props {
  index?: number
  symbol?: string
  period?: string
  priceContext?: { currentPrice: number; klines: any[] }
}

export function MarketHeatmapCard({ index, symbol, period = "1h", priceContext }: Props) {
  const [items, setItems] = useState<HeatmapItem[]>([])
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchHeatmap = useCallback(async () => {
    try {
      setLoading(true)
      setFetchError(null)

      // Step 1: get top 24 symbols by 24h volume for the layout
      const tickerRes = await fetch(
        "https://api.bybit.com/v5/market/tickers?category=linear",
        { cache: "no-store" }
      )
      if (!tickerRes.ok) throw new Error(`Ticker fetch failed: ${tickerRes.status}`)
      const tickerData = await tickerRes.json()
      const raw = tickerData.result?.list || []

      const topSymbols = raw
        .filter((t: any) => t.symbol?.endsWith("USDT"))
        .map((t: any) => ({
          symbol: t.symbol as string,
          price: parseFloat(t.lastPrice) || 0,
          volume: parseFloat(t.turnover24h) || 0,
          change24h: parseFloat(t.price24hPcnt) * 100 || 0,
        }))
        .sort((a: any, b: any) => b.volume - a.volume)
        .slice(0, 24)

      // Step 2: For non-24h periods, fetch klines to get actual % change
      // For "1d" period, 24h ticker data is already correct
      if (period === "1d") {
        setItems(
          topSymbols.map((s: any) => ({
            symbol: s.symbol,
            name: s.symbol.replace("USDT", ""),
            change: s.change24h,
            price: s.price,
            volume: s.volume,
          }))
        )
      } else {
        // Batch kline requests for the selected period
        const { interval, count } = periodToKlineParams(period)
        const klinePromises = topSymbols.map((s: any) =>
          fetch(
            `https://api.bybit.com/v5/market/kline?category=linear&symbol=${s.symbol}&interval=${interval}&limit=${count}`
          )
            .then((r) => r.json())
            .then((d) => {
              const candles = d.result?.list || []
              if (candles.length < 2) return { symbol: s.symbol, change: s.change24h }
              // Bybit returns newest first; last entry = oldest candle
              const oldestOpen = parseFloat(candles[candles.length - 1][1])
              const newestClose = parseFloat(candles[0][4])
              const change =
                oldestOpen > 0 ? ((newestClose - oldestOpen) / oldestOpen) * 100 : 0
              return { symbol: s.symbol, change }
            })
            .catch(() => ({ symbol: s.symbol, change: s.change24h }))
        )

        const klineResults = await Promise.all(klinePromises)
        const changeMap = new Map(klineResults.map((r) => [r.symbol, r.change]))

        setItems(
          topSymbols.map((s: any) => ({
            symbol: s.symbol,
            name: s.symbol.replace("USDT", ""),
            change: changeMap.get(s.symbol) ?? s.change24h,
            price: s.price,
            volume: s.volume,
          }))
        )
      }
      setFetchedAt(Date.now())
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load"
      setFetchError(msg)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchHeatmap()
    const interval = setInterval(fetchHeatmap, 60000)
    return () => clearInterval(interval)
  }, [fetchHeatmap])

  const maxVol = useMemo(
    () =>
      items.length > 0
        ? Math.max(...items.map((t) => t.volume))
        : 1,
    [items]
  )

  const periodLabel = PERIOD_LABELS[period] || "1H"

  const aiData = useMemo(
    () =>
      items.map((t) => ({
        symbol: t.symbol,
        changePct: Math.round(t.change * 100) / 100,
        turnover24hUsd: Math.round(t.volume),
      })),
    [items],
  )
  const aiWindow = `price change over ${PERIOD_WINDOWS[period] || PERIOD_WINDOWS["1h"]}${fetchedAt ? `, fetched ${formatUtc(fetchedAt)}` : ""}`

  return (
    <ToolCard
      title="Market Heatmap"
      description={`Top pairs by volume, colored by ${periodLabel} performance`}
      loading={loading}
      error={fetchError}
      onRetry={fetchHeatmap}
      index={index}
      toolName="market-heatmap"
      aiData={aiData}
      aiWindow={aiWindow}
      symbol={symbol}
      period={period}
      priceContext={priceContext}
    >
      {items.length === 0 && !loading ? (
        <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground">
          No ticker data available
        </div>
      ) : (
        <>
          <div className="grid auto-rows-[44px] grid-cols-8 gap-0.5">
            {items.map((t) => {
              const isHovered = hovered === t.symbol
              const span = getBlockSpan(t.volume, maxVol)
              const isLarge = t.volume / maxVol > 0.06

              return (
                <div
                  key={t.symbol}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded cursor-pointer transition-all duration-200 overflow-hidden",
                    span,
                    getHeatColor(t.change),
                    isHovered && "ring-1 ring-foreground/30 z-10 scale-[1.03]"
                  )}
                  onMouseEnter={() => setHovered(t.symbol)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className={cn(
                      "font-bold leading-tight",
                      isLarge ? "text-xs" : "text-[9px]"
                    )}
                  >
                    {t.name}
                  </span>
                  <span
                    className={cn(
                      "font-mono tabular-nums leading-tight",
                      isLarge ? "text-[11px]" : "text-[8px]"
                    )}
                  >
                    {t.change > 0 ? "+" : ""}
                    {t.change.toFixed(1)}%
                  </span>

                  {/* Hover tooltip */}
                  {isHovered && (
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 rounded-lg border border-border/50 bg-popover px-3 py-1.5 shadow-xl whitespace-nowrap pointer-events-none">
                      <div className="text-[11px] font-semibold text-foreground">
                        {t.name}/USDT
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        ${t.price > 1
                          ? t.price.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : t.price.toFixed(6)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {periodLabel}: {t.change > 0 ? "+" : ""}{t.change.toFixed(2)}%
                      </div>
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 border-b border-r border-border/50 bg-popover" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-6 rounded-sm bg-gradient-to-r from-[#dc2626] via-[#ef4444]/40 to-transparent" />
              <span className="text-[9px] text-muted-foreground">Loss</span>
            </div>
            <div className="w-px h-2.5 bg-border/50" />
            <div className="flex items-center gap-1">
              <div className="h-2 w-6 rounded-sm bg-gradient-to-r from-transparent via-[#22c55e]/40 to-[#16a34a]" />
              <span className="text-[9px] text-muted-foreground">Gain</span>
            </div>
            <div className="w-px h-2.5 bg-border/50" />
            <span className="text-[9px] text-muted-foreground/60">{periodLabel} change</span>
          </div>
        </>
      )}
    </ToolCard>
  )
}
