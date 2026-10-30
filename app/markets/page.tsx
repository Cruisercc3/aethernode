"use client"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Search, ArrowUpRight, ArrowDownRight, Star, TrendingUp, TrendingDown, Flame, Activity, X, ExternalLink, Info, Newspaper, BarChart3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useMarketsTicker, formatVolume, formatPrice, type MarketCoin } from "@/hooks/useMarketsTicker"
import { CryptoIcon } from "@/components/crypto-icon"
import { useCoinMarketData, formatUsdCompact, formatCountCompact } from "@/hooks/useCoinMarketData"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"

/* ── Time filter type ─────────────────────────── */
type TimeFilter = "4h" | "1d" | "7d"
const TIME_FILTERS: TimeFilter[] = ["4h", "1d", "7d"] // Order: 4 hours, 1 day, 7 days

/* ── Market Sentiment Gauge (Fear & Greed style) with ticking animation ─────────────── */
function MarketSentimentGauge({ coins, timeFilter, changesMap }: { coins: MarketCoin[]; timeFilter: TimeFilter; changesMap: Record<string, number> }) {
  const [displayValue, setDisplayValue] = useState(50)
  const [isAnimating, setIsAnimating] = useState(false)
  
  // Calculate sentiment based on market conditions using timeframe-specific changes
  const sentiment = useMemo(() => {
    if (coins.length === 0) return 50
    
    // Get change value based on timeframe - use changesMap if available, otherwise fall back to 24h
    const getChange = (coin: MarketCoin) => changesMap[coin.symbol] ?? coin.change24h
    
    // Factors: % of coins positive, average change, volume momentum
    const positive = coins.filter(c => getChange(c) > 0).length
    const positiveRatio = positive / coins.length
    
    // Average change across all coins
    const avgChange = coins.reduce((sum, c) => sum + getChange(c), 0) / coins.length
    
    // Top 10 performance (weighted heavily)
    const top10Avg = coins.slice(0, 10).reduce((sum, c) => sum + getChange(c), 0) / 10
    
    // BTC influence - Bitcoin sentiment affects overall market
    const btc = coins.find(c => c.baseAsset === "BTC")
    const btcInfluence = btc ? Math.min(Math.max(getChange(btc) * 2, -10), 10) : 0
    
    // Weighted score 0-100
    let score = 50
    score += (positiveRatio - 0.5) * 35 // -17.5 to +17.5
    score += Math.min(Math.max(avgChange * 2.5, -12), 12) // -12 to +12
    score += Math.min(Math.max(top10Avg * 2, -12), 12) // -12 to +12
    score += btcInfluence // -10 to +10
    
    return Math.min(Math.max(Math.round(score), 0), 100)
  }, [coins, changesMap])

  // Animate the needle ticking effect when sentiment changes
  useEffect(() => {
    setIsAnimating(true)
    const startValue = displayValue
    const endValue = sentiment
    const duration = 1200 // ms
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth deceleration with slight overshoot
      const easeOutBack = (t: number) => {
        const c1 = 1.70158
        const c3 = c1 + 1
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
      }
      
      const easedProgress = easeOutBack(progress)
      const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress)
      
      setDisplayValue(Math.min(Math.max(currentValue, 0), 100))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        setIsAnimating(false)
      }
    }
    
    requestAnimationFrame(animate)
  }, [sentiment])

  // Sentiment label and color
  const getSentimentLabel = (value: number) => {
    if (value <= 20) return { label: "Extreme Fear", color: "text-trading-red", bgColor: "bg-trading-red/10" }
    if (value <= 40) return { label: "Fear", color: "text-orange-500", bgColor: "bg-orange-500/10" }
    if (value <= 60) return { label: "Neutral", color: "text-muted-foreground", bgColor: "bg-muted/20" }
    if (value <= 80) return { label: "Greed", color: "text-lime-500", bgColor: "bg-lime-500/10" }
    return { label: "Extreme Greed", color: "text-trading-green", bgColor: "bg-trading-green/10" }
  }

  const { label, color, bgColor } = getSentimentLabel(displayValue)
  
  // Needle angle: -90deg (left/fear) to +90deg (right/greed)
  const needleAngle = (displayValue / 100) * 180 - 90
  
  // Time label based on filter
  const timeLabel = timeFilter === "4h" ? "4H" : timeFilter === "1d" ? "24H" : "7D"

  return (
    <div className="flex-shrink-0 rounded-xl border border-border/40 bg-card/40 p-4 min-w-[220px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={cn("h-4 w-4", isAnimating ? "text-primary animate-pulse" : "text-primary")} />
          <h3 className="text-sm font-semibold text-foreground">Market Sentiment</h3>
        </div>
        <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", bgColor, color)}>
          {timeLabel}
        </span>
      </div>
      
      {/* Gauge */}
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 120 70" className="w-full max-w-[180px]">
          {/* Background arc gradient segments */}
          <defs>
            <linearGradient id="gaugeGradientMain" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(0 65% 50%)" />
              <stop offset="20%" stopColor="hsl(15 80% 50%)" />
              <stop offset="40%" stopColor="hsl(35 90% 55%)" />
              <stop offset="50%" stopColor="hsl(45 10% 60%)" />
              <stop offset="60%" stopColor="hsl(80 60% 50%)" />
              <stop offset="80%" stopColor="hsl(120 60% 45%)" />
              <stop offset="100%" stopColor="hsl(165 80% 45%)" />
            </linearGradient>
            {/* Glow filter for needle */}
            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Gauge background track */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.3"
          />
          
          {/* Gauge colored arc */}
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="url(#gaugeGradientMain)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Tick marks with numbers */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angle = (tick / 100) * 180 - 180
            const rad = (angle * Math.PI) / 180
            const x1 = 60 + 40 * Math.cos(rad)
            const y1 = 60 + 40 * Math.sin(rad)
            const x2 = 60 + 48 * Math.cos(rad)
            const y2 = 60 + 48 * Math.sin(rad)
            const textX = 60 + 34 * Math.cos(rad)
            const textY = 60 + 34 * Math.sin(rad)
            return (
              <g key={tick}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="hsl(var(--muted-foreground))"
                  fontSize="6"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  opacity="0.6"
                >
                  {tick}
                </text>
              </g>
            )
          })}
          
          {/* Animated Needle */}
          <motion.g 
            initial={{ rotate: -90 }}
            animate={{ rotate: needleAngle }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15,
              mass: 1
            }}
            style={{ transformOrigin: "60px 60px" }}
          >
            {/* Needle shadow */}
            <line
              x1="60" y1="60" x2="60" y2="20"
              stroke="hsl(var(--foreground))"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.2"
              filter="url(#needleGlow)"
            />
            {/* Needle body */}
            <line
              x1="60" y1="60" x2="60" y2="20"
              stroke="hsl(var(--foreground))"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Needle center dot */}
            <circle 
              cx="60" 
              cy="60" 
              r="5" 
              fill="hsl(var(--card))" 
              stroke="hsl(var(--foreground))" 
              strokeWidth="2"
            />
            {/* Inner highlight */}
            <circle 
              cx="60" 
              cy="60" 
              r="2" 
              fill="hsl(var(--primary))"
            />
          </motion.g>
        </svg>
        
        {/* Value and label */}
        <div className="text-center -mt-2">
          <motion.div 
            key={displayValue}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn("text-3xl font-bold font-mono tabular-nums", color)}
          >
            {displayValue}
          </motion.div>
          <div className={cn("text-xs font-semibold uppercase tracking-wide mt-0.5", color)}>
            {label}
          </div>
        </div>
        
        {/* Scale labels */}
        <div className="flex justify-between w-full mt-2 px-2">
          <span className="text-[10px] font-medium text-trading-red">Fear</span>
          <span className="text-[10px] font-medium text-muted-foreground">Neutral</span>
          <span className="text-[10px] font-medium text-trading-green">Greed</span>
        </div>
      </div>
    </div>
  )
}

