"use client"

import { useState, useEffect, useCallback } from "react"

// ========================================
// Types for parsed kline/candlestick data
// ========================================

export interface BinanceCandle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface UseBinanceKlinesReturn {
  candles: BinanceCandle[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Binance kline array format indices:
 * [0]  Open time (ms)
 * [1]  Open price
 * [2]  High price
 * [3]  Low price
 * [4]  Close price
 * [5]  Volume
 * [6]  Close time
 * [7]  Quote asset volume
 * [8]  Number of trades
 * [9]  Taker buy base asset volume
 * [10] Taker buy quote asset volume
 * [11] Ignore
 */
type BinanceRawKline = [
  number,   // open time
  string,   // open
  string,   // high
  string,   // low
  string,   // close
  string,   // volume
  number,   // close time
  string,   // quote asset volume
  number,   // number of trades
  string,   // taker buy base asset volume
  string,   // taker buy quote asset volume
  string,   // ignore
]

function parseKline(raw: BinanceRawKline): BinanceCandle {
  return {
    time: raw[0],
    open: parseFloat(raw[1]),
    high: parseFloat(raw[2]),
    low: parseFloat(raw[3]),
    close: parseFloat(raw[4]),
    volume: parseFloat(raw[5]),
  }
}

export function useBinanceKlines(
  symbol: string = "BTCUSDT",
  interval: string = "1h"
): UseBinanceKlinesReturn {
  const [candles, setCandles] = useState<BinanceCandle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKlines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        symbol,
        interval,
        limit: "500",
      })

      const res = await fetch(`/api/binance/klines?${params.toString()}`)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Failed to fetch klines")
      }

      const rawData: BinanceRawKline[] = await res.json()
      const parsed = rawData.map(parseKline)

      setCandles(parsed)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch kline data"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [symbol, interval])

  useEffect(() => {
    fetchKlines()
  }, [fetchKlines])

  return { candles, loading, error, refetch: fetchKlines }
}
