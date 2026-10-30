'use client'

import { useState, useEffect, useCallback } from 'react'
import type { LiquidationSummary } from '@/lib/liquidations'

export interface OpenInterestEntry {
  openInterest: number
  timestamp: number
}

export interface FundingRateEntry {
  fundingRate: number
  timestamp: number
}

export interface LongShortEntry {
  buyRatio: number
  sellRatio: number
  timestamp: number
}

export interface TickerEntry {
  symbol: string
  lastPrice: number
  priceChange: number
  volume: number
}

export interface KlineEntry {
  open: number
  high: number
  low: number
  close: number
  volume: number
  timestamp: number
}

export interface MarketData {
  oi: OpenInterestEntry[]
  funding: FundingRateEntry[]
  longShort: LongShortEntry[]
  tickers: TickerEntry[]
  /** When the 24h ticker snapshot was taken (ms) */
  tickersAt: number
  klines: KlineEntry[]
  currentPrice: number
}

// Bybit only supports these intervals for OI & account-ratio endpoints
const VALID_OI_INTERVALS = ['5min', '15min', '30min', '1h', '4h', '1d']

function mapPeriodToOIInterval(period: string): string {
  if (VALID_OI_INTERVALS.includes(period)) return period
  if (period === '12h') return '4h'
  return '1h'
}

function mapPeriodToRatioInterval(period: string): string {
  if (VALID_OI_INTERVALS.includes(period)) return period
  if (period === '12h') return '4h'
  return '1h'
}

// Map the user-facing period to a Bybit kline interval. The candles use the
// same step and count as open interest and long/short, so the price summary
// the AI gets covers exactly the same window as those two charts.
function mapPeriodToKlineInterval(period: string): string {
  switch (period) {
    case '30min': return '30'   // 30-min candles
    case '1h':    return '60'   // 1h candles
    case '4h':    return '240'  // 4h candles
    case '1d':    return 'D'    // daily candles
    default:      return '60'
  }
}

// How many data points to request per endpoint per timeframe
// Goal: consistent visual coverage — roughly 24-40 data points on every chart.
function getLimitForPeriod(period: string): number {
  switch (period) {
    case '30min': return 30   // 30 × 30min = 15h  of OI data
    case '1h':    return 36   // 36 × 1h   = 36h
    case '4h':    return 42   // 42 × 4h   = 7d
    case '1d':    return 30   // 30 × 1d   = 30d
    default:      return 30
  }
}

function getKlineLimit(period: string): number {
  return getLimitForPeriod(period)
}

