import { NextRequest, NextResponse } from "next/server"

// Interval mapping: convert Binance-style intervals to each exchange's format
function toBybitInterval(interval: string): string {
  const map: Record<string, string> = {
    "1m": "1", "3m": "3", "5m": "5", "15m": "15", "30m": "30",
    "1h": "60", "2h": "120", "4h": "240", "6h": "360", "12h": "720",
    "1d": "D", "1w": "W", "1M": "M",
  }
  return map[interval] || "60"
}

function toOkxBar(interval: string): string {
  const map: Record<string, string> = {
    "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m",
    "1h": "1H", "2h": "2H", "4h": "4H", "6h": "6H", "12h": "12H",
    "1d": "1D", "1w": "1W", "1M": "1M",
  }
  return map[interval] || "1H"
}

// Normalize raw kline rows to Binance format:
// [openTimeMs, open, high, low, close, volume, closeTimeMs, ...]
type NormalizedKline = [number, string, string, string, string, string, number]

function normalizeBinance(row: unknown[]): NormalizedKline {
  return [Number(row[0]), String(row[1]), String(row[2]), String(row[3]), String(row[4]), String(row[5]), Number(row[6])]
}

function normalizeBybit(row: unknown[]): NormalizedKline {
  // Bybit v5: [startTime, open, high, low, close, volume, turnover]
  const t = Number(row[0])
  return [t, String(row[1]), String(row[2]), String(row[3]), String(row[4]), String(row[5]), t + 59999]
}

function normalizeOkx(row: unknown[]): NormalizedKline {
  // OKX: [ts, open, high, low, close, vol, volCcy, ...]
  const t = Number(row[0])
  return [t, String(row[1]), String(row[2]), String(row[3]), String(row[4]), String(row[5]), t + 59999]
}

type ExchangeDef = {
  name: string
  buildUrl: (symbol: string, interval: string, limit: string, endTime: string | null) => string
  normalize: (row: unknown[]) => NormalizedKline
  extractRows: (data: unknown) => unknown[][]
}

const EXCHANGES: ExchangeDef[] = [
  // 1. Binance Spot — highest liquidity for most altcoins
  {
    name: "Binance Spot",
    buildUrl: (symbol, interval, limit, endTime) => {
      let url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      if (endTime) url += `&endTime=${endTime}`
      return url
    },
    normalize: normalizeBinance,
    extractRows: (d) => (Array.isArray(d) ? d : []),
  },
  // 2. Binance Futures — high volume for perps
  {
    name: "Binance Futures",
    buildUrl: (symbol, interval, limit, endTime) => {
      let url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      if (endTime) url += `&endTime=${endTime}`
      return url
    },
    normalize: normalizeBinance,
    extractRows: (d) => (Array.isArray(d) ? d : []),
  },
  // 3. Bybit Spot — top-3 global exchange by volume
  {
    name: "Bybit Spot",
    buildUrl: (symbol, interval, limit, endTime) => {
      const bybitInterval = toBybitInterval(interval)
      // Bybit v5 spot klines
      let url = `https://api.bybit.com/v5/market/kline?category=spot&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`
      if (endTime) url += `&end=${endTime}`
      return url
    },
    normalize: normalizeBybit,
    extractRows: (d: unknown) => {
      const data = d as { retCode?: number; result?: { list?: unknown[][] } }
      return data?.retCode === 0 ? (data?.result?.list ?? []) : []
    },
  },
  // 4. Bybit Linear (futures) — very high volume
  {
    name: "Bybit Linear",
    buildUrl: (symbol, interval, limit, endTime) => {
      const bybitInterval = toBybitInterval(interval)
      let url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&limit=${limit}`
      if (endTime) url += `&end=${endTime}`
      return url
    },
    normalize: normalizeBybit,
    extractRows: (d: unknown) => {
      const data = d as { retCode?: number; result?: { list?: unknown[][] } }
      return data?.retCode === 0 ? (data?.result?.list ?? []) : []
    },
  },
  // 5. OKX Spot — top-5 exchange globally
  {
    name: "OKX Spot",
    buildUrl: (symbol, interval, limit, endTime) => {
      // OKX uses BTC-USDT format
      const okxSymbol = symbol.replace(/USDT$/, "-USDT").replace(/USDC$/, "-USDC")
      const bar = toOkxBar(interval)
      let url = `https://www.okx.com/api/v5/market/candles?instId=${okxSymbol}&bar=${bar}&limit=${limit}`
      if (endTime) url += `&after=${endTime}`
      return url
    },
    normalize: normalizeOkx,
    extractRows: (d: unknown) => {
      const data = d as { code?: string; data?: unknown[][] }
      return data?.code === "0" ? (data?.data ?? []) : []
    },
  },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol") || "BTCUSDT"
  const interval = searchParams.get("interval") || "1h"
  const limit = searchParams.get("limit") || "1000"
  const endTime = searchParams.get("endTime")

  const errors: string[] = []

  for (const exchange of EXCHANGES) {
    const url = exchange.buildUrl(symbol, interval, limit, endTime)
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 AetherNode/1.0" },
        signal: AbortSignal.timeout(7000),
      })

      if (!res.ok) {
        errors.push(`${exchange.name}: HTTP ${res.status}`)
        continue
      }

      const data = await res.json()
      const rows = exchange.extractRows(data)

      if (rows.length < 2) {
        errors.push(`${exchange.name}: only ${rows.length} rows`)
        continue
      }

      // Normalize to Binance format and return
      const normalized = rows.map(exchange.normalize)

      // Bybit returns newest-first — reverse to oldest-first (Binance order)
      if (exchange.name.startsWith("Bybit") || exchange.name.startsWith("OKX")) {
        normalized.reverse()
      }

      return NextResponse.json(normalized, {
        headers: { "Cache-Control": "no-store", "X-Exchange": exchange.name },
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error"
      errors.push(`${exchange.name}: ${msg}`)
      continue
    }
  }

  return NextResponse.json(
    { error: `All exchange endpoints failed: ${errors.join(" | ")}` },
    { status: 502 }
  )
}
