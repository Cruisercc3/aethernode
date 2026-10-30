"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Settings,
  Monitor,
  Bell,
  Shield,
  Palette,
  TrendingUp,
  Volume2,
  Globe,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
  Zap,
  BarChart3,
  Wallet,
  Clock,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Currency = "USD" | "EUR" | "GBP" | "BTC" | "ETH"
type PnLDisplay = "percentage" | "absolute" | "both"
type ChartStyle = "candles" | "line" | "area" | "heikin-ashi"

export default function SettingsPage() {
  // Display preferences
  const [currency, setCurrency] = useState<Currency>("USD")
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [pnlDisplay, setPnlDisplay] = useState<PnLDisplay>("both")
  const [chartStyle, setChartStyle] = useState<ChartStyle>("candles")
  const [hideBalances, setHideBalances] = useState(false)
  const [compactMode, setCompactMode] = useState(false)

  // Trading preferences
  const [confirmTrades, setConfirmTrades] = useState(true)
  const [defaultLeverage, setDefaultLeverage] = useState(10)
  const [oneClickTrading, setOneClickTrading] = useState(false)
  const [autoTPSL, setAutoTPSL] = useState(true)

  // Notifications
  const [priceAlerts, setPriceAlerts] = useState(true)
  const [orderFills, setOrderFills] = useState(true)
  const [liquidationWarnings, setLiquidationWarnings] = useState(true)
  const [tradeSounds, setTradeSounds] = useState(true)
  const [marketNews, setMarketNews] = useState(false)

  // Privacy & Security
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const [ipWhitelist, setIpWhitelist] = useState(false)
  const [withdrawalLock, setWithdrawalLock] = useState(false)

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: "USD", label: "US Dollar", symbol: "$" },
    { value: "EUR", label: "Euro", symbol: "€" },
    { value: "GBP", label: "British Pound", symbol: "£" },
    { value: "BTC", label: "Bitcoin", symbol: "₿" },
    { value: "ETH", label: "Ethereum", symbol: "Ξ" },
  ]

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors duration-150",
        enabled ? "bg-primary" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform duration-150",
          enabled && "translate-x-5"
        )}
      />
    </button>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Dashboard
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-primary/50 bg-primary/10">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground font-mono uppercase">Settings</h1>
          <p className="text-xs text-muted-foreground font-mono">Trading preferences, display options, and notifications</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Display Preferences */}
        <section className="border-2 border-border/50 bg-card">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-secondary/30">
            <Monitor className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">Display</h2>
          </div>

          <div className="divide-y divide-border/30">
            {/* Currency */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Quote Currency</p>
                  <p className="text-[11px] text-muted-foreground">Display values in your preferred currency</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-border bg-background text-sm font-mono hover:border-primary/50 transition-colors min-w-[120px]"
                >
                  <span>{currencies.find(c => c.value === currency)?.symbol}</span>
                  <span className="flex-1 text-left">{currency}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", currencyOpen && "rotate-180")} />
                </button>
                {currencyOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-40 border-2 border-border bg-card shadow-lg">
                    {currencies.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => { setCurrency(c.value); setCurrencyOpen(false) }}
                        className="flex items-center justify-between w-full px-3 py-2 text-sm hover:bg-secondary/50 transition-colors"
                      >
                        <span className="font-mono">{c.symbol} {c.value}</span>
                        {currency === c.value && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PnL Display */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">PnL Display</p>
                  <p className="text-[11px] text-muted-foreground">How to show profit/loss values</p>
                </div>
              </div>
              <div className="flex gap-1">
                {(["percentage", "absolute", "both"] as PnLDisplay[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPnlDisplay(mode)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-mono uppercase tracking-wider border transition-colors",
                      pnlDisplay === mode
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mode === "percentage" ? "%" : mode === "absolute" ? "$" : "%/$"}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Style */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Default Chart Style</p>
                  <p className="text-[11px] text-muted-foreground">Preferred chart visualization</p>
                </div>
              </div>
              <div className="flex gap-1">
                {(["candles", "line", "area", "heikin-ashi"] as ChartStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => setChartStyle(style)}
                    className={cn(
                      "px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider border transition-colors",
                      chartStyle === style
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Hide Balances */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                {hideBalances ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                <div>
                  <p className="text-sm font-medium text-foreground">Hide Balances</p>
                  <p className="text-[11px] text-muted-foreground">Mask portfolio values with asterisks</p>
                </div>
              </div>
              <Toggle enabled={hideBalances} onChange={() => setHideBalances(!hideBalances)} />
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Compact Mode</p>
                  <p className="text-[11px] text-muted-foreground">Reduce spacing for more data density</p>
                </div>
              </div>
              <Toggle enabled={compactMode} onChange={() => setCompactMode(!compactMode)} />
            </div>
          </div>
        </section>

        {/* Trading Preferences */}
        <section className="border-2 border-border/50 bg-card">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-secondary/30">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">Trading</h2>
          </div>

          <div className="divide-y divide-border/30">
            {/* Confirm Trades */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Confirm Orders</p>
                  <p className="text-[11px] text-muted-foreground">Show confirmation dialog before placing orders</p>
                </div>
              </div>
              <Toggle enabled={confirmTrades} onChange={() => setConfirmTrades(!confirmTrades)} />
            </div>

            {/* Default Leverage */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Default Leverage</p>
                  <p className="text-[11px] text-muted-foreground">Initial leverage for new positions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[1, 5, 10, 25, 50].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setDefaultLeverage(lev)}
                    className={cn(
                      "w-10 py-1.5 text-xs font-mono border transition-colors",
                      defaultLeverage === lev
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* One-Click Trading */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Zap className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">One-Click Trading</p>
                  <p className="text-[11px] text-muted-foreground">Execute orders instantly without confirmation</p>
                </div>
              </div>
              <Toggle enabled={oneClickTrading} onChange={() => setOneClickTrading(!oneClickTrading)} />
            </div>

            {/* Auto TP/SL */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Auto TP/SL</p>
                  <p className="text-[11px] text-muted-foreground">Automatically add take profit and stop loss</p>
                </div>
              </div>
              <Toggle enabled={autoTPSL} onChange={() => setAutoTPSL(!autoTPSL)} />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="border-2 border-border/50 bg-card">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-secondary/30">
            <Bell className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">Notifications</h2>
          </div>

          <div className="divide-y divide-border/30">
            {[
              { id: "price", label: "Price Alerts", desc: "Get notified when prices hit your targets", icon: TrendingUp, enabled: priceAlerts, toggle: () => setPriceAlerts(!priceAlerts) },
              { id: "orders", label: "Order Fills", desc: "Alerts when orders are executed", icon: Check, enabled: orderFills, toggle: () => setOrderFills(!orderFills) },
              { id: "liq", label: "Liquidation Warnings", desc: "Warnings when positions approach liquidation", icon: Shield, enabled: liquidationWarnings, toggle: () => setLiquidationWarnings(!liquidationWarnings) },
              { id: "sounds", label: "Trade Sounds", desc: "Audio feedback for trades and alerts", icon: Volume2, enabled: tradeSounds, toggle: () => setTradeSounds(!tradeSounds) },
              { id: "news", label: "Market News", desc: "Breaking news and market updates", icon: Globe, enabled: marketNews, toggle: () => setMarketNews(!marketNews) },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Toggle enabled={item.enabled} onChange={item.toggle} />
              </div>
            ))}
          </div>
        </section>

        {/* Security */}
        <section className="border-2 border-border/50 bg-card">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-secondary/30">
            <Shield className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-foreground">Security</h2>
          </div>

          <div className="divide-y divide-border/30">
            {/* Session Timeout */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Session Timeout</p>
                  <p className="text-[11px] text-muted-foreground">Auto-logout after inactivity</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[15, 30, 60, 120].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => setSessionTimeout(mins)}
                    className={cn(
                      "px-2.5 py-1.5 text-[10px] font-mono border transition-colors",
                      sessionTimeout === mins
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* IP Whitelist */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">IP Whitelist</p>
                  <p className="text-[11px] text-muted-foreground">Restrict access to specific IP addresses</p>
                </div>
              </div>
              <Toggle enabled={ipWhitelist} onChange={() => setIpWhitelist(!ipWhitelist)} />
            </div>

            {/* Withdrawal Lock */}
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">24h Withdrawal Lock</p>
                  <p className="text-[11px] text-muted-foreground">Require extra verification for withdrawals</p>
                </div>
              </div>
              <Toggle enabled={withdrawalLock} onChange={() => setWithdrawalLock(!withdrawalLock)} />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
