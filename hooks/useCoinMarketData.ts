"use client"

import { useEffect, useState } from "react"

// Market cap, supply and rank for one coin, from CoinGecko's free public API.
// It's called from the browser (CoinGecko allows any origin) so each visitor
// uses their own rate limit. The coin is matched by ticker symbol, and the
// UI shows which CoinGecko coin was matched so a wrong match is visible.

export interface CoinMarketData {
  id: string
  name: string
  symbol: string
  rank: number | null
  marketCap: number | null
  fdv: number | null
  volume24h: number | null
  circulatingSupply: number | null
  totalSupply: number | null
  maxSupply: number | null
  ath: number | null
  athDate: string | null
  athChangePct: number | null
  atl: number | null
  atlDate: string | null
  atlChangePct: number | null
  /** Share of total crypto market cap, in percent */
  marketSharePct: number | null
  updatedAt: string | null
}

type State =
  | { status: "idle" | "loading" }
  | { status: "ready"; data: CoinMarketData }
  | { status: "missing" }
  | { status: "error"; message: string }

const API = "https://api.coingecko.com/api/v3"
const TTL_MS = 5 * 60_000

const coinCache = new Map<string, { at: number; data: CoinMarketData | null }>()
let globalCache: { at: number; totalUsd: number } | null = null

/** Bybit lists some coins per 1,000 units (1000PEPE). CoinGecko knows them as PEPE. */
export function plainTicker(base: string): string {
  const m = /^(1000000|10000|1000)([A-Z][A-Z0-9]*)$/.exec(base.toUpperCase())
  return (m ? m[2] : base).toLowerCase()
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

async function getTotalMarketCap(): Promise<number | null> {
  if (globalCache && Date.now() - globalCache.at < TTL_MS) return globalCache.totalUsd
  try {
    const res = await fetch(`${API}/global`, { signal: AbortSignal.timeout(8_000) })
    if (!res.ok) return null
    const json = await res.json()
    const total = num(json?.data?.total_market_cap?.usd)
    if (total) globalCache = { at: Date.now(), totalUsd: total }
    return total
  } catch {
    return null
  }
}

async function getCoin(ticker: string): Promise<CoinMarketData | null> {
  const hit = coinCache.get(ticker)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data

  const res = await fetch(`${API}/coins/markets?vs_currency=usd&symbols=${encodeURIComponent(ticker)}`, {
    signal: AbortSignal.timeout(8_000),
  })
  if (res.status === 429) throw new Error("CoinGecko's free rate limit was hit. Try again in a minute.")
  if (!res.ok) throw new Error(`CoinGecko answered ${res.status}`)
  const list = (await res.json()) as any[]
  // With several matches, take the biggest by market cap
  const c = [...(Array.isArray(list) ? list : [])].sort(
    (a, b) => (num(b?.market_cap) ?? 0) - (num(a?.market_cap) ?? 0),
  )[0]
  if (!c) {
    coinCache.set(ticker, { at: Date.now(), data: null })
    return null
  }

  const total = await getTotalMarketCap()
  const marketCap = num(c.market_cap)
  const data: CoinMarketData = {
    id: String(c.id),
    name: String(c.name),
    symbol: String(c.symbol).toUpperCase(),
    rank: num(c.market_cap_rank),
    marketCap: marketCap && marketCap > 0 ? marketCap : null,
    fdv: num(c.fully_diluted_valuation),
    volume24h: num(c.total_volume),
    circulatingSupply: num(c.circulating_supply),
    totalSupply: num(c.total_supply),
    maxSupply: num(c.max_supply),
    ath: num(c.ath),
    athDate: typeof c.ath_date === "string" ? c.ath_date : null,
    athChangePct: num(c.ath_change_percentage),
    atl: num(c.atl),
    atlDate: typeof c.atl_date === "string" ? c.atl_date : null,
    atlChangePct: num(c.atl_change_percentage),
    marketSharePct: marketCap && total ? (marketCap / total) * 100 : null,
    updatedAt: typeof c.last_updated === "string" ? c.last_updated : null,
  }
  coinCache.set(ticker, { at: Date.now(), data })
  return data
}

export function useCoinMarketData(base: string | null | undefined, enabled = true) {
  const [state, setState] = useState<State>({ status: "idle" })

  useEffect(() => {
    if (!base || !enabled) return
    let alive = true
    setState({ status: "loading" })
    getCoin(plainTicker(base))
      .then((data) => {
        if (!alive) return
        setState(data ? { status: "ready", data } : { status: "missing" })
      })
      .catch((err: unknown) => {
        if (!alive) return
        setState({ status: "error", message: err instanceof Error ? err.message : "CoinGecko didn't answer" })
      })
    return () => {
      alive = false
    }
  }, [base, enabled])

  return state
}

/** "$1.62T", "$845.2M" */
export function formatUsdCompact(n: number | null): string {
  if (n === null) return "n/a"
  const a = Math.abs(n)
  if (a >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (a >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (a >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (a >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

/** "20.11M", "420.69T" */
export function formatCountCompact(n: number | null): string {
  if (n === null) return "n/a"
  const a = Math.abs(n)
  if (a >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (a >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (a >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  if (a >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(0)
}
