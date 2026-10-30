"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface NewsPanelProps {
  selectedPair: string
}

type Sentiment = "bullish" | "bearish" | "neutral"

// Placeholder headlines. No news feed is connected, and the panel says so.
const NEWS_ITEMS: { title: string; source: string; time: string; sentiment: Sentiment; summary: string }[] = [
  {
    title: "Bitcoin Surges Past $97K as Institutional Demand Hits Record High",
    source: "CoinDesk",
    time: "2h ago",
    sentiment: "bullish",
    summary: "Institutional investors have pushed Bitcoin to new highs with record inflows into spot BTC ETFs, driven by favorable macro conditions and growing adoption.",
  },
  {
    title: "Federal Reserve Holds Rates Steady, Signals Possible Cuts in 2026",
    source: "Reuters",
    time: "4h ago",
    sentiment: "bullish",
    summary: "The Federal Reserve maintained interest rates at current levels but hinted at potential rate reductions later this year, boosting risk asset sentiment.",
  },
  {
    title: "Ethereum Layer 2 Ecosystem Sees 40% Growth in Total Value Locked",
    source: "The Block",
    time: "6h ago",
    sentiment: "bullish",
    summary: "Major L2 networks including Arbitrum and Optimism have seen significant TVL growth, reflecting strong DeFi activity and network adoption.",
  },
  {
    title: "SEC Approves New Crypto Exchange Regulations for 2026",
    source: "Bloomberg",
    time: "8h ago",
    sentiment: "neutral",
    summary: "The Securities and Exchange Commission has approved a new regulatory framework for cryptocurrency exchanges, providing clearer guidelines for market participants.",
  },
  {
    title: "MicroStrategy Adds Another $500M in Bitcoin to Treasury",
    source: "CNBC",
    time: "10h ago",
    sentiment: "bullish",
    summary: "The company continues its aggressive Bitcoin accumulation strategy, bringing total holdings to over 250,000 BTC.",
  },
  {
    title: "Bybit Reports Record Trading Volume in Q1 2026",
    source: "CoinTelegraph",
    time: "12h ago",
    sentiment: "neutral",
    summary: "The world's largest crypto exchange by volume reported $2.1 trillion in quarterly trading volume, a 35% increase from the previous quarter.",
  },
  {
    title: "Solana Network Upgrade Promises 65,000 TPS Throughput",
    source: "Decrypt",
    time: "14h ago",
    sentiment: "bullish",
    summary: "The upcoming Firedancer update is expected to dramatically increase Solana's transaction throughput and network reliability.",
  },
  {
    title: "Crypto Market Cap Approaches $4 Trillion Milestone",
    source: "CoinMarketCap",
    time: "16h ago",
    sentiment: "bullish",
    summary: "The total cryptocurrency market capitalization is nearing the $4 trillion mark, driven by Bitcoin's rally and broad altcoin momentum.",
  },
]

export function NewsPanel({ selectedPair }: NewsPanelProps) {
  const coin = selectedPair.split("/")[0]

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-1">
        <h3 className="text-sm font-semibold text-foreground mb-3">News</h3>
        <p className="text-xs text-muted-foreground mb-4">
          <span className="mr-1.5 rounded bg-muted/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">Sample</span>
          Placeholder headlines for the layout. No news feed is connected yet, so nothing here is about {coin} today.
        </p>

        <div className="space-y-3">
          {NEWS_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/30 bg-secondary/20 p-3 hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-xs font-medium text-foreground leading-relaxed flex-1">
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
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
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
      </div>
    </ScrollArea>
  )
}