/** Format a timestamp for chart labels based on the selected period */
export function formatChartTime(ts: number, period: string): string {
  const d = new Date(ts)
  switch (period) {
    case '30min':
    case '1h':
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    case '4h':
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    case '1d':
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    default:
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

export function useMarketData(symbol: string = 'BTCUSDT', period: string = '1h') {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0) // used to force re-fetch on retry

  const fetchAll = useCallback(async (mounted: { current: boolean }) => {
    if (!mounted.current) return

    const oiInterval = mapPeriodToOIInterval(period)
    const ratioInterval = mapPeriodToRatioInterval(period)
    const klineInterval = mapPeriodToKlineInterval(period)
    const limit = getLimitForPeriod(period)
    const klineLimit = getKlineLimit(period)

    try {
      const [oiRes, fundingRes, ratioRes, tickerRes, symbolTickerRes, klineRes] = await Promise.all([
        fetch(
          `https://api.bybit.com/v5/market/open-interest?category=linear&symbol=${symbol}&intervalTime=${oiInterval}&limit=${limit}`
        ),
        // Funding rate is every 8h on Bybit — fetch enough history for the visual.
        // 30min/1h show ~6 recent settlements, 4h shows ~12, 1d shows ~20.
        fetch(
          `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=${period === '1d' ? 20 : period === '4h' ? 12 : 8}`
        ),
        fetch(
          `https://api.bybit.com/v5/market/account-ratio?category=linear&symbol=${symbol}&period=${ratioInterval}&limit=${limit}`
        ),
        fetch(`https://api.bybit.com/v5/market/tickers?category=linear`),
        fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`),
        // Kline (price candles) for the selected symbol & timeframe
        fetch(
          `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${klineInterval}&limit=${klineLimit}`
        ),
      ])

      if (!mounted.current) return

      const [oiData, fundingData, ratioData, tickerData, symbolTickerData, klineData] = await Promise.all([
        oiRes.json(),
        fundingRes.json(),
        ratioRes.json(),
        tickerRes.json(),
        symbolTickerRes.json(),
        klineRes.json(),
      ])

      // Parse Open Interest
      const oi = ((oiData.result?.list || []) as any[])
        .map((item: any) => ({
          openInterest: parseFloat(item.openInterest),
          timestamp: parseInt(item.timestamp, 10),
        }))
        .filter((e: OpenInterestEntry) => !isNaN(e.openInterest) && e.openInterest > 0)
        .reverse()

      // Parse Funding Rate
      const funding = ((fundingData.result?.list || []) as any[])
        .map((item: any) => ({
          fundingRate: parseFloat(item.fundingRate),
          timestamp: parseInt(item.fundingRateTimestamp, 10),
        }))
        .filter((e: FundingRateEntry) => !isNaN(e.fundingRate))
        .reverse()

      // Parse Long/Short Ratio
      const longShort = ((ratioData.result?.list || []) as any[])
        .map((item: any) => ({
          buyRatio: parseFloat(item.buyRatio),
          sellRatio: parseFloat(item.sellRatio),
          timestamp: parseInt(item.timestamp, 10),
        }))
        .filter((e: LongShortEntry) => !isNaN(e.buyRatio) && !isNaN(e.sellRatio))
        .reverse()

      // Parse Tickers (for heatmap / volume card)
      const tickers = ((tickerData.result?.list || []) as any[])
        .filter((t: any) => t.symbol.endsWith('USDT'))
        .map((item: any) => ({
          symbol: item.symbol,
          lastPrice: parseFloat(item.lastPrice),
          priceChange: parseFloat(item.price24hPcnt) * 100,
          volume: parseFloat(item.turnover24h),
        }))
        .sort((a: TickerEntry, b: TickerEntry) => b.volume - a.volume)
        .slice(0, 25)

      // Parse Klines (price candles)
      const klines: KlineEntry[] = ((klineData.result?.list || []) as any[])
        .map((k: any) => ({
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
          volume: parseFloat(k[5]),
          timestamp: parseInt(k[0], 10),
        }))
        .filter((k: KlineEntry) => !isNaN(k.close))
        .reverse() // chronological order

      // Get current price from the dedicated symbol ticker call
      const symbolTicker = (symbolTickerData.result?.list || [])[0]
      const currentPrice = symbolTicker
        ? parseFloat(symbolTicker.lastPrice)
        : tickers.find((t: TickerEntry) => t.symbol === symbol)?.lastPrice || 0

      if (mounted.current) {
        setData({ oi, funding, longShort, tickers, tickersAt: Date.now(), klines, currentPrice })
      }
    } catch (err) {
      console.error('Failed to fetch market data:', err)
      if (mounted.current) {
        setError('Unable to load market data. Please try again.')
      }
    }

    if (mounted.current) {
      setLoading(false)
    }
  }, [symbol, period])

  useEffect(() => {
    const mounted = { current: true }
    setLoading(true)
    setError(null)

    fetchAll(mounted)
    // Shorter periods refresh more frequently
    const refreshMs = period === '30min' ? 30_000 : period === '1h' ? 45_000 : 60_000
    const interval = setInterval(() => fetchAll(mounted), refreshMs)

    return () => {
      mounted.current = false
      clearInterval(interval)
    }
  }, [fetchAll, tick])

  const retry = useCallback(() => {
    setTick((t) => t + 1)
  }, [])

  return { data, loading, error, retry }
}

/**
 * Real forced liquidations for one coin, from /api/liquidations (OKX).
 * Kept apart from useMarketData because it pages through OKX and can take
 * a few seconds, which shouldn't hold up the other cards.
 */
export function useLiquidations(symbol: string = 'BTCUSDT') {
  const [data, setData] = useState<LiquidationSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    setData(null)

    const load = async () => {
      try {
        const res = await fetch(`/api/liquidations?symbol=${encodeURIComponent(symbol)}`)
        const json = (await res.json()) as LiquidationSummary
        if (!alive) return
        // A 200 with available: false is an answer (OKX has no feed for this coin).
        // Anything else that isn't OK is a failure the card offers to retry.
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setData(json)
        setError(null)
      } catch {
        if (alive) setError('Unable to load liquidation data. Please try again.')
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    const interval = setInterval(load, 60_000)
    return () => {
      alive = false
      clearInterval(interval)
    }
  }, [symbol, tick])

  const retry = useCallback(() => setTick((t) => t + 1), [])

  return { data, loading, error, retry }
}
