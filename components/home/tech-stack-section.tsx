"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const techStack = [
  { name: "Next.js 16", mono: true },
  { name: "TypeScript", mono: true },
  { name: "Tailwind CSS", mono: true },
  { name: "TradingView", mono: true },
  { name: "Bybit WebSocket API", mono: true },
  { name: "Bybit REST API (500+ pairs)", mono: true },
  { name: "OKX + Binance REST", mono: true },
  { name: "CoinGecko API", mono: true },
  { name: "Groq (gpt-oss-120b)", mono: true },
  { name: "Vercel", mono: true },
]

export function TechStackSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Technology Stack
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {techStack.map((tech, i) => (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
          >
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/60 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200">
              <span className={tech.mono ? "font-mono text-[13px]" : ""}>
                {tech.name}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
