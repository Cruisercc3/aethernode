"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface PairTickerData {
  symbol: string
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: string   // formatted e.g. "4.23B"
  volumeBase: string  // e.g. "21,450 BTC"
  markPrice: number
  indexPrice: number
  fundingRate: string // e.g. "+0.0100%"
  fundingCountdown: string // e.g. "06:24:18"
  isLive: boolean
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(2)}B`
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(0)}K`
  return vol.toFixed(0)
}

function formatBaseVolume(vol: number, base: string): string {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(2)}M ${base}`
  if (vol >= 1_000) return `${vol.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${base}`
  return `${vol.toFixed(2)} ${base}`
}

function msToCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

// Convert display symbol like "BTC/USDT" → Bybit symbol "BTCUSDT"
function toBybitSymbol(displaySymbol: string): string {
  return displaySymbol.replace("/", "")
}

export function usePairTicker(displaySymbol: string): PairTickerData | null {
  const symbol = toBybitSymbol(displaySymbol)
  const base = displaySymbol.split("/")[0]

  const [data, setData] = useState<PairTickerData | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextFundingTimeRef = useRef<number>(0)
  const mountedRef = useRef(true)

  // Fetch REST snapshot from Bybit linear (perpetual) tickers
  const fetchSnapshot = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`,
        { signal: AbortSignal.timeout(8_000) }
      )
      if (!mountedRef.current) return

      if (!res.ok) return
      const json = await res.json()
      const t = json?.result?.list?.[0]
      if (!t) return

      const price      = parseFloat(t.lastPrice)
      const markPrice  = parseFloat(t.markPrice)
      const indexPrice = parseFloat(t.indexPrice)
      const change24h  = parseFloat(t.price24hPcnt) * 100
      const high24h    = parseFloat(t.highPrice24h)
      const low24h     = parseFloat(t.lowPrice24h)
      const volBase    = parseFloat(t.volume24h)   // in base asset
      const volQuote   = parseFloat(t.turnover24h) // in USDT

      // Funding rate
      const rawRate = parseFloat(t.fundingRate) * 100
      const fundingRate = `${rawRate >= 0 ? "+" : ""}${rawRate.toFixed(4)}%`

      // Next funding time — Bybit returns epoch ms string
      const nextFundingMs = parseInt(t.nextFundingTime, 10)
      nextFundingTimeRef.current = nextFundingMs
      const fundingCountdown = msToCountdown(nextFundingMs - Date.now())

      if (!mountedRef.current) return

      setData({
        symbol,
        price,
        change24h: isNaN(change24h) ? 0 : change24h,
        high24h:   isNaN(high24h)   ? price : high24h,
        low24h:    isNaN(low24h)    ? price : low24h,
        volume24h:  formatVolume(volQuote),
        volumeBase: formatBaseVolume(volBase, base),
        markPrice:  isNaN(markPrice)  ? price : markPrice,
        indexPrice: isNaN(indexPrice) ? price : indexPrice,
        fundingRate,
        fundingCountdown,
        isLive: false,
      })
    } catch {
      // Silently fall back — data stays as previous or null
    }
  }, [symbol, base])

  // Countdown timer — ticks every second
  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
    countdownTimerRef.current = setInterval(() => {
      if (!mountedRef.current) return
      const remaining = nextFundingTimeRef.current - Date.now()
      if (remaining <= 0) {
        fetchSnapshot()
        return
      }
      setData(prev => prev ? { ...prev, fundingCountdown: msToCountdown(remaining) } : prev)
    }, 1000)
  }, [fetchSnapshot])

  // Bybit WebSocket — subscribe to tickers & liquidation stream for this symbol
  const connectWS = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")

    ws.onopen = () => {
      ws.send(JSON.stringify({
        op: "subscribe",
        args: [`tickers.${symbol}`],
      }))
      if (mountedRef.current) {
        setData(prev => prev ? { ...prev, isLive: true } : prev)
      }
    }

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(evt.data)
        if (!msg.topic?.startsWith("tickers.") || !msg.data) return
        const d = msg.data

        setData(prev => {
          if (!prev) return prev

          const price      = d.lastPrice   ? parseFloat(d.lastPrice)   : prev.price
          const markPrice  = d.markPrice   ? parseFloat(d.markPrice)   : prev.markPrice
          const indexPrice = d.indexPrice  ? parseFloat(d.indexPrice)  : prev.indexPrice
          const high24h    = d.highPrice24h? parseFloat(d.highPrice24h): prev.high24h
          const low24h     = d.lowPrice24h ? parseFloat(d.lowPrice24h) : prev.low24h
          const volBase    = d.volume24h   ? parseFloat(d.volume24h)   : null
          const volQuote   = d.turnover24h ? parseFloat(d.turnover24h) : null
          const rawPcnt    = d.price24hPcnt? parseFloat(d.price24hPcnt) * 100 : prev.change24h

          // Update funding rate if provided in this message
          let fundingRate = prev.fundingRate
          if (d.fundingRate) {
            const rawRate = parseFloat(d.fundingRate) * 100
            fundingRate = `${rawRate >= 0 ? "+" : ""}${rawRate.toFixed(4)}%`
          }

          // Update next funding time if provided
          if (d.nextFundingTime) {
            nextFundingTimeRef.current = parseInt(d.nextFundingTime, 10)
          }

          return {
            ...prev,
            price:      isNaN(price)      ? prev.price      : price,
            markPrice:  isNaN(markPrice)  ? prev.markPrice  : markPrice,
            indexPrice: isNaN(indexPrice) ? prev.indexPrice : indexPrice,
            high24h:    isNaN(high24h)    ? prev.high24h    : high24h,
            low24h:     isNaN(low24h)     ? prev.low24h     : low24h,
            change24h:  isNaN(rawPcnt)    ? prev.change24h  : rawPcnt,
            volume24h:  volQuote != null && !isNaN(volQuote) ? formatVolume(volQuote) : prev.volume24h,
            volumeBase: volBase  != null && !isNaN(volBase)  ? formatBaseVolume(volBase, base) : prev.volumeBase,
            fundingRate,
            isLive: true,
          }
        })
      } catch { /* skip */ }
    }

    ws.onclose = () => {
      if (mountedRef.current) {
        setData(prev => prev ? { ...prev, isLive: false } : prev)
        wsRef.current = null
        setTimeout(connectWS, 3000)
      }
    }
    ws.onerror = () => ws.close()
    wsRef.current = ws
  }, [symbol, base])

  useEffect(() => {
    mountedRef.current = true
    setData(null)

    fetchSnapshot().then(() => {
      startCountdown()
      connectWS()
    })

    return () => {
      mountedRef.current = false
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current)
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    }
  // Re-initialize when symbol changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol])

  return data
}
