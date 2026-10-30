"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import type { TickerEntry } from "@/hooks/useMarketData"
import { formatUtc } from "@/lib/time-window"
import { ToolCard } from "./tool-card"

interface Props {
  data: TickerEntry[]
  loading: boolean
  error?: string | null
  onRetry?: () => void
  index?: number
  symbol?: string
  period?: string
  priceContext?: { currentPrice: number; klines: any[] }
  resetKey?: string
  /** When the ticker snapshot was taken (ms) */
  snapshotAt?: number
}

function formatVolume(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

export function TakerVolumeCard({ data, loading, error, onRetry, index, symbol, period, priceContext, snapshotAt }: Props) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data
      .slice(0, 10)
      .map((d) => ({
        symbol: d.symbol.replace('USDT', ''),
        volume: d.volume,
        volumeFormatted: formatVolume(d.volume),
      }))
      .reverse() // Reverse so highest is at top
  }, [data])

  const aiData = useMemo(
    () =>
      (data ?? []).slice(0, 10).map((d) => ({
        symbol: d.symbol,
        turnover24hUsd: Math.round(d.volume),
        priceChange24hPct: Math.round(d.priceChange * 100) / 100,
      })),
    [data],
  )
  const aiWindow = snapshotAt
    ? `rolling 24-hour turnover and price change, snapshot at ${formatUtc(snapshotAt)}`
    : "rolling 24-hour turnover and price change"

  return (
    <ToolCard
      title="Volume Leaders"
      description="Top 10 trading pairs by 24h volume"
      loading={loading}
      error={error}
      onRetry={onRetry}
      index={index}
      toolName="taker-volume"
      aiData={aiData}
      aiWindow={aiWindow}
      symbol={symbol}
      period={period}
      priceContext={priceContext}
    >
      {chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground">
          No volume data available
        </div>
      ) : (
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatVolume}
              />
              <YAxis
                dataKey="symbol"
                type="category"
                tick={{ fontSize: 10, fill: "hsl(var(--foreground))", fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Bar
                dataKey="volume"
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
                label={{
                  position: 'right',
                  fontSize: 9,
                  fill: 'hsl(var(--muted-foreground))',
                  formatter: formatVolume,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ToolCard>
  )
}
