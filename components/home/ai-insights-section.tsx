"use client"

import { useRef } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"

export function DevelopmentValueSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative overflow-hidden rounded-2xl border border-border/50"
      >
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-card via-card to-secondary/30" />
        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-primary/3 blur-[100px]" />

        <div className="relative px-8 py-16 text-center md:px-16 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            Development Equivalent
          </p>

          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What would this cost to build?
          </h2>

          <p className="mt-6 mx-auto max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            An agency tasked with replicating this system — dual trading terminals
            with live TradingView charting across 500+ pairs, 25+ working indicators
            with full customization, real-time markets with sector filtering across
            12+ categories, rebuilt order book with production-grade performance, six
            analytics tools on live exchange data, AI analysis engine, complete user
            system, and 19+ fully built pages — would quote{" "}
            <span className="font-semibold text-foreground">$125,000 - $200,000</span>{" "}
            and deliver in 4 - 6 months.
          </p>

          <p className="mt-6 text-sm text-muted-foreground/70">
            AetherNode runs on ~$1/month. All data sources are free public Bybit
            APIs. No ongoing licensing costs. No data subscriptions.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)] px-8"
            >
              <Link href="/architecture">
                View Architecture
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border/60 bg-transparent text-foreground hover:bg-secondary hover:text-foreground px-8"
            >
              <Link href="/acquisition">Acquisition Details</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
