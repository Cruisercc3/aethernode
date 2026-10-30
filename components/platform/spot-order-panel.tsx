"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Info, ChevronDown, X, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

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

interface SpotOrderPanelProps {
  selectedPrice?: number | null
  /** e.g. "SOL/USDT", used for the button label */
  pair?: string
}

export function SpotOrderPanel({ selectedPrice, pair = "BTC/USDT" }: SpotOrderPanelProps) {
  const base = pair.split("/")[0] || "BTC"
  const [demoNote, setDemoNote] = useState(false)
  useEffect(() => {
    if (!demoNote) return
    const t = setTimeout(() => setDemoNote(false), 4000)
    return () => clearTimeout(t)
  }, [demoNote])
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [positionSize, setPositionSize] = useState(0)
  // Starts empty. Click a price in the order book to fill it.
  const [price, setPrice] = useState("")
  const [amount, setAmount] = useState("")
  const [orderType, setOrderType] = useState<"limit" | "market">("limit")
  const [tpslEnabled, setTpslEnabled] = useState(false)
  const [timeInForce, setTimeInForce] = useState("GTC")
  const [postOnlyEnabled, setPostOnlyEnabled] = useState(false)
  const [mainTab, setMainTab] = useState<"spot" | "bots">("spot")
  const [activeModal, setActiveModal] = useState<"deposit" | "transfer" | "buy" | null>(null)

  const availableBalance = 250_000.00

  // Derived price as number
  const priceNum = parseFloat(price.replace(/,/g, "")) || 0

  // Price tick size based on magnitude
  const priceTick = priceNum > 10000 ? 0.5 : priceNum > 1000 ? 0.1 : priceNum > 10 ? 0.01 : 0.0001
  const priceDp   = priceNum > 10000 ? 1   : priceNum > 1000 ? 1   : priceNum > 10 ? 2   : 4

  // For spot Buy: max BTC = availableBalance / price
  // For spot Sell: max BTC = available BTC balance (assume 0 for now)
  const maxBtc = side === "buy"
    ? (priceNum > 0 ? availableBalance / priceNum : 0)
    : 0.5 // mock BTC balance for sell side

  // Derived total: amount × price
  const amountNum = parseFloat(amount) || 0
  const total = amountNum * priceNum

  // Sync price from order book click
  useEffect(() => {
    if (selectedPrice == null) return
    const dp = selectedPrice > 10000 ? 1 : selectedPrice > 1000 ? 1 : selectedPrice > 10 ? 2 : 4
    setPrice(selectedPrice.toFixed(dp))
    setOrderType("limit")
  }, [selectedPrice])

  // Slider → amount
  const handleSliderChange = useCallback((pct: number) => {
    setPositionSize(pct)
    if (maxBtc <= 0) return
    const qty = (pct / 100) * maxBtc
    setAmount(qty > 0 ? qty.toFixed(6) : "")
  }, [maxBtc])

  // Amount → slider
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
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
        <div className="flex gap-3">
          <button
            onClick={() => setMainTab("spot")}
            className={cn(
              "text-xs pb-0.5 transition-colors",
              mainTab === "spot"
                ? "font-semibold text-foreground border-b border-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Spot Trade
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
      </div>

      {/* Buy/Sell Toggle */}
      <div className="flex border-b border-border/30">
        <button
          onClick={() => setSide("buy")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold transition-all",
            side === "buy"
              ? "text-trading-green border-b-2 border-trading-green bg-trading-green/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold transition-all",
            side === "sell"
              ? "text-trading-red border-b-2 border-trading-red bg-trading-red/5"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Sell
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
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
                {postOnlyEnabled && <Check className="h-2 w-2 text-primary-foreground" />}
              </span>
            </button>
            <div className="relative group">
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full right-0 mb-1 hidden group-hover:block z-50 w-48 p-2 bg-card border border-border rounded text-[10px] text-muted-foreground shadow-lg">
                Post-only orders are added to the order book and will not execute immediately.
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
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-2.5">
          <label className="mb-1 block text-[11px] text-muted-foreground">Amount</label>
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

        {/* Quantity Slider */}
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

        {/* Total — live computed */}
        <div className="mb-2.5">
          <label className="mb-1 block text-[11px] text-muted-foreground">Total</label>
          <div className="flex items-center rounded-md border border-border/50 bg-secondary/30 overflow-hidden">
            <input
              type="text"
              value={total > 0 ? total.toFixed(2) : ""}
              placeholder="0.00"
              readOnly
              className="flex-1 bg-transparent px-2.5 py-2 text-xs font-mono text-foreground outline-none tabular-nums placeholder:text-muted-foreground/50"
            />
            <span className="pr-2.5 text-[11px] text-muted-foreground">USDT</span>
          </div>
        </div>

        {/* TP/SL */}
        <div className="mb-2.5 flex items-center gap-2">
          <Checkbox
            id="tpsl-spot"
            checked={tpslEnabled}
            onCheckedChange={(checked) => setTpslEnabled(checked === true)}
            className="h-3.5 w-3.5"
          />
          <label htmlFor="tpsl-spot" className="text-[11px] text-muted-foreground cursor-pointer">
            TP/SL
          </label>
        </div>

        {/* Time in Force */}
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">Time in force</span>
          <button className="text-[11px] text-foreground hover:text-foreground/80 flex items-center gap-1">
            {timeInForce} <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setDemoNote(true)}
          className={cn(
            "w-full font-semibold text-xs h-10 transition-all mb-3",
            side === "buy"
              ? "bg-trading-green text-background hover:bg-trading-green/90"
              : "bg-trading-red text-foreground hover:bg-trading-red/90"
          )}
        >
          {side === "buy" ? `Buy ${base}` : `Sell ${base}`}
        </Button>
        {demoNote && (
          <p className="-mt-1.5 mb-3 rounded-md border border-border/40 bg-secondary/30 px-2.5 py-1.5 text-[10px] text-muted-foreground">
            Demo terminal. No order was sent, and there's no exchange behind this panel.
          </p>
        )}

        {/* Fee Info */}
        <div className="mb-3 flex items-center gap-2.5 text-[11px]">
          <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            VIP 0 fee rate
          </button>
        </div>

        {/* Assets Section */}
        <div className="rounded border border-border/30 bg-secondary/20 p-3 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2.5">Spot Assets</h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">USDT balance</span>
              <span className="font-mono tabular-nums text-foreground">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">BTC balance</span>
              <span className="font-mono tabular-nums text-foreground">0.0000</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Available</span>
              <span className="font-mono tabular-nums text-foreground">{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="mt-3 flex gap-1">
            <Button variant="secondary" className="flex-1 h-8 text-[11px]" onClick={() => setActiveModal("buy")}>
              Buy crypto
            </Button>
            <Button variant="secondary" className="flex-1 h-8 text-[11px]" onClick={() => setActiveModal("deposit")}>
              Deposit
            </Button>
            <Button variant="secondary" className="flex-1 h-8 text-[11px]" onClick={() => setActiveModal("transfer")}>
              Transfer
            </Button>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {activeModal === "deposit" && (
        <ActionModal
          title="Deposit"
          description="Fund your spot account by depositing crypto from an external wallet."
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
          description="Move funds between your spot wallet and futures account instantly."
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
          description="Purchase crypto using a credit/debit card or bank transfer."
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
