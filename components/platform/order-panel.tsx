"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Info, ChevronDown, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

/* ─── Leverage Popup ─────────────────────────── */
function LeveragePopup({
  leverage,
  onChange,
  onClose,
}: {
  leverage: number
  onChange: (v: number) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [local, setLocal] = useState(leverage)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  const presets = [1, 5, 10, 25, 50, 75, 100, 125, 150]

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border/40 bg-card shadow-2xl backdrop-blur-xl p-3 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground">Adjust Leverage</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-center mb-3">
        <span className="text-2xl font-bold text-primary tabular-nums font-mono">{local}x</span>
      </div>

      <Slider
        value={[local]}
        onValueChange={([v]) => setLocal(v)}
        min={1}
        max={150}
        step={1}
        className="mb-3"
      />

      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
        <span>1x</span>
        <span>150x</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setLocal(p)}
            className={cn(
              "rounded px-2 py-1 text-[10px] font-medium transition-colors",
              local === p
                ? "bg-primary/20 text-primary"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {p}x
          </button>
        ))}
      </div>

      <Button
        size="sm"
        className="w-full h-8 text-xs"
        onClick={() => {
          onChange(local)
          onClose()
        }}
      >
        Confirm
      </Button>
    </div>
  )
}

/* ─── Time-in-Force Dropdown ─────────────────── */
function TimeInForceDropdown({
  value,
  onChange,
  onClose,
}: {
  value: string
  onChange: (v: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  const options = [
    { value: "GTC", label: "Good Till Cancel", desc: "Order stays active until filled or cancelled" },
    { value: "IOC", label: "Immediate or Cancel", desc: "Fill immediately or cancel unfilled portion" },
    { value: "FOK", label: "Fill or Kill", desc: "Fill entire order immediately or cancel completely" },
    { value: "GTD", label: "Good Till Date", desc: "Order stays active until a specified date" },
  ]

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-border/40 bg-card shadow-2xl backdrop-blur-xl p-1 animate-in fade-in-0 zoom-in-95 duration-150"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => {
            onChange(opt.value)
            onClose()
          }}
          className={cn(
            "flex w-full flex-col rounded-md px-2.5 py-2 text-left transition-colors",
            value === opt.value
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-secondary/60"
          )}
        >
          <span className="text-xs font-medium">{opt.label} ({opt.value})</span>
          <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
        </button>
      ))}
    </div>
  )
}

