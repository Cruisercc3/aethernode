"use client"

import { HelpCircle, Search, MessageCircle, BookOpen, Shield, Wallet, BarChart3, Zap, Terminal, Server, AlertTriangle, Clock, Users, Code } from "lucide-react"
import { PageShell, ContentSection, InfoCard } from "@/components/page-shell"
import Link from "next/link"

const categories = [
  { 
    title: "Quick Start", 
    description: "Account setup, KYC verification tiers, two-factor authentication, first deposit guide.", 
    icon: Zap,
    href: "/signup"
  },
  { 
    title: "Spot Trading", 
    description: "Order types (limit, market, stop-limit, OCO), order book mechanics, fee calculation.", 
    icon: BarChart3,
    href: "/spot"
  },
  { 
    title: "Perpetual Futures", 
    description: "Leverage settings, margin modes, funding rates, liquidation process, ADL ranking.", 
    icon: Terminal,
    href: "/platform"
  },
  { 
    title: "API Integration", 
    description: "REST endpoints, WebSocket streams, FIX protocol, rate limits, authentication.", 
    icon: Code,
    href: "/api-docs"
  },
  { 
    title: "Wallet Operations", 
    description: "Deposit addresses, withdrawal process, network selection, transaction tracking.", 
    icon: Wallet,
    href: "/wallet"
  },
  { 
    title: "Security Center", 
    description: "2FA setup, API key management, withdrawal whitelists, anti-phishing codes.", 
    icon: Shield,
    href: "/dashboard/security"
  },
]

const tradingFaqs = [
  { 
    q: "What leverage is available for futures trading?", 
    a: "Up to 150x on BTC/USDT, 100x on ETH/USDT, 50-75x on major alts. Leverage limits decrease with position size. Risk-adjusted maximum leverage: $100K position = max 50x, $500K = max 20x, $1M+ = max 10x." 
  },
  { 
    q: "How does the liquidation engine work?", 
    a: "Positions liquidated when margin ratio < maintenance margin (0.4-0.5% depending on tier). Liquidation price calculated using mark price (index + funding basis). Partial liquidation attempted first; full liquidation if insufficient margin. 0.5% liquidation fee sent to insurance fund." 
  },
  { 
    q: "What's the difference between Isolated and Cross margin?", 
    a: "Isolated: Position margin fixed at entry; max loss = assigned margin. Cross: Entire account balance serves as margin; higher liquidation threshold but full account at risk. Switch modes only when no open positions." 
  },
  { 
    q: "How are funding rates calculated?", 
    a: "Funding = (Premium Index + Clamp(Interest Rate - Premium Index, -0.05%, 0.05%)). Paid every 8 hours (00:00, 08:00, 16:00 UTC). Positive rate = longs pay shorts. Historical rates are on the Analytics page." 
  },
]

const accountFaqs = [
  { 
    q: "What are the KYC verification tiers?", 
    a: "Tier 1 (email only): 2 BTC daily withdrawal. Tier 2 (ID + selfie): 100 BTC daily, futures access. Tier 3 (proof of address): Unlimited, institutional features. Processing: Tier 1 instant, Tier 2 ~15 minutes, Tier 3 ~24 hours." 
  },
  { 
    q: "How do I reset my 2FA if I lost my device?", 
    a: "Submit identity verification + video selfie at /account/2fa-reset. Include government ID and speak today's date. Processing: 24-72 hours. Emergency support available for institutional accounts via dedicated line." 
  },
  { 
    q: "What are the trading fee tiers?", 
    a: "Base: 0.1% maker/taker spot, 0.02/0.05% futures. VIP 1 (>$1M/30d): -20%. VIP 2 (>$5M): -40%. VIP 3 (>$25M): -60%. VIP 4 (>$100M): -80%, dedicated account manager. Market maker program: negative maker fees available." 
  },
  { 
    q: "How long do withdrawals take?", 
    a: "Crypto: 2-30 minutes (network dependent). Large withdrawals (>$100K): Additional compliance review, up to 24h. Whitelisted addresses: Instant processing. Security hold for new addresses: 24h for non-whitelisted." 
  },
]

