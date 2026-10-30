"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight, Layers, Radio, LineChart, Brain, Terminal, BarChart3,
  Globe2, Users, Building2
} from "lucide-react"

const layers = [
  {
    number: "01",
    name: "Live Market Data Intelligence",
    icon: Radio,
    description:
      "Real-time market data infrastructure powered by Bybit. REST polling of 500+ USDT perpetual pairs every 15 seconds combined with WebSocket streaming for instant price updates on major pairs. Candle history comes through one server route that tries Binance, Bybit and OKX in turn. Bybit analytics endpoints cover open interest, funding rates, long/short ratios and volume, and a second server route pulls real liquidation orders from OKX. Custom data hooks handle refresh cycles, error states and transformation.",
    metrics: [
      { label: "Trading Pairs", value: "500+" },
      { label: "WebSocket", value: "Real-time" },
      { label: "REST Poll", value: "15s" },
      { label: "Analytics Endpoints", value: "5" },
    ],
    link: { label: "Markets Page", href: "/markets" },
  },
  {
    number: "02",
    name: "Advanced Charting & Technical Analysis Engine",
    icon: LineChart,
    description:
      "TradingView Lightweight Charts with live Bybit data binding. 25+ indicators organized by type with correct chart overlay and pane placement. Full visual customization — candle colors, backgrounds, grids, crosshairs, timezone selection. Searchable indicator dropdown with category badges. Drawing tools sidebar. Timeframes from 1 minute to 1 week. Chart rendering performance optimized to match or exceed production exchanges including Bybit and Bitget.",
    metrics: [
      { label: "Indicators", value: "25+" },
      { label: "Categories", value: "4" },
      { label: "Timeframes", value: "8" },
      { label: "Settings", value: "15+" },
    ],
    link: { label: "Futures Terminal", href: "/platform" },
  },
  {
    number: "03",
    name: "AI-Powered Market Interpretation Engine",
    icon: Brain,
    description:
      "One Groq call per card across 6 contexts. The model gets the exact live data on that card plus the time window each block really covers, and has to quote real figures from it: prices, ratios, rates. Liquidations, open interest, long/short positioning, funding, volume leaders and the heatmap.",
    metrics: [
      { label: "AI Model", value: "gpt-oss-120b" },
      { label: "Contexts", value: "6" },
      { label: "Host", value: "Groq" },
      { label: "Data", value: "Live" },
    ],
    link: { label: "AI Analytics", href: "/analytics" },
  },
  {
    number: "04",
    name: "Dual Trading Terminal Operations",
    icon: Terminal,
    description:
      "Two trading interfaces sharing the charting engine. The futures order panel has leverage up to 150x, isolated and cross margin, long and short, take profit and stop loss, and 8 position tabs. The spot panel has limit and market orders with percentage sizing. Order entry is front end only and places no orders. The order book is live, with real-time bid/ask depth and spread tracking.",
    metrics: [
      { label: "Terminals", value: "2" },
      { label: "Max Leverage", value: "150x" },
      { label: "Order Types", value: "2" },
      { label: "Position Tabs", value: "8" },
    ],
    link: { label: "Spot Terminal", href: "/spot", secondLabel: "Futures Terminal", secondHref: "/platform" },
  },
  {
    number: "05",
    name: "Analytics & Market Intelligence Dashboard",
    icon: BarChart3,
    description:
      "Six analytical tools: Recent Liquidations, Open Interest Tracker, Long/Short Ratio, Funding Rate History, Volume Leaders and Market Heatmap. Each fetches live exchange data, draws an interactive chart and has its own AI read-out.",
    metrics: [
      { label: "Tools", value: "6" },
      { label: "Data Source", value: "Bybit + OKX" },
      { label: "AI Insight", value: "Per tool" },
      { label: "Updates", value: "60s" },
    ],
    link: { label: "Analytics Dashboard", href: "/analytics" },
  },
  {
    number: "06",
    name: "Real-Time Markets & Asset Discovery",
    icon: Globe2,
    description:
      "Live market data across 500+ USDT perpetual pairs streamed from Bybit with REST polling every 15 seconds and WebSocket price flashes on major pairs. Top Gainers, Top Losers, and Trending sections. Sortable data table with 24h metrics. Scrollable sector chip filtering across 12+ categories including Layer 1, Layer 2, DeFi, AI, Meme, Gaming, Storage, and Modular. Combined text search and sector filtering. Favorites and trade buttons.",
    metrics: [
      { label: "Pairs", value: "500+" },
      { label: "Sectors", value: "12+" },
      { label: "Poll", value: "15s" },
      { label: "Sections", value: "3" },
    ],
    link: { label: "Markets Page", href: "/markets" },
  },
  {
    number: "07",
    name: "User System, Authentication & Wallet Architecture",
    icon: Users,
    description:
      "Complete authentication UI with email, password, Google OAuth, and Apple OAuth. User dashboard with security overview, 2FA, KYC verification flow, API key management, and sub-accounts. Web3 wallet connection modal supporting MetaMask, WalletConnect, Coinbase Wallet, and Trust Wallet.",
    metrics: [
      { label: "Auth Methods", value: "3" },
      { label: "Wallet Providers", value: "4" },
      { label: "Dashboard Sections", value: "6" },
      { label: "Security", value: "2FA, KYC" },
    ],
    link: { label: "Dashboard", href: "/dashboard" },
  },
  {
    number: "08",
    name: "Platform Infrastructure & Enterprise Completeness",
    icon: Building2,
    description:
      "Every link on the platform leads to a functional page. API documentation with REST and WebSocket endpoint specifications. Careers page with role listings. Full legal suite covering Terms, Privacy, Cookies, and Compliance. Help Center, Status, Contact, Blog, and Press pages.",
    metrics: [
      { label: "Pages", value: "19+" },
      { label: "API Docs", value: "REST + WS" },
      { label: "Legal Pages", value: "4" },
      { label: "Support", value: "4" },
    ],
    link: { label: "API Docs", href: "/api-docs", secondLabel: "Careers", secondHref: "/careers", thirdLabel: "Legal", thirdHref: "/terms" },
  },
]