/* ─── Generic Action Modal ───────────────────── */
function ActionModal({
  title,
  description,
  children,
  onClose,
}: {
  title: string
  description: string
  children?: React.ReactNode
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border/40 bg-card shadow-2xl p-5 animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
        {children}
        <Button className="w-full mt-4 h-9 text-xs" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}

/* ─── Main Order Panel ───────────────────────── */
interface OrderPanelProps {
  selectedPrice?: number | null
}

export function OrderPanel({ selectedPrice }: OrderPanelProps) {
  const [leverage, setLeverage] = useState(150)
  const [marginMode, setMarginMode] = useState<"cross" | "isolated">("isolated")
  const [positionSize, setPositionSize] = useState(0)
  // Starts empty. Click a price in the order book to fill it.
  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")
  const [orderType, setOrderType] = useState<"limit" | "market">("limit")
  const [tpslEnabled, setTpslEnabled] = useState(false)
  const [timeInForce, setTimeInForce] = useState("GTC")

  // Popup states
  const [showLeverage, setShowLeverage] = useState(false)
  const [showTif, setShowTif] = useState(false)
  const [showPostOnly, setShowPostOnly] = useState(false)
  const [activeModal, setActiveModal] = useState<"deposit" | "transfer" | "buy" | null>(null)
  const [mainTab, setMainTab] = useState<"trade" | "bots">("trade")
  const [tradeTab, setTradeTab] = useState<"open" | "close">("open")
  const [postOnlyEnabled, setPostOnlyEnabled] = useState(false)
  const [demoNote, setDemoNote] = useState(false)
  useEffect(() => {
    if (!demoNote) return
    const t = setTimeout(() => setDemoNote(false), 4000)
    return () => clearTimeout(t)
  }, [demoNote])

  const availableBalance = 250_000.00

  // Derived price as number
  const priceNum = parseFloat(price.replace(/,/g, "")) || 0

  // Price tick size based on magnitude
  const priceTick = priceNum > 10000 ? 0.5 : priceNum > 1000 ? 0.1 : priceNum > 10 ? 0.01 : 0.0001
  const priceDp   = priceNum > 10000 ? 1   : priceNum > 1000 ? 1   : priceNum > 10 ? 2   : 4

  // Max position in base asset = (balance * leverage) / price
  // e.g. at 100x with $250k balance and BTC at $100k: 250000 * 100 / 100000 = 250 BTC
  const maxBtc = priceNum > 0 ? (availableBalance * leverage) / priceNum : 0

  // Derived cost: amount × price
  const amountNum = parseFloat(amount) || 0
  const cost = amountNum * priceNum

  // Sync price from order book click
  useEffect(() => {
    if (selectedPrice == null) return
    const dp = selectedPrice > 10000 ? 1 : selectedPrice > 1000 ? 1 : selectedPrice > 10 ? 2 : 4
    setPrice(selectedPrice.toFixed(dp))
    setOrderType("limit")
  }, [selectedPrice])

  // Slider → quantity: positionSize% of max
  const handleSliderChange = useCallback((pct: number) => {
    setPositionSize(pct)
    if (maxBtc <= 0) return
    const qty = (pct / 100) * maxBtc
    setAmount(qty > 0 ? qty.toFixed(6) : "")
  }, [maxBtc])

  // Quantity → slider: back-calculate percentage
  const handleAmountChange = useCallback((val: string) => {
    setAmount(val)
    const qty = parseFloat(val) || 0
    if (maxBtc > 0 && qty > 0) {
      const pct = Math.min(100, Math.round((qty / maxBtc) * 100))
      setPositionSize(pct)
    } else {
      setPositionSize(0)
    }
  }, [maxBtc])

  return (
    <div className="flex h-full flex-col bg-card border border-border/30 overflow-hidden">
      {/* Top Bar with Tabs and Voucher */}
      <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
        <div className="flex gap-3">
          <button
            onClick={() => setMainTab("trade")}
            className={cn(
              "text-xs pb-0.5 transition-colors",
              mainTab === "trade"
                ? "font-semibold text-foreground border-b border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Trade
          </button>
          <button
            onClick={() => setMainTab("bots")}
            className={cn(
              "text-xs pb-0.5 transition-colors",
              mainTab === "bots"
                ? "font-semibold text-foreground border-b border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Bots
          </button>
        </div>
        <Button variant="secondary" size="sm" className="h-6 text-[11px] px-2">
          Get 1 position voucher(s)
        </Button>
      </div>

      {/* Margin Mode & Leverage Display */}
      <div className="relative flex items-center gap-1.5 border-b border-border/30 px-3 py-1">
        <button
          onClick={() => setMarginMode(marginMode === "isolated" ? "cross" : "isolated")}
          className={cn(
            "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
            marginMode === "isolated"
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {marginMode}
        </button>
        <button
          onClick={() => setShowLeverage(!showLeverage)}
          className="rounded bg-trading-green/20 px-2.5 py-1 text-xs font-bold text-trading-green hover:bg-trading-green/30 transition-colors cursor-pointer"
        >
          {leverage}x
        </button>
        {showLeverage && (
          <LeveragePopup
            leverage={leverage}
            onChange={setLeverage}
            onClose={() => setShowLeverage(false)}
          />
        )}
      </div>

      {/* Open/Close Tabs */}
      {mainTab === "trade" && (
        <div className="flex border-b border-border/30">
          <button
            onClick={() => setTradeTab("open")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium transition-all",
              tradeTab === "open"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Open
          </button>
          <button
            onClick={() => setTradeTab("close")}
            className={cn(
              "flex-1 py-1.5 text-xs font-medium transition-all",
              tradeTab === "close"
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Close
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {/* Bots Tab Content */}
        {mainTab === "bots" && (
          <div className="space-y-3">
            <div className="text-center py-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">Trading Bots</h3>
              <p className="text-[11px] text-muted-foreground">Automate your trading strategies</p>
            </div>
            
            {/* Grid Bot */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Grid Bot</span>
                <span className="text-[9px] bg-trading-green/10 text-trading-green px-1.5 py-0.5 rounded">Popular</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Buy low and sell high 24/7 automatically within a price range</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Est. APY</span>
                <span className="text-trading-green font-mono">15-45%</span>
              </div>
            </div>

            {/* DCA Bot */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">DCA Bot</span>
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Beginner</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Dollar-cost average into positions over time</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Risk level</span>
                <span className="text-foreground">Low</span>
              </div>
            </div>

            {/* Smart Rebalance */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Smart Rebalance</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Automatically rebalance your portfolio allocation</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Strategy</span>
                <span className="text-foreground">Portfolio</span>
              </div>
            </div>

            {/* Martingale Bot */}
            <div className="rounded-lg border border-border/40 bg-secondary/20 p-3 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Martingale Bot</span>
                <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">Advanced</span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">Increase position size on drawdowns to average entry</p>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Risk level</span>
                <span className="text-amber-500">High</span>
              </div>
            </div>

            <Button className="w-full h-9 text-xs" variant="secondary">
              Create Custom Bot
            </Button>
          </div>
        )}

        {/* Trade Tab Content */}
        {mainTab === "trade" && (
          <>
        {/* Order Type Selection */}
        <div className="mb-2.5 flex items-center gap-1.5">
          <button
            onClick={() => setOrderType("limit")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              orderType === "limit"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Limit
          </button>
          <button
            onClick={() => setOrderType("market")}
            className={cn(
              "rounded px-2.5 py-1 text-xs font-medium transition-colors",
              orderType === "market"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Market
          </button>
          <div className="relative ml-auto flex items-center gap-1">
            <button
              onClick={() => setPostOnlyEnabled(!postOnlyEnabled)}
              className={cn(
                "text-[11px] flex items-center gap-1 transition-colors",
                postOnlyEnabled ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Post only
              <span className={cn("h-3 w-3 rounded border flex items-center justify-center", postOnlyEnabled ? "bg-primary border-primary" : "border-border")}>
                {postOnlyEnabled && <X className="h-2 w-2 text-primary-foreground" />}
              </span>
            </button>
            <div className="relative group">
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-50 w-48 p-2 bg-card border border-border rounded text-[10px] text-muted-foreground shadow-lg">
                Post-only orders are added to the order book and will not execute immediately. If the order would execute as a taker, it will be cancelled.
              </div>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="mb-2.5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Available</span>
          <span className="font-mono tabular-nums text-foreground">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
        </div>

        {/* Price Input */}
        <div className="mb-2.5">
          <label className="mb-1 block text-[11px] text-muted-foreground">Price</label>
          <div className="flex items-center rounded-md border border-border/50 bg-secondary/30 overflow-hidden">
            <button
              className="px-2.5 py-2 text-muted-foreground hover:text-foreground text-xs hover:bg-secondary/50 transition-colors"
              onClick={() => {
                const val = parseFloat(price.replace(/,/g, ""))
                setPrice((val - priceTick).toFixed(priceDp))
              }}
            >
              -
            </button>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent px-2 py-2 text-center text-xs font-mono text-foreground outline-none tabular-nums"
            />
            <button
              className="px-2.5 py-2 text-muted-foreground hover:text-foreground text-xs hover:bg-secondary/50 transition-colors"
              onClick={() => {
                const val = parseFloat(price.replace(/,/g, ""))
                setPrice((val + priceTick).toFixed(priceDp))
              }}
            >
              +
            </button>
            <Button variant="secondary" size="sm" className="h-8 text-[11px] px-2.5 m-1 rounded">
              BBO
            </Button>
          </div>
        </div>

        {/* Quantity Input */}
        <div className="mb-2.5">
          <label className="mb-1 block text-[11px] text-muted-foreground">Quantity</label>
          <div className="flex items-center rounded-md border border-border/50 bg-secondary/30 overflow-hidden">
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00000"
              className="flex-1 bg-transparent px-2.5 py-2 text-xs font-mono text-foreground outline-none tabular-nums placeholder:text-muted-foreground/50"
            />
            <button className="pr-2.5 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
              BTC <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Quantity Slider with % labels */}
        <div className="mb-2.5">
          <Slider
            value={[positionSize]}
            onValueChange={([v]) => handleSliderChange(v)}
            min={0}
            max={100}
            step={1}
            className="mb-1.5"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Cost — live computed */}
        <div className="mb-2.5 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Cost</span>
          <span className="font-mono tabular-nums">
            <span className="text-trading-green">{cost > 0 ? cost.toFixed(2) : "0.00"}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-trading-red">{cost > 0 ? cost.toFixed(2) : "0.00"}</span>
            <span className="text-foreground ml-1">USDT</span>
          </span>
        </div>

        {/* TP/SL Checkbox */}
        <div className="mb-2.5 flex items-center gap-2">
          <Checkbox
            id="tpsl"
            checked={tpslEnabled}
            onCheckedChange={(checked) => setTpslEnabled(checked === true)}
            className="h-3.5 w-3.5"
          />
          <label htmlFor="tpsl" className="text-[11px] text-muted-foreground cursor-pointer">
            TP/SL
          </label>
        </div>

        {/* Time in Force */}
        <div className="relative mb-3 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Time in force</span>
          <button
            onClick={() => setShowTif(!showTif)}
            className="text-[11px] text-foreground hover:text-foreground/80 flex items-center gap-1"
          >
            {timeInForce} <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showTif && (
            <TimeInForceDropdown
              value={timeInForce}
              onChange={setTimeInForce}
              onClose={() => setShowTif(false)}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-3 flex gap-1.5">
          <Button
            onClick={() => setDemoNote(true)}
            className="flex-1 font-semibold text-xs h-10 bg-trading-green text-background hover:bg-trading-green/90 transition-all"
          >
            Open long
          </Button>
          <Button
            onClick={() => setDemoNote(true)}
            className="flex-1 font-semibold text-xs h-10 bg-trading-red text-foreground hover:bg-trading-red/90 transition-all"
          >
            Open short
          </Button>
        </div>
        {demoNote && (
          <p className="-mt-1.5 mb-3 rounded-md border border-border/40 bg-secondary/30 px-2.5 py-1.5 text-[10px] text-muted-foreground">
            Demo terminal. No order was sent, and there's no exchange behind this panel.
          </p>
        )}

        {/* Max Position */}
        <div className="mb-3 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">Max (Long)</span>
          <span className="font-mono tabular-nums text-foreground">{maxBtc > 0 ? maxBtc.toFixed(4) : "0.0000"} BTC</span>
        </div>

        {/* Calculator & Fee Rate */}
        <div className="mb-3 flex items-center gap-2.5 text-[11px]">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            VIP 0 fee rate
          </button>
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            Calculator
          </button>
        </div>

        {/* Account Section */}
        <div className="mb-4 rounded border border-border/30 bg-secondary/20 p-3">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-foreground">Account</h3>
            <span className="text-xs text-primary">PnL</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Maintenance margin rate (MMR)</span>
              <span className="font-mono tabular-nums text-foreground">0.00%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Maintenance margin</span>
              <span className="font-mono tabular-nums text-foreground">0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Position tier guide</span>
              <span className="text-primary">More</span>
            </div>
          </div>

          <Button variant="secondary" className="w-full mt-3 h-8 text-[11px]">
            Single-asset mode
          </Button>
        </div>

        {/* Assets USDT Section */}
        <div className="mb-4 rounded border border-border/30 bg-secondary/20 p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2.5">Assets USDT</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">USDT balance</span>
              <span className="font-mono tabular-nums text-foreground">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Wallet balance</span>
              <span className="font-mono tabular-nums text-foreground">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Available</span>
              <span className="font-mono tabular-nums text-foreground">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total unrealized PnL</span>
              <span className="font-mono tabular-nums text-foreground">0.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">ROI</span>
              <span className="font-mono tabular-nums text-foreground">0.00%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Trading bonuses</span>
              <span className="font-mono tabular-nums text-foreground">0.00</span>
            </div>
          </div>

          <div className="mt-3 flex gap-1">
            <Button
              variant="secondary"
              className="flex-1 h-8 text-[11px]"
              onClick={() => setActiveModal("buy")}
            >
              Buy crypto
            </Button>
            <Button
              variant="secondary"
              className="flex-1 h-8 text-[11px]"
              onClick={() => setActiveModal("deposit")}
            >
              Deposit
            </Button>
            <Button
              variant="secondary"
              className="flex-1 h-8 text-[11px]"
              onClick={() => setActiveModal("transfer")}
            >
              Transfer
            </Button>
          </div>
        </div>

        {/* Futures Details Section */}
        <div className="rounded border border-border/30 bg-secondary/20 p-3 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2.5">Futures details</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Maturity date</span>
              <span className="font-mono tabular-nums text-foreground">Perpetual</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Maximum leverage</span>
              <span className="font-mono tabular-nums text-foreground">150 x</span>
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {activeModal === "deposit" && (
        <ActionModal
          title="Deposit"
          description="Fund your futures account by depositing USDT from your wallet or an external address."
          onClose={() => setActiveModal(null)}
        >
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Network</span>
              <span className="text-foreground font-medium">TRC20 (Tron)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Min deposit</span>
              <span className="text-foreground font-mono">1.00 USDT</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Est. arrival</span>
              <span className="text-foreground">~1 min</span>
            </div>
          </div>
        </ActionModal>
      )}

      {activeModal === "transfer" && (
        <ActionModal
          title="Transfer"
          description="Move funds between your spot wallet and futures account instantly with zero fees."
          onClose={() => setActiveModal(null)}
        >
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">From</span>
              <span className="text-foreground font-medium">Spot Wallet</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">To</span>
              <span className="text-foreground font-medium">USDT-M Futures</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Available</span>
              <span className="text-foreground font-mono">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
            </div>
          </div>
        </ActionModal>
      )}

      {activeModal === "buy" && (
        <ActionModal
          title="Buy Crypto"
          description="Purchase USDT using a credit/debit card or bank transfer through our supported payment providers."
          onClose={() => setActiveModal(null)}
        >
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Payment methods</span>
              <span className="text-foreground font-medium">Visa, Mastercard, Bank</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Supported</span>
              <span className="text-foreground">USDT, BTC, ETH, USDC</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Fee</span>
              <span className="text-foreground font-mono">1.5%</span>
            </div>
          </div>
        </ActionModal>
      )}
    </div>
  )
}
