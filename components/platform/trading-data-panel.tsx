"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { cryptoPairs } from "@/lib/data"
import Link from "next/link"

interface TradingDataPanelProps {
  selectedPair: string
}

export function TradingDataPanel({ selectedPair }: TradingDataPanelProps) {
  const pair = cryptoPairs.find((p) => p.symbol === selectedPair) || cryptoPairs[0]
  const positive = pair.change24h >= 0

  const tradingStats = {
    openInterest: "12.45B USDT",
    openInterestChange: "+2.31%",
    longShortRatio: "1.24",
    topTraderLong: "54.8%",
    topTraderShort: "45.2%",
    fundingRate: pair.fundingRate,
    nextFunding: "06:24:24",
    liquidations24h: "124.5M USDT",
    buySellRatio: "0.98",
    takerBuyVol: "1.23B USDT",
    takerSellVol: "1.25B USDT",
    avgEntryLong: "$96,450.2",
    avgEntryShort: "$98,120.8",
    insuranceFund: "1.23B USDT",
  }

  const recentLiquidations = [
    { side: "long" as const, size: "2.45M", price: "96,234.5", time: "14:23:01" },
    { side: "short" as const, size: "1.87M", price: "97,891.2", time: "14:20:45" },
    { side: "long" as const, size: "892K", price: "96,102.3", time: "14:18:32" },
    { side: "short" as const, size: "1.23M", price: "97,654.8", time: "14:15:21" },
    { side: "long" as const, size: "3.12M", price: "95,987.1", time: "14:12:09" },
    { side: "short" as const, size: "567K", price: "98,001.4", time: "14:10:55" },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-5">
        {/* Open Interest */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Trading Data</h3>
          <p className="text-xs text-muted-foreground mb-4">
            <span className="mr-1.5 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">Sample</span>
            Fixed placeholder figures for the layout, not live and not specific to {selectedPair}. Live open interest, funding, long/short and liquidations are on the{" "}
            <Link href="/analytics" className="text-primary hover:underline">Analytics</Link> page.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Open Interest" value={tradingStats.openInterest} change={tradingStats.openInterestChange} positive />
            <StatCard label="Long/Short Ratio" value={tradingStats.longShortRatio} />
            <StatCard label="Funding Rate" value={tradingStats.fundingRate} subtext={`Next: ${tradingStats.nextFunding}`} />
            <StatCard label="24h Liquidations" value={tradingStats.liquidations24h} />
            <StatCard label="Taker Buy Vol" value={tradingStats.takerBuyVol} />
            <StatCard label="Taker Sell Vol" value={tradingStats.takerSellVol} />
          </div>
        </div>

        {/* Long/Short Distribution */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2.5">Top Trader Sentiment</h4>
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-trading-green font-medium">Long {tradingStats.topTraderLong}</span>
              <span className="text-trading-red font-medium">Short {tradingStats.topTraderShort}</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden">
              <div className="bg-trading-green" style={{ width: tradingStats.topTraderLong }} />
              <div className="bg-trading-red" style={{ width: tradingStats.topTraderShort }} />
            </div>
          </div>
        </div>

        {/* Additional stats */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2.5">Position Data</h4>
          <div className="rounded-lg border border-border/30 bg-secondary/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Buy/Sell Ratio</span>
              <span className="font-mono tabular-nums text-foreground">{tradingStats.buySellRatio}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avg Entry (Long)</span>
              <span className="font-mono tabular-nums text-trading-green">{tradingStats.avgEntryLong}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avg Entry (Short)</span>
              <span className="font-mono tabular-nums text-trading-red">{tradingStats.avgEntryShort}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Insurance Fund</span>
              <span className="font-mono tabular-nums text-foreground">{tradingStats.insuranceFund}</span>
            </div>
          </div>
        </div>

        {/* Recent Liquidations */}
        <div>
          <h4 className="text-xs font-semibold text-foreground mb-2.5">Recent Liquidations</h4>
          <div className="rounded-lg border border-border/30 overflow-hidden">
            <div className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[10px] font-medium text-muted-foreground bg-secondary/30">
              <span>Side</span>
              <span>Size</span>
              <span>Price</span>
              <span className="text-right">Time</span>
            </div>
            {recentLiquidations.map((liq, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[11px] font-mono tabular-nums hover:bg-secondary/20 transition-colors">
                <span className={cn("font-medium uppercase text-[10px]", liq.side === "long" ? "text-trading-green" : "text-trading-red")}>
                  {liq.side}
                </span>
                <span className="text-foreground">{liq.size}</span>
                <span className="text-foreground">{liq.price}</span>
                <span className="text-right text-muted-foreground">{liq.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

function StatCard({
  label,
  value,
  change,
  positive,
  subtext,
}: {
  label: string
  value: string
  change?: string
  positive?: boolean
  subtext?: string
}) {
  return (
    <div className="rounded-lg border border-border/30 bg-secondary/20 p-2.5">
      <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs font-semibold text-foreground">{value}</span>
        {change && (
          <span className={cn("text-[10px] font-mono", positive ? "text-trading-green" : "text-trading-red")}>{change}</span>
        )}
      </div>
      {subtext && <div className="text-[9px] text-muted-foreground mt-0.5">{subtext}</div>}
    </div>
  )
}
