"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { type OpenInterestEntry, formatChartTime } from "@/hooks/useMarketData"
import { describeReadings } from "@/lib/time-window"
import { ToolCard } from "./tool-card"

interface Props {
  data: OpenInterestEntry[]
  loading: boolean
  error?: string | null
  onRetry?: () => void
  index?: number
  symbol?: string
  period?: string
  priceContext?: { currentPrice: number; klines: any[] }
  resetKey?: string
}

// Bybit reports linear open interest in the base coin, not in dollars
function compact(val: number): string {
  const a = Math.abs(val)
  if (a >= 1e9) return `${(val / 1e9).toFixed(2)}B`
  if (a >= 1e6) return `${(val / 1e6).toFixed(2)}M`
  if (a >= 1e3) return `${(val / 1e3).toFixed(1)}K`
  if (a >= 10) return val.toFixed(0)
  return val.toFixed(2)
}

export function OpenInterestCard({ data, loading, error, onRetry, index, symbol, period, priceContext }: Props) {
  const base = (symbol || "BTCUSDT").replace(/USDT$/, "")

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((d) => ({
      time: formatChartTime(d.timestamp, period || "1h"),
      value: d.openInterest,
    }))
  }, [data, period])

  const aiData = useMemo(
    () => (data ?? []).map((d) => ({ time: new Date(d.timestamp).toISOString(), openInterest: d.openInterest, unit: base })),
    [data, base],
  )
  const aiWindow = data && data.length > 0 ? describeReadings(data.map((d) => d.timestamp)) : undefined

  const currentOI = chartData.length > 0 ? chartData[chartData.length - 1].value : 0
  const currentPrice = priceContext?.currentPrice ?? 0

  return (
    <ToolCard
      title="Open Interest Tracker"
      description={`Open contracts on Bybit, in ${base}`}
      loading={loading}
      error={error}
      onRetry={onRetry}
      index={index}
      toolName="open-interest"
      aiData={aiData}
      aiWindow={aiWindow}
      symbol={symbol}
      period={period}
      priceContext={priceContext}
    >
      {/* Current OI */}
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Current OI
        </span>
        <p className="text-xl font-bold font-mono tabular-nums text-foreground">
          {compact(currentOI)} <span className="text-sm font-semibold text-muted-foreground">{base}</span>
        </p>
        {currentOI > 0 && currentPrice > 0 && (
          <p className="text-[10px] text-muted-foreground">
            About ${compact(currentOI * currentPrice)} at the current price
          </p>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground">
          No open interest data available
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
            >
              <defs>
                <linearGradient id="oiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(12,80%,48%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(12,80%,48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1a1a2e"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "#666" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#666" }}
                axisLine={false}
                tickLine={false}
                width={56}
                domain={["auto", "auto"]}
                tickFormatter={(v: number) => compact(v)}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,15,25,0.95)",
                  border: "1px solid #1a1a2e",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "#ccc",
                }}
                formatter={(value: number) => [`${compact(value)} ${base}`, "Open Interest"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(12,80%,48%)"
                strokeWidth={2}
                fill="url(#oiGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ToolCard>
  )
}