/* ── Tiny sparkline SVG ────────────────────────── */
function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (!data || data.length < 2) {
    return <svg width={80} height={28} className="shrink-0 opacity-30"><line x1="0" y1="14" x2="80" y2="14" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="3 3" /></svg>
  }
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 80, h = 28
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ")
  const area = `0,${h} ${pts} ${w},${h}`
  const c = positive ? "hsl(var(--trading-green))" : "hsl(var(--trading-red))"
  return (
    <svg width={w} height={h} className="shrink-0">
      <defs><linearGradient id={`ms-${positive ? "g" : "r"}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.2} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient></defs>
      <polygon points={area} fill={`url(#ms-${positive ? "g" : "r"})`} />
      <polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Coin icon — uses shared CryptoIcon with real logos ─── */

/* ── Price flash cell ──────────────────────────── */
function PriceCell({ coin }: { coin: MarketCoin }) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null)
  const prev = useRef(coin.price)
  useEffect(() => {
    if (coin.price !== prev.current) {
      setFlash(coin.price > prev.current ? "up" : "down")
      prev.current = coin.price
      const t = setTimeout(() => setFlash(null), 350)
      return () => clearTimeout(t)
    }
  }, [coin.price])
  return (
    <span className={cn("font-mono text-sm tabular-nums transition-colors duration-200", flash === "up" && "text-trading-green", flash === "down" && "text-trading-red", !flash && "text-foreground")}>
      ${formatPrice(coin.price)}
    </span>
  )
}

/* ── Fetch kline data for a specific interval ─────────────────── */
async function fetchKlineChange(symbol: string, interval: string, limit: number = 2): Promise<number> {
  try {
    const res = await fetch(
      `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return 0
    const data = await res.json()
    const klines = data?.result?.list
    if (!klines || klines.length < 2) return 0
    // Bybit kline: [timestamp, open, high, low, close, volume, turnover]
    const oldClose = parseFloat(klines[klines.length - 1][4])
    const newClose = parseFloat(klines[0][4])
    if (oldClose <= 0) return 0
    return ((newClose - oldClose) / oldClose) * 100
  } catch {
    return 0
  }
}

/* ── 24h sparklines for the rows on screen ──────────────────── */
// Hourly closes for the last 24 hours from Bybit, fetched only for the rows
// on the current page, a few at a time, and cached for 5 minutes.
const sparkCache = new Map<string, { at: number; closes: number[] }>()
const SPARK_TTL_MS = 5 * 60_000

async function fetchSparkline(symbol: string): Promise<number[]> {
  const hit = sparkCache.get(symbol)
  if (hit && Date.now() - hit.at < SPARK_TTL_MS) return hit.closes
  try {
    const res = await fetch(
      `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=60&limit=24`,
      { signal: AbortSignal.timeout(6000) }
    )
    if (!res.ok) return []
    const data = await res.json()
    const rows: string[][] = data?.result?.list ?? []
    // Bybit returns newest first
    const closes = rows.map(r => parseFloat(r[4])).filter(n => Number.isFinite(n)).reverse()
    sparkCache.set(symbol, { at: Date.now(), closes })
    return closes
  } catch {
    return []
  }
}

function useSparklines(symbols: string[]) {
  const [sparks, setSparks] = useState<Record<string, number[]>>({})
  const key = symbols.join(",")
  useEffect(() => {
    let alive = true
    const queue = key ? key.split(",") : []
    const worker = async () => {
      while (alive && queue.length) {
        const sym = queue.shift()!
        const closes = await fetchSparkline(sym)
        if (alive && closes.length > 1) setSparks(prev => ({ ...prev, [sym]: closes }))
      }
    }
    Promise.all(Array.from({ length: 6 }, worker))
    return () => { alive = false }
  }, [key])
  return sparks
}

/* ── Small summary card for Top Gainers / Trending / Losers - static 4 items ─ */
function SummaryCard({ 
  title, 
  icon, 
  coins, 
  timeFilter,
  changesMap
}: { 
  title: string
  icon: React.ReactNode
  coins: MarketCoin[]
  timeFilter: TimeFilter
  changesMap: Record<string, number>
}) {
  // Sort coins by the current time filter's change
  const sortedCoins = useMemo(() => {
    return [...coins].sort((a, b) => {
      const changeA = changesMap[a.symbol] ?? a.change24h
      const changeB = changesMap[b.symbol] ?? b.change24h
      // For gainers sort descending (highest first), for losers ascending (lowest first)
      if (title.includes("Losers")) return changeA - changeB
      // For trending, sort by volume but show change
      if (title.includes("Trending")) return b.volume24h - a.volume24h
      return changeB - changeA
    })
  }, [coins, changesMap, title])

  // Show exactly 4 items, no pagination
  const displayedCoins = sortedCoins.slice(0, 4)
  
  // Get the change value label based on time filter
  const changeLabel = timeFilter === "4h" ? "4H %" : timeFilter === "1d" ? "1D %" : "7D %"

  return (
    <div className="flex-1 rounded-xl border border-border/40 bg-card/40 p-4 min-w-[260px]">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-3 gap-1 text-[10px] text-muted-foreground mb-2 px-1">
        <span>Pairs</span>
        <span className="text-right">Price</span>
        <span className="text-right">{changeLabel}</span>
      </div>
      <div>
        {displayedCoins.map((c) => {
          const change = changesMap[c.symbol] ?? c.change24h
          const pos = change >= 0
          return (
            <Link key={c.symbol} href={`/spot?pair=${c.baseAsset}%2FUSDT`} className="grid grid-cols-3 gap-1 items-center px-1 py-1.5 rounded-md hover:bg-secondary/40 transition-colors">
              <div className="flex items-center gap-1.5">
                <CryptoIcon base={c.baseAsset} />
                <span className="text-xs font-medium text-foreground">{c.displaySymbol}</span>
              </div>
              <span className="text-right text-xs font-mono tabular-nums text-foreground">{formatPrice(c.price)}</span>
              <span className={cn("text-right text-xs font-mono tabular-nums", pos ? "text-trading-green" : "text-trading-red")}>
                {pos ? "+" : ""}{change.toFixed(2)}%
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

/* ── Coin Details Modal ─────────────────────────────────── */
type DetailsTab = "about" | "news"

type Sentiment = "bullish" | "bearish" | "neutral"

// Placeholder headlines. No news feed is connected, and the UI says so.
const NEWS_ITEMS: { title: string; source: string; time: string; sentiment: Sentiment; summary: string }[] = [
  {
    title: "Bitcoin Surges Past $97K as Institutional Demand Hits Record High",
    source: "CoinDesk",
    time: "2h ago",
    sentiment: "bullish",
    summary: "Institutional investors have pushed Bitcoin to new highs with record inflows into spot BTC ETFs.",
  },
  {
    title: "Federal Reserve Holds Rates Steady, Signals Possible Cuts in 2026",
    source: "Reuters",
    time: "4h ago",
    sentiment: "bullish",
    summary: "The Federal Reserve maintained interest rates but hinted at potential rate reductions later this year.",
  },
  {
    title: "Ethereum Layer 2 Ecosystem Sees 40% Growth in TVL",
    source: "The Block",
    time: "6h ago",
    sentiment: "bullish",
    summary: "Major L2 networks including Arbitrum and Optimism have seen significant TVL growth.",
  },
  {
    title: "SEC Approves New Crypto Exchange Regulations for 2026",
    source: "Bloomberg",
    time: "8h ago",
    sentiment: "neutral",
    summary: "The SEC has approved a new regulatory framework for cryptocurrency exchanges.",
  },
  {
    title: "MicroStrategy Adds Another $500M in Bitcoin to Treasury",
    source: "CNBC",
    time: "10h ago",
    sentiment: "bullish",
    summary: "The company continues its aggressive Bitcoin accumulation strategy.",
  },
]

function CoinDetailsModal({ 
  coin, 
  isOpen, 
  onClose 
}: { 
  coin: MarketCoin | null
  isOpen: boolean
  onClose: () => void 
}) {
  const [activeTab, setActiveTab] = useState<DetailsTab>("about")
  const [mounted, setMounted] = useState(false)
  const market = useCoinMarketData(coin?.baseAsset, isOpen)

  // Ensure we only render portal on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isOpen])

  if (!mounted || !isOpen || !coin) return null

  const positive = coin.change24h >= 0

  // Market cap, rank and supply come from CoinGecko. Until it answers,
  // or if it has no match for this ticker, the cells say so.
  const md = market.status === "ready" ? market.data : null
  const pending = market.status === "loading" || market.status === "idle"
  const blank = pending ? "..." : "n/a"
  const coinDetails = {
    ranking: md?.rank ? `#${md.rank}` : blank,
    marketCap: md?.marketCap ? formatUsdCompact(md.marketCap) : blank,
    fullyDilutedMarketCap: md?.fdv ? formatUsdCompact(md.fdv) : blank,
    volume24h: md?.volume24h ? formatUsdCompact(md.volume24h) : blank,
    volumeToMarketCap:
      md?.volume24h && md?.marketCap ? `${((md.volume24h / md.marketCap) * 100).toFixed(2)}%` : blank,
    marketShare: md?.marketSharePct !== null && md?.marketSharePct !== undefined ? `${md.marketSharePct.toFixed(2)}%` : blank,
    circulatingSupply: md?.circulatingSupply ? `${formatCountCompact(md.circulatingSupply)} ${md.symbol}` : blank,
    maxSupply: md ? (md.maxSupply ? `${formatCountCompact(md.maxSupply)} ${md.symbol}` : "No fixed cap") : blank,
    description: getCoinDescription(coin.baseAsset, coin.name),
  }
  const marketNote =
    market.status === "ready"
      ? `Market cap, rank and supply from CoinGecko, matched by ticker to ${market.data.name} (${market.data.id}).`
      : market.status === "missing"
        ? `CoinGecko has no coin with the ticker ${coin.baseAsset}, so market cap and supply aren't shown.`
        : market.status === "error"
          ? `${market.message}`
          : "Loading market cap and supply from CoinGecko..."

  // Use portal to render at document body level for proper centering
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {/* Backdrop */}
          <div 
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal - centered in viewport */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-card border-2 border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <CryptoIcon base={coin.baseAsset} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{coin.name}</h2>
                    <span className="text-sm text-muted-foreground font-mono">{coin.baseAsset}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xl font-bold font-mono">${formatPrice(coin.price)}</span>
                    <span className={cn(
                      "flex items-center gap-0.5 text-sm font-mono font-medium",
                      positive ? "text-trading-green" : "text-trading-red"
                    )}>
                      {positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      {positive ? "+" : ""}{coin.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-border">
              <button
                onClick={() => setActiveTab("about")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === "about"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Info className="h-4 w-4" />
                About
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === "news"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <Newspaper className="h-4 w-4" />
                News
              </button>
            </div>

            {/* Content */}
            <ScrollArea className="h-[calc(85vh-180px)]">
              {activeTab === "about" ? (
                <div className="p-4 space-y-6">
                  {/* Key Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Key Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <StatItem label="Ranking" value={coinDetails.ranking} />
                      <StatItem label="Market Cap" value={coinDetails.marketCap} />
                      <StatItem label="FDV" value={coinDetails.fullyDilutedMarketCap} />
                      <StatItem label="24h Volume (all markets)" value={coinDetails.volume24h} />
                      <StatItem label="Vol/MCap" value={coinDetails.volumeToMarketCap} />
                      <StatItem label="Market Share" value={coinDetails.marketShare} />
                    </div>
                    <p className="mt-2 text-[10px] text-muted-foreground/70">{marketNote}</p>
                  </div>

                  {/* Price Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Price Statistics</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatItem label="24h High" value={`$${formatPrice(coin.high24h)}`} valueClass="text-trading-green" />
                      <StatItem label="24h Low" value={`$${formatPrice(coin.low24h)}`} valueClass="text-trading-red" />
                      <StatItem label="24h Change" value={`${positive ? "+" : ""}${coin.change24h.toFixed(2)}%`} valueClass={positive ? "text-trading-green" : "text-trading-red"} />
                      <StatItem label="24h Volume (Bybit)" value={`${formatVolume(coin.volume24h)} USDT`} />
                    </div>
                  </div>

                  {/* Supply Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Supply Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <StatItem label="Circulating Supply" value={coinDetails.circulatingSupply} />
                      <StatItem label="Max Supply" value={coinDetails.maxSupply} />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">About {coin.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {coinDetails.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href={`/spot?pair=${coin.baseAsset}%2FUSDT`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Trade Spot
                    </Link>
                    <Link
                      href={`/platform?pair=${coin.baseAsset}%2FUSDT`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Trade Futures
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground mb-4">
                    <span className="mr-1.5 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">Sample</span>
                    Placeholder headlines. No news feed is connected yet.
                  </p>
                  {NEWS_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/30 bg-secondary/20 p-3 hover:bg-secondary/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-sm font-medium text-foreground leading-relaxed flex-1">
                          {item.title}
                        </h4>
                        <span
                          className={cn(
                            "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase",
                            item.sentiment === "bullish" && "bg-trading-green/15 text-trading-green",
                            item.sentiment === "bearish" && "bg-trading-red/15 text-trading-red",
                            item.sentiment === "neutral" && "bg-muted/50 text-muted-foreground"
                          )}
                        >
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                        {item.summary}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-medium">{item.source}</span>
                        <span>-</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function StatItem({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border/30">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</div>
      <div className={cn("text-sm font-semibold font-mono", valueClass || "text-foreground")}>{value}</div>
    </div>
  )
}

function getCoinDescription(baseAsset: string, name: string): string {
  const descriptions: Record<string, string> = {
    BTC: "Bitcoin is a decentralized digital currency that enables instant payments to anyone, anywhere in the world. It uses peer-to-peer technology to operate with no central authority, with transaction management and money issuance carried out collectively by the network.",
    ETH: "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform. Among cryptocurrencies, it is second only to Bitcoin in market capitalization.",
    SOL: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale. It is known for its fast transaction speeds and low fees.",
    BNB: "BNB is the cryptocurrency coin that powers the BNB Chain ecosystem. It is used to pay for transaction fees and participate in token sales on the platform.",
    XRP: "XRP is the native cryptocurrency of the XRP Ledger, designed for fast, low-cost international payments. It serves as a bridge currency in cross-border transactions.",
    DOGE: "Dogecoin is a cryptocurrency created by software engineers Billy Markus and Jackson Palmer, who decided to create a payment system as a joke. It has since gained a massive community following.",
    ADA: "Cardano is a proof-of-stake blockchain platform that says its goal is to allow changemakers, innovators, and visionaries to bring about positive global change.",
  }
  return descriptions[baseAsset] || `${name} is a digital asset trading on major cryptocurrency exchanges. It enables various use cases in the blockchain ecosystem and has an active trading community.`
}

/* ── Page tabs ─────────────────────────────────── */
const PAGE_TABS = ["Spot", "Derivatives", "Newly Listed"] as const
type PageTab = (typeof PAGE_TABS)[number]

/* ── Derivatives sub-filters ───────────────────── */
const DERIV_FILTERS = [
  "All",
  "USDT Perpetual",
  "USDC Perpetual 125X",
  "Inverse Perpetual",
  "Inverse Futures",
  "USDT Options",
] as const
type DerivFilter = (typeof DERIV_FILTERS)[number]

// Which Bybit symbols match each derivatives sub-filter
// USDT Perpetual = ends in USDT (linear), USDC = ends in USDC (linear),
// Inverse = ends in USD (not USDT/USDC), Options = ends in a date+C/P suffix
function matchesDerivFilter(coin: MarketCoin, filter: DerivFilter): boolean {
  if (filter === "All") return true
  const sym = coin.symbol
  if (filter === "USDT Perpetual") return sym.endsWith("USDT") && !sym.includes("-")
  if (filter === "USDC Perpetual 125X") return sym.endsWith("USDC") && !sym.includes("-")
  if (filter === "Inverse Perpetual") return sym.endsWith("USD") && !sym.endsWith("USDT") && !sym.endsWith("USDC")
  if (filter === "Inverse Futures") return /USD\d{2}$/.test(sym) // e.g. BTCUSD0329
  if (filter === "USDT Options") return sym.includes("-") && (sym.endsWith("C") || sym.endsWith("P"))
  return true
}

/* ── Sort keys ─────────────────────────────────── */
type SortKey = "symbol" | "price" | "change24h" | "high24h" | "low24h" | "volume24h"
type PageSize = 25 | 50

export default function MarketsPage() {
  const { coins, isLive, topGainers, topLosers, trending, dynamicSectors, newlyListed } = useMarketsTicker()
  const SECTOR_KEYS = Object.keys(dynamicSectors)
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<PageTab>("Spot")
  const [activeSector, setActiveSector] = useState("All")
  const [activeDerivFilter, setActiveDerivFilter] = useState<DerivFilter>("All")
  const [sortKey, setSortKey] = useState<SortKey>("volume24h")
  const [sortAsc, setSortAsc] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [pageSize, setPageSize] = useState<PageSize>(50)
  const [currentPage, setCurrentPage] = useState(1)
  // Global time filter for all cards and sentiment gauge
  const [globalTimeFilter, setGlobalTimeFilter] = useState<TimeFilter>("4h")
  // Selected coin for details modal
  const [selectedCoin, setSelectedCoin] = useState<MarketCoin | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  // Changes map for timeframe-specific percentage changes
  const [changesMap, setChangesMap] = useState<Record<string, number>>({})
  const [changesLoading, setChangesLoading] = useState(false)
  
  // Fetch change data once when time filter changes (at page level, not per card)
  useEffect(() => {
    // Get all coins needed for the summary cards
    const allSymbols = new Set([
      ...topGainers.slice(0, 10).map(c => c.symbol),
      ...topLosers.slice(0, 10).map(c => c.symbol),
      ...trending.slice(0, 10).map(c => c.symbol)
    ])
    
    if (globalTimeFilter === "1d") {
      // Use existing 24h data from Bybit ticker
      const map: Record<string, number> = {}
      coins.forEach(c => { map[c.symbol] = c.change24h })
      setChangesMap(map)
      return
    }
    
    // Fetch kline data for 4h or 7d from Bybit
    const interval = globalTimeFilter === "4h" ? "240" : "D"
    const limit = globalTimeFilter === "4h" ? 2 : 8
    
    setChangesLoading(true)
    const fetchChanges = async () => {
      const results: Record<string, number> = {}
      
      await Promise.all(
        Array.from(allSymbols).map(async (symbol) => {
          const change = await fetchKlineChange(symbol, interval, limit)
          results[symbol] = change
        })
      )
      
      setChangesMap(results)
      setChangesLoading(false)
    }
    
    fetchChanges()
  // Only re-fetch when timeFilter changes, not on every coin update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalTimeFilter])

  const toggleFav = (symbol: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.has(symbol) ? next.delete(symbol) : next.add(symbol)
      return next
    })
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) { setSortAsc(!sortAsc) } else { setSortKey(key); setSortAsc(false) }
    setCurrentPage(1)
  }

  const handleSearch = (val: string) => { setSearch(val); setCurrentPage(1) }
  const handleSector = (s: string) => { setActiveSector(s); setCurrentPage(1) }
  const handlePageSize = (ps: PageSize) => { setPageSize(ps); setCurrentPage(1) }

  const filteredCoins = useMemo(() => {
    // Tab-level pool selection
    let pool: MarketCoin[]
    if (activeTab === "Newly Listed") {
      pool = [...newlyListed]
    } else if (activeTab === "Derivatives") {
      const stables = new Set(["USDC","BUSD","DAI","TUSD","USDP","GUSD","FRAX","USDD","PYUSD","USDE"])
      pool = [...coins]
        .filter(c => !stables.has(c.baseAsset))
        .filter(c => matchesDerivFilter(c, activeDerivFilter))
    } else {
      // Spot — top pairs by volume (exclude very low-liquidity pairs)
      pool = [...coins].filter(c => c.volume24h > 50_000)
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      pool = pool.filter((c) => c.displaySymbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.baseAsset.toLowerCase().includes(q))
    }

    // Sector filter
    if (activeSector !== "All") {
      const bases = dynamicSectors[activeSector] || []
      pool = pool.filter((c) => bases.includes(c.baseAsset))
    }

    // Sort
    pool.sort((a, b) => {
      let diff = 0
      if (sortKey === "symbol") diff = a.displaySymbol.localeCompare(b.displaySymbol)
      else diff = (a[sortKey] as number) - (b[sortKey] as number)
      return sortAsc ? diff : -diff
    })

    return pool
  }, [coins, newlyListed, activeTab, activeDerivFilter, search, activeSector, dynamicSectors, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(filteredCoins.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pagedCoins = filteredCoins.slice((safePage - 1) * pageSize, safePage * pageSize)
  const sparks = useSparklines(pagedCoins.map(c => c.symbol))

  const SortHeader = ({ label, sKey, align = "right" }: { label: string; sKey: SortKey; align?: string }) => (
    <th
      onClick={() => handleSort(sKey)}
      className={cn("px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none", align === "left" ? "text-left" : "text-right")}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {sortKey === sKey && <span className="text-primary">{sortAsc ? " \u2191" : " \u2193"}</span>}
      </span>
    </th>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="border-b border-border/30 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Markets</h1>
                {isLive && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }} className="flex items-center gap-1.5 rounded-full bg-trading-green/10 px-2.5 py-0.5">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trading-green opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-trading-green" /></span>
                    <span className="text-[10px] font-semibold text-trading-green uppercase tracking-wider">Live</span>
                  </motion.div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Real-time cryptocurrency prices from Bybit · 500+ pairs</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search coins..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 h-10 bg-secondary/30 border-border/40"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        {/* Timeframe selector at top left */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Timeframe:</span>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/30 border border-border/40">
              {TIME_FILTERS.map((t) => {
                const displayLabel = t === "4h" ? "4H" : t === "1d" ? "1D" : "7D"
                return (
                  <button
                    key={t}
                    onClick={() => setGlobalTimeFilter(t)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      globalTimeFilter === t
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {displayLabel}
                  </button>
                )
              })}
            </div>
            {changesLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="h-3 w-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Market Sentiment Gauge + Summary cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none mb-6">
          {/* Market Sentiment Gauge */}
          <MarketSentimentGauge coins={coins} timeFilter={globalTimeFilter} changesMap={changesMap} />
          
          {/* Summary Cards - 4 items each, no time filter buttons */}
          <SummaryCard
            title="Top Gainers"
            icon={<TrendingUp className="h-4 w-4 text-trading-green" />}
            coins={topGainers.slice(0, 10)}
            timeFilter={globalTimeFilter}
            changesMap={changesMap}
          />
          <SummaryCard
            title="Top Losers"
            icon={<TrendingDown className="h-4 w-4 text-trading-red" />}
            coins={topLosers.slice(0, 10)}
            timeFilter={globalTimeFilter}
            changesMap={changesMap}
          />
          <SummaryCard
            title="Trending"
            icon={<Flame className="h-4 w-4 text-primary" />}
            coins={trending.slice(0, 10)}
            timeFilter={globalTimeFilter}
            changesMap={changesMap}
          />
        </div>

        {/* Page tabs */}
        <div className="flex items-center gap-6 border-b border-border/30 mb-4">
          {PAGE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setActiveSector("All"); setActiveDerivFilter("All"); setCurrentPage(1) }}
              className={cn("pb-2.5 text-sm font-medium transition-colors border-b-2", activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter chips — Derivatives sub-types or Sector categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {activeTab === "Derivatives" ? (
            DERIV_FILTERS.map((df) => (
              <button
                key={df}
                onClick={() => { setActiveDerivFilter(df); setCurrentPage(1) }}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap",
                  activeDerivFilter === df
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {df}
              </button>
            ))
          ) : (
            SECTOR_KEYS.map((s) => (
              <button
                key={s}
                onClick={() => handleSector(s)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors",
                  activeSector === s
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {s}
              </button>
            ))
          )}
        </div>

        {/* Main table */}
        <div className="rounded-xl border border-border/40 overflow-hidden bg-card/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-card/40">
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground w-8"></th>
                  <SortHeader label="Trading Pairs" sKey="symbol" align="left" />
                  <SortHeader label="Last Traded Price" sKey="price" />
                  <SortHeader label="24H Change %" sKey="change24h" />
                  <SortHeader label="24H High" sKey="high24h" />
                  <SortHeader label="24H Low" sKey="low24h" />
                  <SortHeader label="24H Volume" sKey="volume24h" />
                  <th className="hidden lg:table-cell px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">24h Chart</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {pagedCoins.length > 0 ? pagedCoins.map((coin) => {
                    const pos = coin.change24h >= 0
                    const isFav = favorites.has(coin.symbol)
                    return (
                      <motion.tr
                        key={coin.symbol}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="border-b border-border/20 last:border-0 hover:bg-card/50 transition-colors group"
                      >
                        {/* Fav star */}
                        <td className="px-4 py-3">
                          <button onClick={() => toggleFav(coin.symbol)} className="text-muted-foreground hover:text-primary transition-colors">
                            <Star className={cn("h-3.5 w-3.5", isFav && "fill-primary text-primary")} />
                          </button>
                        </td>
                        {/* Pair */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <CryptoIcon base={coin.baseAsset} />
                            <div>
                              <span className="text-sm font-semibold text-foreground">{coin.baseAsset}<span className="text-muted-foreground font-normal">/USDT</span></span>
                              <div className="text-[10px] text-muted-foreground">{coin.name}</div>
                            </div>
                          </div>
                        </td>
                        {/* Price */}
                        <td className="px-4 py-3 text-right"><PriceCell coin={coin} /></td>
                        {/* 24H change */}
                        <td className="px-4 py-3 text-right">
                          <span className={cn("inline-flex items-center gap-0.5 text-xs font-mono tabular-nums font-medium", pos ? "text-trading-green" : "text-trading-red")}>
                            {pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {pos ? "+" : ""}{coin.change24h.toFixed(2)}%
                          </span>
                        </td>
                        {/* High */}
                        <td className="px-4 py-3 text-right text-xs font-mono tabular-nums text-foreground/70">{formatPrice(coin.high24h)}</td>
                        {/* Low */}
                        <td className="px-4 py-3 text-right text-xs font-mono tabular-nums text-foreground/70">{formatPrice(coin.low24h)}</td>
                        {/* Volume */}
                        <td className="px-4 py-3 text-right text-xs font-mono tabular-nums text-muted-foreground">{formatVolume(coin.volume24h)} USDT</td>
                        {/* Chart */}
                        <td className="hidden lg:table-cell px-4 py-3">
                          <div className="flex justify-end"><MiniSparkline data={sparks[coin.symbol] ?? coin.sparkline} positive={(sparks[coin.symbol] ? sparks[coin.symbol][sparks[coin.symbol].length - 1] >= sparks[coin.symbol][0] : pos)} /></div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <button 
                              onClick={() => { setSelectedCoin(coin); setDetailsModalOpen(true) }}
                              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Details
                            </button>
                            <Link href={`/spot?pair=${coin.baseAsset}%2FUSDT`} className="text-[11px] font-medium text-card-foreground bg-primary hover:bg-primary/90 px-3 py-1 rounded-md transition-colors">Trade</Link>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  }) : (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No results found</td></tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer: pagination controls + data attribution */}
        <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: page info + per-page selector */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>
              Showing {((safePage - 1) * pageSize) + 1}–{Math.min(safePage * pageSize, filteredCoins.length)} of {filteredCoins.length} pairs
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              {([25, 50] as PageSize[]).map((ps) => (
                <button
                  key={ps}
                  onClick={() => handlePageSize(ps)}
                  className={cn(
                    "px-2 py-0.5 rounded border text-[11px] font-medium transition-colors",
                    pageSize === ps
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "border-border/40 hover:border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {ps}
                </button>
              ))}
            </div>
          </div>

          {/* Center: prev / page numbers / next */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-2.5 py-1 rounded border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            {/* Page number pills — show up to 7 */}
            {(() => {
              const pages: (number | "…")[] = []
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i)
              } else {
                pages.push(1)
                if (safePage > 3) pages.push("…")
                for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i)
                if (safePage < totalPages - 2) pages.push("…")
                pages.push(totalPages)
              }
              return pages.map((p, idx) =>
                p === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-1.5 text-[11px] text-muted-foreground">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={cn(
                      "min-w-[28px] px-2 py-1 rounded border text-[11px] font-medium transition-colors",
                      safePage === p
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/40 hover:border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p}
                  </button>
                )
              )
            })()}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-2.5 py-1 rounded border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>

          {/* Right: data source */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>Data from Bybit {isLive ? "WebSocket" : "REST API"}</span>
          </div>
        </div>
      </div>

      {/* Coin Details Modal */}
      <CoinDetailsModal 
        coin={selectedCoin}
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedCoin(null) }}
      />
    </div>
  )
}
