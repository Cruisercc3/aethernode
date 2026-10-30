"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { createChart, type IChartApi, type ISeriesApi, type UTCTimestamp, type LogicalRange, type LineWidth, ColorType } from "lightweight-charts"
import { calculateIndicator, getIndicatorDef, type ActiveIndicator, type CandleData } from "@/lib/indicators"
import { ArrowUp, ArrowDown, Minimize2, Maximize2, Trash2, Settings, Eye, EyeOff } from "lucide-react"

interface IndicatorPaneProps {
  indicator: ActiveIndicator
  candles: CandleData[]
  isFirst: boolean
  isLast: boolean
  isLastPane: boolean
  collapsed: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onCollapse: () => void
  onRestore: () => void
  onDelete: () => void
  onOpenSettings: () => void
  onVisibilityToggle: () => void
  /** Current visible logical range from the main chart for time sync */
  visibleLogicalRange: LogicalRange | null
  /** Called when this pane's time scale changes (for bidirectional sync) */
  onTimeRangeChange?: (range: LogicalRange | null) => void
}

export function IndicatorPane({
  indicator,
  candles,
  isFirst,
  isLast,
  isLastPane,
  collapsed,
  onMoveUp,
  onMoveDown,
  onCollapse,
  onRestore,
  onDelete,
  onOpenSettings,
  onVisibilityToggle,
  visibleLogicalRange,
  onTimeRangeChange,
}: IndicatorPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<Map<string, ISeriesApi<any>>>(new Map())
  const [isHovered, setIsHovered] = useState(false)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const isSyncingRef = useRef(false)

  const def = getIndicatorDef(indicator.type)
  const label = def?.label || indicator.type
  const isVisible = indicator.visible !== false

  // Build param string
  const paramStr = Object.entries(indicator.params)
    .filter(([k]) => k !== "source" && k !== "type")
    .map(([, v]) => v)
    .join(", ")

  // Sync time range from main chart
  useEffect(() => {
    if (!chartRef.current || !visibleLogicalRange || collapsed) return
    isSyncingRef.current = true
    try {
      chartRef.current.timeScale().setVisibleLogicalRange(visibleLogicalRange)
    } catch {
      // range may be invalid
    }
    // Small delay to prevent feedback loop
    requestAnimationFrame(() => {
      isSyncingRef.current = false
    })
  }, [visibleLogicalRange, collapsed])

  // Create/update chart
  useEffect(() => {
    if (!containerRef.current || collapsed) return

    // Clean up existing
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      seriesRef.current.clear()
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#888",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(136,136,136,0.06)" },
        horzLines: { color: "rgba(136,136,136,0.06)", style: 3 },
      },
      timeScale: {
        visible: isLastPane,
        borderColor: "#1a1a2e",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 0,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
        autoScale: true,
      },
      crosshair: {
        horzLine: { visible: true, labelVisible: true, color: "rgba(136,136,136,0.3)" },
        vertLine: { visible: true, labelVisible: isLastPane, color: "rgba(255,255,255,0.15)", style: 3, width: 1 },
      },
      handleScroll: { vertTouchDrag: false },
      handleScale: {
        axisPressedMouseMove: { price: true, time: false },
        pinch: true,
        mouseWheel: true,
      },
    })

    chartRef.current = chart

    // Listen for time range changes from this pane (for bidirectional sync)
    if (onTimeRangeChange) {
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (!isSyncingRef.current) {
          onTimeRangeChange(range)
        }
      })
    }

    // Calculate indicator data
    if (candles.length > 0 && isVisible) {
      try {
        const result = calculateIndicator(indicator.type, candles, indicator.params as Record<string, number | string>)
        const mainColor = indicator.color || def?.defaultColor || "#2196F3"
        const extraColors = { ...(def?.extraColors || {}), ...(indicator.extraColors || {}) }

        Object.entries(result).forEach(([key, data]) => {
          if (!data || data.length === 0) return

          // Histogram for MACD, Awesome Oscillator, and Volume
          if (key === "histogram") {
            const isVolume = indicator.type === "VOL"
            const series = chart.addHistogramSeries({
              color: isVolume ? "rgba(34,197,94,0.35)" : (extraColors.histogram || "#26A69A"),
              priceScaleId: "right",
              priceFormat: isVolume ? { type: "volume" as any } : { type: "price", precision: 4, minMove: 0.0001 },
            })
            let histData: any[]
            if (isVolume) {
              histData = data.map((d, i) => {
                const candle = candles[i]
                const isUp = candle ? candle.close >= candle.open : true
                return {
                  time: d.time,
                  value: d.value,
                  color: isUp
                    ? (indicator.extraColors?.falling ? indicator.color || "rgba(34,197,94,0.35)" : "rgba(34,197,94,0.35)")
                    : (indicator.extraColors?.falling || "rgba(239,68,68,0.35)"),
                }
              })
            } else {
              histData = data.map((d) => ({
                time: d.time,
                value: d.value,
                color: d.value >= 0
                  ? "rgba(38, 166, 154, 0.6)"
                  : "rgba(239, 83, 80, 0.6)",
              }))
            }
            series.setData(histData as any)
            seriesRef.current.set(key, series)
            return
          }

          const color = key === "main"
            ? mainColor
            : key === "signal"
              ? extraColors.signal || "#FF6D00"
              : key === "d"
                ? extraColors.d || "#FF6D00"
                : key === "plusDI"
                  ? extraColors.plusDI || "#4CAF50"
                  : key === "minusDI"
                    ? extraColors.minusDI || "#ef4444"
                    : mainColor

          const series = chart.addLineSeries({
            color,
            lineWidth: (indicator.lineWidth || 2) as LineWidth,
            priceScaleId: "right",
            priceFormat: { type: "price", precision: 4, minMove: 0.0001 },
          })
          series.setData(data)
          seriesRef.current.set(key, series)
        })

        // Add reference lines for specific indicators
        addReferenceLines(chart, indicator.type)
      } catch {
        // Calculation failed
      }
    }

    // Sync range after data is set
    if (visibleLogicalRange) {
      try {
        chart.timeScale().setVisibleLogicalRange(visibleLogicalRange)
      } catch {
        // range may not be valid yet
      }
    }

    // Resize observer
    resizeObserverRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (chartRef.current && width > 0 && height > 0) {
          chartRef.current.applyOptions({ width, height })
        }
      }
    })
    resizeObserverRef.current.observe(containerRef.current)

    return () => {
      resizeObserverRef.current?.disconnect()
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current.clear()
      }
    }
  }, [indicator, candles, collapsed, def, isLastPane, isVisible])

  // Update time scale visibility when isLastPane changes
  useEffect(() => {
    if (chartRef.current && !collapsed) {
      chartRef.current.applyOptions({
        timeScale: {
          visible: isLastPane,
        },
      })
    }
  }, [isLastPane, collapsed])

  return (
    <div
      className={cn(
        "relative border-t border-border/20 bg-card transition-all",
        collapsed ? "h-[28px]" : "h-[120px]"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Indicator Ticker Badge - Top Left (always visible, like TradingView) */}
      <div className="absolute top-1 left-2 z-10 flex items-center gap-1">
        <div className="flex items-center gap-1.5 rounded border border-border/40 bg-card/95 backdrop-blur-sm px-1.5 py-0.5 shadow-sm">
          {/* Color Dot */}
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: isVisible ? (indicator.color || def?.defaultColor || "#2196F3") : "#555" }}
          />
          {/* Label + Params */}
          <span
            className="text-[10px] font-medium"
            style={{ color: isVisible ? (indicator.color || def?.defaultColor) : "#888" }}
          >
            {label}
            {paramStr && <span className="text-muted-foreground/60 ml-0.5">({paramStr})</span>}
          </span>

          {/* Eye toggle */}
          <button
            onClick={onVisibilityToggle}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title={isVisible ? "Hide" : "Show"}
          >
            {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Settings"
          >
            <Settings className="h-3 w-3" />
          </button>

          {/* Collapse/Restore */}
          <button
            onClick={collapsed ? onRestore : onCollapse}
            className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title={collapsed ? "Restore pane" : "Collapse pane"}
          >
            {collapsed ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="rounded p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Hover Controls - Top Right (reorder only) */}
      <div
        className={cn(
          "absolute top-1 right-12 z-10 flex items-center gap-0.5 transition-all",
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {!isFirst && (
          <button
            onClick={onMoveUp}
            className="h-6 w-6 rounded flex items-center justify-center border border-border/40 bg-card/90 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Move pane up"
          >
            <ArrowUp className="h-3 w-3" />
          </button>
        )}
        {!isLast && (
          <button
            onClick={onMoveDown}
            className="h-6 w-6 rounded flex items-center justify-center border border-border/40 bg-card/90 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Move pane down"
          >
            <ArrowDown className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Chart Container */}
      {!collapsed && (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  )
}

// ─── Reference Lines for Specific Indicators ─────────────────
function addReferenceLines(chart: IChartApi, type: string) {
  const addLine = (value: number, color: string) => {
    const series = chart.addLineSeries({
      color,
      lineWidth: 1,
      lineStyle: 2, // dashed
      priceScaleId: "right",
      crosshairMarkerVisible: false,
      lastValueVisible: false,
      priceLineVisible: false,
    })
    const now = Math.floor(Date.now() / 1000) as UTCTimestamp
    const past = (now - 86400 * 365) as UTCTimestamp
    series.setData([
      { time: past, value },
      { time: now, value },
    ])
  }

  switch (type) {
    case "RSI":
    case "MFI":
      addLine(70, "rgba(239, 83, 80, 0.3)")
      addLine(50, "rgba(136, 136, 136, 0.15)")
      addLine(30, "rgba(38, 166, 154, 0.3)")
      break
    case "STOCH":
    case "STOCHRSI":
      addLine(80, "rgba(239, 83, 80, 0.3)")
      addLine(50, "rgba(136, 136, 136, 0.15)")
      addLine(20, "rgba(38, 166, 154, 0.3)")
      break
    case "WILLIAMSR":
      addLine(-20, "rgba(239, 83, 80, 0.3)")
      addLine(-50, "rgba(136, 136, 136, 0.15)")
      addLine(-80, "rgba(38, 166, 154, 0.3)")
      break
    case "CCI":
      addLine(100, "rgba(239, 83, 80, 0.3)")
      addLine(0, "rgba(136, 136, 136, 0.15)")
      addLine(-100, "rgba(38, 166, 154, 0.3)")
      break
    case "MACD":
    case "AWESOME":
    case "CHAIKIN":
    case "ROC":
    case "MOMENTUM":
    case "TRIX":
    case "CMF":
      addLine(0, "rgba(136, 136, 136, 0.2)")
      break
    case "VOL":
      break
  }
}
