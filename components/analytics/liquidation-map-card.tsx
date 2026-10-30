"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import type { LiquidationSummary } from "@/lib/liquidations"
import { describeSpan } from "@/lib/time-window"
import { ToolCard } from "./tool-card"

interface Props {
  data: LiquidationSummary | null
  loading: boolean
  error?: string | null
  onRetry?: () => void
  index?: number
  symbol?: string
  period?: string
  priceContext?: { currentPrice: number; klines: any[] }
}

function usd(n: number): string {
  const a = Math.abs(n)
  if (a >= 1e9) return `$${(a / 1e9).toFixed(2)}B`
  if (a >= 1e6) return `$${(a / 1e6).toFixed(2)}M`
  if (a >= 1e3) return `$${(a / 1e3).toFixed(1)}K`
  return `$${a.toFixed(0)}`
}

function price(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: n >= 1 ? 2 : 8 })}`
}

export function LiquidationMapCard({ data, loading, error, onRetry, index, symbol, period, priceContext }: Props) {
  const summary = data && data.available ? data : null
  const currentPrice = priceContext?.currentPrice ?? 0

  const chartData = useMemo(() => {
    if (!summary) return []
    const rows = summary.buckets.map((b) => ({
      price: b.price,
      longLiq: -b.longUsd,
      shortLiq: b.shortUsd,
      longCount: b.longCount,
      shortCount: b.shortCount,
    }))
    // Add an empty row for the current price's bucket so it can be marked
    if (currentPrice > 0 && rows.length > 0) {
      const step = summary.bucketSize
      const key = Number((Math.floor(currentPrice / step) * step).toFixed(10))
      const lo = Math.min(...rows.map((r) => r.price))
      const hi = Math.max(...rows.map((r) => r.price))
      if (key >= lo - step && key <= hi + step && !rows.some((r) => Math.abs(r.price - key) < step / 2)) {
        rows.push({ price: key, longLiq: 0, shortLiq: 0, longCount: 0, shortCount: 0 })
      }
    }
    return rows.sort((a, b) => b.price - a.price) // highest price at the top
  }, [summary, currentPrice])

  const nowBucket = useMemo(() => {
    if (!summary || currentPrice <= 0) return null
    const step = summary.bucketSize
    const match = chartData.find((r) => currentPrice >= r.price && currentPrice < r.price + step)
    return match ? match.price : null
  }, [summary, chartData, currentPrice])

  const aiData = useMemo(() => {
    if (!summary) return undefined
    return {
      instrument: summary.instId,
      totals: {
        longsLiquidatedUsd: summary.longUsd,
        longOrders: summary.longCount,
        shortsLiquidatedUsd: summary.shortUsd,
        shortOrders: summary.shortCount,
      },
      largestOrder: summary.largest,
      bucketSizeUsd: summary.bucketSize,
      buckets: summary.buckets,
    }
  }, [summary])

  const aiWindow = summary
    ? `${summary.count} filled liquidation orders on OKX ${summary.instId}, ${describeSpan(summary.from, summary.to)}`
    : undefined

  const description = summary
    ? `Forced closes on OKX ${summary.instId}, grouped by price`
    : "Forced closes on OKX, grouped by price"

  return (
    <ToolCard
      title="Recent Liquidations"
      description={description}
      loading={loading}
      error={error}
      onRetry={onRetry}
      index={index}
      toolName="liquidation-map"
      aiData={aiData}
      aiWindow={aiWindow}
      symbol={symbol}
      period={period}
      priceContext={priceContext}
    >
      {!summary ? (
        <div className="flex h-[340px] items-center justify-center px-6 text-center text-xs text-muted-foreground">
          {data && !data.available ? `${data.reason}, so this pair has no liquidation feed.` : "No liquidation data available"}
        </div>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Longs liquidated</span>
              <p className="text-base font-bold font-mono tabular-nums text-trading-red">
                {usd(summary.longUsd)} <span className="text-[10px] font-normal text-muted-foreground">({summary.longCount})</span>
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Shorts liquidated</span>
              <p className="text-base font-bold font-mono tabular-nums text-trading-green">
                {usd(summary.shortUsd)} <span className="text-[10px] font-normal text-muted-foreground">({summary.shortCount})</span>
              </p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" stackOffset="sign" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => usd(v)}
                />
                <YAxis
                  type="category"
                  dataKey="price"
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                  tickFormatter={(v: number) => price(v)}
                />
                <ReferenceLine x={0} stroke="hsl(var(--border))" />
                {nowBucket !== null && (
                  <ReferenceLine
                    y={nowBucket}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="4 3"
                    label={{ value: "Now", position: "insideTopRight", fontSize: 9, fill: "hsl(var(--primary))" }}
                  />
                )}
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(value: number, name: string, item: any) => {
                    const isLong = name === "longLiq"
                    const n = isLong ? item?.payload?.longCount : item?.payload?.shortCount
                    return [`${usd(value)} (${n ?? 0} orders)`, isLong ? "Longs" : "Shorts"]
                  }}
                  labelFormatter={(v: number) => `${price(v)} to ${price(v + summary.bucketSize)}`}
                />
                <Bar dataKey="longLiq" stackId="a" radius={[4, 0, 0, 4]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--trading-red))" fillOpacity={0.7} />
                  ))}
                </Bar>
                <Bar dataKey="shortLiq" stackId="a" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill="hsl(var(--trading-green))" fillOpacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-trading-red/70" />
              <span className="text-[10px] text-muted-foreground">Long liquidations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-trading-green/70" />
              <span className="text-[10px] text-muted-foreground">Short liquidations</span>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
            Latest {summary.count.toLocaleString()} orders, {describeSpan(summary.from, summary.to)}
          </p>
        </>
      )}
    </ToolCard>
  )
}
