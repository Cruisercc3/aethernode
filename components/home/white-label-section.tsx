"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const brandMockups = [
  { name: "AetherNode", accent: "hsl(12, 80%, 48%)", accentBg: "hsl(12, 80%, 48%)", current: true },
  { name: "NovaTrade", accent: "hsl(210, 80%, 55%)", accentBg: "hsl(210, 80%, 55%)", current: false },
  { name: "VaultFi", accent: "hsl(160, 70%, 45%)", accentBg: "hsl(160, 70%, 45%)", current: false },
]

function NavMockup({ brand }: { brand: typeof brandMockups[number] }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/80 overflow-hidden">
      {/* Nav bar mockup */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-secondary/30">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-[9px] font-bold"
            style={{ backgroundColor: `${brand.accent}20`, color: brand.accent, border: `1px solid ${brand.accent}30` }}
          >
            {brand.name[0]}
          </div>
          <span className="text-xs font-bold text-foreground">
            {brand.name.slice(0, -brand.name.split(/(?=[A-Z])/).pop()!.length)}
            <span style={{ color: brand.accent }}>
              {brand.name.split(/(?=[A-Z])/).pop()}
            </span>
          </span>
        </div>

        {/* Nav items */}
        <div className="ml-auto flex items-center gap-2">
          {["Spot", "Futures", "Markets"].map((item) => (
            <span key={item} className="text-[9px] text-muted-foreground">{item}</span>
          ))}
          <div
            className="rounded px-2 py-0.5 text-[8px] font-semibold"
            style={{ backgroundColor: brand.accent, color: "#fff" }}
          >
            Sign Up
          </div>
        </div>
      </div>

      {/* Minimal page content mockup */}
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <div className="h-2 w-24 rounded-full bg-secondary" />
          <div className="h-1.5 w-32 rounded-full bg-secondary/60" />
        </div>
        <div
          className="h-6 w-6 rounded"
          style={{ backgroundColor: `${brand.accent}15` }}
        />
      </div>

      {/* Label */}
      <div className="px-4 pb-2.5 flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground/60">
          {brand.current ? "Current branding" : "Your brand here"}
        </span>
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: brand.accent }}
        />
      </div>
    </div>
  )
}

export function WhiteLabelSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
          Ready to Rebrand
        </p>
        <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Your exchange. Your brand. Your infrastructure.
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-pretty text-muted-foreground leading-relaxed">
          AetherNode is designed as white-label-ready infrastructure. Replace
          the logo, colors, and domain — everything else works immediately.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-3 max-w-3xl mx-auto">
        {brandMockups.map((brand, i) => (
          <motion.div
            key={brand.name}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
          >
            <NavMockup brand={brand} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
