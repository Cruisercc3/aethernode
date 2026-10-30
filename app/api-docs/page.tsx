"use client"

import { Code2, Zap, Database, Bot, Globe, Copy, Check } from "lucide-react"
import { PageShell, ContentSection } from "@/components/page-shell"
import { useState } from "react"

function CodeBlock({ title, code, language = "typescript" }: { title: string; code: string; language?: string }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border/30">
        <span className="text-xs font-mono text-muted-foreground">{title}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-trading-green" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-muted-foreground">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function ApiDocsPage() {
  return (
    <PageShell
      icon={Code2}
      tag="Developer Reference"
      title="API Documentation"
      description="The public exchange streams and endpoints the site reads, and the three server routes it adds on top."
    >
      {/* WebSocket Connection */}
      <ContentSection title="WebSocket Connection">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Real-Time Market Data Stream</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Live order book updates, trades, and ticker data via persistent WebSocket connection.
            </p>
          </div>
        </div>

        <CodeBlock
          title="WebSocket URL"
          code={`// Bybit WebSocket - Live Order Book & Trades
wss://stream.bybit.com/v5/public/linear

// Subscribe to BTC order book (depth 50)
{
  "op": "subscribe",
  "args": ["orderbook.50.BTCUSDT"]
}

// Subscribe to live trades
{
  "op": "subscribe", 
  "args": ["publicTrade.BTCUSDT"]
}`}
        />

        <div className="mt-4 rounded-lg bg-secondary/40 p-4 border border-border/30">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">Supported streams:</span>{" "}
            <code className="text-[11px]">orderbook.&#123;1|50|200&#125;.&#123;symbol&#125;</code>,{" "}
            <code className="text-[11px]">publicTrade.&#123;symbol&#125;</code>,{" "}
            <code className="text-[11px]">tickers.&#123;symbol&#125;</code>,{" "}
            <code className="text-[11px]">kline.&#123;interval&#125;.&#123;symbol&#125;</code>
          </p>
        </div>
      </ContentSection>

      {/* REST Endpoints */}
      <ContentSection title="REST Endpoints — Market Data">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
            <Database className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Market Data & Analytics</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Fetch tickers, klines, order books, and historical data via REST API.
            </p>
          </div>
        </div>

        <div className="space-y-3 not-prose">
          {[
            { 
              method: "GET", 
              endpoint: "/v5/market/tickers", 
              description: "Real-time ticker data for all symbols or specific category",
              params: "category=linear&symbol=BTCUSDT"
            },
            { 
              method: "GET", 
              endpoint: "/v5/market/kline", 
              description: "Historical kline/candlestick data with configurable intervals",
              params: "category=linear&symbol=BTCUSDT&interval=15&limit=200"
            },
            { 
              method: "GET", 
              endpoint: "/v5/market/orderbook", 
              description: "Order book depth snapshot (1, 50, 200 levels)",
              params: "category=linear&symbol=BTCUSDT&limit=50"
            },
            { 
              method: "GET", 
              endpoint: "/v5/market/recent-trade", 
              description: "Recent public trades for a symbol",
              params: "category=linear&symbol=BTCUSDT&limit=50"
            },
            { 
              method: "GET", 
              endpoint: "/v5/market/funding/history", 
              description: "Historical funding rate data",
              params: "category=linear&symbol=BTCUSDT&limit=100"
            },
          ].map((ep) => (
            <div key={ep.endpoint} className="rounded-lg border border-border/50 bg-card/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-trading-green/10 text-trading-green">
                  {ep.method}
                </span>
                <code className="text-xs font-mono font-semibold text-foreground">{ep.endpoint}</code>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{ep.description}</p>
              <code className="text-[10px] font-mono text-muted-foreground/70">?{ep.params}</code>
            </div>
          ))}
        </div>

        <CodeBlock
          title="Base URL"
          code={`// Bybit REST API Base
https://api.bybit.com

// Example: Fetch BTC ticker
fetch('https://api.bybit.com/v5/market/tickers?category=linear&symbol=BTCUSDT')
  .then(res => res.json())
  .then(data => console.log(data.result.list[0]))`}
        />
      </ContentSection>

      {/* The site's own routes */}
      <ContentSection title="Server Routes">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Bot className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Three Next.js route handlers</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Everything else runs in the browser. These three exist because the browser can&apos;t do the job alone.
            </p>
          </div>
        </div>

        <CodeBlock
          title="GET /api/binance/klines"
          code={`// Candle history. Tries Binance spot, Binance futures, Bybit spot,
// Bybit linear, then OKX spot, and returns the first answer in Binance's
// row format. The X-Exchange header names the exchange that answered.
GET /api/binance/klines?symbol=BTCUSDT&interval=1h&limit=500&endTime=<ms>

// Response
[[openTimeMs, "open", "high", "low", "close", "volume", closeTimeMs], ...]`}
        />

        <CodeBlock
          title="GET /api/liquidations"
          code={`// Recent forced liquidations from OKX's public API, up to 1,000 orders,
// converted to USD and grouped into price buckets. Cached for 30 seconds.
GET /api/liquidations?symbol=BTCUSDT

// Response
{
  "available": true,
  "source": "OKX",
  "instId": "BTC-USDT-SWAP",
  "count": 1000,
  "from": 1793284200000, "to": 1793298700000,
  "longUsd": 2210000, "shortUsd": 1870000,
  "bucketSize": 50,
  "buckets": [{ "price": 80500, "longUsd": 120000, "shortUsd": 0, "longCount": 9, "shortCount": 0 }]
}`}
        />

        <CodeBlock
          title="POST /api/ai/analyze"
          code={`// AI Insight for one analytics card. Calls Groq (openai/gpt-oss-120b)
// with the card's data and the time window that data really covers.
POST /api/ai/analyze
Content-Type: application/json

{
  "tool": "open-interest",
  "symbol": "BTCUSDT",
  "data": [{ "time": "2026-10-29T06:00:00.000Z", "openInterest": 62812.3, "unit": "BTC" }],
  "window": "36 readings at 1-hour steps, 28 Oct 06:00 UTC to 29 Oct 17:00 UTC (35 hours)",
  "priceContext": { "currentPrice": 80540, "klines": [{ "open": 80100, "high": 80600, "low": 80020, "close": 80540, "timestamp": 1793253600000 }] }
}

// Response
{ "analysis": "Open interest rose 2.1% to 62.8K BTC while price ..." }`}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 not-prose">
          {[
            { context: "liquidation-map", desc: "Real OKX liquidations by price bucket" },
            { context: "open-interest", desc: "Bybit open interest in the base coin" },
            { context: "long-short", desc: "Share of Bybit accounts net long vs net short" },
            { context: "funding-rate", desc: "Funding rate at each settlement" },
            { context: "taker-volume", desc: "Top 10 pairs by rolling 24h turnover" },
            { context: "market-heatmap", desc: "Top 24 pairs by volume, change over the chosen window" },
          ].map((ctx) => (
            <div key={ctx.context} className="rounded-lg border border-border/50 bg-secondary/30 p-3">
              <code className="text-xs font-mono text-primary">tool: "{ctx.context}"</code>
              <p className="text-[11px] text-muted-foreground mt-1">{ctx.desc}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Integration Summary */}
      <ContentSection title="Integration Summary">
        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">6 Outside Services</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Bybit, Binance, OKX, CoinGecko, Groq and Formspree. Charts use TradingView&apos;s Lightweight Charts library.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Real-Time Data</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Order book, trades, tickers and candles stream from the exchanges straight to the browser
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bot className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">6 AI Contexts</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  One per analytics card: liquidations, open interest, long/short, funding, volume and the heatmap
                </p>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>
    </PageShell>
  )
}
