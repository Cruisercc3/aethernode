"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { type LongShortEntry, formatChartTime } from "@/hooks/useMarketData"
import { describeReadings } from "@/lib/time-window"
import { ToolCard } from "./tool-card"

interface Props {
  data: LongShortEntry[]
  loading: boolean
  error?: string | null
  onRetry?: () => void
  index?: number
  symbol?: string
  period?: string
  priceContext?: { currentPrice: number; klines: any[] }
  resetKey?: string
}

export function LongShortCard({ data, loading, error, onRetry, index, symbol, period, priceContext }: Props) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((d) => ({
      time: formatChartTime(d.timestamp, period || "1h"),
      ratio: d.buyRatio / d.sellRatio,
      longPct: d.buyRatio * 100,
      shortPct: d.sellRatio * 100,
    }))
  }, [data, period])

  const aiData = useMemo(
    () =>
      (data ?? []).map((d) => ({
        time: new Date(d.timestamp).toISOString(),
        longPct: Math.round(d.buyRatio * 10000) / 100,
        shortPct: Math.round(d.sellRatio * 10000) / 100,
      })),
    [data],
  )
  const aiWindow = data && data.length > 0 ? describeReadings(data.map((d) => d.timestamp)) : undefined

  const current = chartData.length > 0 ? chartData[chartData.length - 1] : null

  return (
    <ToolCard
      title="Long/Short Ratio"
      description="Share of Bybit accounts net long vs net short"
      loading={loading}
      error={error}
      onRetry={onRetry}
      index={index}
      toolName="long-short"
      aiData={aiData}
      aiWindow={aiWindow}
      symbol={symbol}
      period={period}
      priceContext={priceContext}
    >
      {current ? (
        <>
          {/* Current Ratio Display */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono tabular-nums text-foreground">
                {current.ratio.toFixed(3)}
              </span>
              <span className="text-xs text-muted-foreground">ratio</span>
            </div>
            <p className="mt-1 text-xs">
              <span className="font-medium text-[#22c55e]">
                {current.longPct.toFixed(1)}% Long
              </span>
              <span className="mx-1.5 text-muted-foreground">/</span>
              <span className="font-medium text-[#ef4444]">
                {current.shortPct.toFixed(1)}% Short
              </span>
            </p>

            {/* Percentage bar */}
            <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full">
              <div
                className="h-full bg-[#22c55e] transition-all duration-500"
                style={{ width: `${current.longPct}%` }}
              />
              <div
                className="h-full bg-[#ef4444] transition-all duration-500"
                style={{ width: `${current.shortPct}%` }}
              />
            </div>
          </div>

          {/* Chart */}
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
              >
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
                  width={40}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,15,25,0.95)",
                    border: "1px solid #1a1a2e",
                    borderRadius: 8,
                    fontSize: 11,
                    color: "#ccc",
                  }}
                  formatter={(value: number) => [value.toFixed(3), "Ratio"]}
                />
                <Line
                  type="monotone"
                  dataKey="ratio"
                  stroke="hsl(12,80%,48%)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3, fill: "hsl(12,80%,48%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="flex h-[260px] items-center justify-center text-xs text-muted-foreground">
          No long/short data available
        </div>
      )}
    </ToolCard>
  )
}
