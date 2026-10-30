"use client"

import { useRef, useCallback } from "react"
import Link from "next/link"
import {
  LineChart,
  Brain,
  Activity,
  Layers,
  Shield,
  Code,
  ArrowRight,
  type LucideIcon,
} from "lucide-react"
import { motion, useInView } from "framer-motion"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  category: string
  linkLabel: string
  index: number
}

function TiltFeatureCard({ title, description, icon: Icon, href, category, linkLabel, index }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(600px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale3d(1.02, 1.02, 1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = "perspective(600px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)"
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 h-full flex flex-col"
        style={{ transition: "transform 0.15s ease-out, border-color 0.3s, box-shadow 0.3s", transformStyle: "preserve-3d" }}
      >
        {/* Hover accent */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_-4px_hsl(var(--primary)/0.3)]">
            <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
          </div>
          <span className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {category}
          </span>
        </div>

        <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">
          {description}
        </p>

        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  )
}

const platformCapabilities = [
  {
    title: "Dual Trading Terminals",
    description: "Spot and Futures terminals with live TradingView charting and real-time order books. The order panels (up to 150x leverage, isolated and cross margin) are front end only and place no orders. Chart updates optimized to match or exceed production exchange responsiveness.",
    icon: LineChart,
    href: "/platform",
    category: "Trading",
    linkLabel: "Futures Terminal",
  },
  {
    title: "AI Market Analysis",
    description: "6 analysis contexts on Groq. The model gets the live data on each card, from Bybit and OKX, with the time window each block covers, and quotes the real numbers back.",
    icon: Brain,
    href: "/analytics",
    category: "Intelligence",
    linkLabel: "Analytics Dashboard",
  },
  {
    title: "Real-Time Markets",
    description: "500+ USDT perpetual pairs via Bybit WebSocket and REST polling every 15 seconds. Sector-based filtering across 12+ categories including Layer 1, DeFi, AI, Meme, and Gaming. Top gainers, top losers, trending assets, favorites, and instant trade access.",
    icon: Activity,
    href: "/markets",
    category: "Live Data",
    linkLabel: "Markets Page",
  },
  {
    title: "6 Intelligence Tools",
    description: "Recent liquidations, open interest, long/short ratio, funding history, volume leaders and a market heatmap. Each has its own AI read-out.",
    icon: Layers,
    href: "/analytics",
    category: "Analytics",
    linkLabel: "Analytics Dashboard",
  },
  {
    title: "Authentication & Wallets",
    description: "Complete auth UI with Google and Apple OAuth. User dashboard with 2FA, KYC flows, API key management. Web3 wallet connection supporting MetaMask, WalletConnect, Coinbase, and Trust Wallet.",
    icon: Shield,
    href: "/dashboard",
    category: "User System",
    linkLabel: "Dashboard",
  },
  {
    title: "Enterprise Completeness",
    description: "API documentation, careers page, legal suite, help center, blog, press pages. Every link leads to a built page. Nothing is a dead end.",
    icon: Code,
    href: "/api-docs",
    category: "Infrastructure",
    linkLabel: "API Docs",
  },
]

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="text-center mb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Platform Capabilities
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {"What's Inside"}
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          A complete trading platform with real-time data, AI intelligence, and
          production-grade infrastructure across every page.
        </p>
        <div className="mt-6 mx-auto h-px w-16 bg-primary/40" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {platformCapabilities.map((feature, index) => (
          <TiltFeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </section>
  )
}
