"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  Activity, Radio, BarChart2, TrendingUp, Brain,
  Globe, Coins, Flame, ArrowRight, RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Each row runs a real check from this browser when the page opens.
// Nothing here is hardcoded to "operational".

type CheckState = { status: "checking" | "up" | "down" | "info"; detail: string }

type System = {
  id: string
  icon: typeof Activity
  name: string
  descriptor: string
  run: () => Promise<CheckState>
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; ms: number }> {
  const t0 = performance.now()
  const value = await fn()
  return { value, ms: Math.round(performance.now() - t0) }
}

function fail(err: unknown): CheckState {
  const msg = err instanceof Error ? err.message : String(err)
  return { status: "down", detail: msg.includes("timed out") || msg.includes("aborted") ? "Timed out" : msg || "No answer" }
}

const systems: System[] = [
  {
    id: "frontend",
    icon: Globe,
    name: "Platform Frontend",
    descriptor: "Next.js 16 on Vercel",
    run: async () => ({ status: "up", detail: "You're looking at it" }),
  },
  {
    id: "bybit-rest",
    icon: Activity,
    name: "Bybit REST API",
    descriptor: "Markets table, analytics cards, coin header",
    run: async () => {
      try {
        const { value: json, ms } = await timed(async () => {
          const res = await fetch("https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT", {
            signal: AbortSignal.timeout(8_000),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        return json?.retCode === 0
          ? { status: "up", detail: `Answered in ${ms} ms` }
          : { status: "down", detail: `retCode ${json?.retCode ?? "missing"}` }
      } catch (err) {
        return fail(err)
      }
    },
  },
  {
    id: "bybit-ws",
    icon: Radio,
    name: "Bybit WebSocket Feed",
    descriptor: "Order book, trades and live tickers",
    run: () =>
      new Promise<CheckState>((resolve) => {
        const t0 = performance.now()
        let done = false
        const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")
        const finish = (state: CheckState) => {
          if (done) return
          done = true
          clearTimeout(timer)
          try { ws.close() } catch { /* already closed */ }
          resolve(state)
        }
        const timer = setTimeout(() => finish({ status: "down", detail: "No ticker message within 8 s" }), 8_000)
        ws.onopen = () => ws.send(JSON.stringify({ op: "subscribe", args: ["tickers.BTCUSDT"] }))
        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(String(e.data))
            if (msg.topic === "tickers.BTCUSDT") {
              finish({ status: "up", detail: `First ticker after ${Math.round(performance.now() - t0)} ms` })
            }
          } catch { /* ignore non-JSON frames */ }
        }
        ws.onerror = () => finish({ status: "down", detail: "Connection refused" })
      }),
  },
  {
    id: "candles",
    icon: BarChart2,
    name: "Candle History Route",
    descriptor: "/api/binance/klines: Binance, Bybit, then OKX",
    run: async () => {
      try {
        const { value: res, ms } = await timed(() =>
          fetch("/api/binance/klines?symbol=BTCUSDT&interval=1h&limit=2", { signal: AbortSignal.timeout(20_000) }),
        )
        if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` }
        const exchange = res.headers.get("X-Exchange") || "an exchange"
        return { status: "up", detail: `Answered by ${exchange} in ${ms} ms` }
      } catch (err) {
        return fail(err)
      }
    },
  },
  {
    id: "liquidations",
    icon: Flame,
    name: "Liquidations Route",
    descriptor: "/api/liquidations: OKX public liquidation orders",
    run: async () => {
      try {
        const { value: res, ms } = await timed(() =>
          fetch("/api/liquidations?symbol=BTCUSDT", { signal: AbortSignal.timeout(20_000) }),
        )
        const json = await res.json()
        if (!res.ok || !json?.available) return { status: "down", detail: json?.reason || `HTTP ${res.status}` }
        return { status: "up", detail: `${json.count} orders from ${json.instId} in ${ms} ms` }
      } catch (err) {
        return fail(err)
      }
    },
  },
  {
    id: "coingecko",
    icon: Coins,
    name: "CoinGecko API",
    descriptor: "Market cap, rank and supply in the coin panels",
    run: async () => {
      try {
        const { value: res, ms } = await timed(() =>
          fetch("https://api.coingecko.com/api/v3/ping", { signal: AbortSignal.timeout(8_000) }),
        )
        if (res.status === 429) return { status: "down", detail: "Rate limited right now" }
        return res.ok ? { status: "up", detail: `Answered in ${ms} ms` } : { status: "down", detail: `HTTP ${res.status}` }
      } catch (err) {
        return fail(err)
      }
    },
  },
  {
    id: "ai",
    icon: Brain,
    name: "Groq AI Route",
    descriptor: "/api/ai/analyze on openai/gpt-oss-120b",
    run: async () => {
      try {
        const res = await fetch("/api/ai/analyze", { signal: AbortSignal.timeout(8_000) })
        const json = await res.json()
        if (!res.ok) return { status: "down", detail: `HTTP ${res.status}` }
        return json?.configured
          ? { status: "info", detail: "Key is set. Not called from here, since each call spends tokens" }
          : { status: "down", detail: "No Groq key set on the server" }
      } catch (err) {
        return fail(err)
      }
    },
  },
]

const STATUS_STYLE: Record<CheckState["status"], { dot: string; text: string; label: string }> = {
  checking: { dot: "bg-muted-foreground/50 animate-pulse", text: "text-muted-foreground", label: "Checking" },
  up: { dot: "bg-trading-green", text: "text-trading-green", label: "Up" },
  down: { dot: "bg-trading-red", text: "text-trading-red", label: "Down" },
  info: { dot: "bg-primary", text: "text-primary", label: "Configured" },
}

export default function StatusPage() {
  const [results, setResults] = useState<Record<string, CheckState>>({})
  const [checkedAt, setCheckedAt] = useState<Date | null>(null)

  const runAll = useCallback(() => {
    setResults(Object.fromEntries(systems.map((s) => [s.id, { status: "checking", detail: "" }])))
    setCheckedAt(null)
    Promise.all(
      systems.map((s) =>
        s.run().then((state) => setResults((prev) => ({ ...prev, [s.id]: state }))),
      ),
    ).then(() => setCheckedAt(new Date()))
  }, [])

  useEffect(() => {
    runAll()
  }, [runAll])

  const states = systems.map((s) => results[s.id]?.status ?? "checking")
  const checking = states.some((s) => s === "checking")
  const down = states.filter((s) => s === "down").length

  return (
    <div className="relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-6 py-16 lg:px-8 lg:py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              System Status
            </span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Platform Status
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
            Live checks against each service the site depends on, run from your browser when this page opens.
          </p>
          <div className="mt-7 h-px w-16 bg-primary/40" />
        </motion.div>

        {/* Summary banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.08 }}
          className={cn(
            "mb-8 flex items-center gap-3 rounded-xl border px-5 py-4",
            checking
              ? "border-border/40 bg-card/40"
              : down === 0
                ? "border-trading-green/30 bg-trading-green/5"
                : "border-trading-red/30 bg-trading-red/5",
          )}
        >
          <div className="relative flex h-3 w-3 shrink-0">
            {!checking && down === 0 && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-trading-green opacity-50" />
            )}
            <span
              className={cn(
                "relative inline-flex h-3 w-3 rounded-full",
                checking ? "bg-muted-foreground/50 animate-pulse" : down === 0 ? "bg-trading-green" : "bg-trading-red",
              )}
            />
          </div>
          <p className="flex-1 text-sm font-semibold text-foreground">
            {checking
              ? "Running checks..."
              : down === 0
                ? "Every check passed"
                : `${down} of ${systems.length} checks failed from your browser`}
          </p>
          <button
            onClick={runAll}
            disabled={checking}
            className="flex items-center gap-1.5 rounded-md border border-border/50 bg-secondary/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3 w-3", checking && "animate-spin")} />
            Re-run
          </button>
        </motion.div>

        {/* System list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.12 }}
          className="space-y-2 mb-6"
        >
          {systems.map((sys, i) => {
            const state = results[sys.id] ?? { status: "checking", detail: "" }
            const style = STATUS_STYLE[state.status]
            return (
              <motion.div
                key={sys.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: 0.15 + i * 0.04 }}
                className="group flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-card/60 px-5 py-4 transition-colors duration-150 hover:border-border/70 hover:bg-card/80"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-150">
                    <sys.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{sys.name}</p>
                    <p className="text-xs text-muted-foreground break-words">{sys.descriptor}</p>
                    {state.detail && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/70 break-words">{state.detail}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className={cn("h-2 w-2 rounded-full", style.dot)} />
                  <span className={cn("text-xs font-medium", style.text)}>{style.label}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.55 }}
          className="mb-16 rounded-lg border border-border/30 bg-card/30 px-5 py-4"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            {checkedAt ? `Last checked ${checkedAt.toLocaleTimeString()}. ` : ""}
            Exchange APIs block some regions, so a check can fail for you and pass elsewhere. All market data
            sources are free public APIs. Total infrastructure cost: ~$1/month.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.6 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href="/architecture"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            View Architecture
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/acquisition"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
          >
            Acquisition Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
