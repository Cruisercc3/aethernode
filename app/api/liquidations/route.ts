import { NextRequest, NextResponse } from "next/server"
import type { LiquidationBucket, LiquidationSummary } from "@/lib/liquidations"

// Recent forced liquidations for one coin, from OKX's public API.
// Bybit and Binance don't answer from Vercel's US region (the candle route
// falls through to OKX for the same reason), and neither offers liquidation
// history over plain REST anyway. OKX does, with no key.
//
// The route pages back through the newest orders, converts contract sizes
// to USD, and groups them into price buckets for the analytics card.

const OKX = "https://www.okx.com/api/v5/public"
const MAX_PAGES = 10 // 100 orders a page
const TIME_BUDGET_MS = 6_000
const CACHE_TTL_MS = 30_000
const INSTRUMENT_TTL_MS = 60 * 60_000
const TARGET_BUCKETS = 20

type Instrument = { instId: string; ctVal: number; ctMult: number }
type Detail = { bkPx: string; sz: string; side: string; posSide: string; ts: string }

const instrumentCache = new Map<string, { at: number; inst: Instrument | null }>()
const summaryCache = new Map<string, { at: number; body: LiquidationSummary }>()

async function okx(path: string): Promise<{ code?: string; msg?: string; data?: unknown[] }> {
  const res = await fetch(`${OKX}${path}`, {
    headers: { "User-Agent": "Mozilla/5.0 AetherNode/1.0" },
    signal: AbortSignal.timeout(5_000),
  })
  // OKX answers a bad parameter (an unknown coin) with HTTP 400 and its own
  // error code in the body, so read the body before treating it as a failure
  if (res.status === 400) return res.json().catch(() => ({ code: "400" }))
  if (!res.ok) throw new Error(`OKX HTTP ${res.status}`)
  return res.json()
}

async function getInstrument(family: string): Promise<Instrument | null> {
  const hit = instrumentCache.get(family)
  if (hit && Date.now() - hit.at < INSTRUMENT_TTL_MS) return hit.inst
  const json = await okx(`/instruments?instType=SWAP&instFamily=${family}`)
  const row = (json.code === "0" ? json.data?.[0] : undefined) as
    | { instId?: string; ctVal?: string; ctMult?: string; ctType?: string }
    | undefined
  const inst =
    row && row.ctType === "linear" && row.instId
      ? { instId: row.instId, ctVal: Number(row.ctVal) || 0, ctMult: Number(row.ctMult) || 1 }
      : null
  instrumentCache.set(family, { at: Date.now(), inst })
  return inst
}

// 1, 2, 2.5 or 5 times a power of ten
function niceStep(raw: number): number {
  if (!(raw > 0)) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const f = raw / pow
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return nice * pow
}

function decimalsFor(step: number): number {
  if (step >= 1) return 0
  return Math.min(10, Math.ceil(-Math.log10(step)) + 1)
}

async function summarise(family: string, multiplier: number): Promise<LiquidationSummary> {
  const inst = await getInstrument(family)
  if (!inst) {
    return { available: false, reason: `OKX has no USDT perpetual for ${family.replace("-USDT", "")}` }
  }

  const started = Date.now()
  const details: Detail[] = []
  let after: string | null = null
  for (let page = 0; page < MAX_PAGES; page++) {
    if (Date.now() - started > TIME_BUDGET_MS) break
    const q = `/liquidation-orders?instType=SWAP&instFamily=${family}&state=filled&limit=100${after ? `&after=${after}` : ""}`
    const json = await okx(q)
    if (json.code !== "0") break
    const rows = ((json.data?.[0] as { details?: Detail[] } | undefined)?.details ?? []) as Detail[]
    if (rows.length === 0) break
    details.push(...rows)
    const oldest = rows.reduce((min, r) => Math.min(min, Number(r.ts)), Infinity)
    if (!Number.isFinite(oldest)) break
    after = String(oldest)
    if (rows.length < 100) break
  }

  const orders = details
    .map((d) => {
      const okxPrice = Number(d.bkPx)
      const contracts = Number(d.sz)
      const time = Number(d.ts)
      // A sell closes a long, a buy closes a short (holds for net mode too)
      const side: "long" | "short" = d.side === "sell" ? "long" : "short"
      return {
        price: okxPrice * multiplier,
        usd: contracts * inst.ctVal * inst.ctMult * okxPrice,
        side,
        time,
      }
    })
    .filter((o) => o.price > 0 && o.usd > 0 && Number.isFinite(o.time))

  if (orders.length === 0) {
    return { available: false, reason: `No recent liquidations on OKX for ${inst.instId}` }
  }

  const prices = orders.map((o) => o.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const step = niceStep(max > min ? (max - min) / TARGET_BUCKETS : max * 0.001)
  const dp = decimalsFor(step)

  const buckets = new Map<number, LiquidationBucket>()
  let longUsd = 0
  let shortUsd = 0
  let longCount = 0
  let shortCount = 0
  let largest: (typeof orders)[number] | null = null
  for (const o of orders) {
    const key = Number((Math.floor(o.price / step) * step).toFixed(dp))
    const b = buckets.get(key) ?? { price: key, longUsd: 0, shortUsd: 0, longCount: 0, shortCount: 0 }
    if (o.side === "long") {
      b.longUsd += o.usd
      b.longCount++
      longUsd += o.usd
      longCount++
    } else {
      b.shortUsd += o.usd
      b.shortCount++
      shortUsd += o.usd
      shortCount++
    }
    buckets.set(key, b)
    if (!largest || o.usd > largest.usd) largest = o
  }

  const times = orders.map((o) => o.time)
  return {
    available: true,
    source: "OKX",
    instId: inst.instId,
    count: orders.length,
    from: Math.min(...times),
    to: Math.max(...times),
    longUsd: Math.round(longUsd),
    shortUsd: Math.round(shortUsd),
    longCount,
    shortCount,
    bucketSize: step,
    buckets: [...buckets.values()]
      .sort((a, b) => a.price - b.price)
      .map((b) => ({ ...b, longUsd: Math.round(b.longUsd), shortUsd: Math.round(b.shortUsd) })),
    largest: largest
      ? { price: largest.price, usd: Math.round(largest.usd), side: largest.side, time: largest.time }
      : null,
  }
}

export async function GET(req: NextRequest) {
  const symbol = (req.nextUrl.searchParams.get("symbol") || "BTCUSDT").toUpperCase()
  const match = /^([A-Z0-9]{1,20})USDT$/.exec(symbol)
  if (!match) {
    return NextResponse.json({ available: false, reason: "Only USDT pairs are supported" }, { status: 400 })
  }

  // Bybit lists some small-priced coins per 1,000 units (1000PEPEUSDT).
  // OKX quotes the plain coin, so look it up without the prefix and scale
  // the prices back to match the chart.
  let base = match[1]
  let multiplier = 1
  const scaled = /^(1000000|10000|1000)([A-Z][A-Z0-9]*)$/.exec(base)
  if (scaled) {
    multiplier = Number(scaled[1])
    base = scaled[2]
  }
  const family = `${base}-USDT`

  const cached = summaryCache.get(symbol)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json(cached.body, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    })
  }

  try {
    const body = await summarise(family, multiplier)
    summaryCache.set(symbol, { at: Date.now(), body })
    return NextResponse.json(body, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error"
    console.error("Liquidations fetch failed:", msg)
    return NextResponse.json(
      { available: false, reason: "OKX didn't answer. Try again in a moment." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }
}
