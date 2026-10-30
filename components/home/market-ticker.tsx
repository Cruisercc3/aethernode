"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react"
import { useHomeTickers, type TickerData } from "@/hooks/useHomeTickers"
import { CryptoIcon } from "@/components/crypto-icon"
import { motion } from "framer-motion"

function MiniSparkline({
  data,
  positive,
}: {
  data: number[]
  positive: boolean
}) {
  if (!data || data.length < 2) {
    return (
      <svg width={100} height={36} className="shrink-0 opacity-30">
        <line x1="0" y1="18" x2="100" y2="18" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
    )
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 100
  const height = 36

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(" ")

  const areaPoints = `0,${height} ${points} ${width},${height}`
  const color = positive ? "hsl(var(--trading-green))" : "hsl(var(--trading-red))"

  return (
    <svg width={width} height={height} className="shrink-0">
      <defs>
        <linearGradient id={`spark-${positive ? "g" : "r"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.2} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-${positive ? "g" : "r"})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PriceCell({ ticker }: { ticker: TickerData }) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null)
  const prevPriceRef = useRef(ticker.price)

  useEffect(() => {
    if (ticker.price !== prevPriceRef.current) {
      setFlash(ticker.price > prevPriceRef.current ? "up" : "down")
      prevPriceRef.current = ticker.price
      const timeout = setTimeout(() => setFlash(null), 350)
      return () => clearTimeout(timeout)
    }
  }, [ticker.price])

  const decimals = ticker.price >= 100 ? 2 : ticker.price >= 1 ? 4 : 6

  return (
    <span
      className={cn(
        "font-mono text-sm font-medium tabular-nums transition-colors duration-200",
        flash === "up" && "text-trading-green",
        flash === "down" && "text-trading-red",
        !flash && "text-foreground"
      )}
    >
      ${ticker.price.toLocaleString(undefined, {
        minimumFractionDigits: decimals > 4 ? 4 : 2,
        maximumFractionDigits: decimals,
      })}
    </span>
  )
}

function formatPriceCompact(price: number): string {
  if (price >= 10_000) return price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  if (price >= 1_000) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return price.toFixed(6)
}

function TickerRow({ ticker, index, formatVolume }: { ticker: TickerData; index: number; formatVolume: (v: number) => string }) {
  const positive = ticker.change24h >= 0
  const base = ticker.displaySymbol.split("/")[0]

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015, duration: 0.15 }}
      className="border-b border-border/20 last:border-0 transition-colors hover:bg-card/60 group"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <CryptoIcon base={base} size="lg" />
          <div>
            <div className="font-semibold text-foreground text-sm">
              {ticker.displaySymbol}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {ticker.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-right">
        <PriceCell ticker={ticker} />
      </td>
      <td className="px-5 py-3.5 text-right">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium font-mono tabular-nums",
            positive ? "text-trading-green" : "text-trading-red"
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {positive ? "+" : ""}
          {ticker.change24h.toFixed(2)}%
        </span>
      </td>
      <td className="hidden px-5 py-3.5 text-right text-sm text-foreground/70 font-mono tabular-nums md:table-cell">
        {formatPriceCompact(ticker.high24h)}
      </td>
      <td className="hidden px-5 py-3.5 text-right text-sm text-foreground/70 font-mono tabular-nums md:table-cell">
        {formatPriceCompact(ticker.low24h)}
      </td>
      <td className="hidden px-5 py-3.5 text-right text-sm text-muted-foreground font-mono tabular-nums lg:table-cell">
        ${formatVolume(ticker.volume24h)}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/spot?pair=${base}%2FUSDT`}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Details
          </Link>
          <Link
            href={`/spot?pair=${base}%2FUSDT`}
            className="text-[11px] font-medium text-primary-foreground bg-primary hover:bg-primary/90 px-3.5 py-1.5 rounded-md transition-colors"
          >
            Trade
          </Link>
        </div>
      </td>
    </motion.tr>
  )
}

export function MarketTicker() {
  const { tickers, isLive, formatVolume } = useHomeTickers()

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 lg:px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Markets
            </p>
            {isLive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 rounded-full bg-trading-green/10 px-2.5 py-0.5"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trading-green opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-trading-green" />
                </span>
                <span className="text-[10px] font-semibold text-trading-green uppercase tracking-wider">
                  Live
                </span>
              </motion.div>
            )}
          </div>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Live Markets
          </h2>
          <p className="mt-2 text-muted-foreground">
            Real-time prices from Bybit {isLive ? "WebSocket" : "API"}
          </p>
        </div>
        <Link
          href="/markets"
          className="hidden text-sm font-medium text-primary hover:text-primary/80 transition-colors sm:inline-flex items-center gap-1"
        >
          View all markets
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="rounded-xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-card/60">
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Pair
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Price
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  24h Change
                </th>
                <th className="hidden px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  24h High
                </th>
                <th className="hidden px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                  24h Low
                </th>
                <th className="hidden px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                  24h Volume
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                </th>
              </tr>
            </thead>
            <tbody>
              {tickers.length > 0
                ? tickers.map((ticker, i) => (
                    <TickerRow
                      key={ticker.symbol}
                      ticker={ticker}
                      index={i}
                      formatVolume={formatVolume}
                    />
                  ))
                : // Skeleton loading rows
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
                          <div className="space-y-1.5">
                            <div className="h-3.5 w-16 rounded bg-secondary animate-pulse" />
                            <div className="h-2.5 w-12 rounded bg-secondary/60 animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right"><div className="ml-auto h-3.5 w-20 rounded bg-secondary animate-pulse" /></td>
                      <td className="px-5 py-3.5 text-right"><div className="ml-auto h-3.5 w-14 rounded bg-secondary animate-pulse" /></td>
                      <td className="hidden px-5 py-3.5 text-right md:table-cell"><div className="ml-auto h-3.5 w-16 rounded bg-secondary animate-pulse" /></td>
                      <td className="hidden px-5 py-3.5 text-right md:table-cell"><div className="ml-auto h-3.5 w-16 rounded bg-secondary animate-pulse" /></td>
                      <td className="hidden px-5 py-3.5 text-right lg:table-cell"><div className="ml-auto h-3.5 w-16 rounded bg-secondary animate-pulse" /></td>
                      <td className="px-5 py-3.5 text-right"><div className="ml-auto h-6 w-20 rounded bg-secondary animate-pulse" /></td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View All Markets CTA */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/markets"
          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        >
          View All Markets
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </section>
  )
}
