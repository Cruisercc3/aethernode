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
import { type FundingRateEntry, formatChartTime } from "@/hooks/useMarketData"
import { describeReadings } from "@/lib/time-window"
import { ToolCard } from "./tool-card"

interface Props {
  data: FundingRateEntry[]
  loading: boolean
  error?: string | null
  onRetry?: () => void
  index?: number
  symbol?: string
  period?: string
  priceContext?: { currentPrice: number; klines: any[] }
  resetKey?: string
}

export function FundingRateCard({ data, loading, error, onRetry, index, symbol, period, priceContext }: Props) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    return data.map((d) => {
      const rate = d.fundingRate * 100
      return {
        time: formatChartTime(d.timestamp, period || "1h"),
        rate,
        positive: rate >= 0,
      }
    })
  }, [data, period])

  const aiData = useMemo(
    () =>
      (data ?? []).map((d) => ({
        settledAt: new Date(d.timestamp).toISOString(),
        ratePct: Math.round(d.fundingRate * 100 * 1e6) / 1e6,
      })),
    [data],
  )
  const aiWindow =
    data && data.length > 0 ? describeReadings(data.map((d) => d.timestamp), "settlements") : undefined

  const currentRate =
    chartData.length > 0 ? chartData[chartData.length - 1].rate : 0
  const currentPositive = currentRate >= 0

  return (
    <ToolCard
      title="Funding Rate History"
      description="Bybit funding rate at each settlement"
      loading={loading}
      error={error}
      onRetry={onRetry}
      index={index}
      toolName="funding-rate"
      aiData={aiData}
      aiWindow={aiWindow}
      symbol={symbol}
      period={period}
      priceContext={priceContext}
    >
      {/* Current Rate */}
      <div className="mb-3">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Last Settled Rate
        </span>
        <p
          className={`text-xl font-bold font-mono tabular-nums ${
            currentPositive ? "text-[#22c55e]" : "text-[#ef4444]"
          }`}
        >
          {currentRate >= 0 ? "+" : ""}
          {currentRate.toFixed(4)}%
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-xs text-muted-foreground">
          No funding rate data available
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                width={48}
                tickFormatter={(v: number) => `${v.toFixed(3)}%`}
              />
              <ReferenceLine y={0} stroke="#444" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,15,25,0.95)",
                  border: "1px solid #1a1a2e",
                  borderRadius: 8,
                  fontSize: 11,
                  color: "#ccc",
                }}
                formatter={(value: number) => [
                  `${value >= 0 ? "+" : ""}${value.toFixed(4)}%`,
                  "Funding Rate",
                ]}
              />
              <Bar dataKey="rate" radius={[2, 2, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.positive ? "#22c55e" : "#ef4444"}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ToolCard>
  )
}
