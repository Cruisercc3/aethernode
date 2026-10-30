"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowRight, Code2, Globe, FileText, Scale, Mail, MessageSquare,
  Rocket, Palette, BarChart3, Brain, Building2, Layers, BookOpen, Handshake
} from "lucide-react"

const includedCards = [
  {
    icon: Code2,
    title: "Source Code & IP",
    description:
      "Complete Next.js 16 TypeScript codebase. GitHub repository transfer with full commit history. 100% original work — no outside developers, no shared code, no licensing restrictions. Modify, extend, and commercialize without limitations.",
  },
  {
    icon: Globe,
    title: "Domain & Deployment",
    description:
      "aethernode.net domain transfer. Vercel deployment configuration included. 1 environment variable to configure. Deploy in minutes. Infrastructure runs on approximately $1/month using free-tier services.",
  },
  {
    icon: FileText,
    title: "Documentation",
    description:
      "Full technical architecture breakdown covering all 8 system layers. Deployment and integration guide. API documentation. Silent video walkthrough of the complete platform. Customization reference for rebranding.",
  },
  {
    icon: Scale,
    title: "Commercial Rights",
    description:
      "Unrestricted rights to modify, rebrand, resell, white-label, sublicense, and distribute. Launch as a branded exchange, extract components as developer products, build subscription services, or license to third parties.",
  },
]

const revenuePaths = [
  {
    title: "Launch a Branded Exchange",
    description: "Deploy under a new brand with the complete architecture already production-ready. 500+ pairs live from day one.",
    icon: Rocket,
  },
  {
    title: "Reskin for Other Markets",
    description: "The data pipeline is asset-class agnostic. Replace the feed for forex, stocks, or commodities.",
    icon: Palette,
  },
  {
    title: "Extract the Charting Engine",
    description: "Sell the TradingView integration, indicators, and WebSocket management as a standalone developer product.",
    icon: BarChart3,
  },
  {
    title: "Build an AI Analysis Subscription",
    description: "Package the AI interpretation layer covering 500+ pairs as a $29-49/month SaaS product.",
    icon: Brain,
  },
  {
    title: "White-Label for Fintech Clients",
    description: "Deploy customized instances for crypto projects and trading communities at $5K-$15K per client.",
    icon: Building2,
  },
  {
    title: "Extend into DeFi Analytics",
    description: "Add on-chain data sources alongside exchange data for blockchain analytics.",
    icon: Layers,
  },
  {
    title: "Create a Trading Journal",
    description: "Extend analytics into AI-driven performance tracking and risk assessment.",
    icon: BookOpen,
  },
  {
    title: "License to Trading Educators",
    description: "Signal groups and communities need branded platforms with live data credibility.",
    icon: Handshake,
  },
]

const techStack = [
  { label: "Framework", value: "Next.js 16 (App Router)" },
  { label: "Language", value: "TypeScript" },
  { label: "Styling", value: "Tailwind CSS" },
  { label: "Charting", value: "TradingView Lightweight Charts" },
  { label: "Live Data", value: "Bybit WebSocket API" },
  { label: "Analytics", value: "Bybit REST API (5 endpoints) + OKX liquidations" },
  { label: "Candle History", value: "Binance, Bybit and OKX via one server route" },
  { label: "Coin Data", value: "CoinGecko (market cap, supply)" },
  { label: "Market Data", value: "Bybit REST API (500+ pairs, 15s polling)" },
  { label: "AI", value: "Groq (openai/gpt-oss-120b)" },
  { label: "Deployment", value: "Vercel" },
]

export default function AcquisitionPage() {
  return (
    <div className="relative">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

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
              <Handshake className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Platform Transfer
            </span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Acquisition<br />
            <span className="text-primary">Overview</span>
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            Complete ownership transfer of a fully functional trading intelligence platform —
            source code, domain, documentation, and unrestricted commercial rights.
          </p>
          <div className="mt-8 h-px w-20 bg-primary/40" />
        </motion.div>

        {/* What's Included */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">{"What's Included"}</h2>
          <div className="h-px w-12 bg-primary/40 mb-8" />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {includedCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="group rounded-2xl border border-border/50 bg-card/60 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Commercialization Paths */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">8 Paths to Revenue</h2>
          <div className="h-px w-12 bg-primary/40 mb-8" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {revenuePaths.map((path, i) => (
              <motion.div
                key={path.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
                className="group flex gap-4 rounded-xl border border-border/40 bg-card/40 p-5 transition-all duration-300 hover:border-primary/25 hover:bg-card/60"
              >
                <div className="shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <path.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono font-bold text-primary/60">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-sm font-semibold text-foreground">{path.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{path.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Technology Stack */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-foreground mb-2">Technology Stack</h2>
          <div className="h-px w-12 bg-primary/40 mb-8" />

          <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
            {techStack.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center justify-between px-6 py-4 ${
                  i < techStack.length - 1 ? "border-b border-border/30" : ""
                }`}
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium font-mono text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Contact / CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="rounded-2xl border border-primary/20 bg-card/80 p-8 md:p-12 text-center">
            <div className="flex justify-center mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Mail className="h-7 w-7 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Interested in acquiring this platform?
            </h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
              Request the full technical documentation package or schedule a walkthrough.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/request-docs"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <FileText className="h-4 w-4" />
                Request Documentation
              </Link>
              <Link
                href="/request-docs"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
              >
                <MessageSquare className="h-4 w-4" />
                Contact for Acquisition
              </Link>
            </div>

            {/* Back to Architecture link */}
            <div className="mt-8 pt-6 border-t border-border/30">
              <Link
                href="/architecture"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                View full system architecture
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
