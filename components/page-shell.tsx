"use client"

import { motion } from "framer-motion"
import { type LucideIcon } from "lucide-react"

interface PageShellProps {
  icon: LucideIcon
  tag: string
  title: string
  description: string
  children: React.ReactNode
}

export function PageShell({ icon: Icon, tag, title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">{tag}</span>
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-pretty text-muted-foreground leading-relaxed max-w-2xl">
          {description}
        </p>
        <div className="mt-6 h-px w-16 bg-primary/40" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.15 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
        {children}
      </div>
    </div>
  )
}

export function InfoCard({ title, description, tag }: { title: string; description: string; tag?: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-5 transition-colors hover:border-primary/20">
      {tag && (
        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider mb-3">
          {tag}
        </span>
      )}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