const summaryMetrics = [
  { label: "Architecture Layers", value: "8" },
  { label: "Technical Indicators", value: "25+" },
  { label: "API Integrations", value: "8" },
  { label: "AI Analysis Contexts", value: "6" },
  { label: "Page Routes", value: "19+" },
  { label: "Trading Pairs", value: "500+" },
  { label: "Sector Filters", value: "12+" },
  { label: "UI Components", value: "100-120+" },
  { label: "Infrastructure", value: "~$1/mo" },
]

export default function ArchitecturePage() {
  return (
    <div className="relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              System Architecture
            </span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            8-Layer Integrated<br />
            <span className="text-primary">Trading Platform</span>
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            AetherNode is structured across 8 functional layers, each representing a distinct
            operational domain. Unlike conceptual architectures, every layer described below is
            deployed and operational with live data connections and functional interfaces.
          </p>
          <div className="mt-8 h-px w-20 bg-primary/40" />
        </motion.div>

        {/* Layer Cards */}
        <div className="flex flex-col gap-6">
          {layers.map((layer, index) => (
            <motion.div
              key={layer.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * index }}
              className="group relative rounded-2xl border border-border/50 bg-card/60 p-6 md:p-8 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
            >
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.04),transparent_60%)] pointer-events-none" />

              <div className="relative flex flex-col gap-5 md:flex-row md:gap-8">
                {/* Layer number */}
                <div className="shrink-0">
                  <span className="text-5xl md:text-6xl font-bold font-mono text-muted-foreground/20 leading-none select-none">
                    {layer.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <layer.icon className="h-5 w-5 text-primary shrink-0" />
                    <h2 className="text-lg font-semibold text-foreground md:text-xl">
                      {layer.name}
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                    {layer.description}
                  </p>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-5">
                    {layer.metrics.map((metric) => (
                      <div key={metric.label} className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground/70">{metric.label}:</span>
                        <span className="font-mono font-semibold text-foreground">{metric.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={layer.link.href}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {layer.link.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    {"secondLabel" in layer.link && layer.link.secondLabel && (
                      <Link
                        href={layer.link.secondHref!}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {layer.link.secondLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {"thirdLabel" in layer.link && layer.link.thirdLabel && (
                      <Link
                        href={layer.link.thirdHref!}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        {layer.link.thirdLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 rounded-2xl border border-primary/20 bg-card/80 p-8 md:p-10"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Full Platform Metrics</h2>
          <div className="h-px w-12 bg-primary/40 mb-8" />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-border/40 bg-secondary/30 px-4 py-4 text-center transition-colors hover:border-primary/20"
              >
                <p className="text-2xl font-bold font-mono text-primary">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/acquisition"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
            >
              View Acquisition Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
