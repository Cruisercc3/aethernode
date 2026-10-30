"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Terminal, Cpu, Database, Zap, Globe, Shield, Activity } from "lucide-react"
import { motion } from "framer-motion"
import { useHomeTickers } from "@/hooks/useHomeTickers"

/* Terminal typing effect */
function TerminalText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i <= text.length) {
          setDisplayed(text.slice(0, i))
          i++
        } else {
          clearInterval(interval)
          setTimeout(() => setShowCursor(false), 500)
        }
      }, 30)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timeout)
  }, [text, delay])

  return (
    <span>
      {displayed}
      {showCursor && <span className="cursor-blink text-primary">_</span>}
    </span>
  )
}

/* Animated grid background */
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base grid */}
      <div className="absolute inset-0 retro-grid opacity-50" />
      
      {/* Radial fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
    </div>
  )
}

/* Stats ticker bar */
function StatsTicker() {
  const stats = [
    { label: "PAIRS", value: "500+", color: "text-foreground" },
    { label: "INDICATORS", value: "25+", color: "text-foreground" },
    { label: "API INTEGRATIONS", value: "8", color: "text-accent" },
    { label: "AI CONTEXTS", value: "6", color: "text-accent" },
    { label: "PAGES", value: "19+", color: "text-primary" },
    { label: "INFRA COST", value: "$1/mo", color: "text-primary" },
  ]

  return (
    <div className="flex items-center gap-8 overflow-hidden">
      <div className="flex items-center gap-8 animate-marquee">
        {[...stats, ...stats].map((stat, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[10px] font-mono text-muted-foreground">{stat.label}</span>
            <span className={`text-xs font-mono font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Feature card */
function FeatureCard({ 
  icon: Icon, 
  title, 
  description,
  delay 
}: { 
  icon: typeof Terminal
  title: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group relative border-2 border-border hover:border-primary/50 bg-card/50 p-4 transition-all hover:bg-card"
    >
      <div className="absolute top-0 right-0 w-8 h-8 border-l-2 border-b-2 border-border group-hover:border-primary/50 transition-colors" />
      <Icon className="h-5 w-5 text-primary mb-3" />
      <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  )
}

/* Live prices from Bybit (REST snapshot, then the public WebSocket) */
const FEED_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]

function LivePriceTicker() {
  const { tickers } = useHomeTickers()
  const prices = FEED_SYMBOLS.map(s => tickers.find(t => t.symbol === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
    .map(t => ({ symbol: t.symbol.replace("USDT", ""), price: t.price, change: t.change24h }))

  if (prices.length === 0) {
    return <span className="text-[10px] font-mono text-muted-foreground">Connecting to Bybit...</span>
  }

  return (
    <div className="flex items-center gap-6">
      {prices.map(p => (
        <div key={p.symbol} className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{p.symbol}</span>
          <span className="text-xs font-mono font-bold text-foreground tabular-nums">
            ${p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-[10px] font-mono ${p.change >= 0 ? "text-accent" : "text-destructive"}`}>
            {p.change >= 0 ? "+" : ""}{p.change.toFixed(2)}%
          </span>
        </div>
      ))}
    </div>
  )
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    { icon: Cpu, title: "AI Analytics", description: "Groq read-outs on six live analytics charts" },
    { icon: Database, title: "Full Order Book", description: "Bybit L2 depth and trades over WebSocket" },
    { icon: Zap, title: "Thin Server", description: "Exchange data streams straight to the browser" },
    { icon: Globe, title: "White Label", description: "Complete rebrandable platform solution" },
    { icon: Shield, title: "No Keys Needed", description: "Market data comes from free public APIs" },
    { icon: Activity, title: "Trading UI", description: "Futures and spot order panels, front end only" },
  ]

  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <GridBackground />
      
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        {/* Top bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-12 pb-4 border-b border-border"
        >
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            LIVE FEED
          </div>
          {mounted && <LivePriceTicker />}
        </motion.div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left column - text */}
          <div>
            {/* Terminal window */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border-2 border-border bg-card mb-8"
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground ml-2">aethernode://terminal</span>
              </div>
              
              {/* Terminal content */}
              <div className="p-6 font-mono text-sm">
                <div className="text-muted-foreground mb-2">
                  <span className="text-accent">$</span> query --platform-status
                </div>
                <div className="text-foreground mb-4">
                  {mounted && <TerminalText text="Enterprise Crypto Trading Infrastructure" delay={300} />}
                </div>
                <div className="text-muted-foreground mb-2">
                  <span className="text-accent">$</span> describe --offering
                </div>
                <div className="text-muted-foreground text-xs leading-relaxed">
                  {mounted && (
                    <TerminalText 
                      text="Complete white-label trading platform with real-time Bybit integration, AI-powered analytics, and institutional-grade infrastructure. Available for acquisition or licensing."
                      delay={1200}
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-foreground">Trading</span>
                <br />
                <span className="text-primary">Infrastructure</span>
                <br />
                <span className="text-muted-foreground">Redefined</span>
              </h1>
              
              <p className="text-muted-foreground text-lg mb-8 max-w-lg">
                Production-ready cryptocurrency exchange platform built for scale. 
                Deploy your own branded trading experience in weeks, not years.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/platform"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-wider hover:bg-primary/90 transition-all group"
                >
                  Explore Platform
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/acquisition"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-foreground/20 text-foreground font-mono text-sm uppercase tracking-wider hover:border-primary hover:text-primary transition-all"
                >
                  View Acquisition Info
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right column - feature cards */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.4 + i * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Bottom stats ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 pt-6 border-t border-border"
        >
          <StatsTicker />
        </motion.div>
      </div>
    </section>
  )
}
