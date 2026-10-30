"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"

const platformMetrics = [
  { value: "8", label: "Architecture Layers", desc: "Integrated system design" },
  { value: "25+", label: "Technical Indicators", desc: "Live charting analysis" },
  { value: "12+", label: "Sector Filters", desc: "Layer 1, DeFi, AI, Meme, Gaming & more" },
  { value: "6", label: "AI Analysis Contexts", desc: "Contextual intelligence" },
  { value: "19+", label: "Built Pages", desc: "Complete platform" },
  { value: "500+", label: "Trading Pairs", desc: "USDT perpetuals via Bybit" },
  { value: "100-120+", label: "UI Components", desc: "Production interface" },
  { value: "~$1/mo", label: "Infrastructure Cost", desc: "Free-tier deployment" },
]

function MetricCard({ metric, index }: { metric: typeof platformMetrics[number]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(500px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) scale3d(1.02, 1.02, 1.02)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = "perspective(500px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)"
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="glass rounded-xl px-5 py-6 text-center glow-border relative overflow-hidden group"
        style={{ transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative">
          <div className="font-mono text-2xl font-bold text-foreground tabular-nums md:text-3xl">
            {metric.value}
          </div>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{metric.label}</p>
          <p className="mt-1 text-[11px] text-muted-foreground/60">{metric.desc}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function StatsSection() {
  return (
    <section className="relative z-20 mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {platformMetrics.map((metric, i) => (
          <MetricCard key={metric.label} metric={metric} index={i} />
        ))}
      </div>
    </section>
  )
}
