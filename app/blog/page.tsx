"use client"

import { GitCommit, Calendar } from "lucide-react"
import { PageShell } from "@/components/page-shell"

const entries = [
  { date: "Mar 2026", title: "Compliance & Deployment Framework", desc: "Added regulatory pathway documentation covering KYC provider integration, custody solutions, and jurisdictional frameworks." },
  { date: "Mar 2026", title: "Platform Status & System Monitoring", desc: "Built status page displaying operational state of all 8 core platform systems." },
  { date: "Mar 2026", title: "Acquisition & Architecture Pages", desc: "Added buyer-facing acquisition overview and 8-layer architecture breakdown with live links to each functional system." },
  { date: "Feb 2026", title: "Bybit Migration \u2014 500+ Live Pairs", desc: "Migrated entire data layer from Binance to Bybit. Dynamic fetch of all USDT perpetuals replacing hardcoded 40-pair list. REST polling every 15 seconds with WebSocket streaming for major pairs." },
  { date: "Feb 2026", title: "Order Book Rebuild", desc: "Rebuilt order book component from scratch for production-grade performance. Real-time bid/ask depth visualization with spread tracking and WebSocket state management." },
  { date: "Feb 2026", title: "Chart Performance Optimization", desc: "Optimized TradingView chart rendering to match or exceed production exchange update speeds. Candlestick streaming now faster than Bybit and Bitget native interfaces." },
  { date: "Feb 2026", title: "Sector Chip Filtering", desc: "Added scrollable sector filter row across Spot and Futures search panels. 12+ categories including Layer 1, DeFi, AI, Meme, Gaming. Combined with text search." },
  { date: "Jan 2026", title: "Pair Ticker Migration", desc: "Migrated ticker bar, mark price, index price, funding rate, and countdown systems from Binance to Bybit endpoints." },
  { date: "Jan 2026", title: "AI Analysis Engine \u2014 6 Contexts", desc: "Completed Groq integration across all 6 analytics tools. Each context receives live screen data and returns specific analysis referencing actual market figures." },
  { date: "Jan 2026", title: "Analytics Dashboard \u2014 Full Suite", desc: "Deployed all 6 analytics tools: Liquidation Zones, Open Interest, Long/Short Ratio, Funding Rate History, Taker Volume, Market Heatmap. All connected to live Bybit data." },
  { date: "Dec 2025", title: "Futures Terminal \u2014 Position Management", desc: "Added 8-tab position management panel: Positions, Copy Trades, Trading Bots, Open Orders, Order History, Position History, Transaction History, Assets." },
  { date: "Dec 2025", title: "Leverage & Margin System", desc: "Implemented leverage slider (1x\u2013150x), isolated/cross margin toggle, and full order panel with TP/SL configuration." },
  { date: "Dec 2025", title: "Spot Trading Terminal", desc: "Built spot terminal with limit/market orders, percentage-based position sizing, and shared charting engine." },
  { date: "Dec 2025", title: "Web3 Wallet Integration", desc: "Added wallet connection modal supporting MetaMask, WalletConnect, Coinbase Wallet, and Trust Wallet." },
  { date: "Nov 2025", title: "User Dashboard & Security", desc: "Built user dashboard with security overview, 2FA configuration, API key management, sub-account support, and session management." },
  { date: "Nov 2025", title: "KYC Verification Flow", desc: "Implemented identity verification UI with document upload, multi-level verification status, and compliance-ready architecture." },
  { date: "Nov 2025", title: "Authentication System", desc: "Built sign-up/login flows with email, Google OAuth, and Apple OAuth. Remember me, forgot password, and 256-bit SSL indicators." },
  { date: "Nov 2025", title: "Markets Page \u2014 Live Data", desc: "Deployed markets page with live pricing, Top Gainers/Losers/Trending sections, sortable table, category filters, and favorites system." },
  { date: "Oct 2025", title: "Indicator System \u2014 25+ Indicators", desc: "Completed indicator library: trend overlays (VWAP, SAR, Supertrend, Ichimoku, ADX, DMI), momentum oscillators (RSI, MACD, Stochastic, CCI, Williams %R), Bollinger Bands, EMA, SMA. Searchable dropdown with category badges and chart/pane placement logic." },
  { date: "Oct 2025", title: "Chart Settings & Customization", desc: "Added full chart settings panel: candle colors, background styles, grid configuration, crosshair settings, timezone selection, status line toggles." },
  { date: "Oct 2025", title: "Drawing Tools", desc: "Implemented drawing tool sidebar with trend lines, horizontal lines, and annotation instruments." },
  { date: "Sep 2025", title: "TradingView Chart Integration", desc: "Integrated TradingView Lightweight Charts with live WebSocket data binding. Historical REST backfill with live streaming overlay. Timeframe system: 1m, 5m, 15m, 30m, 1H, 4H, 1D, 1W." },
  { date: "Sep 2025", title: "WebSocket Data Pipeline", desc: "Established persistent WebSocket connection for real-time OHLCV candlestick streaming. Automatic reconnection, symbol switching, interval switching, and timestamp normalization." },
  { date: "Sep 2025", title: "Platform Architecture & Routing", desc: "Established Next.js 14 App Router structure with 19+ page routes, API route architecture, and Tailwind CSS design system." },
]

export default function BlogPage() {
  return (
    <PageShell
      icon={GitCommit}
      tag="Development Log"
      title="Build History"
      description="A chronological record of AetherNode's development from initial architecture to production deployment."
    >
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-8 w-px bg-border/60 md:left-[103px]" />

        <div className="flex flex-col gap-1">
          {entries.map((entry, i) => (
            <div key={i} className="group relative flex gap-4 md:gap-6">
              {/* Date column - hidden on mobile, shown on md+ */}
              <div className="hidden md:block w-[80px] shrink-0 pt-4 text-right">
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {entry.date}
                </span>
              </div>

              {/* Dot */}
              <div className="relative shrink-0 pt-[18px] md:pt-[18px]">
                <div className="h-[15px] w-[15px] rounded-full border-2 border-border bg-background group-hover:border-primary/60 transition-colors" />
              </div>

              {/* Content card */}
              <div className="flex-1 rounded-xl border border-border/40 bg-card/40 px-4 py-3.5 mb-1 group-hover:border-primary/15 group-hover:bg-card/60 transition-colors">
                {/* Mobile date */}
                <div className="flex items-center gap-1.5 mb-1 md:hidden">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{entry.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  {entry.title}
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {entry.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-12 text-center text-xs text-muted-foreground/60">
        AetherNode has been in active development since September 2025.
      </p>
    </PageShell>
  )
}
