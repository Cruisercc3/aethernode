"use client"

import { useState, useEffect, useRef, useCallback } from "react"

export interface TickerData {
  symbol: string
  displaySymbol: string
  name: string
  price: number
  prevPrice: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  sparkline: number[]
}

const PAIRS = [
  { symbol: "BTCUSDT",  display: "BTC/USDT",  name: "Bitcoin" },
  { symbol: "ETHUSDT",  display: "ETH/USDT",  name: "Ethereum" },
  { symbol: "SOLUSDT",  display: "SOL/USDT",  name: "Solana" },
  { symbol: "BNBUSDT",  display: "BNB/USDT",  name: "BNB" },
  { symbol: "ADAUSDT",  display: "ADA/USDT",  name: "Cardano" },
  { symbol: "DOGEUSDT", display: "DOGE/USDT", name: "Dogecoin" },
  { symbol: "XRPUSDT",  display: "XRP/USDT",  name: "Ripple" },
  { symbol: "DOTUSDT",  display: "DOT/USDT",  name: "Polkadot" },
  { symbol: "AVAXUSDT", display: "AVAX/USDT", name: "Avalanche" },
  { symbol: "LINKUSDT", display: "LINK/USDT", name: "Chainlink" },
]

export function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(0)}K`
  return vol.toFixed(0)
}

export function useHomeTickers() {
  const [tickers, setTickers] = useState<Map<string, TickerData>>(new Map())
  const [isLive, setIsLive] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mountedRef = useRef(true)

  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch each pair's ticker from Bybit linear
      const results = await Promise.all(
        PAIRS.map(p =>
          fetch(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${p.symbol}`, {
            signal: AbortSignal.timeout(8_000),
          })
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      )

      if (!mountedRef.current) return

      const newTickers = new Map<string, TickerData>()
      results.forEach((json, i) => {
        const t = json?.result?.list?.[0]
        if (!t) return
        const pair = PAIRS[i]
        newTickers.set(pair.symbol, {
          symbol: pair.symbol,
          displaySymbol: pair.display,
          name: pair.name,
          price: parseFloat(t.lastPrice),
          prevPrice: parseFloat(t.lastPrice),
          change24h: parseFloat(t.price24hPcnt) * 100,
          volume24h: parseFloat(t.turnover24h),
          high24h: parseFloat(t.highPrice24h),
          low24h: parseFloat(t.lowPrice24h),
          sparkline: [],
        })
      })

      if (mountedRef.current) setTickers(newTickers)
    } catch {
      // fallback — keep empty
    }
  }, [])

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")

    ws.onopen = () => {
      ws.send(JSON.stringify({
        op: "subscribe",
        args: PAIRS.map(p => `tickers.${p.symbol}`),
      }))
      if (mountedRef.current) setIsLive(true)
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const msg = JSON.parse(event.data)
        if (!msg.topic?.startsWith("tickers.") || !msg.data) return
        const d = msg.data
        const symbol: string = d.symbol
        if (!symbol) return

        const newPrice = d.lastPrice ? parseFloat(d.lastPrice) : null
        if (newPrice === null || isNaN(newPrice)) return

        setTickers(prev => {
          const next = new Map(prev)
          const existing = next.get(symbol)
          if (!existing) return prev

          const change = d.price24hPcnt ? parseFloat(d.price24hPcnt) * 100 : existing.change24h
          const vol    = d.turnover24h  ? parseFloat(d.turnover24h)         : existing.volume24h
          const high   = d.highPrice24h ? parseFloat(d.highPrice24h)        : existing.high24h
          const low    = d.lowPrice24h  ? parseFloat(d.lowPrice24h)         : existing.low24h

          next.set(symbol, {
            ...existing,
            prevPrice: existing.price,
            price: newPrice,
            change24h: isNaN(change) ? existing.change24h : change,
            volume24h: isNaN(vol)    ? existing.volume24h : vol,
            high24h:   isNaN(high)   ? existing.high24h   : high,
            low24h:    isNaN(low)    ? existing.low24h    : low,
          })
          return next
        })
      } catch { /* skip */ }
    }

    ws.onclose = () => {
      if (mountedRef.current) {
        setIsLive(false)
        wsRef.current = null
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000)
      }
    }
    ws.onerror = () => ws.close()
    wsRef.current = ws
  }, [])

  useEffect(() => {
    mountedRef.current = true
    fetchInitialData()
    const wsTimeout = setTimeout(connectWebSocket, 1000)
    return () => {
      mountedRef.current = false
      clearTimeout(wsTimeout)
      clearTimeout(reconnectTimeoutRef.current)
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
    }
  }, [fetchInitialData, connectWebSocket])

  const tickerArray = PAIRS.map(p => tickers.get(p.symbol)).filter(Boolean) as TickerData[]

  return { tickers: tickerArray, isLive, formatVolume }
}
