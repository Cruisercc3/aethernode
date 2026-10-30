"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { cryptoPairs } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { CryptoIcon } from "@/components/crypto-icon"

interface TradingTopBarProps {
  selectedPair: string
  onPairChange: (pair: string) => void
  mode?: "futures" | "spot"
}

export function TradingTopBar({ selectedPair, onPairChange, mode = "futures" }: TradingTopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  
  const pair = cryptoPairs.find(p => p.symbol === selectedPair) || cryptoPairs[0]
  const positive = pair.change24h >= 0

  const filteredPairs = cryptoPairs.filter((p) =>
    p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const items = [
    {
      label: "Mark Price",
      value: `$${pair.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      colored: true,
    },
    {
      label: "24h Change",
      value: `${positive ? "+" : ""}${pair.change24h.toFixed(2)}%`,
      colored: true,
    },
    {
      label: "24h High",
      value: `$${pair.high24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      label: "24h Low",
      value: `$${pair.low24h.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      label: "24h Volume",
      value: `$${pair.volume24h}`,
    },
    {
      label: "Funding Rate",
      value: pair.fundingRate,
    },
  ]

  return (
    <>
      <div className="flex items-center gap-2.5 overflow-x-auto border-b border-border/30 bg-card px-1.5 py-2 scrollbar-hide">
        {/* Pair Name with Crypto Icon - Clickable and Searchable */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2.5 shrink-0 hover:bg-secondary/50 rounded px-3 py-1.5 transition-colors group min-w-[220px]"
        >
          <CryptoIcon base={pair.symbol.split("/")[0]} size="md" />
          <span className="text-[18.8px] font-bold text-foreground group-hover:text-primary transition-colors">
            {pair.symbol}
          </span>
          {mode === "futures" && <span className="text-[10.6px] text-muted-foreground">Perpetual</span>}
          <Search className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <div className="h-4 w-px bg-border/30 shrink-0" />

        {/* Stats */}
        {items.map((item) => (
          <div key={item.label} className="shrink-0">
            <div className="text-[9px] text-muted-foreground">{item.label}</div>
            <div
              className={cn(
                "text-[10px] font-mono font-medium tabular-nums",
                item.colored
                  ? positive
                    ? "text-trading-green"
                    : "text-trading-red"
                  : "text-foreground"
              )}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Pair Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-md bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Search Trading Pairs</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border/50"
              autoFocus
            />
          </div>
          <div className="max-h-[400px] overflow-y-auto space-y-1 mt-2">
            {filteredPairs.map((p) => {
              const isPositive = p.change24h >= 0
              return (
                <button
                  key={p.symbol}
                  onClick={() => {
                    onPairChange(p.symbol)
                    setSearchOpen(false)
                    setSearchQuery("")
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-secondary/80 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <CryptoIcon base={p.symbol.split("/")[0]} size="sm" />
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {p.symbol}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {p.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono tabular-nums text-foreground">
                      ${p.price.toLocaleString()}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-mono tabular-nums",
                        isPositive ? "text-trading-green" : "text-trading-red"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {p.change24h.toFixed(2)}%
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