const apiFaqs = [
  { 
    q: "What are the API rate limits?", 
    a: "REST: 1200 req/min (general), 180 req/min (trading). WebSocket: 10 connections/IP, 100 subscriptions/connection. FIX: Dedicated gateway, contact sales. Rate limit headers included in all responses." 
  },
  { 
    q: "How do I authenticate API requests?", 
    a: "HMAC-SHA256 signature using API secret. Signature = HMAC(timestamp + method + path + body). Include X-API-Key, X-API-Timestamp, X-API-Signature headers. Testnet available at api-testnet.aethernode.io." 
  },
]

export default function HelpPage() {
  return (
    <PageShell
      icon={HelpCircle}
      tag="Support"
      title="Help Center"
      description="Technical documentation and support for AetherNode trading infrastructure."
    >
      {/* System Status */}
      <div className="mb-8 p-4 rounded-lg border border-accent/30 bg-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-foreground">All Systems Operational</span>
          </div>
          <Link href="/status" className="text-xs font-mono text-primary hover:underline">
            status.aethernode.io
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-3">
          <div>
            <span className="text-[10px] text-muted-foreground block">Matching Engine</span>
            <span className="text-xs font-mono text-accent">99.99%</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">API Latency</span>
            <span className="text-xs font-mono text-foreground">&lt;1ms</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">WebSocket</span>
            <span className="text-xs font-mono text-accent">Healthy</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block">Withdrawals</span>
            <span className="text-xs font-mono text-accent">Normal</span>
          </div>
        </div>
      </div>

      <ContentSection title="Documentation">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 not-prose">
          {categories.map((cat) => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="p-4 rounded-lg border border-border/50 bg-card/60 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cat.title}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{cat.description}</p>
              </Link>
            )
          })}
        </div>
      </ContentSection>

      <ContentSection title="Trading FAQ">
        <div className="space-y-3 not-prose">
          {tradingFaqs.map((faq) => (
            <div key={faq.q} className="rounded-lg border border-border/50 bg-card/60 p-4">
              <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Account & Withdrawals FAQ">
        <div className="space-y-3 not-prose">
          {accountFaqs.map((faq) => (
            <div key={faq.q} className="rounded-lg border border-border/50 bg-card/60 p-4">
              <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="API & Integration FAQ">
        <div className="space-y-3 not-prose">
          {apiFaqs.map((faq) => (
            <div key={faq.q} className="rounded-lg border border-border/50 bg-card/60 p-4">
              <h3 className="text-sm font-semibold text-foreground">{faq.q}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </ContentSection>

      {/* Support Options */}
      <div className="grid gap-4 sm:grid-cols-3 mt-8">
        <div className="p-4 rounded-lg border border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Live Chat</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">24/7 support with &lt;5 min response time</p>
          <button className="text-xs font-mono text-primary hover:underline">Open Chat</button>
        </div>
        
        <div className="p-4 rounded-lg border border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Institutional</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">Dedicated support for VIP 3+ accounts</p>
          <span className="text-xs font-mono text-muted-foreground">vip@aethernode.io</span>
        </div>
        
        <div className="p-4 rounded-lg border border-border/50 bg-card/60">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">API Support</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">Technical integration assistance</p>
          <span className="text-xs font-mono text-muted-foreground">api@aethernode.io</span>
        </div>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-8">
        <p className="text-sm font-semibold text-foreground">Acquisition Inquiries</p>
        <p className="text-xs text-muted-foreground mt-1">
          For technical due diligence, infrastructure documentation, and acquisition discussions:
          <span className="font-mono text-foreground ml-1">acquisition@aethernode.io</span>
        </p>
      </div>
    </PageShell>
  )
}
