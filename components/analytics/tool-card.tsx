"use client"

import { ReactNode, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, RefreshCw, Maximize2, Minimize2, Sparkles } from "lucide-react"
import { formatUtc } from "@/lib/time-window"

interface ToolCardProps {
  title: string
  description: string
  children: ReactNode
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  index?: number
  toolName?: string
  /** What the AI is sent. Leave it out and the card has no AI Insight button. */
  aiData?: unknown
  /** Plain description of the time the AI data covers, from its timestamps */
  aiWindow?: string
  symbol?: string
  period?: string
  priceContext?: { currentPrice: number; klines: any[] }
}

export function ToolCard({
  title,
  description,
  children,
  loading,
  error,
  onRetry,
  index = 0,
  toolName,
  aiData,
  aiWindow,
  symbol,
  period,
  priceContext,
}: ToolCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showAiInsight, setShowAiInsight] = useState(false)
  const [aiInsight, setAiInsight] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiAt, setAiAt] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Clear the AI read when the pair or timeframe changes. A data refresh
  // keeps it, and the panel says when it was written.
  useEffect(() => {
    setShowAiInsight(false)
    setAiInsight("")
    setAiAt(null)
  }, [symbol, period])

  const hasAiData = Array.isArray(aiData) ? aiData.length > 0 : Boolean(aiData)

  const handleAiAnalysis = async () => {
    if (!toolName || !hasAiData) return

    setAiLoading(true)
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: toolName,
          data: aiData,
          window: aiWindow,
          symbol: symbol || "BTCUSDT",
          priceContext: priceContext || null,
        }),
      })

      const result = await response.json()
      setAiInsight(result.analysis || "Unable to generate analysis")
      setAiAt(response.ok ? Date.now() : null)
      setShowAiInsight(true)
    } catch (err) {
      setAiInsight("Failed to fetch AI analysis. Please try again.")
      setAiAt(null)
      setShowAiInsight(true)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isFullscreen])

  const cardContent = (
    <motion.div
      initial={isFullscreen ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/90 backdrop-blur-xl transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.15)] h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-5 py-3.5 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {description}
          </p>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border/50 bg-secondary/30 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground shrink-0"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="relative overflow-y-auto p-4 flex-1">
        {loading ? (
          <div className="flex h-[260px] flex-col items-center justify-center gap-3">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary/40"
                  style={{
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <div className="h-4 w-32 animate-shimmer rounded bg-muted/50" />
            <div className="mt-4 h-40 w-full animate-shimmer rounded-lg bg-muted/30" />
          </div>
        ) : error ? (
          <div className="flex h-[260px] flex-col items-center justify-center gap-3">
            <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground text-center max-w-[200px]">
              {error}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-1 flex items-center gap-1.5 rounded-md border border-border/50 bg-secondary/50 px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1">{children}</div>
            
            {/* AI Insight Button - always bottom left */}
            {toolName && hasAiData && (
              <div className="mt-auto pt-3">
                <button
                  onClick={handleAiAnalysis}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary transition-all hover:bg-primary/20 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-3 w-3" />
                  {aiLoading ? "Analyzing..." : "AI Insight"}
                </button>

                {/* AI Insight Panel */}
                <AnimatePresence>
                  {showAiInsight && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="rounded-lg border border-primary/20 bg-card/50 p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                              AI Analysis
                            </span>
                          </div>
                          <button
                            onClick={() => setShowAiInsight(false)}
                            className="text-muted-foreground hover:text-foreground text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {aiInsight}
                        </p>
                        {aiAt && (
                          <p className="mt-2 text-[10px] text-muted-foreground/60">
                            Written {formatUtc(aiAt)} from the data on this card
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )

  if (isFullscreen && mounted) {
    return createPortal(
      <AnimatePresence>
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm overflow-y-auto">
          {/* Floating exit button — top right corner */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="fixed top-4 right-4 z-[60] flex items-center gap-1.5 rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-lg hover:text-foreground hover:bg-secondary transition-all group"
            title="Exit fullscreen (Esc)"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span>Exit</span>
          </button>
          <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl h-[90vh]"
            >
              {cardContent}
            </motion.div>
          </div>
        </div>
      </AnimatePresence>,
      document.body
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
    >
      {cardContent}
    </motion.div>
  )
}
