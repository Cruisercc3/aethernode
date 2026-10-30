"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cryptoPairs } from "@/lib/data"
import {
  LayoutGrid,
  Maximize2,
  Minimize2,
  LineChart,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Settings,
  Trash2,
  Palette,
  BarChart3,
} from "lucide-react"
import {
  INDICATOR_DEFINITIONS,
  getIndicatorDef,
  calculateIndicator,
  type ActiveIndicator,
  type CandleData,
  type IndicatorDefinition,
} from "@/lib/indicators"
import { IndicatorSearchPanel } from "@/components/platform/indicator-search-panel"
import { ChartToolsSidebar } from "@/components/platform/chart-tools-sidebar"
import { IndicatorSettingsDialog } from "@/components/platform/indicator-settings-dialog"
import { IndicatorPane } from "@/components/platform/indicator-pane"
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  ColorType,
  CrosshairMode,
  type UTCTimestamp,
  type LogicalRange,
  type LineWidth,
  type Coordinate,
} from "lightweight-charts"

// ─── Color Palette (80 colors) ─────────────────
const COLOR_SWATCHES = [
  // Row 1: Pure whites to blacks
  "#ffffff", "#f5f5f5", "#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252", "#404040", "#262626", "#171717", "#0a0a0a", "#000000",
  // Row 2: Reds
  "#fecaca", "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#450a0a", "#fef2f2", "#fee2e2", "#dc143c",
  // Row 3: Oranges / Ambers
  "#fed7aa", "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12", "#431407", "#ff8c00", "#ff6347", "#e65100",
  // Row 4: Yellows / Limes
  "#fef08a", "#fde047", "#facc15", "#eab308", "#ca8a04", "#a16207", "#854d0e", "#713f12", "#422006", "#fff59d", "#cddc39", "#aeea00",
  // Row 5: Greens
  "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#052e16", "#00e676", "#69f0ae", "#00c853",
  // Row 6: Teals / Cyans
  "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e", "#115e59", "#134e4a", "#042f2e", "#00bcd4", "#00acc1", "#006064",
  // Row 7: Blues
  "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554", "#2196f3", "#1976d2", "#0d47a1",
  // Row 8: Purples / Pinks
  "#d8b4fe", "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87", "#3b0764", "#f0abfc", "#e879f9", "#d946ef", "#a21caf",
]

function ColorPalette({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md border border-border/40 px-2 py-1 hover:border-border/60 transition-colors"
        style={{ backgroundColor: "#2a2a3a" }}
      >
        <div className="h-4 w-6 rounded" style={{ backgroundColor: value }} />
        <span className="text-[10px] font-mono text-muted-foreground">{value}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div
          className="absolute left-0 z-[60] mt-1 w-[268px] rounded-lg border border-border/40 p-2.5 shadow-xl"
          style={{ backgroundColor: "#252535" }}
        >
          <div className="grid grid-cols-12 gap-[3px]">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c}
                onClick={() => { onChange(c); setOpen(false) }}
                className={cn(
                  "h-[18px] w-[18px] rounded-sm transition-transform hover:scale-125",
                  value === c && "ring-1.5 ring-primary ring-offset-1 ring-offset-background"
                )}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors duration-200",
        checked ? "bg-primary" : "bg-border/60"
      )}
    >
      <div
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

// ─── Constants ─────────────────────────────────────
const TIMEFRAMES = [
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "30m", value: "30m" },
  { label: "1H", value: "1h" },
  { label: "2H", value: "2h" },
  { label: "4H", value: "4h" },
  { label: "6H", value: "6h" },
  { label: "12H", value: "12h" },
  { label: "1D", value: "1d" },
  { label: "3D", value: "3d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1M" },
]

const DEFAULT_VISIBLE_TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"]

const PAIRS = cryptoPairs.map((p) => p.symbol)

// ─── Chart Types ───────────────────────────────────
type ChartType = "Candlestick" | "Bar" | "Line" | "Area" | "Baseline"

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "Candlestick", label: "Candles" },
  { value: "Bar", label: "Bars" },
  { value: "Line", label: "Line" },
  { value: "Area", label: "Area" },
  { value: "Baseline", label: "Baseline" },
]

// ─── Indicator types imported from lib/indicators ───

// ─── Drawing types ────────────────────────────────
interface DrawingPoint {
  time: number   // UTC timestamp (seconds) - chart coordinate
  price: number  // price value - chart coordinate
}

interface Drawing {
  id: string
  tool: string
  points: DrawingPoint[]
  color: string
  lineWidth: number
  lineStyle?: "solid" | "dashed" | "dotted"
  locked?: boolean
  hidden?: boolean
  zIndex?: number
  showPriceLabels?: boolean
  showBarRange?: boolean
}

interface DrawingContextMenu {
  x: number
  y: number
  drawingId: string
}

interface DrawingSettingsPanel {
  drawingId: string
  tab: "style" | "text"
}

// ─── Single chart (TradingView lightweight-charts) ─
interface SingleChartProps {
  pair: string
  showPairSelector?: boolean
  isFullscreen?: boolean
  onPairChange?: (pair: string) => void
  activeIndicators?: ActiveIndicator[]
  onIndicatorsChange?: (indicators: ActiveIndicator[]) => void
  activeTool?: string | null
  onToolSelect?: (tool: string | null) => void
  // View controls (passed from CandlestickChartArea)
  viewMode?: "single" | "multi"
  onToggleViewMode?: () => void
  onToggleFullscreen?: () => void
  multiLayout?: MultiLayout
  showLayoutPicker?: boolean
  onShowLayoutPicker?: () => void
  onSelectLayout?: (layout: MultiLayout) => void
  layoutPickerRef?: React.RefObject<HTMLDivElement | null>
}

// Geometry helper: distance from point (px,py) to line segment (x1,y1)-(x2,y2)
function distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq
  t = Math.max(0, Math.min(1, t))
  const projX = x1 + t * dx
  const projY = y1 + t * dy
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
}

function pairToSymbol(pair: string): string {
  return pair.replace("/", "")
}

function SingleChart({
  pair,
  showPairSelector,
  isFullscreen,
  onPairChange,
  activeIndicators = [],
  onIndicatorsChange,
  viewMode,
  onToggleViewMode,
  onToggleFullscreen,
  multiLayout,
  showLayoutPicker,
  onShowLayoutPicker,
  onSelectLayout,
  layoutPickerRef,
  activeTool,
  onToolSelect,
}: SingleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<any> | null>(null)
  // Volume is now handled entirely as a pane indicator (VOL type)
  const wsRef = useRef<WebSocket | null>(null)
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map())
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [drawingInProgress, setDrawingInProgress] = useState<DrawingPoint[]>([])
  const isDrawingRef = useRef(false)
  const [drawingContextMenu, setDrawingContextMenu] = useState<DrawingContextMenu | null>(null)
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettingsPanel | null>(null)

  // Drag-to-move / resize state for placed drawings (cursor tool active)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  // anchorIndex: null = dragging whole line, number = dragging that endpoint (resize)
  const dragStartRef = useRef<{
    chartPoint: DrawingPoint
    origPoints: DrawingPoint[]
    anchorIndex: number | null
  } | null>(null)
  // Selected drawing — shows resize handles; clicking background deselects
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null)
  const selectedDrawingIdRef = useRef<string | null>(null)
  // hovered drawing id (drives cursor style only, not handle rendering)
  const [hoveredDrawingId, setHoveredDrawingId] = useState<string | null>(null)
  const hoveredDrawingIdRef = useRef<string | null>(null)

  const [selectedTf, setSelectedTf] = useState("1h")
  const [loading, setLoading] = useState(true)
  const [showIndicatorMenu, setShowIndicatorMenu] = useState(false)
  const [showTimeframeMenu, setShowTimeframeMenu] = useState(false)
  const [showChartTypeMenu, setShowChartTypeMenu] = useState(false)
  const [chartType, setChartType] = useState<ChartType>("Candlestick")
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; price?: number } | null>(null)
  const [showChartSettings, setShowChartSettings] = useState(false)
  const [editingIndicator, setEditingIndicator] = useState<string | null>(null)
  const [autoScale, setAutoScale] = useState(true)
  const autoScaleRef = useRef(true)
  const [ohlcData, setOhlcData] = useState<{ open: number; high: number; low: number; close: number } | null>(null)
  // showScaleControls removed – A button is now always visible
  const [storedCandles, setStoredCandles] = useState<CandleData[]>([])
  const [favoriteIndicators, setFavoriteIndicators] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("indicator-favorites")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [paneCollapsed, setPaneCollapsed] = useState<Record<string, boolean>>({})
  const [paneOrder, setPaneOrder] = useState<string[]>([])
  // Volume-related cache for the separate volume indicator pane
  const volumeCacheRef = useRef<Map<number, { open: number; close: number; volume: number }>>(new Map())

  // Time sync: main chart broadcasts its visible range to all pane indicators
  const [mainVisibleRange, setMainVisibleRange] = useState<LogicalRange | null>(null)
  const isSyncingFromPaneRef = useRef(false)

  // Auto-add a Volume indicator pane on mount if one doesn't already exist
  const hasAutoAddedVolume = useRef(false)
  useEffect(() => {
    if (hasAutoAddedVolume.current) return
    hasAutoAddedVolume.current = true
    const hasVolume = activeIndicators.some((ind) => ind.type === "VOL")
    if (!hasVolume) {
      const volDef = INDICATOR_DEFINITIONS.find((d) => d.type === "VOL")
      if (volDef) {
        const volIndicator: ActiveIndicator = {
          id: `VOL-default`,
          type: "VOL",
          params: { ...volDef.defaultParams },
          color: volDef.defaultColor,
          extraColors: volDef.extraColors ? { ...volDef.extraColors } : undefined,
          visible: true,
          lineWidth: 2,
        }
        onIndicatorsChange?.([...activeIndicators, volIndicator])
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("indicator-favorites", JSON.stringify(favoriteIndicators))
    }
  }, [favoriteIndicators])

  const toggleFavorite = useCallback((type: string) => {
    setFavoriteIndicators((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }, [])

  // Separate overlay and pane indicators using useMemo to prevent re-creation
  const overlayIndicators = useMemo(() => {
    return activeIndicators.filter((ind) => {
      const def = getIndicatorDef(ind.type)
      return def?.category === "overlay"
    })
  }, [activeIndicators])

  const paneIndicators = useMemo(() => {
    return activeIndicators.filter((ind) => {
      const def = getIndicatorDef(ind.type)
      return def?.category === "pane"
    })
  }, [activeIndicators])

  // Keep pane order in sync
  useEffect(() => {
    const paneIds = paneIndicators.map((p) => p.id)
    setPaneOrder((prev) => {
      const existing = prev.filter((id) => paneIds.includes(id))
      const newOnes = paneIds.filter((id) => !existing.includes(id))
      if (existing.length === prev.length && newOnes.length === 0) return prev
      return [...existing, ...newOnes]
    })
  }, [paneIndicators])

  const orderedPaneIndicators = useMemo(() => {
    return paneOrder
      .map((id) => paneIndicators.find((p) => p.id === id))
      .filter(Boolean) as ActiveIndicator[]
  }, [paneOrder, paneIndicators])

  // Toggle main chart time scale: hide when pane indicators exist (last pane shows it)
  const hasPaneIndicators = orderedPaneIndicators.length > 0
  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.applyOptions({
      timeScale: { visible: !hasPaneIndicators },
    })
  }, [hasPaneIndicators])

  // Bidirectional sync: when a pane changes its time range, sync main chart
  const handlePaneTimeRangeChange = useCallback((range: LogicalRange | null) => {
    if (!chartRef.current || !range) return
    isSyncingFromPaneRef.current = true
    try {
      chartRef.current.timeScale().setVisibleLogicalRange(range)
    } catch {}
    requestAnimationFrame(() => {
      isSyncingFromPaneRef.current = false
    })
  }, [])

  // Handle visibility toggle for pane indicators
  const handleToggleIndicatorVisibility = useCallback((id: string) => {
    if (!onIndicatorsChange) return
    const updated = activeIndicators.map((ind) =>
      ind.id === id ? { ...ind, visible: ind.visible === false ? true : false } : ind
    )
    onIndicatorsChange(updated)
  }, [activeIndicators, onIndicatorsChange])

  const chartTypeRef = useRef<ChartType>(chartType)
  chartTypeRef.current = chartType
  const [chartSettings, setChartSettings] = useState({
    // Symbol - candlestick colors
    bodyUpColor: "#22c55e",
    bodyDownColor: "#ef4444",
    borderUpColor: "#22c55e",
    borderDownColor: "#ef4444",
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444",
    timezone: "UTC",
    // Status line
    showChartValues: true,

    // Canvas - background
    bgMode: "solid" as "solid" | "gradient",
    bgColor: "#0a0a14",
    bgGradientFrom: "#0a0a14",
    bgGradientTo: "#141428",
    // Canvas - grid
    gridMode: "both" as "both" | "vertical" | "horizontal" | "none",
    gridColor: "#1a1a2e",
    // Canvas - crosshair
    crosshairColor: "#888888",
    crosshairLineWidth: 1 as 1 | 2 | 3 | 4,
    crosshairLineType: "dotted" as "solid" | "dashed" | "dotted",
  })

  const symbol = pairToSymbol(pair)

  // ── Helper: Create appropriate series based on chart type ──
  const createMainSeries = useCallback((chart: IChartApi, type: ChartType) => {
    const commonColor = "#2196F3"
    
    switch (type) {
      case "Candlestick":
        return chart.addCandlestickSeries({
          upColor: chartSettings.bodyUpColor,
          downColor: chartSettings.bodyDownColor,
          borderUpColor: chartSettings.borderUpColor,
          borderDownColor: chartSettings.borderDownColor,
          wickUpColor: chartSettings.wickUpColor,
          wickDownColor: chartSettings.wickDownColor,
        })
      case "Bar":
        return chart.addBarSeries({
          upColor: chartSettings.bodyUpColor,
          downColor: chartSettings.bodyDownColor,
          thinBars: false,
        })
      case "Line":
        return chart.addLineSeries({
          color: commonColor,
          lineWidth: 2,
        })
      case "Area":
        return chart.addAreaSeries({
          topColor: `${commonColor}80`,
          bottomColor: `${commonColor}10`,
          lineColor: commonColor,
          lineWidth: 2,
        })
      case "Baseline":
        return chart.addBaselineSeries({
          topLineColor: chartSettings.bodyUpColor,
          topFillColor1: `${chartSettings.bodyUpColor}80`,
          topFillColor2: `${chartSettings.bodyUpColor}20`,
          bottomLineColor: chartSettings.bodyDownColor,
          bottomFillColor1: `${chartSettings.bodyDownColor}80`,
          bottomFillColor2: `${chartSettings.bodyDownColor}20`,
        })
      default:
        return chart.addCandlestickSeries({
          upColor: chartSettings.bodyUpColor,
          downColor: chartSettings.bodyDownColor,
          borderUpColor: chartSettings.borderUpColor,
          borderDownColor: chartSettings.borderDownColor,
          wickUpColor: chartSettings.wickUpColor,
          wickDownColor: chartSettings.wickDownColor,
        })
    }
  }, [chartSettings, chartType])

  // ── Helper: Calculate SMA ──
  // ── Apply overlay indicators to chart (uses centralized calculations) ──
  const applyIndicators = useCallback((candles: CandlestickData[], forceRecreate = false) => {
    if (!chartRef.current || candles.length === 0) return

    if (forceRecreate) {
      indicatorSeriesRef.current.forEach((series) => {
        try { chartRef.current?.removeSeries(series) } catch {}
      })
      indicatorSeriesRef.current.clear()
    }

    // Compute overlay indicators inside to avoid dependency
    const currentOverlayIndicators = activeIndicators.filter((ind) => {
      const def = getIndicatorDef(ind.type)
      return def?.category === "overlay"
    })

    // Only apply overlay indicators to main chart
    currentOverlayIndicators.forEach((indicator) => {
      // Convert candles to CandleData format for calculation
      const candleData: CandleData[] = candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: (c as any).volume || 1,
      }))
      const existingSeries = indicatorSeriesRef.current.get(indicator.id)
      
      if (existingSeries && !forceRecreate) {
        try {
          existingSeries.applyOptions({
            color: indicator.color || "#2196F3",
            lineWidth: (indicator.lineWidth || 2) as LineWidth,
            visible: indicator.visible !== false,
          })
          return
        } catch {}
      }
      
      if (indicator.visible === false && !existingSeries) return
      
      if (existingSeries) {
        try { chartRef.current?.removeSeries(existingSeries) } catch {}
        indicatorSeriesRef.current.delete(indicator.id)
      }
      
      try {
        const result = calculateIndicator(indicator.type, candleData, indicator.params as Record<string, number | string>)
        const def = getIndicatorDef(indicator.type)
        const mainColor = indicator.color || def?.defaultColor || "#2196F3"
        const extraColors = { ...(def?.extraColors || {}), ...(indicator.extraColors || {}) }

        Object.entries(result).forEach(([key, data]) => {
          if (!data || data.length === 0) return
          const color = key === "main" ? mainColor : extraColors[key] || mainColor
          const seriesKey = key === "main" ? indicator.id : `${indicator.id}-${key}`
          const series = chartRef.current!.addLineSeries({
            color,
            lineWidth: (indicator.lineWidth || 2) as LineWidth,
            title: key === "main" ? `${indicator.type}` : "",
            visible: indicator.visible !== false,
            lastValueVisible: false,
            priceLineVisible: false,
          })
          series.setData(data)
          indicatorSeriesRef.current.set(seriesKey, series)
        })
      } catch {}
    })
  }, [activeIndicators])

  // Keep a stable ref to applyIndicators so chart-init effect doesn't depend on it
  const applyIndicatorsRef = useRef(applyIndicators)
  applyIndicatorsRef.current = applyIndicators

  // ── Fetch historical klines (returns parsed candle arrays for caller) ──
  const fetchKlinesForChart = useCallback(
    async (
      sym: string,
      interval: string,
      signal: AbortSignal,
    ): Promise<{ candles: CandlestickData[]; volumes: HistogramData[] } | null> => {
      // Binance/Bybit max per request is 1000; OKX max is 300
      const limitMap: Record<string, number> = {
        "1m": 1000, "3m": 1000, "5m": 1000, "15m": 1000,
        "30m": 1000, "1h": 1000, "2h": 1000, "4h": 1000,
        "6h": 1000, "12h": 1000, "1d": 500, "3d": 500,
        "1w": 500, "1M": 500,
      }
      const limit = limitMap[interval] || 1000

      let raw: unknown[][] | null = null

      // Use server-side proxy to avoid CORS issues
      try {
        const proxyUrl = `/api/binance/klines?symbol=${sym}&interval=${interval}&limit=${limit}`
        const res = await fetch(proxyUrl, { cache: "no-store", signal })
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 1) raw = data
        }
      } catch (e: any) {
        if (e.name === "AbortError") return null
      }

      // Fallback: direct Binance Futures API
      if (!raw) {
        try {
          const directUrl = `https://fapi.binance.com/fapi/v1/klines?symbol=${sym}&interval=${interval}&limit=${limit}`
          const res = await fetch(directUrl, { cache: "no-store", signal })
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 1) raw = data
          }
        } catch (e: any) {
          if (e.name === "AbortError") return null
        }
      }

      // Fallback: direct Binance Spot API
      if (!raw) {
        try {
          const spotUrl = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`
          const res = await fetch(spotUrl, { cache: "no-store", signal })
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 1) raw = data
          }
        } catch (e: any) {
          if (e.name === "AbortError") return null
        }
      }

      if (!raw || raw.length === 0) return null

      const candles: CandlestickData[] = []
      const volumes: HistogramData[] = []

      for (const k of raw) {
        const timeMs = Number(k[0])
        if (isNaN(timeMs) || timeMs === 0) continue
        const time = Math.floor(timeMs / 1000) as UTCTimestamp
        const open = parseFloat(String(k[1]))
        const high = parseFloat(String(k[2]))
        const low = parseFloat(String(k[3]))
        const close = parseFloat(String(k[4]))
        const volume = parseFloat(String(k[5]))
        if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) continue
        candles.push({ time, open, high, low, close })
        volumes.push({
          time,
          value: volume,
          color: close >= open ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
        })
      }

      candles.sort((a, b) => (a.time as number) - (b.time as number))
      volumes.sort((a, b) => (a.time as number) - (b.time as number))

      // Deduplicate
      const deduped: CandlestickData[] = []
      const dedupedVol: HistogramData[] = []
      const seen = new Set<number>()
      for (let i = 0; i < candles.length; i++) {
        const t = candles[i].time as number
        if (!seen.has(t)) {
          seen.add(t)
          deduped.push(candles[i])
          dedupedVol.push(volumes[i])
        }
      }

      // ── Gap-fill: for minute-level intervals, forward-fill missing candles
      // so the chart renders a continuous baseline instead of empty blocks.
      const intervalMs: Record<string, number> = {
        "1m": 60, "3m": 180, "5m": 300, "15m": 900, "30m": 1800,
        "1h": 3600, "2h": 7200, "4h": 14400, "6h": 21600, "12h": 43200,
        "1d": 86400, "3d": 259200, "1w": 604800,
      }
      const stepSec = intervalMs[interval]
      const filled: CandlestickData[] = []
      const filledVol: HistogramData[] = []
      if (stepSec && deduped.length > 1) {
        for (let i = 0; i < deduped.length; i++) {
          filled.push(deduped[i])
          filledVol.push(dedupedVol[i])
          if (i < deduped.length - 1) {
            const gapSeconds = (deduped[i + 1].time as number) - (deduped[i].time as number)
            const missingBars = Math.round(gapSeconds / stepSec) - 1
            // Only fill small gaps (≤10 bars) to avoid creating false history
            if (missingBars > 0 && missingBars <= 10) {
              const lastClose = deduped[i].close
              for (let g = 1; g <= missingBars; g++) {
                const t = ((deduped[i].time as number) + g * stepSec) as UTCTimestamp
                filled.push({ time: t, open: lastClose, high: lastClose, low: lastClose, close: lastClose })
                filledVol.push({ time: t, value: 0, color: "rgba(100,100,100,0.1)" })
              }
            }
          }
        }
      }

      return {
        candles: filled.length > 0 ? filled : deduped,
        volumes: filledVol.length > 0 ? filledVol : dedupedVol,
      }
    },
    []
  )

  // ── WebSocket for real-time updates (tries futures, then spot) ──
  const connectWs = useCallback(
    (sym: string, interval: string) => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      const stream = `${sym.toLowerCase()}@kline_${interval}`
      // Spot first — highest volume for all altcoins, futures as secondary,
      // plus Bybit spot as a high-volume tertiary fallback.
      const bybitInterval = (() => {
        const m: Record<string, string> = {
          "1m":"1","3m":"3","5m":"5","15m":"15","30m":"30",
          "1h":"60","2h":"120","4h":"240","6h":"360","12h":"720",
          "1d":"D","1w":"W","1M":"M",
        }
        return m[interval] || "1"
      })()
      const wsUrls = [
        `wss://stream.binance.com:9443/ws/${stream}`,
        `wss://fstream.binance.com/ws/${stream}`,
        `wss://stream.bybit.com/v5/public/spot`,
      ]
      // Bybit requires a subscribe message; track if we're on bybit
      let isBybit = false

      let urlIndex = 0
      const tryConnect = () => {
        if (urlIndex >= wsUrls.length) return
        isBybit = wsUrls[urlIndex].includes("bybit")
        const ws = new WebSocket(wsUrls[urlIndex])

        ws.onopen = () => {
          if (isBybit) {
            // Bybit requires explicit subscription
            ws.send(JSON.stringify({
              op: "subscribe",
              args: [`kline.${bybitInterval}.${sym}`],
            }))
          }
        }

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)

            let time: UTCTimestamp, open: number, high: number, low: number, close: number, volume: number

            if (isBybit) {
              // Bybit v5 kline: { topic, data: [{ start, end, open, close, high, low, volume }] }
              if (!msg.data || !Array.isArray(msg.data) || msg.data.length === 0) return
              const d = msg.data[0]
              time = Math.floor(Number(d.start) / 1000) as UTCTimestamp
              open = parseFloat(d.open); high = parseFloat(d.high)
              low = parseFloat(d.low); close = parseFloat(d.close)
              volume = parseFloat(d.volume)
            } else {
              // Binance kline stream
              const k = msg.k
              if (!k) return
              time = Math.floor(Number(k.t) / 1000) as UTCTimestamp
              open = parseFloat(String(k.o)); high = parseFloat(String(k.h))
              low = parseFloat(String(k.l)); close = parseFloat(String(k.c))
              volume = parseFloat(String(k.v))
            }

            if (isNaN(open) || isNaN(close)) return

            // Update OHLC data
            setOhlcData({ open, high, low, close })

            if (candleSeriesRef.current) {
              const ct = chartTypeRef.current
              if (ct === "Line" || ct === "Area" || ct === "Baseline") {
                candleSeriesRef.current.update({ time, value: close })
              } else {
                candleSeriesRef.current.update({ time, open, high, low, close })
              }
            }
            volumeCacheRef.current.set(time as number, { open, close, volume })
          } catch {
            // ignore bad frames
          }
        }

        ws.onerror = () => {
          ws.close()
          urlIndex++
          if (urlIndex < wsUrls.length) {
            setTimeout(tryConnect, 500)
          }
        }
        wsRef.current = ws
      }
      tryConnect()
    },
    []
  )

  // Keep stable refs so the chart-init effect doesn't depend on them
  const createMainSeriesRef = useRef(createMainSeries)
  createMainSeriesRef.current = createMainSeries
  const fetchKlinesForChartRef = useRef(fetchKlinesForChart)
  fetchKlinesForChartRef.current = fetchKlinesForChart
  const connectWsRef = useRef(connectWs)
  connectWsRef.current = connectWs

  // We keep a parallel store of OHLC candles so historical-load and
  // indicator reapply always have full candle data, even when the
  // visible series type is Line/Area/Baseline.
  const ohlcCacheRef = useRef<CandlestickData[]>([])

  // ── Create / destroy chart ──
  useEffect(() => {
    if (!chartContainerRef.current) return

    // Always reset autoScale on timeframe/pair/chartType change so new data is visible
    autoScaleRef.current = true
    setAutoScale(true)

    const containerEl = chartContainerRef.current
    // Ensure the container is clean before creating a new chart
    while (containerEl.firstChild) {
      containerEl.removeChild(containerEl.firstChild)
    }

    const chart = createChart(containerEl, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#888",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1a1a2e" },
        horzLines: { color: "#1a1a2e" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(255,255,255,0.15)", style: 3, width: 1 },
        horzLine: { color: "rgba(255,255,255,0.15)", style: 3, width: 1 },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        scaleMargins: { top: 0.05, bottom: 0.05 },
        autoScale: true,
        entireTextOnly: true,
        ticksVisible: false,
        minimumWidth: 65,
      },
      timeScale: {
        borderColor: "#1a1a2e",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 15,
      },
      handleScroll: { vertTouchDrag: false },
      handleScale: {
        axisPressedMouseMove: { price: true, time: true },
        pinch: true,
        mouseWheel: true,
      },
    })

    const candleSeries = createMainSeriesRef.current(chart, chartType)

    chartRef.current = chart
    candleSeriesRef.current = candleSeries
    ohlcCacheRef.current = []

    // Initial resize to match container
    const { width: initW, height: initH } = containerEl.getBoundingClientRect()
    if (initW > 0 && initH > 0) {
      chart.resize(initW, initH)
    }

    // Responsive resize
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) chart.resize(width, height)
      }
    })
    ro.observe(containerEl)

    // ── Historical data lazy-loading on scroll/zoom to left edge ──
    let isLoadingMore = false
    let noMoreHistory = false   // true once Binance returns 0 new candles
    let aborted = false
    let consecutiveFailures = 0

    const loadMoreHistory = () => {
      if (aborted || isLoadingMore || noMoreHistory) return

      const cached = ohlcCacheRef.current
      if (!cached || cached.length === 0) return

      const firstCandle = cached[0]
      if (!firstCandle) return

      // Dual check: use both logical range and time range for reliability
      const logicalRange = chart.timeScale().getVisibleLogicalRange()
      const visibleRange = chart.timeScale().getVisibleRange()

      let shouldLoad = false

      // Check 1: Logical range - if left edge is near or past index 0
      if (logicalRange) {
        if (logicalRange.from <= 10) {
          shouldLoad = true
        }
      }

      // Check 2: Time range - if visible left edge is near the oldest candle
      if (!shouldLoad && visibleRange) {
        const firstLoadedTime = firstCandle.time as number
        const visibleFrom = visibleRange.from as number
        const visibleSpan = (visibleRange.to as number) - visibleFrom
        const buffer = visibleSpan * 0.3
        if (visibleFrom <= firstLoadedTime + buffer) {
          shouldLoad = true
        }
      }

      if (!shouldLoad) return

      isLoadingMore = true
      const firstLoadedTime = firstCandle.time as number
      const endTime = firstLoadedTime * 1000 - 1
      const sym = pairToSymbol(pair)

      fetch(`/api/binance/klines?symbol=${sym}&interval=${selectedTf}&limit=1000&endTime=${endTime}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((raw: unknown[][]) => {
          if (aborted) { isLoadingMore = false; return }
          if (!Array.isArray(raw)) {
            consecutiveFailures++
            if (consecutiveFailures >= 3) noMoreHistory = true
            isLoadingMore = false
            return
          }
          if (raw.length === 0) {
            noMoreHistory = true
            isLoadingMore = false
            return
          }

          consecutiveFailures = 0

          const newCandles: CandlestickData[] = []
          const newVolumes: HistogramData[] = []

          for (const k of raw) {
            const timeMs = Number(k[0])
            if (isNaN(timeMs) || timeMs === 0) continue
            const time = Math.floor(timeMs / 1000) as UTCTimestamp
            if (time >= firstLoadedTime) continue

            const open = parseFloat(String(k[1]))
            const high = parseFloat(String(k[2]))
            const low = parseFloat(String(k[3]))
            const close = parseFloat(String(k[4]))
            const volume = parseFloat(String(k[5]))
            if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) continue

            newCandles.push({ time, open, high, low, close })
            newVolumes.push({
              time,
              value: volume,
              color: close >= open ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
            })
          }

          if (newCandles.length === 0) {
            noMoreHistory = true
            isLoadingMore = false
            return
          }
          if (aborted || !candleSeriesRef.current) {
            isLoadingMore = false
            return
          }

          // Merge new historical candles into the ohlc cache
          const merged = [...newCandles, ...ohlcCacheRef.current].sort(
            (a, b) => (a.time as number) - (b.time as number)
          )
          const deduped: CandlestickData[] = []
          const seen = new Set<number>()
          for (const c of merged) {
            const t = c.time as number
            if (!seen.has(t)) { seen.add(t); deduped.push(c) }
          }
          ohlcCacheRef.current = deduped

          // Update the visible series
          const ct = chartTypeRef.current
          try {
            if (ct === "Line" || ct === "Area" || ct === "Baseline") {
              candleSeriesRef.current!.setData(
                deduped.map(c => ({ time: c.time, value: c.close }))
              )
            } else {
              candleSeriesRef.current!.setData(deduped)
            }
          } catch {}

          // Build a volume lookup from the new loaded data
          const volLookup = new Map<number, number>()
          for (const v of newVolumes) {
            volLookup.set(v.time as number, v.value)
          }
          // Update stored candles with volume data for the VOL indicator pane
          setStoredCandles(prev => {
            const prevVolMap = new Map<number, number>()
            for (const sc of prev) {
              prevVolMap.set(sc.time as number, sc.volume || 0)
            }
            return deduped.map((c) => ({
              time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close,
              volume: volLookup.get(c.time as number) || prevVolMap.get(c.time as number) || 0,
            }))
          })

          // Reapply indicators with full OHLC data
          applyIndicatorsRef.current(deduped, true)

          isLoadingMore = false
        })
        .catch(() => {
          consecutiveFailures++
          if (consecutiveFailures >= 3) noMoreHistory = true
          isLoadingMore = false
        })
    }

    chart.timeScale().subscribeVisibleLogicalRangeChange(loadMoreHistory)

    // Broadcast main chart's visible range to indicator panes for time sync
    const syncPaneTimes = (range: LogicalRange | null) => {
      if (!isSyncingFromPaneRef.current && range) {
        setMainVisibleRange(range)
      }
    }
    chart.timeScale().subscribeVisibleLogicalRangeChange(syncPaneTimes)

    // ── Initial data fetch ──
    const abortController = new AbortController()
    const sym = pairToSymbol(pair)
    setLoading(true)

    fetchKlinesForChartRef.current(sym, selectedTf, abortController.signal).then((result) => {
      if (abortController.signal.aborted) return
      if (!result || !candleSeriesRef.current || !chartRef.current) {
        setLoading(false)
        connectWsRef.current(sym, selectedTf)
        return
      }

      const { candles, volumes } = result

      // Store full OHLC candles in cache
      ohlcCacheRef.current = candles

      // Set data on the visible series
      const ct = chartTypeRef.current
      if (ct === "Line" || ct === "Area" || ct === "Baseline") {
        candleSeriesRef.current.setData(candles.map(c => ({ time: c.time, value: c.close })))
      } else {
        candleSeriesRef.current.setData(candles)
      }
      // Volume is handled by the separate VOL indicator pane

      // Update OHLC with latest
      if (candles.length > 0) {
        const latest = candles[candles.length - 1]
        setOhlcData({ open: latest.open, high: latest.high, low: latest.low, close: latest.close })
      }

      // Apply indicators
      applyIndicatorsRef.current(candles, true)

      // Store candle data for pane indicators (including volume from the raw volumes array)
      setStoredCandles(candles.map((c, i) => ({
        time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close,
        volume: volumes[i]?.value || 0,
      })))

      // Show the most recent ~150 candles at a comfortable zoom level
      // (like TradingView) so the user can scroll left to load more history
      requestAnimationFrame(() => {
        if (chartRef.current) {
          const totalBars = candles.length
          const visibleBars = Math.min(150, totalBars)
          chartRef.current.timeScale().setVisibleLogicalRange({
            from: totalBars - visibleBars,
            to: totalBars + 5,
          })
        }
      })

      setLoading(false)

      // Connect WebSocket for live updates
      if (!abortController.signal.aborted) {
        connectWsRef.current(sym, selectedTf)
      }
    }).catch(() => {
      if (!abortController.signal.aborted) {
        setLoading(false)
        connectWsRef.current(sym, selectedTf)
      }
    })

    return () => {
      aborted = true
      abortController.abort()
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      ro.disconnect()
  chart.timeScale().unsubscribeVisibleLogicalRangeChange(loadMoreHistory)
  chart.timeScale().unsubscribeVisibleLogicalRangeChange(syncPaneTimes)
  indicatorSeriesRef.current.clear()
      try { chart.remove() } catch {}
      chartRef.current = null
      candleSeriesRef.current = null
      ohlcCacheRef.current = []
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, pair, selectedTf])

  // ── Update auto-scale mode ──
  useEffect(() => {
    autoScaleRef.current = autoScale
    if (!chartRef.current) return
    chartRef.current.priceScale('right').applyOptions({
      autoScale,
      scaleMargins: { top: 0.05, bottom: 0.05 },
    })
  }, [autoScale])



  // ── Track previous indicators to detect param changes ��─
  const prevIndicatorsRef = useRef<ActiveIndicator[]>([])
  
  // ── Re-apply indicators when they change ──
  useEffect(() => {
    if (!chartRef.current) return
    // Always use the OHLC cache for indicators (works regardless of chart type)
    const data = ohlcCacheRef.current
    if (!data || data.length === 0) return

    const needsRecreate =
      prevIndicatorsRef.current.length !== activeIndicators.length ||
      activeIndicators.some((ind) => {
        const prev = prevIndicatorsRef.current.find(p => p.id === ind.id)
        if (!prev) return true
        return JSON.stringify(prev.params) !== JSON.stringify(ind.params)
      }) ||
      prevIndicatorsRef.current.some(prev => !activeIndicators.find(ind => ind.id === prev.id))

    applyIndicatorsRef.current(data, needsRecreate)
    prevIndicatorsRef.current = JSON.parse(JSON.stringify(activeIndicators))

    // Update stored candles for pane indicators (preserve volume from cache)
    setStoredCandles(prev => {
      // Build a volume lookup from previous stored candles
      const volMap = new Map<number, number>()
      for (const sc of prev) {
        volMap.set(sc.time as number, sc.volume || 0)
      }
      return data.map((c) => ({
        time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close,
        volume: (c as any).volume || volMap.get(c.time as number) || 0,
      }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndicators])

  const handleAddIndicator = (def: IndicatorDefinition) => {
    const newIndicator: ActiveIndicator = {
      id: `${def.type}-${Date.now()}`,
      type: def.type,
      params: { ...def.defaultParams },
      color: def.defaultColor,
      extraColors: def.extraColors ? { ...def.extraColors } : undefined,
      visible: true,
      lineWidth: 2,
    }
    onIndicatorsChange?.([...activeIndicators, newIndicator])
    setShowIndicatorMenu(false)
  }

  const handleRemoveIndicator = (id: string) => {
    onIndicatorsChange?.(activeIndicators.filter((ind) => ind.id !== id))
  }

  const handleUpdateIndicator = (id: string, updates: Partial<ActiveIndicator>) => {
    onIndicatorsChange?.(
      activeIndicators.map((ind) => (ind.id === id ? { ...ind, ...updates } : ind))
    )
  }

  // Use a ref for hitTestDrawing so handleRightClick doesn't have a stale reference
  const hitTestDrawingRef = useRef<(px: number, py: number) => string | null>(() => null)

  const handleRightClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!chartRef.current || !chartContainerRef.current) return
    
    const rect = chartContainerRef.current.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    
    // First: check if we hit a drawing
    const hitId = hitTestDrawingRef.current(px, py)
    if (hitId) {
      setDrawingContextMenu({ x: e.clientX, y: e.clientY, drawingId: hitId })
      setContextMenu(null)
      return
    }
    
    // Otherwise show standard chart context menu
    try {
      const price = candleSeriesRef.current?.coordinateToPrice(py)
      setContextMenu({ x: e.clientX, y: e.clientY, price: price ?? undefined })
      setDrawingContextMenu(null)
    } catch {
      setContextMenu({ x: e.clientX, y: e.clientY })
      setDrawingContextMenu(null)
    }
  }, [])

  const copyPriceToClipboard = (price?: number) => {
    if (price) {
      navigator.clipboard.writeText(price.toFixed(2))
    }
    setContextMenu(null)
  }

  const removeAllIndicators = () => {
    onIndicatorsChange?.([])
    setContextMenu(null)
  }

  // ── Drawing Functions ──
  // Helper: Convert chart time/price to pixel coordinates
  const chartToPixel = useCallback((pt: DrawingPoint): { x: number; y: number } | null => {
    if (!chartRef.current || !candleSeriesRef.current) return null
    try {
      const chart = chartRef.current
      const series = candleSeriesRef.current
      
      let x = chart.timeScale().timeToCoordinate(pt.time as UTCTimestamp)
      let y = series.priceToCoordinate(pt.price)
      
      // If x is null (time off screen), try to extrapolate from visible range
      if (x === null) {
        const visibleRange = chart.timeScale().getVisibleRange()
        if (visibleRange) {
          const fromTime = visibleRange.from as number
          const toTime = visibleRange.to as number
          const fromCoord = chart.timeScale().timeToCoordinate(visibleRange.from as UTCTimestamp)
          const toCoord = chart.timeScale().timeToCoordinate(visibleRange.to as UTCTimestamp)
          if (fromCoord !== null && toCoord !== null && toTime !== fromTime) {
            const ratio = (pt.time - fromTime) / (toTime - fromTime)
            x = (fromCoord + ratio * (toCoord - fromCoord)) as Coordinate
          }
        }
      }
      
      // If y is null (price off scale), try to extrapolate
      if (y === null && chartContainerRef.current) {
        const containerHeight = chartContainerRef.current.clientHeight
        // Use the visible price range from the price scale
        const cached = ohlcCacheRef.current
        if (cached.length > 0) {
          // Get min/max visible price approximately
          let minP = Infinity, maxP = -Infinity
          for (const c of cached.slice(-100)) {
            if (c.low < minP) minP = c.low
            if (c.high > maxP) maxP = c.high
          }
          if (maxP > minP) {
            const ratio = (pt.price - minP) / (maxP - minP)
            y = (containerHeight * (1 - ratio) * 0.8 + containerHeight * 0.05) as Coordinate
          }
        }
      }
      
      if (x === null || y === null) return null
      return { x: x as number, y: y as number }
    } catch {
      return null
    }
  }, [])

  // Helper: Convert pixel to chart time/price
  // px/py are relative to the chart container div
  const pixelToChart = useCallback((px: number, py: number): DrawingPoint | null => {
    if (!chartRef.current || !candleSeriesRef.current || !chartContainerRef.current) return null
    try {
      const chart = chartRef.current
      const series = candleSeriesRef.current
      
      let timeVal: number | null = null
      let priceVal: number | null = null
      
      // Try direct coordinate conversion first
      const rawTime = chart.timeScale().coordinateToTime(px)
      if (rawTime !== null) {
        timeVal = rawTime as number
      }
      
      const rawPrice = series.coordinateToPrice(py)
      if (rawPrice !== null) {
        priceVal = rawPrice as number
      }
      
      // If time conversion fails, interpolate from the visible time range
      if (timeVal === null) {
        const visibleRange = chart.timeScale().getVisibleRange()
        if (visibleRange) {
          const fromCoord = chart.timeScale().timeToCoordinate(visibleRange.from as UTCTimestamp)
          const toCoord = chart.timeScale().timeToCoordinate(visibleRange.to as UTCTimestamp)
          if (fromCoord !== null && toCoord !== null && toCoord !== fromCoord) {
            const ratio = (px - fromCoord) / (toCoord - fromCoord)
            timeVal = Math.round((visibleRange.from as number) + ratio * ((visibleRange.to as number) - (visibleRange.from as number)))
          } else {
            const containerWidth = chartContainerRef.current.clientWidth
            const ratio = px / containerWidth
            timeVal = Math.round((visibleRange.from as number) + ratio * ((visibleRange.to as number) - (visibleRange.from as number)))
          }
        }
      }
      
      // If price conversion fails, use last known price as fallback
      if (priceVal === null) {
        const cached = ohlcCacheRef.current
        if (cached.length > 0) {
          priceVal = cached[cached.length - 1].close
        }
      }
      
      if (timeVal === null || priceVal === null) return null
      return { time: timeVal, price: priceVal }
    } catch {
      return null
    }
  }, [])

  const renderDrawings = useCallback(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      // Only resize if dimensions changed
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
      }
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Sort by zIndex, filter out hidden drawings
    const allDrawings = [...drawings].filter(d => !d.hidden).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
    // Anchors are shown only on the selected drawing (click-to-select model)
    const activeHighlightId = selectedDrawingIdRef.current
    if (drawingInProgress.length > 0 && activeTool) {
      allDrawings.push({
        id: "in-progress",
        tool: activeTool,
        points: drawingInProgress,
        color: "#2196F3",
        lineWidth: 2,
      })
    }
    
    // Helper to draw anchor circles at drawing endpoints (TradingView-style)
    // highlighted = true when hovered or being dragged → larger handle
    const drawAnchor = (x: number, y: number, color: string, highlighted = false) => {
      ctx.save()
      const r = highlighted ? 6 : 4
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = highlighted ? "#ffffff" : color
      ctx.fill()
      ctx.lineWidth = highlighted ? 2 : 1.5
      ctx.strokeStyle = highlighted ? color : "#ffffff"
      ctx.stroke()
      // Outer glow ring when highlighted
      if (highlighted) {
        ctx.beginPath()
        ctx.arc(x, y, r + 4, 0, Math.PI * 2)
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.35
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      ctx.restore()
    }

    // Helper to draw a price label on the right edge (TradingView-style)
    const drawPriceLabel = (price: number, y: number, color: string) => {
      const cw = (canvas.width / (window.devicePixelRatio || 1))
      const labelX = cw - 60
      const text = `$${price.toFixed(2)}`
      ctx.save()
      ctx.font = "10px monospace"
      const tm = ctx.measureText(text)
      const pw = tm.width + 8
      const ph = 16
      ctx.fillStyle = color
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.roundRect(labelX, y - ph / 2, pw, ph, 3)
      ctx.fill()
      ctx.globalAlpha = 1
      ctx.fillStyle = "#ffffff"
      ctx.fillText(text, labelX + 4, y + 3.5)
      ctx.restore()
    }

    for (const drawing of allDrawings) {
      if (drawing.points.length < 1) continue

      // Convert all points from chart coordinates to pixel coordinates
      const rawPxPts = drawing.points.map(chartToPixel)
      const pxPts = rawPxPts.filter(Boolean) as { x: number; y: number }[]
      if (pxPts.length === 0) continue

      // Draw a soft selection glow behind the line when this drawing is selected
      const isSelected = drawing.id === activeHighlightId && drawing.id !== "in-progress"
      if (isSelected) {
        ctx.save()
        ctx.strokeStyle = drawing.color
        ctx.lineWidth = drawing.lineWidth + 6
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.globalAlpha = 0.18
        ctx.setLineDash([])
        // Draw a single-segment glow for simple 2-point lines
        if (pxPts.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(pxPts[0].x, pxPts[0].y)
          ctx.lineTo(pxPts[1].x, pxPts[1].y)
          ctx.stroke()
        }
        ctx.restore()
      }

      ctx.save()
      ctx.strokeStyle = drawing.color
      ctx.lineWidth = isSelected ? drawing.lineWidth + 0.5 : drawing.lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      // Apply line style
      const style = drawing.lineStyle || "solid"
      if (style === "dashed") ctx.setLineDash([8, 5])
      else if (style === "dotted") ctx.setLineDash([2, 4])
      else ctx.setLineDash([])

      const tool = drawing.tool
      const cw = (canvas.width / (window.devicePixelRatio || 1))
      const ch = (canvas.height / (window.devicePixelRatio || 1))

      if (tool === "trendline" || tool === "regression-trend" || tool === "flat-top-bottom" || tool === "ray" || tool === "extended-line" || tool === "info-line" || tool === "arrow" || tool === "horizontal-ray") {
        if (pxPts.length >= 2) {
          ctx.beginPath()
          if (tool === "ray" || tool === "extended-line" || tool === "horizontal-ray") {
            // Extend beyond the second point to screen edge
            const dx = pxPts[1].x - pxPts[0].x
            const dy = pxPts[1].y - pxPts[0].y
            const len = Math.hypot(dx, dy)
            if (len > 0) {
              const ext = Math.max(cw, ch) * 2
              ctx.moveTo(tool === "extended-line" ? pxPts[0].x - (dx / len) * ext : pxPts[0].x, tool === "extended-line" ? pxPts[0].y - (dy / len) * ext : pxPts[0].y)
              ctx.lineTo(pxPts[1].x + (dx / len) * ext, pxPts[1].y + (dy / len) * ext)
            }
          } else {
            ctx.moveTo(pxPts[0].x, pxPts[0].y)
            ctx.lineTo(pxPts[1].x, pxPts[1].y)
          }
          ctx.stroke()
          
          if (tool === "arrow") {
            const dx = pxPts[1].x - pxPts[0].x
            const dy = pxPts[1].y - pxPts[0].y
            const angle = Math.atan2(dy, dx)
            const headLen = 12
            ctx.beginPath()
            ctx.moveTo(pxPts[1].x, pxPts[1].y)
            ctx.lineTo(pxPts[1].x - headLen * Math.cos(angle - Math.PI / 6), pxPts[1].y - headLen * Math.sin(angle - Math.PI / 6))
            ctx.lineTo(pxPts[1].x - headLen * Math.cos(angle + Math.PI / 6), pxPts[1].y - headLen * Math.sin(angle + Math.PI / 6))
            ctx.closePath()
            ctx.fillStyle = drawing.color
            ctx.fill()
          }
          
          // Draw anchor points
          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, drawing.color, hl)
            drawAnchor(pxPts[1].x, pxPts[1].y, drawing.color, hl)
          }
        }
      } else if (tool === "horizontal" || tool === "cross-line") {
        if (pxPts.length >= 1) {
          ctx.beginPath()
          ctx.moveTo(0, pxPts[0].y)
          ctx.lineTo(cw, pxPts[0].y)
          ctx.stroke()
          // Price label
          drawPriceLabel(drawing.points[0].price, pxPts[0].y, drawing.color)
          if (tool === "cross-line") {
            ctx.beginPath()
            ctx.moveTo(pxPts[0].x, 0)
            ctx.lineTo(pxPts[0].x, ch)
            ctx.stroke()
          }
          // Anchor
          if (drawing.id !== "in-progress") {
            drawAnchor(pxPts[0].x, pxPts[0].y, drawing.color, drawing.id === activeHighlightId)
          }
        }
      } else if (tool === "vertical-line") {
        if (pxPts.length >= 1) {
          ctx.beginPath()
          ctx.moveTo(pxPts[0].x, 0)
          ctx.lineTo(pxPts[0].x, ch)
          ctx.stroke()
          // Anchor
          if (drawing.id !== "in-progress") {
            drawAnchor(pxPts[0].x, pxPts[0].y, drawing.color, drawing.id === activeHighlightId)
          }
        }
      } else if (tool === "parallel-channel" || tool === "fib-channel") {
        if (pxPts.length >= 2) {
          const priceDiff = Math.abs(drawing.points[1].price - drawing.points[0].price) * 0.3
          const offset0 = chartToPixel({ time: drawing.points[0].time, price: drawing.points[0].price + priceDiff })
          const offset1 = chartToPixel({ time: drawing.points[1].time, price: drawing.points[1].price + priceDiff })
          const offsetB0 = chartToPixel({ time: drawing.points[0].time, price: drawing.points[0].price - priceDiff })
          const offsetB1 = chartToPixel({ time: drawing.points[1].time, price: drawing.points[1].price - priceDiff })
          
          // Fill between channels
          if (offset0 && offset1 && offsetB0 && offsetB1) {
            ctx.fillStyle = drawing.color
            ctx.globalAlpha = 0.06
            ctx.beginPath()
            ctx.moveTo(offset0.x, offset0.y)
            ctx.lineTo(offset1.x, offset1.y)
            ctx.lineTo(offsetB1.x, offsetB1.y)
            ctx.lineTo(offsetB0.x, offsetB0.y)
            ctx.closePath()
            ctx.fill()
            ctx.globalAlpha = 1
          }
          
          // Center line (main)
          ctx.beginPath()
          ctx.moveTo(pxPts[0].x, pxPts[0].y)
          ctx.lineTo(pxPts[1].x, pxPts[1].y)
          ctx.stroke()
          
          // Upper/Lower channel lines
          ctx.globalAlpha = 0.6
          if (offset0 && offset1) {
            ctx.beginPath()
            ctx.moveTo(offset0.x, offset0.y)
            ctx.lineTo(offset1.x, offset1.y)
            ctx.stroke()
          }
          if (offsetB0 && offsetB1) {
            ctx.beginPath()
            ctx.moveTo(offsetB0.x, offsetB0.y)
            ctx.lineTo(offsetB1.x, offsetB1.y)
            ctx.stroke()
          }
          ctx.globalAlpha = 1
          
          // Anchors
          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, drawing.color, hl)
            drawAnchor(pxPts[1].x, pxPts[1].y, drawing.color, hl)
          }
        }
      } else if (tool === "pitchfork") {
        if (pxPts.length >= 2) {
          const midTime = (drawing.points[0].time + drawing.points[1].time) / 2
          const topPrice = drawing.points[0].price + Math.abs(drawing.points[1].price - drawing.points[0].price) * 0.5
          const midPx = chartToPixel({ time: midTime, price: topPrice })
          if (midPx) {
            ctx.beginPath(); ctx.moveTo(midPx.x, midPx.y); ctx.lineTo(pxPts[0].x, pxPts[0].y); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(midPx.x, midPx.y); ctx.lineTo(pxPts[1].x, pxPts[1].y); ctx.stroke()
            ctx.setLineDash([4, 4])
            ctx.beginPath(); ctx.moveTo(midPx.x, midPx.y); ctx.lineTo(midPx.x, pxPts[0].y + 20); ctx.stroke()
            ctx.setLineDash([])
          }
        }
      } else if (tool === "fib-retracement" || tool === "fib-extension") {
        if (pxPts.length >= 2) {
          const levels = tool === "fib-retracement"
            ? [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1]
            : [0, 0.618, 1, 1.618, 2.618]
          const p0 = drawing.points[0].price
          const p1 = drawing.points[1].price
          const pDiff = p1 - p0
          const fibColors = ["#787B86", "#F23645", "#FF9800", "#FFC107", "#4CAF50", "#2962FF", "#9C27B0"]
          const fibBgAlpha = 0.06
          
          // Draw filled zones between levels (TradingView-style)
          for (let i = 0; i < levels.length; i++) {
            const price = p0 + pDiff * levels[i]
            const levelPx = chartToPixel({ time: drawing.points[0].time, price })
            if (!levelPx) continue
            
            // Draw the filled band
            if (i < levels.length - 1) {
              const nextPrice = p0 + pDiff * levels[i + 1]
              const nextLevelPx = chartToPixel({ time: drawing.points[0].time, price: nextPrice })
              if (nextLevelPx) {
                ctx.fillStyle = fibColors[(i + 1) % fibColors.length]
                ctx.globalAlpha = fibBgAlpha
                const x0 = Math.min(pxPts[0].x, pxPts[1].x)
                const xw = Math.abs(pxPts[1].x - pxPts[0].x)
                ctx.fillRect(x0, levelPx.y, xw, nextLevelPx.y - levelPx.y)
              }
            }
            
            // Draw the level line
            ctx.globalAlpha = 0.8
            ctx.strokeStyle = fibColors[i % fibColors.length]
            ctx.lineWidth = 1
            ctx.setLineDash(i === 0 || i === levels.length - 1 ? [] : [4, 3])
            ctx.beginPath()
            ctx.moveTo(pxPts[0].x, levelPx.y)
            ctx.lineTo(pxPts[1].x, levelPx.y)
            ctx.stroke()
            
            // Draw label
            ctx.font = "10px -apple-system, system-ui, sans-serif"
            ctx.fillStyle = fibColors[i % fibColors.length]
            ctx.globalAlpha = 0.9
            const labelText = `${(levels[i] * 100).toFixed(1)}%  $${price.toFixed(2)}`
            ctx.fillText(labelText, pxPts[0].x + 6, levelPx.y - 4)
          }
          
          ctx.globalAlpha = 1.0
          ctx.setLineDash([])
          ctx.strokeStyle = drawing.color
          ctx.lineWidth = drawing.lineWidth
          
          // Anchors
          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, drawing.color, hl)
            drawAnchor(pxPts[1].x, pxPts[1].y, drawing.color, hl)
          }
        }
      } else if (tool === "fib-wedge") {
        if (pxPts.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(pxPts[0].x, pxPts[0].y)
          ctx.lineTo(pxPts[1].x, pxPts[1].y)
          ctx.stroke()
          const pDiff = drawing.points[1].price - drawing.points[0].price
          const levels = [0.382, 0.618]
          levels.forEach(l => {
            const price = drawing.points[0].price + pDiff * l
            const lPx0 = chartToPixel({ time: drawing.points[0].time, price })
            const lPx1 = chartToPixel({ time: drawing.points[1].time, price })
            if (!lPx0 || !lPx1) return
            ctx.setLineDash([3, 3])
            ctx.beginPath()
            ctx.moveTo(lPx0.x, lPx0.y)
            ctx.lineTo(lPx1.x, lPx1.y)
            ctx.stroke()
          })
          ctx.setLineDash([])
        }
      } else if (tool === "gann-box" || tool === "gann-fan") {
        if (pxPts.length >= 2) {
          const x0 = pxPts[0].x, y0 = pxPts[0].y
          const x1 = pxPts[1].x, y1 = pxPts[1].y
          if (tool === "gann-box") {
            ctx.strokeRect(x0, y0, x1 - x0, y1 - y0)
            ctx.setLineDash([3, 3])
            ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(x1, y0); ctx.lineTo(x0, y1); ctx.stroke()
            const midX = (x0 + x1) / 2, midY = (y0 + y1) / 2
            ctx.beginPath(); ctx.moveTo(midX, y0); ctx.lineTo(midX, y1); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(x0, midY); ctx.lineTo(x1, midY); ctx.stroke()
            ctx.setLineDash([])
          } else {
            const angles = [1, 2, 3, 4, 8]
            angles.forEach(a => {
              ctx.beginPath()
              ctx.moveTo(x0, y0)
              ctx.lineTo(x1, y0 + (y1 - y0) / a)
              ctx.stroke()
            })
          }
        }
      } else if (tool === "fib-time-zone") {
        if (pxPts.length >= 1) {
          const fibs = [1, 1, 2, 3, 5, 8, 13, 21]
          const startX = pxPts[0].x
          let accum = 0
          fibs.forEach((f, i) => {
            accum += f * 8
            ctx.strokeStyle = `hsl(${210 + i * 20}, 70%, 60%)`
            ctx.beginPath()
            ctx.moveTo(startX + accum, 0)
            ctx.lineTo(startX + accum, canvas.height)
            ctx.stroke()
          })
          ctx.strokeStyle = drawing.color
        }
      } else if (tool === "rectangle") {
        if (pxPts.length >= 2) {
          const x = Math.min(pxPts[0].x, pxPts[1].x)
          const y = Math.min(pxPts[0].y, pxPts[1].y)
          const w = Math.abs(pxPts[1].x - pxPts[0].x)
          const h = Math.abs(pxPts[1].y - pxPts[0].y)
          ctx.fillStyle = drawing.color
          ctx.globalAlpha = 0.08
          ctx.fillRect(x, y, w, h)
          ctx.globalAlpha = 1
          ctx.strokeRect(x, y, w, h)
          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, drawing.color, hl)
            drawAnchor(pxPts[1].x, pxPts[1].y, drawing.color, hl)
            drawAnchor(pxPts[0].x, pxPts[1].y, drawing.color, hl)
            drawAnchor(pxPts[1].x, pxPts[0].y, drawing.color, hl)
          }
        }
      } else if (tool === "circle" || tool === "ellipse") {
        if (pxPts.length >= 2) {
          const cx = (pxPts[0].x + pxPts[1].x) / 2
          const cy = (pxPts[0].y + pxPts[1].y) / 2
          const rx = Math.abs(pxPts[1].x - pxPts[0].x) / 2
          const ry = tool === "circle" ? rx : Math.abs(pxPts[1].y - pxPts[0].y) / 2
          ctx.beginPath()
          ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2)
          ctx.stroke()
        }
      } else if (tool === "triangle") {
        if (pxPts.length >= 2) {
          const midX = (pxPts[0].x + pxPts[1].x) / 2
          ctx.beginPath()
          ctx.moveTo(midX, pxPts[0].y)
          ctx.lineTo(pxPts[0].x, pxPts[1].y)
          ctx.lineTo(pxPts[1].x, pxPts[1].y)
          ctx.closePath()
          ctx.stroke()
        }
      } else if (tool === "arc") {
        if (pxPts.length >= 2) {
          const cx = pxPts[0].x
          const cy = pxPts[0].y
          const r = Math.hypot(pxPts[1].x - cx, pxPts[1].y - cy)
          ctx.beginPath()
          ctx.arc(cx, cy, Math.max(r, 1), 0, Math.PI, true)
          ctx.stroke()
        }
      } else if (tool === "pen") {
        if (pxPts.length >= 2) {
          ctx.beginPath()
          ctx.moveTo(pxPts[0].x, pxPts[0].y)
          for (let i = 1; i < pxPts.length; i++) {
            ctx.lineTo(pxPts[i].x, pxPts[i].y)
          }
          ctx.stroke()
        }
      } else if (tool === "text") {
        if (pxPts.length >= 1) {
          ctx.font = "bold 13px -apple-system, system-ui, sans-serif"
          ctx.fillStyle = drawing.color
          const txt = "Aa"
          const tm = ctx.measureText(txt)
          // Background
          ctx.fillStyle = drawing.color
          ctx.globalAlpha = 0.1
          ctx.beginPath()
          ctx.roundRect(pxPts[0].x - 4, pxPts[0].y - 14, tm.width + 8, 20, 3)
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.fillStyle = drawing.color
          ctx.fillText(txt, pxPts[0].x, pxPts[0].y)
          if (drawing.id !== "in-progress") {
            drawAnchor(pxPts[0].x, pxPts[0].y, drawing.color, drawing.id === activeHighlightId)
          }
        }
      } else if (tool === "measure" || tool === "date-range" || tool === "price-range-tool" || tool === "date-price-range") {
        if (pxPts.length >= 2) {
          // Background area
          const x = Math.min(pxPts[0].x, pxPts[1].x)
          const y = Math.min(pxPts[0].y, pxPts[1].y)
          const w = Math.abs(pxPts[1].x - pxPts[0].x)
          const h = Math.abs(pxPts[1].y - pxPts[0].y)
          ctx.fillStyle = "#FFC107"
          ctx.globalAlpha = 0.06
          ctx.fillRect(x, y, w, h)
          ctx.globalAlpha = 1
          
          ctx.setLineDash([4, 4])
          ctx.strokeStyle = "#FFC107"
          ctx.beginPath()
          ctx.moveTo(pxPts[0].x, pxPts[0].y)
          ctx.lineTo(pxPts[1].x, pxPts[0].y)
          ctx.lineTo(pxPts[1].x, pxPts[1].y)
          ctx.stroke()
          ctx.setLineDash([])
          
          // Measurement label with background
          const priceDiff = drawing.points[1].price - drawing.points[0].price
          const pctChange = ((priceDiff / drawing.points[0].price) * 100).toFixed(2)
          const midX = (pxPts[0].x + pxPts[1].x) / 2
          const midY = (pxPts[0].y + pxPts[1].y) / 2
          const text = `${priceDiff > 0 ? "+" : ""}$${priceDiff.toFixed(2)} (${priceDiff > 0 ? "+" : ""}${pctChange}%)`
          ctx.font = "bold 11px -apple-system, system-ui, sans-serif"
          const tm = ctx.measureText(text)
          const labelW = tm.width + 12
          const labelH = 20
          ctx.fillStyle = priceDiff >= 0 ? "#22c55e" : "#ef4444"
          ctx.globalAlpha = 0.9
          ctx.beginPath()
          ctx.roundRect(midX - labelW / 2, midY - labelH / 2, labelW, labelH, 4)
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.fillStyle = "#ffffff"
          ctx.fillText(text, midX - tm.width / 2, midY + 4)
        }
      } else if (tool === "projection" || tool === "long-position" || tool === "short-position" || tool === "price-range") {
        if (pxPts.length >= 2) {
          const isLong = tool === "long-position"
          const isShort = tool === "short-position"
          const color = isLong ? "#22c55e" : isShort ? "#ef4444" : drawing.color
          const x = Math.min(pxPts[0].x, pxPts[1].x)
          const y = Math.min(pxPts[0].y, pxPts[1].y)
          const w = Math.abs(pxPts[1].x - pxPts[0].x)
          const h = Math.abs(pxPts[1].y - pxPts[0].y)
          
          ctx.strokeStyle = color
          ctx.fillStyle = color
          ctx.globalAlpha = 0.1
          ctx.fillRect(x, y, w, h)
          ctx.globalAlpha = 0.7
          ctx.setLineDash([])
          
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x, pxPts[0].y)
          ctx.lineTo(x + w, pxPts[0].y)
          ctx.stroke()
          
          ctx.lineWidth = 1
          ctx.setLineDash([4, 3])
          ctx.beginPath()
          ctx.moveTo(x, pxPts[1].y)
          ctx.lineTo(x + w, pxPts[1].y)
          ctx.stroke()
          ctx.setLineDash([])
          
          ctx.globalAlpha = 1
          ctx.font = "bold 10px -apple-system, system-ui, sans-serif"
          ctx.fillStyle = color
          const priceDiff = drawing.points[1].price - drawing.points[0].price
          const pctChange = ((priceDiff / drawing.points[0].price) * 100).toFixed(2)
          const label = (isLong || isShort) ? `${priceDiff > 0 ? "+" : ""}${pctChange}%` : `$${Math.abs(priceDiff).toFixed(2)}`
          ctx.fillText(label, x + 6, (pxPts[0].y + pxPts[1].y) / 2 + 4)
          
          if (isLong) ctx.fillText("LONG", x + 6, pxPts[0].y - 6)
          else if (isShort) ctx.fillText("SHORT", x + 6, pxPts[0].y - 6)
          
          ctx.globalAlpha = 1
          ctx.lineWidth = drawing.lineWidth
        }

      // ── Forecast / Projection group tools ────────────────────────────────
      } else if (tool === "forecast-long" || tool === "forecast-short") {
        if (pxPts.length >= 2) {
          const isLong = tool === "forecast-long"
          const profitColor = isLong ? "#22c55e" : "#ef4444"
          const lossColor  = isLong ? "#ef4444" : "#22c55e"

          // Derive entry (point 0), target and stop from the two clicked points
          const entryY  = pxPts[0].y
          const targetY = pxPts[1].y
          // Stop is mirrored below/above entry by the same distance
          const distance = Math.abs(targetY - entryY)
          const stopY   = isLong ? entryY + distance : entryY - distance

          const x = pxPts[0].x
          const boxW = Math.max(Math.abs(pxPts[1].x - pxPts[0].x), 120)

          const entryPrice  = drawing.points[0].price
          const targetPrice = drawing.points[1].price
          const stopPrice   = isLong ? entryPrice - Math.abs(targetPrice - entryPrice) : entryPrice + Math.abs(targetPrice - entryPrice)

          // Profit zone
          ctx.fillStyle = profitColor
          ctx.globalAlpha = 0.12
          ctx.fillRect(x, Math.min(entryY, targetY), boxW, Math.abs(targetY - entryY))

          // Loss zone
          ctx.fillStyle = lossColor
          ctx.globalAlpha = 0.08
          ctx.fillRect(x, Math.min(entryY, stopY), boxW, Math.abs(stopY - entryY))

          ctx.globalAlpha = 1
          ctx.setLineDash([])

          // Entry line
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.moveTo(x, entryY); ctx.lineTo(x + boxW, entryY); ctx.stroke()

          // Target line
          ctx.strokeStyle = profitColor
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.moveTo(x, targetY); ctx.lineTo(x + boxW, targetY); ctx.stroke()

          // Stop line
          ctx.strokeStyle = lossColor
          ctx.lineWidth = 1
          ctx.setLineDash([4, 3])
          ctx.beginPath(); ctx.moveTo(x, stopY); ctx.lineTo(x + boxW, stopY); ctx.stroke()
          ctx.setLineDash([])

          // Labels
          ctx.font = "bold 10px -apple-system, system-ui, sans-serif"
          const pctProfit = (((targetPrice - entryPrice) / entryPrice) * 100).toFixed(2)
          const pctLoss   = (((stopPrice  - entryPrice) / entryPrice) * 100).toFixed(2)

          // Target label
          ctx.fillStyle = profitColor
          ctx.globalAlpha = 0.9
          const tLabel = `Target  $${targetPrice.toFixed(2)}  ${pctProfit}%`
          ctx.fillText(tLabel, x + 6, targetY - 5)

          // Entry label
          ctx.fillStyle = "#ffffff"
          ctx.fillText(`Entry  $${entryPrice.toFixed(2)}`, x + 6, entryY - 5)

          // Stop label
          ctx.fillStyle = lossColor
          const sLabel = `Stop  $${stopPrice.toFixed(2)}  ${pctLoss}%`
          ctx.fillText(sLabel, x + 6, stopY + 13)

          // Direction badge
          ctx.fillStyle = isLong ? "#22c55e" : "#ef4444"
          ctx.globalAlpha = 0.85
          ctx.beginPath()
          ctx.roundRect(x + 4, (entryY + targetY) / 2 - 9, isLong ? 38 : 42, 18, 4)
          ctx.fill()
          ctx.globalAlpha = 1
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 9px -apple-system, system-ui, sans-serif"
          ctx.fillText(isLong ? "LONG" : "SHORT", x + 8, (entryY + targetY) / 2 + 4)

          // Anchors
          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, "#ffffff", hl)
            drawAnchor(pxPts[1].x, pxPts[1].y, profitColor, hl)
          }
        }

      } else if (tool === "forecast-time-range") {
        if (pxPts.length >= 2) {
          const x0 = Math.min(pxPts[0].x, pxPts[1].x)
          const x1 = Math.max(pxPts[0].x, pxPts[1].x)
          const bandColor = "#7c3aed"

          // Shaded vertical band
          ctx.fillStyle = bandColor
          ctx.globalAlpha = 0.10
          ctx.fillRect(x0, 0, x1 - x0, ch)
          ctx.globalAlpha = 1

          // Left + right boundary lines
          ctx.strokeStyle = bandColor
          ctx.lineWidth = 1.5
          ctx.setLineDash([])
          ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, ch); ctx.stroke()
          ctx.setLineDash([4, 3])
          ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, ch); ctx.stroke()
          ctx.setLineDash([])

          // Top bracket arrows
          const arrowY = 14
          ctx.strokeStyle = bandColor
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(x0, arrowY); ctx.lineTo(x1, arrowY); ctx.stroke()
          // Arrow heads
          ctx.beginPath(); ctx.moveTo(x0, arrowY); ctx.lineTo(x0 + 6, arrowY - 5); ctx.moveTo(x0, arrowY); ctx.lineTo(x0 + 6, arrowY + 5); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(x1, arrowY); ctx.lineTo(x1 - 6, arrowY - 5); ctx.moveTo(x1, arrowY); ctx.lineTo(x1 - 6, arrowY + 5); ctx.stroke()

          // Label
          const t0 = drawing.points[0].time, t1 = drawing.points[1].time
          const diffSec = Math.abs(t1 - t0)
          const diffH   = Math.round(diffSec / 3600)
          const rangeText = diffH >= 24 ? `${Math.round(diffH / 24)}d` : `${diffH}h`
          ctx.font = "bold 10px -apple-system, system-ui, sans-serif"
          ctx.fillStyle = bandColor
          ctx.fillText(`Time Range  ${rangeText}`, (x0 + x1) / 2 - 36, arrowY + 22)

          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, bandColor, hl)
            drawAnchor(pxPts[1].x, pxPts[1].y, bandColor, hl)
          }
        }

      } else if (tool === "forecast-price-projection") {
        if (pxPts.length >= 2) {
          const projColor = "#f59e0b"
          const entryPrice  = drawing.points[0].price
          const targetPrice = drawing.points[1].price
          const isUp = targetPrice > entryPrice
          const priceDiff = targetPrice - entryPrice
          const pctChange = ((priceDiff / entryPrice) * 100).toFixed(2)

          // Dotted horizontal target line spanning full width
          ctx.strokeStyle = projColor
          ctx.lineWidth = 1.5
          ctx.setLineDash([6, 4])
          ctx.beginPath(); ctx.moveTo(0, pxPts[1].y); ctx.lineTo(cw, pxPts[1].y); ctx.stroke()
          ctx.setLineDash([])

          // Entry dot line
          ctx.strokeStyle = "rgba(255,255,255,0.4)"
          ctx.lineWidth = 1
          ctx.setLineDash([3, 4])
          ctx.beginPath(); ctx.moveTo(0, pxPts[0].y); ctx.lineTo(cw, pxPts[0].y); ctx.stroke()
          ctx.setLineDash([])

          // Vertical connector with arrow head
          ctx.strokeStyle = projColor
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.moveTo(pxPts[0].x, pxPts[0].y); ctx.lineTo(pxPts[0].x, pxPts[1].y); ctx.stroke()
          // Arrow head at target
          const arrowDir = isUp ? -1 : 1
          ctx.beginPath()
          ctx.moveTo(pxPts[0].x, pxPts[1].y)
          ctx.lineTo(pxPts[0].x - 6, pxPts[1].y - arrowDir * 10)
          ctx.lineTo(pxPts[0].x + 6, pxPts[1].y - arrowDir * 10)
          ctx.closePath()
          ctx.fillStyle = projColor
          ctx.fill()

          // Price label badge
          drawPriceLabel(targetPrice, pxPts[1].y, projColor)

          // % change label
          ctx.font = "bold 10px -apple-system, system-ui, sans-serif"
          ctx.fillStyle = projColor
          const changeLabel = `${priceDiff > 0 ? "+" : ""}${pctChange}%  $${Math.abs(priceDiff).toFixed(2)}`
          ctx.fillText(changeLabel, pxPts[0].x + 10, (pxPts[0].y + pxPts[1].y) / 2 + 4)

          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, "rgba(255,255,255,0.7)", hl)
            drawAnchor(pxPts[0].x, pxPts[1].y, projColor, hl)
          }
        }

      } else if (tool === "forecast-risk-reward") {
        if (pxPts.length >= 2) {
          const rrColor = "#3b82f6"
          const profitColor = "#22c55e"
          const lossColor   = "#ef4444"

          const entryY  = pxPts[0].y
          const targetY = pxPts[1].y
          const stopY   = entryY + (entryY - targetY) * 0.5  // stop = half distance below entry

          const x = Math.min(pxPts[0].x, pxPts[1].x)
          const boxW = Math.max(Math.abs(pxPts[1].x - pxPts[0].x), 140)

          const entryPrice  = drawing.points[0].price
          const targetPrice = drawing.points[1].price
          const stopPrice   = entryPrice - (targetPrice - entryPrice) * 0.5

          const reward = Math.abs(targetPrice - entryPrice)
          const risk   = Math.abs(entryPrice   - stopPrice)
          const rr     = risk > 0 ? (reward / risk).toFixed(2) : "∞"

          // Profit zone
          ctx.fillStyle = profitColor
          ctx.globalAlpha = 0.10
          ctx.fillRect(x, Math.min(entryY, targetY), boxW, Math.abs(targetY - entryY))

          // Risk zone
          ctx.fillStyle = lossColor
          ctx.globalAlpha = 0.07
          ctx.fillRect(x, Math.min(entryY, stopY), boxW, Math.abs(stopY - entryY))

          ctx.globalAlpha = 1

          // Entry line
          ctx.strokeStyle = rrColor
          ctx.lineWidth = 2; ctx.setLineDash([])
          ctx.beginPath(); ctx.moveTo(x, entryY); ctx.lineTo(x + boxW, entryY); ctx.stroke()

          // Target line
          ctx.strokeStyle = profitColor
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.moveTo(x, targetY); ctx.lineTo(x + boxW, targetY); ctx.stroke()

          // Stop line
          ctx.strokeStyle = lossColor
          ctx.lineWidth = 1
          ctx.setLineDash([4, 3])
          ctx.beginPath(); ctx.moveTo(x, stopY); ctx.lineTo(x + boxW, stopY); ctx.stroke()
          ctx.setLineDash([])

          // Labels
          ctx.font = "bold 10px -apple-system, system-ui, sans-serif"
          ctx.fillStyle = rrColor
          ctx.fillText(`Entry  $${entryPrice.toFixed(2)}`, x + 6, entryY - 5)
          ctx.fillStyle = profitColor
          ctx.fillText(`Target  $${targetPrice.toFixed(2)}`, x + 6, targetY - 5)
          ctx.fillStyle = lossColor
          ctx.fillText(`Stop  $${stopPrice.toFixed(2)}`, x + 6, stopY + 13)

          // R:R badge
          ctx.fillStyle = rrColor
          ctx.globalAlpha = 0.88
          const badge = `R:R  1:${rr}`
          ctx.font = "bold 11px -apple-system, system-ui, sans-serif"
          const bw = ctx.measureText(badge).width + 14
          const midY = (entryY + targetY) / 2
          ctx.beginPath(); ctx.roundRect(x + boxW - bw - 6, midY - 10, bw, 20, 5); ctx.fill()
          ctx.globalAlpha = 1
          ctx.fillStyle = "#ffffff"
          ctx.fillText(badge, x + boxW - bw - 6 + 7, midY + 4)

          if (drawing.id !== "in-progress") {
            const hl = drawing.id === activeHighlightId
            drawAnchor(pxPts[0].x, pxPts[0].y, rrColor, hl)
            drawAnchor(pxPts[1].x, pxPts[1].y, profitColor, hl)
          }
        }
      }
      ctx.restore()
    }
  }, [drawings, drawingInProgress, activeTool, chartToPixel, selectedDrawingId])

  // Render drawings on change
  useEffect(() => {
    renderDrawings()
  }, [renderDrawings])

  // Resize canvas on container resize
  useEffect(() => {
    const canvas = drawingCanvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => renderDrawings())
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    return () => ro.disconnect()
  }, [renderDrawings])

  // Re-render drawings when chart scrolls/zooms/rescales (pixel positions change)
  const renderDrawingsRef = useRef(renderDrawings)
  renderDrawingsRef.current = renderDrawings
  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    let rafId: number | null = null
    const scheduleRedraw = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        renderDrawingsRef.current()
        rafId = null
      })
    }
    // Subscribe to time scale changes (scroll, zoom)
    chart.timeScale().subscribeVisibleLogicalRangeChange(scheduleRedraw)
    // Subscribe to crosshair (captures price scale updates too)
    chart.subscribeCrosshairMove(scheduleRedraw)
    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(scheduleRedraw)
      chart.unsubscribeCrosshairMove(scheduleRedraw)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [chartType, pair, selectedTf]) // Re-subscribe when chart is recreated

  // Deselect drawing when a drawing tool is picked up
  useEffect(() => {
    if (activeTool && activeTool !== "cursor") {
      selectedDrawingIdRef.current = null
      setSelectedDrawingId(null)
    }
  }, [activeTool])

  // Drawing mouse handlers - click-click for two-point tools, click-drag for pen
  const activeToolRef = useRef(activeTool)
  activeToolRef.current = activeTool
  const drawingInProgressRef = useRef(drawingInProgress)
  drawingInProgressRef.current = drawingInProgress

  // Phase: "idle" = no drawing started, "placing" = first point set, waiting for second click
  const [drawingPhase, setDrawingPhase] = useState<"idle" | "placing">("idle")
  const drawingPhaseRef = useRef(drawingPhase)
  drawingPhaseRef.current = drawingPhase

  // Single-click tools (only need one point)
  const SINGLE_CLICK_TOOLS = ["horizontal", "cross-line", "vertical-line", "text", "fib-time-zone"]
  // Pen is drag-based
  const PEN_TOOL = "pen"

  const handleDrawingClick = useCallback((e: React.MouseEvent) => {
    const tool = activeToolRef.current
    if (!tool || tool === "cursor") return
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const container = chartContainerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const chartPt = pixelToChart(px, py)
    if (!chartPt) return

    // Single-click tools: place immediately
    if (SINGLE_CLICK_TOOLS.includes(tool)) {
      setDrawings(prev => [...prev, {
        id: `drawing-${Date.now()}`,
        tool,
        points: [chartPt],
        color: "#2196F3",
        lineWidth: 2,
      }])
      onToolSelect?.("cursor")
      return
    }

    // Pen tool: handled via mousedown/move/up drag, not click-click
    if (tool === PEN_TOOL) return

    // Two-point tools (trendline, fib, ray, etc.): click-click
    if (drawingPhaseRef.current === "idle") {
      // First click: set first point
      setDrawingPhase("placing")
      setDrawingInProgress([chartPt])
    } else {
      // Second click: finalize the drawing
      const progress = drawingInProgressRef.current
      if (progress.length >= 1) {
        setDrawings(prev => [...prev, {
          id: `drawing-${Date.now()}`,
          tool,
          points: [progress[0], chartPt],
          color: "#2196F3",
          lineWidth: 2,
        }])
      }
      setDrawingInProgress([])
      setDrawingPhase("idle")
      onToolSelect?.("cursor")
    }
  }, [onToolSelect, pixelToChart])

  const handleDrawingMouseMove = useCallback((e: React.MouseEvent) => {
    const tool = activeToolRef.current
    if (!tool) return

    const container = chartContainerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const chartPt = pixelToChart(px, py)
    if (!chartPt) return

    // Pen drag mode
    if (tool === PEN_TOOL && isDrawingRef.current) {
      setDrawingInProgress(prev => [...prev, chartPt])
      return
    }

    // Two-point click-click: preview second point while mouse moves
    if (drawingPhaseRef.current === "placing") {
      setDrawingInProgress(prev => prev.length > 0 ? [prev[0], chartPt] : [chartPt])
    }
  }, [pixelToChart])

  // Pen tool drag handlers
  const handleDrawingMouseDown = useCallback((e: React.MouseEvent) => {
    const tool = activeToolRef.current
    if (tool !== PEN_TOOL) return
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()

    const container = chartContainerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    const chartPt = pixelToChart(px, py)
    if (!chartPt) return

    isDrawingRef.current = true
    setDrawingInProgress([chartPt])
  }, [pixelToChart])

  const handleDrawingMouseUp = useCallback(() => {
    const tool = activeToolRef.current
    if (tool !== PEN_TOOL || !isDrawingRef.current) return
    isDrawingRef.current = false

    const progress = drawingInProgressRef.current
    if (progress.length >= 2) {
      setDrawings(prev => [...prev, {
        id: `drawing-${Date.now()}`,
        tool: PEN_TOOL,
        points: [...progress],
        color: "#2196F3",
        lineWidth: 2,
      }])
    }
    setDrawingInProgress([])
    onToolSelect?.("cursor")
  }, [onToolSelect])

  // ── Stable refs so native capture listeners always read latest state ──
  const drawingsRef = useRef(drawings)
  drawingsRef.current = drawings
  const pixelToChartRef = useRef(pixelToChart)
  pixelToChartRef.current = pixelToChart
  const draggingIdRef = useRef<string | null>(null)

  // Cursor style driven by hover — applied directly to chart container element
  const [overlayCursor, setOverlayCursor] = useState<string>("default")

  // ── Native capture-phase event listeners on the chart container ──
  // These fire before lightweight-charts sees the event. When the pointer is
  // on a drawing we call stopPropagation() so lightweight-charts never pans/zooms.
  // When the pointer misses all drawings the event flows through untouched.
  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const onMouseDown = (e: MouseEvent) => {
      const tool = activeToolRef.current
      if (tool && tool !== "cursor") return
      if (e.button !== 0) return

      try {
        const rect = container.getBoundingClientRect()
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top

        // Anchor hit (resize) — only on selected drawing
        const anchorHit = hitTestAnchorRef.current(px, py)
        if (anchorHit) {
          const drawing = drawingsRef.current.find(d => d.id === anchorHit.drawingId)
          if (!drawing) return
          selectedDrawingIdRef.current = drawing.id
          setSelectedDrawingId(drawing.id)
          e.stopPropagation()
          e.preventDefault()
          if (drawing.locked) return
          const chartPt = pixelToChartRef.current(px, py)
          if (!chartPt) return
          draggingIdRef.current = anchorHit.drawingId
          setDraggingId(anchorHit.drawingId)
          dragStartRef.current = {
            chartPoint: chartPt,
            origPoints: drawing.points.map(p => ({ ...p })),
            anchorIndex: anchorHit.anchorIndex,
          }
          return
        }

        // Line body hit (select + move)
        const hitId = hitTestDrawingRef.current(px, py)
        if (!hitId) {
          // Background click — deselect
          selectedDrawingIdRef.current = null
          setSelectedDrawingId(null)
          return // let event through for chart panning
        }
        const drawing = drawingsRef.current.find(d => d.id === hitId)
        if (!drawing) return

        selectedDrawingIdRef.current = drawing.id
        setSelectedDrawingId(drawing.id)
        e.stopPropagation()
        e.preventDefault()

        if (drawing.locked) return
        const chartPt = pixelToChartRef.current(px, py)
        if (!chartPt) return
        draggingIdRef.current = hitId
        setDraggingId(hitId)
        dragStartRef.current = {
          chartPoint: chartPt,
          origPoints: drawing.points.map(p => ({ ...p })),
          anchorIndex: null,
        }
      } catch { /* ignore */ }
    }

    const onMouseMove = (e: MouseEvent) => {
      const tool = activeToolRef.current
      if (tool && tool !== "cursor") return

      try {
        const rect = container.getBoundingClientRect()
        const px = e.clientX - rect.left
        const py = e.clientY - rect.top

        // If actively dragging, handle move and block chart panning
        if (draggingIdRef.current && dragStartRef.current) {
          e.stopPropagation()
          const chartPt = pixelToChartRef.current(px, py)
          if (!chartPt) return
          const startSnap = dragStartRef.current
          const currentId = draggingIdRef.current
          const origPts = startSnap.origPoints.map(p => ({ ...p }))
          const anchorIdx = startSnap.anchorIndex
          if (anchorIdx !== null) {
            setDrawings(prev => prev.map(d => {
              if (d.id !== currentId) return d
              return { ...d, points: origPts.map((p, i) => i === anchorIdx ? { time: chartPt.time, price: chartPt.price } : { ...p }) }
            }))
          } else {
            const dTime = chartPt.time - startSnap.chartPoint.time
            const dPrice = chartPt.price - startSnap.chartPoint.price
            setDrawings(prev => prev.map(d => {
              if (d.id !== currentId) return d
              return { ...d, points: origPts.map(p => ({ time: p.time + dTime, price: p.price + dPrice })) }
            }))
          }
          return
        }

        // Not dragging — update hover state for cursor style
        const anchorHit = hitTestAnchorRef.current(px, py)
        if (anchorHit && anchorHit.drawingId === selectedDrawingIdRef.current) {
          if (hoveredDrawingIdRef.current !== anchorHit.drawingId) {
            hoveredDrawingIdRef.current = anchorHit.drawingId
            setHoveredDrawingId(anchorHit.drawingId)
          }
          setOverlayCursor("crosshair")
          return
        }
        const hitId = hitTestDrawingRef.current(px, py)
        const next = hitId ?? null
        if (hoveredDrawingIdRef.current !== next) {
          hoveredDrawingIdRef.current = next
          setHoveredDrawingId(next)
        }
        if (next && next === selectedDrawingIdRef.current) setOverlayCursor("grab")
        else if (next) setOverlayCursor("pointer")
        else setOverlayCursor("default")
      } catch { /* ignore */ }
    }

    const onMouseUp = () => {
      if (draggingIdRef.current) {
        draggingIdRef.current = null
        dragStartRef.current = null
        setDraggingId(null)
      }
    }

    container.addEventListener("mousedown", onMouseDown, { capture: true })
    container.addEventListener("mousemove", onMouseMove, { capture: true })
    container.addEventListener("mouseup", onMouseUp, { capture: true })

    return () => {
      container.removeEventListener("mousedown", onMouseDown, true)
      container.removeEventListener("mousemove", onMouseMove, true)
      container.removeEventListener("mouseup", onMouseUp, true)
    }
  // Re-attach when drawings change so hit-test closures stay fresh
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawings])

  // Apply cursor to the chart container so it shows over lightweight-charts' own canvas
  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return
    const activeTool_ = activeToolRef.current
    if (activeTool_ && activeTool_ !== "cursor") return
    const cur = draggingId ? "grabbing" : overlayCursor
    container.style.cursor = cur === "default" ? "" : cur
  }, [overlayCursor, draggingId])

  const clearAllDrawings = useCallback(() => {
    setDrawings([])
    setDrawingInProgress([])
    renderDrawings()
  }, [renderDrawings])

  // Hit-test: find which drawing is near pixel coordinates
  const hitTestDrawing = useCallback((px: number, py: number): string | null => {
    const threshold = 12 // pixels proximity threshold
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i]
      const pxPts = drawing.points.map(chartToPixel).filter(Boolean) as { x: number; y: number }[]
      if (pxPts.length === 0) continue

      const tool = drawing.tool

      // For line-type tools: check distance to line segment
      if (pxPts.length >= 2 && (
        tool === "trendline" || tool === "regression-trend" || tool === "flat-top-bottom" ||
        tool === "ray" || tool === "extended-line" || tool === "info-line" || tool === "arrow" ||
        tool === "horizontal-ray" || tool === "fib-retracement" || tool === "fib-extension" ||
        tool === "fib-wedge" || tool === "parallel-channel" || tool === "fib-channel" ||
        tool === "pitchfork" || tool === "measure" || tool === "date-range" ||
        tool === "price-range-tool" || tool === "date-price-range" || tool === "pen"
      )) {
        for (let j = 0; j < pxPts.length - 1; j++) {
          const d = distanceToLineSegment(px, py, pxPts[j].x, pxPts[j].y, pxPts[j + 1].x, pxPts[j + 1].y)
          if (d < threshold) return drawing.id
        }
      }

      // For horizontal/vertical/cross lines
      if (tool === "horizontal" || tool === "cross-line") {
        if (Math.abs(py - pxPts[0].y) < threshold) return drawing.id
        if (tool === "cross-line" && Math.abs(px - pxPts[0].x) < threshold) return drawing.id
      }
      if (tool === "vertical-line") {
        if (Math.abs(px - pxPts[0].x) < threshold) return drawing.id
      }

      // For rectangle/box shapes
      if (pxPts.length >= 2 && (
        tool === "rectangle" || tool === "gann-box" || tool === "projection" ||
        tool === "long-position" || tool === "short-position" || tool === "price-range" ||
        tool === "forecast-long" || tool === "forecast-short" || tool === "forecast-time-range" ||
        tool === "forecast-price-projection" || tool === "forecast-risk-reward"
      )) {
        const x0 = Math.min(pxPts[0].x, pxPts[1].x)
        const x1 = Math.max(pxPts[0].x, pxPts[1].x)
        const y0 = Math.min(pxPts[0].y, pxPts[1].y)
        const y1 = Math.max(pxPts[0].y, pxPts[1].y)
        if (px >= x0 - threshold && px <= x1 + threshold && py >= y0 - threshold && py <= y1 + threshold) {
          // Check if near edges
          if (Math.abs(px - x0) < threshold || Math.abs(px - x1) < threshold ||
              Math.abs(py - y0) < threshold || Math.abs(py - y1) < threshold) {
            return drawing.id
          }
          // Or inside
          if (px >= x0 && px <= x1 && py >= y0 && py <= y1) return drawing.id
        }
      }

      // For circle/ellipse
      if (pxPts.length >= 2 && (tool === "circle" || tool === "ellipse")) {
        const cx = (pxPts[0].x + pxPts[1].x) / 2
        const cy = (pxPts[0].y + pxPts[1].y) / 2
        const rx = Math.abs(pxPts[1].x - pxPts[0].x) / 2
        const ry = tool === "circle" ? rx : Math.abs(pxPts[1].y - pxPts[0].y) / 2
        if (rx > 0 && ry > 0) {
          const dist = Math.sqrt(((px - cx) / rx) ** 2 + ((py - cy) / ry) ** 2)
          if (Math.abs(dist - 1) < threshold / Math.max(rx, ry) || dist < 1) return drawing.id
        }
      }

      // For text
      if (tool === "text" && pxPts.length >= 1) {
        if (Math.abs(px - pxPts[0].x) < 40 && Math.abs(py - pxPts[0].y) < 14) return drawing.id
      }
    }
    return null
  }, [drawings, chartToPixel])

  // Keep ref in sync
  hitTestDrawingRef.current = hitTestDrawing

  // Hit-test: find which endpoint anchor (index) on a drawing is near pixel coords
  // Returns { drawingId, anchorIndex } or null
  const hitTestAnchor = useCallback((px: number, py: number): { drawingId: string; anchorIndex: number } | null => {
    const ANCHOR_RADIUS = 10
    for (let i = drawings.length - 1; i >= 0; i--) {
      const drawing = drawings[i]
      if (drawing.locked || drawing.hidden) continue
      const tool = drawing.tool
      // Only line-type tools have resizable endpoints
      const isLineTool = (
        tool === "trendline" || tool === "regression-trend" || tool === "flat-top-bottom" ||
        tool === "ray" || tool === "extended-line" || tool === "info-line" || tool === "arrow" ||
        tool === "horizontal-ray" || tool === "parallel-channel" || tool === "fib-channel" ||
        tool === "fib-retracement" || tool === "fib-extension" || tool === "pitchfork" ||
        tool === "rectangle" || tool === "gann-box" || tool === "projection" ||
        tool === "long-position" || tool === "short-position" || tool === "price-range" ||
        tool === "circle" || tool === "ellipse"
      )
      if (!isLineTool) continue
      for (let j = 0; j < drawing.points.length; j++) {
        const pxPt = chartToPixel(drawing.points[j])
        if (!pxPt) continue
        const dist = Math.hypot(px - pxPt.x, py - pxPt.y)
        if (dist <= ANCHOR_RADIUS) {
          return { drawingId: drawing.id, anchorIndex: j }
        }
      }
    }
    return null
  }, [drawings, chartToPixel])

  const hitTestAnchorRef = useRef(hitTestAnchor)
  hitTestAnchorRef.current = hitTestAnchor

  // Update a specific drawing's properties
  const updateDrawing = useCallback((id: string, updates: Partial<Drawing>) => {
    setDrawings(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d))
  }, [])

  const deleteDrawing = useCallback((id: string) => {
    setDrawings(prev => prev.filter(d => d.id !== id))
    setDrawingContextMenu(null)
    setDrawingSettings(null)
    if (selectedDrawingIdRef.current === id) {
      selectedDrawingIdRef.current = null
      setSelectedDrawingId(null)
    }
  }, [])

  // Close drawing context menu on outside click
  useEffect(() => {
    if (!drawingContextMenu) return
    const close = () => setDrawingContextMenu(null)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [drawingContextMenu])

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    if (contextMenu) {
      document.addEventListener("click", handleClick)
      return () => document.removeEventListener("click", handleClick)
    }
  }, [contextMenu])

  // Close indicator menu on outside click
  useEffect(() => {
    const handleClick = () => setShowIndicatorMenu(false)
    if (showIndicatorMenu) {
      document.addEventListener("click", handleClick)
      return () => document.removeEventListener("click", handleClick)
    }
  }, [showIndicatorMenu])
  
  // Menus are now hover-based, no click handlers needed

  // Handle "__clear_drawings__" signal from sidebar trash button
  useEffect(() => {
    if (activeTool === "__clear_drawings__") {
      setDrawings([])
      setDrawingInProgress([])
      setDrawingPhase("idle")
      onToolSelect?.("cursor")
    }
  }, [activeTool, onToolSelect])

  // Escape key to cancel active drawing tool
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTool && activeTool !== "cursor") {
        isDrawingRef.current = false
        setDrawingInProgress([])
        setDrawingPhase("idle")
        onToolSelect?.("cursor")
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [activeTool, onToolSelect])

  return (
    <div className="flex h-full flex-col overflow-hidden border-y border-r border-border/30 bg-card">
      {/* ── Toolbar ─��� */}
      <div className="flex items-center gap-1 border-b border-border/30 py-1.5 pl-0 relative">
        {/* Settings button - left edge */}
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setContextMenu({ x: rect.left, y: rect.bottom + 5 })
          }}
          className="ml-0 mr-1 flex h-7 w-7 items-center justify-center rounded hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
          title="Chart Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
        
        <div className="h-4 w-px bg-border/30" />
        
        {/* Timeframe buttons - default visible */}
        {TIMEFRAMES.filter((tf) => DEFAULT_VISIBLE_TIMEFRAMES.includes(tf.value)).map((tf) => (
          <button
            key={tf.value}
            onClick={() => setSelectedTf(tf.value)}
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
              selectedTf === tf.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tf.label}
          </button>
        ))}
        
        {/* Dropdown for more timeframes - hover based */}
        <div 
          className="relative"
          onMouseEnter={() => setShowTimeframeMenu(true)}
          onMouseLeave={() => setShowTimeframeMenu(false)}
        >
          <button
            className="rounded px-1.5 py-0.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="More timeframes"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {showTimeframeMenu && (
            <div 
              className="absolute left-0 top-full z-50 w-32 rounded-lg border border-border/50 bg-card shadow-lg pt-1"
            >
              <div className="p-1">
                {TIMEFRAMES.filter((tf) => !DEFAULT_VISIBLE_TIMEFRAMES.includes(tf.value)).map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => {
                      setSelectedTf(tf.value)
                      setShowTimeframeMenu(false)
                    }}
                    className={cn(
                      "flex w-full items-center rounded px-2 py-1.5 text-left text-xs transition-colors",
                      selectedTf === tf.value
                        ? "bg-primary/15 text-primary"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border/50 mx-1" />
        
        {/* Chart Type Selector - hover based */}
        <div 
          className="relative"
          onMouseEnter={() => setShowChartTypeMenu(true)}
          onMouseLeave={() => setShowChartTypeMenu(false)}
        >
          <button
            className={cn(
              "flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
              showChartTypeMenu
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="h-3 w-3" />
          </button>
          
          {showChartTypeMenu && (
            <div 
              className="absolute left-0 top-full z-50 w-40 rounded-lg border border-border/50 bg-card shadow-lg pt-1"
            >
              <div className="p-1">
                {CHART_TYPES.map((ct) => (
                  <button
                    key={ct.value}
                    onClick={() => {
                      setChartType(ct.value)
                      setShowChartTypeMenu(false)
                    }}
                    className={cn(
                      "flex w-full items-center rounded px-2 py-1.5 text-left text-xs transition-colors",
                      chartType === ct.value
                        ? "bg-primary/15 text-primary font-medium"
                        : "text-foreground hover:bg-secondary"
                    )}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border/50 mx-1" />

        {/* Indicators button */}
        <div className="relative">
          <button
            onClick={() => setShowIndicatorMenu(!showIndicatorMenu)}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
              showIndicatorMenu || activeIndicators.length > 0
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LineChart className="h-3 w-3" />
            Indicators
            {activeIndicators.length > 0 && (
              <span className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                {activeIndicators.length}
              </span>
            )}
          </button>

          <IndicatorSearchPanel
            open={showIndicatorMenu}
            onClose={() => setShowIndicatorMenu(false)}
            onAddIndicator={handleAddIndicator}
            activeIndicatorTypes={activeIndicators.map((i) => i.type)}
            favorites={favoriteIndicators}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        {/* Spacer to push view controls to far right */}
        <div className="flex-1" />

        {/* View controls - far right of toolbar row */}
        {(onToggleViewMode || onToggleFullscreen) && (
          <div className="flex items-center gap-0.5 pr-1.5">
            {/* Multi-chart layout picker */}
            {(onShowLayoutPicker || onToggleViewMode) && (
              <div className="relative" ref={layoutPickerRef}>
                <button
                  onClick={() => onShowLayoutPicker?.()}
                  className={cn(
                    "rounded p-1 transition-colors",
                    viewMode === "multi"
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Chart layout"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>

                {/* Layout picker popover */}
                {showLayoutPicker && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border/50 bg-card shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2.5 pt-2 pb-1">
                      <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Chart Layout
                      </div>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {/* Single option */}
                      <button
                        onClick={() => {
                          if (viewMode === "multi" && onToggleViewMode) onToggleViewMode()
                          onShowLayoutPicker?.()
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                          viewMode === "single"
                            ? "bg-primary/15 text-primary"
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        <div className="w-[22px] h-[18px] rounded-[2px] border border-current flex items-center justify-center">
                          <div className="w-[14px] h-[10px] rounded-[1px] bg-current opacity-60" />
                        </div>
                        <span className="text-[11px] font-medium">Single Chart</span>
                      </button>

                      {MULTI_LAYOUTS.map((layout) => (
                        <button
                          key={layout.value}
                          onClick={() => onSelectLayout?.(layout.value)}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                            viewMode === "multi" && multiLayout === layout.value
                              ? "bg-primary/15 text-primary"
                              : "text-foreground hover:bg-secondary"
                          )}
                        >
                          {layout.icon}
                          <span className="text-[11px] font-medium">{layout.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Maximize"}
              >
                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Chart container (flex col for main chart + pane indicators) ── */}
      <div className="flex flex-col flex-1 min-h-0">
      <div className="relative flex-1 min-h-0">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs text-muted-foreground">
                Loading {pair} data...
              </span>
            </div>
          </div>
        )}
        
        {/* Chart Info Ticker - Top Left */}
        <div className="absolute left-2 top-1 z-20 flex flex-col gap-1.5">
          {/* Ticker Display */}
          <div className="flex items-center gap-2 rounded border border-border/50 bg-card/95 backdrop-blur-sm px-2.5 py-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 border-r border-border/30 pr-2.5">
              <span className="text-xs font-bold text-foreground">{pair}</span>
              <span className="text-[9px] text-muted-foreground">•</span>
              <span className="text-[9px] text-muted-foreground">Bybit</span>
            </div>
            
            <div className="flex items-center gap-1.5 border-r border-border/30 pr-2.5">
              <span className="text-[9px] text-muted-foreground">{selectedTf.toUpperCase()}</span>
              <span className="text-[9px] text-muted-foreground">•</span>
              <span className="text-[9px] text-muted-foreground capitalize">{chartType}</span>
            </div>
            
            {ohlcData && chartSettings.showChartValues && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-muted-foreground">O</span>
                  <span className="text-[10px] font-mono text-foreground">{ohlcData.open.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-muted-foreground">H</span>
                  <span className="text-[10px] font-mono text-trading-green">{ohlcData.high.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-muted-foreground">L</span>
                  <span className="text-[10px] font-mono text-trading-red">{ohlcData.low.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-muted-foreground">C</span>
                  <span className={`text-[10px] font-mono ${ohlcData.close >= ohlcData.open ? 'text-trading-green' : 'text-trading-red'}`}>
                    {ohlcData.close.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Overlay Indicators (shown under ticker) */}
          {overlayIndicators.map((ind) => {
            const indDef = getIndicatorDef(ind.type)
            const paramStr = Object.entries(ind.params)
              .filter(([k]) => k !== "source" && k !== "type")
              .map(([, v]) => v)
              .join(",")
            return (
              <div
                key={ind.id}
                className="flex items-center gap-1.5 rounded border border-border/50 bg-card/95 backdrop-blur-sm px-2 py-1 shadow-sm"
              >
                <div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: ind.color || indDef?.defaultColor }}
                />
                <span className="text-[10px] font-medium text-foreground">
                  {indDef?.label || ind.type}
                  {paramStr && `(${paramStr})`}
                </span>
                
                <button
                  onClick={() => handleToggleIndicatorVisibility(ind.id)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title={ind.visible === false ? "Show" : "Hide"}
                >
                  {ind.visible === false ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingIndicator(editingIndicator === ind.id ? null : ind.id)
                  }}
                  className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  title="Settings"
                >
                  <Settings className="h-3 w-3" />
                </button>
                
                <button
                  onClick={() => handleRemoveIndicator(ind.id)}
                  className="rounded p-0.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
                  title="Remove"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Indicator Settings Dialog (TradingView-style) */}
        {editingIndicator && (() => {
          const ind = activeIndicators.find((i) => i.id === editingIndicator)
          if (!ind) return null
          return (
            <IndicatorSettingsDialog
              indicator={ind}
              onUpdate={handleUpdateIndicator}
              onClose={() => setEditingIndicator(null)}
            />
          )
        })()}
        
        {/* Chart Canvas - Wrapper (right-click only; drag is handled by overlay below) */}
        <div 
          className="h-full w-full relative"
          onContextMenu={handleRightClick}
        >
          <div ref={chartContainerRef} className="h-full w-full" />
          
          {/* Drawing render canvas (always pointer-events-none, just displays drawings) */}
          <canvas
            ref={drawingCanvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 15 }}
          />

          {/* Cursor style layer — pointer-events:none so all events reach lightweight-charts
              natively. The actual interception happens via capture listeners on the container. */}
          {(!activeTool || activeTool === "cursor") && drawings.length > 0 && (
            <div
              className="absolute inset-0"
              style={{
                zIndex: 18,
                pointerEvents: "none",
                cursor: draggingId ? "grabbing" : overlayCursor,
              }}
            />
          )}

          {/* Drawing interaction layer (only active when a drawing tool is selected) */}
          {activeTool && activeTool !== "cursor" && activeTool !== "__clear_drawings__" && (
            <div
              className="absolute inset-0"
              style={{ zIndex: 20, cursor: "crosshair" }}
              onClick={handleDrawingClick}
              onMouseDown={handleDrawingMouseDown}
              onMouseMove={handleDrawingMouseMove}
              onMouseUp={handleDrawingMouseUp}
              onMouseLeave={() => {
                // Only cancel pen drawing on mouse leave
                if (isDrawingRef.current && activeToolRef.current === "pen") {
                  handleDrawingMouseUp()
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault()
                // Cancel current drawing on right-click
                if (drawingPhaseRef.current === "placing") {
                  setDrawingInProgress([])
                  setDrawingPhase("idle")
                }
                handleRightClick(e as unknown as React.MouseEvent<HTMLDivElement>)
              }}
              onWheel={(e) => {
                // Forward wheel events to chart for zoom
                const chartEl = chartContainerRef.current
                if (chartEl) {
                  const syntheticEvent = new WheelEvent("wheel", {
                    deltaX: e.deltaX,
                    deltaY: e.deltaY,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    bubbles: true,
                  })
                  chartEl.dispatchEvent(syntheticEvent)
                }
              }}
            />
          )}

          {/* Active Drawing Tool Indicator */}
          {activeTool && activeTool !== "cursor" && activeTool !== "__clear_drawings__" && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 backdrop-blur-sm px-2 py-1" style={{ zIndex: 25 }}>
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-medium text-primary capitalize">
                {activeTool.replace(/-/g, " ")}
              </span>
              <button
                onClick={() => onToolSelect?.("cursor")}
                className="ml-1 text-primary/60 hover:text-primary text-[10px]"
              >
                ESC
              </button>
            </div>
          )}
          
          {/* Drawing Context Menu (right-click on a drawing) */}
          {drawingContextMenu && (() => {
            const drawing = drawings.find(d => d.id === drawingContextMenu.drawingId)
            if (!drawing) return null
            const isFib = drawing.tool.includes("fib")
            return (
              <div
                className="fixed z-50 min-w-[200px] rounded-lg border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl py-1 animate-in fade-in-0 zoom-in-95"
                style={{ top: drawingContextMenu.y, left: drawingContextMenu.x }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  {drawing.tool.replace(/-/g, " ")}
                </div>

                {/* Quick color swatches */}
                <div className="px-3 py-2 flex items-center gap-1.5">
                  {(isFib
                    ? ["#787B86", "#F23645", "#FF9800", "#FFC107", "#4CAF50", "#2962FF", "#9C27B0", "#E040FB"]
                    : ["#2196F3", "#4CAF50", "#FF5252", "#FF9800", "#E040FB", "#00BCD4", "#FFFFFF", "#FFD740"]
                  ).map(color => (
                    <button
                      key={color}
                      className={cn("w-5 h-5 rounded-full border-2 transition-all hover:scale-110", drawing.color === color ? "border-foreground scale-110" : "border-transparent")}
                      style={{ backgroundColor: color }}
                      onClick={() => { updateDrawing(drawingContextMenu.drawingId, { color }); setDrawingContextMenu(null) }}
                    />
                  ))}
                </div>
                
                <div className="h-px bg-border/40 mx-2 my-0.5" />

                {/* Visual Order submenu */}
                <div className="group/vo relative">
                  <button className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2 justify-between">
                    <span className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h3m4 0h11M3 12h7m4 0h7M3 17h11m4 0h3"/></svg>
                      Visual order
                    </span>
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                  </button>
                  <div className="invisible group-hover/vo:visible absolute left-full top-0 ml-1 min-w-[140px] rounded-lg border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl py-1">
                    {[
                      { label: "Bring to front", action: () => { const maxZ = Math.max(...drawings.map(d => d.zIndex || 0), 0); updateDrawing(drawingContextMenu.drawingId, { zIndex: maxZ + 1 }) } },
                      { label: "Send to back", action: () => { const minZ = Math.min(...drawings.map(d => d.zIndex || 0), 0); updateDrawing(drawingContextMenu.drawingId, { zIndex: minZ - 1 }) } },
                      { label: "Bring forward", action: () => updateDrawing(drawingContextMenu.drawingId, { zIndex: (drawing.zIndex || 0) + 1 }) },
                      { label: "Send backward", action: () => updateDrawing(drawingContextMenu.drawingId, { zIndex: (drawing.zIndex || 0) - 1 }) },
                    ].map(item => (
                      <button key={item.label} className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors" onClick={() => { item.action(); setDrawingContextMenu(null) }}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clone */}
                <button className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                  onClick={() => {
                    const clone: Drawing = { ...drawing, id: `drawing-${Date.now()}`, points: drawing.points.map(p => ({ ...p, price: p.price * 1.002 })) }
                    setDrawings(prev => [...prev, clone])
                    setDrawingContextMenu(null)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  Clone
                </button>

                {/* Copy */}
                <button className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify({ tool: drawing.tool, color: drawing.color, lineWidth: drawing.lineWidth, points: drawing.points }))
                    setDrawingContextMenu(null)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  Copy
                </button>

                <div className="h-px bg-border/40 mx-2 my-0.5" />

                {/* Hide */}
                <button className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                  onClick={() => { updateDrawing(drawingContextMenu.drawingId, { hidden: !drawing.hidden }); setDrawingContextMenu(null) }}
                >
                  {drawing.hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {drawing.hidden ? "Show" : "Hide"}
                </button>

                {/* Lock */}
                <button className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                  onClick={() => { updateDrawing(drawingContextMenu.drawingId, { locked: !drawing.locked }); setDrawingContextMenu(null) }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {drawing.locked
                      ? <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></>
                      : <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></>
                    }
                  </svg>
                  {drawing.locked ? "Unlock" : "Lock"}
                </button>

                <div className="h-px bg-border/40 mx-2 my-0.5" />

                {/* Settings */}
                <button className="w-full px-3 py-1.5 text-left text-xs text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                  onClick={() => { setDrawingSettings({ drawingId: drawingContextMenu.drawingId, tab: "style" }); setDrawingContextMenu(null) }}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Settings
                </button>

                {/* Remove */}
                <button className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  onClick={() => deleteDrawing(drawingContextMenu.drawingId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            )
          })()}
          
          {/* Drawing Settings Panel (opened from context menu > Settings) */}
          {drawingSettings && (() => {
            const drawing = drawings.find(d => d.id === drawingSettings.drawingId)
            if (!drawing) return null
            const isFib = drawing.tool.includes("fib")
            const fibColors = ["#787B86", "#F23645", "#FF9800", "#FFC107", "#4CAF50", "#2962FF", "#9C27B0"]
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDrawingSettings(null)}>
                <div className="w-full max-w-md max-h-[70vh] rounded-xl border border-border/40 shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: "#1e1e2a" }} onClick={(e) => e.stopPropagation()}>
                  {/* Header with tabs */}
                  <div className="flex items-center justify-between border-b border-border/20 px-4 py-2.5 shrink-0" style={{ backgroundColor: "#252535" }}>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-semibold text-foreground capitalize">{drawing.tool.replace(/-/g, " ")} Settings</h3>
                    </div>
                    <button onClick={() => setDrawingSettings(null)} className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10 transition-colors">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  {/* Tabs */}
                  <div className="flex border-b border-border/20 px-4" style={{ backgroundColor: "#252535" }}>
                    {(["style", "text"] as const).map(tab => (
                      <button key={tab} onClick={() => setDrawingSettings({ ...drawingSettings, tab })}
                        className={cn("px-3 py-1.5 text-[11px] font-medium capitalize transition-colors border-b-2", drawingSettings.tab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}
                      >{tab}</button>
                    ))}
                  </div>
                  {/* Content */}
                  <div className="overflow-y-auto flex-1 p-4 space-y-4">
                    {drawingSettings.tab === "style" && (
                      <>
                        {/* Color */}
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Color</label>
                          <ColorPalette value={drawing.color} onChange={(c) => updateDrawing(drawing.id, { color: c })} />
                        </div>
                        {/* Line width */}
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Line Width</label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4].map(w => (
                              <button key={w} onClick={() => updateDrawing(drawing.id, { lineWidth: w })}
                                className={cn("flex h-8 w-12 items-center justify-center rounded-md text-[10px] font-medium transition-colors", drawing.lineWidth === w ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground border border-border/30 hover:border-border/60")}>
                                {w}px
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Line style */}
                        <div>
                          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Line Style</label>
                          <div className="flex items-center gap-1.5">
                            {(["solid", "dashed", "dotted"] as const).map(s => (
                              <button key={s} onClick={() => updateDrawing(drawing.id, { lineStyle: s })}
                                className={cn("flex h-8 flex-1 items-center justify-center rounded-md text-[10px] font-medium transition-colors gap-1 capitalize", (drawing.lineStyle || "solid") === s ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground border border-border/30 hover:border-border/60")}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Toggles */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-muted-foreground">Price labels</label>
                            <ToggleSwitch checked={drawing.showPriceLabels ?? true} onChange={(v) => updateDrawing(drawing.id, { showPriceLabels: v })} />
                          </div>
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] text-muted-foreground">Bars range</label>
                            <ToggleSwitch checked={drawing.showBarRange ?? false} onChange={(v) => updateDrawing(drawing.id, { showBarRange: v })} />
                          </div>
                        </div>
                        {/* Fib-specific level colors */}
                        {isFib && (
                          <div>
                            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Fib Level Colors</label>
                            <div className="space-y-1.5">
                              {[0, 0.236, 0.382, 0.5, 0.618, 0.786, 1].map((level, i) => (
                                <div key={level} className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-muted-foreground w-12">{(level * 100).toFixed(1)}%</span>
                                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: fibColors[i % fibColors.length] }} />
                                  <span className="text-[10px] font-mono text-muted-foreground">{fibColors[i % fibColors.length]}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {drawingSettings.tab === "text" && (
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Text Label</label>
                        <p className="text-xs text-muted-foreground">Text annotations can be edited by double-clicking the drawing on the chart.</p>
                      </div>
                    )}
                  </div>
                  {/* Footer */}
                  <div className="border-t border-border/20 px-4 py-2.5 flex justify-end shrink-0" style={{ backgroundColor: "#252535" }}>
                    <Button size="sm" onClick={() => setDrawingSettings(null)}>Done</Button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Auto Scale Toggle - Bottom Right */}
          <div className="absolute bottom-3 right-3 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setAutoScale(prev => !prev)
              }}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded border text-[10px] font-semibold transition-all duration-200",
                autoScale
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border/50 bg-card/80 text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              title={autoScale ? "Auto Scale ON" : "Auto Scale OFF"}
            >
              A
            </button>
          </div>
        </div>
        
        {/* Right-click Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-50 w-56 rounded-lg border border-border/50 bg-card shadow-lg"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="p-1">
              {contextMenu.price && (
                <button
                  onClick={() => copyPriceToClipboard(contextMenu.price)}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-secondary transition-colors"
                >
                  <span className="text-foreground">Copy Price: ${contextMenu.price.toFixed(2)}</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  setContextMenu(null)
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-secondary transition-colors"
              >
                <span className="text-foreground">Object Tree</span>
              </button>
              
              {activeIndicators.length > 0 && (
                <button
                  onClick={removeAllIndicators}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove {activeIndicators.length} Indicator{activeIndicators.length > 1 ? "s" : ""}</span>
                </button>
              )}

              {drawings.length > 0 && (
                <button
                  onClick={() => { clearAllDrawings(); setContextMenu(null) }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear {drawings.length} Drawing{drawings.length > 1 ? "s" : ""}</span>
                </button>
              )}
              
              <div className="my-1 h-px bg-border/50" />
              
              <button
                onClick={() => {
                  setShowChartSettings(true)
                  setContextMenu(null)
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-secondary transition-colors"
              >
                <Settings className="h-3 w-3" />
                <span className="text-foreground">Settings</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Chart Settings Modal - grey popup, no backdrop blur */}
        {showChartSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowChartSettings(false)}>
            <div
              className="w-full max-w-lg max-h-[85vh] rounded-xl border border-border/40 shadow-2xl overflow-hidden flex flex-col"
              style={{ backgroundColor: "#1e1e2a" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/20 px-5 py-3 shrink-0" style={{ backgroundColor: "#252535" }}>
                <h3 className="text-sm font-semibold text-foreground">Chart Settings</h3>
                <button
                  onClick={() => setShowChartSettings(false)}
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-white/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-5 space-y-6 scrollbar-thin">
                {/* ── SYMBOL SECTION ── */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Symbol</h4>
                  <div className="text-[11px] text-muted-foreground mb-3">{pair}</div>
                  
                  {/* Body colors */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Body</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Up</label>
                        <ColorPalette value={chartSettings.bodyUpColor} onChange={(c) => setChartSettings(s => ({ ...s, bodyUpColor: c }))} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Down</label>
                        <ColorPalette value={chartSettings.bodyDownColor} onChange={(c) => setChartSettings(s => ({ ...s, bodyDownColor: c }))} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Border colors */}
                  <div className="space-y-2.5 mt-3">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Borders</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Up</label>
                        <ColorPalette value={chartSettings.borderUpColor} onChange={(c) => setChartSettings(s => ({ ...s, borderUpColor: c }))} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Down</label>
                        <ColorPalette value={chartSettings.borderDownColor} onChange={(c) => setChartSettings(s => ({ ...s, borderDownColor: c }))} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Wick colors */}
                  <div className="space-y-2.5 mt-3">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Wicks</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Up</label>
                        <ColorPalette value={chartSettings.wickUpColor} onChange={(c) => setChartSettings(s => ({ ...s, wickUpColor: c }))} />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Down</label>
                        <ColorPalette value={chartSettings.wickDownColor} onChange={(c) => setChartSettings(s => ({ ...s, wickDownColor: c }))} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Timezone */}
                  <div className="mt-4">
                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Timezone</label>
                    <select
                      value={chartSettings.timezone}
                      onChange={(e) => setChartSettings(s => ({ ...s, timezone: e.target.value }))}
                      className="w-full rounded-md border border-border/40 px-2.5 py-1.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                      style={{ backgroundColor: "#2a2a3a" }}
                    >
                      {["UTC", "America/New_York", "America/Chicago", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Europe/Moscow", "Asia/Tokyo", "Asia/Shanghai", "Asia/Singapore", "Asia/Dubai", "Australia/Sydney"].map(tz => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="h-px bg-border/20" />
                
                {/* ── STATUS LINE SECTION ── */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Status Line</h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-muted-foreground">Chart Values (O, H, L, C)</label>
                      <ToggleSwitch checked={chartSettings.showChartValues} onChange={(v) => setChartSettings(s => ({ ...s, showChartValues: v }))} />
                    </div>

                  </div>
                </div>
                
                <div className="h-px bg-border/20" />
                
                {/* ── CANVAS SECTION ── */}
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">Canvas</h4>
                  
                  {/* Background */}
                  <div className="mb-4">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Background</span>
                    <div className="flex items-center gap-2 mb-2.5">
                      {(["solid", "gradient"] as const).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setChartSettings(s => ({ ...s, bgMode: mode }))}
                          className={cn(
                            "rounded-md px-3 py-1 text-[10px] font-medium transition-colors capitalize",
                            chartSettings.bgMode === mode
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "text-muted-foreground border border-border/30 hover:border-border/60"
                          )}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                    {chartSettings.bgMode === "solid" ? (
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Color</label>
                        <ColorPalette value={chartSettings.bgColor} onChange={(c) => setChartSettings(s => ({ ...s, bgColor: c }))} />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">From</label>
                          <ColorPalette value={chartSettings.bgGradientFrom} onChange={(c) => setChartSettings(s => ({ ...s, bgGradientFrom: c }))} />
                        </div>
                        <div>
                          <label className="text-[10px] text-muted-foreground mb-1 block">To</label>
                          <ColorPalette value={chartSettings.bgGradientTo} onChange={(c) => setChartSettings(s => ({ ...s, bgGradientTo: c }))} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Grid Lines */}
                  <div className="mb-4">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Grid Lines</span>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {([
                        { v: "both", l: "Both" },
                        { v: "vertical", l: "Vertical" },
                        { v: "horizontal", l: "Horizontal" },
                        { v: "none", l: "None" },
                      ] as const).map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setChartSettings(s => ({ ...s, gridMode: opt.v }))}
                          className={cn(
                            "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
                            chartSettings.gridMode === opt.v
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "text-muted-foreground border border-border/30 hover:border-border/60"
                          )}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                    {chartSettings.gridMode !== "none" && (
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Grid Color</label>
                        <ColorPalette value={chartSettings.gridColor} onChange={(c) => setChartSettings(s => ({ ...s, gridColor: c }))} />
                      </div>
                    )}
                  </div>
                  
                  {/* Crosshair */}
                  <div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider block mb-2">Crosshair</span>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Color</label>
                        <ColorPalette value={chartSettings.crosshairColor} onChange={(c) => setChartSettings(s => ({ ...s, crosshairColor: c }))} />
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1.5 block">Line Thickness</label>
                        <div className="flex items-center gap-1.5">
                          {([1, 2, 3, 4] as const).map(w => (
                            <button
                              key={w}
                              onClick={() => setChartSettings(s => ({ ...s, crosshairLineWidth: w }))}
                              className={cn(
                                "flex h-8 w-12 items-center justify-center rounded-md text-[10px] font-medium transition-colors",
                                chartSettings.crosshairLineWidth === w
                                  ? "bg-primary/20 text-primary border border-primary/30"
                                  : "text-muted-foreground border border-border/30 hover:border-border/60"
                              )}
                            >
                              {w}px
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1.5 block">Line Type</label>
                        <div className="flex items-center gap-1.5">
                          {([
                            { v: "solid" as const, l: "Solid", preview: "━━━" },
                            { v: "dashed" as const, l: "Dashed", preview: "- - -" },
                            { v: "dotted" as const, l: "Dotted", preview: "···" },
                          ]).map(opt => (
                            <button
                              key={opt.v}
                              onClick={() => setChartSettings(s => ({ ...s, crosshairLineType: opt.v }))}
                              className={cn(
                                "flex h-8 flex-1 items-center justify-center rounded-md text-[10px] font-medium transition-colors gap-1",
                                chartSettings.crosshairLineType === opt.v
                                  ? "bg-primary/20 text-primary border border-primary/30"
                                  : "text-muted-foreground border border-border/30 hover:border-border/60"
                              )}
                            >
                              <span className="font-mono text-[9px]">{opt.preview}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="border-t border-border/20 px-5 py-3 flex justify-end gap-2 shrink-0" style={{ backgroundColor: "#252535" }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowChartSettings(false)}
                  className="border-border/40 text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (chartRef.current && candleSeriesRef.current) {
                      // Apply candlestick colors
                      candleSeriesRef.current.applyOptions({
                        upColor: chartSettings.bodyUpColor,
                        downColor: chartSettings.bodyDownColor,
                        borderUpColor: chartSettings.borderUpColor,
                        borderDownColor: chartSettings.borderDownColor,
                        wickUpColor: chartSettings.wickUpColor,
                        wickDownColor: chartSettings.wickDownColor,
                      })
                      
                      // Apply grid
                      const showV = chartSettings.gridMode === "both" || chartSettings.gridMode === "vertical"
                      const showH = chartSettings.gridMode === "both" || chartSettings.gridMode === "horizontal"
                      chartRef.current.applyOptions({
                        layout: {
                          background: { type: ColorType.Solid, color: chartSettings.bgMode === "solid" ? chartSettings.bgColor : chartSettings.bgGradientFrom },
                        },
                        grid: {
                          vertLines: { visible: showV, color: chartSettings.gridColor },
                          horzLines: { visible: showH, color: chartSettings.gridColor },
                        },
                        crosshair: {
                          vertLine: {
                            color: chartSettings.crosshairColor,
                            width: chartSettings.crosshairLineWidth,
                            style: chartSettings.crosshairLineType === "solid" ? 0 : chartSettings.crosshairLineType === "dashed" ? 1 : 3,
                          },
                          horzLine: {
                            color: chartSettings.crosshairColor,
                            width: chartSettings.crosshairLineWidth,
                            style: chartSettings.crosshairLineType === "solid" ? 0 : chartSettings.crosshairLineType === "dashed" ? 1 : 3,
                          },
                        },
                      })
                      
                    }
                    setShowChartSettings(false)
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Pane Indicators (RSI, MACD, VOL, etc.) ── */}
      {orderedPaneIndicators.length > 0 && (
        <div className="flex flex-col border-t border-border/20">
          {orderedPaneIndicators.map((ind, idx) => (
            <IndicatorPane
              key={ind.id}
              indicator={ind}
              candles={storedCandles}
              isFirst={idx === 0}
              isLast={idx === orderedPaneIndicators.length - 1}
              isLastPane={idx === orderedPaneIndicators.length - 1}
              collapsed={paneCollapsed[ind.id] || false}
              visibleLogicalRange={mainVisibleRange}
              onTimeRangeChange={handlePaneTimeRangeChange}
              onVisibilityToggle={() => handleToggleIndicatorVisibility(ind.id)}
              onMoveUp={() => {
                setPaneOrder((prev) => {
                  const i = prev.indexOf(ind.id)
                  if (i <= 0) return prev
                  const next = [...prev]
                  ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                  return next
                })
              }}
              onMoveDown={() => {
                setPaneOrder((prev) => {
                  const i = prev.indexOf(ind.id)
                  if (i >= prev.length - 1) return prev
                  const next = [...prev]
                  ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
                  return next
                })
              }}
              onCollapse={() => setPaneCollapsed((prev) => ({ ...prev, [ind.id]: true }))}
              onRestore={() => setPaneCollapsed((prev) => ({ ...prev, [ind.id]: false }))}
              onDelete={() => handleRemoveIndicator(ind.id)}
              onOpenSettings={() => setEditingIndicator(ind.id)}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

// ─── Multi-chart layout definitions ──────────────────
type MultiLayout = "2x2" | "1x3" | "2x3"
const MULTI_LAYOUTS: { value: MultiLayout; label: string; count: number; icon: React.ReactNode }[] = [
  {
    value: "1x3",
    label: "3 Charts",
    count: 3,
    icon: (
      <div className="grid grid-cols-3 gap-[2px] w-[28px] h-[18px]">
        {[0,1,2].map(i => <div key={i} className="rounded-[1px] bg-current" />)}
      </div>
    ),
  },
  {
    value: "2x2",
    label: "4 Charts",
    count: 4,
    icon: (
      <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-[22px] h-[18px]">
        {[0,1,2,3].map(i => <div key={i} className="rounded-[1px] bg-current" />)}
      </div>
    ),
  },
  {
    value: "2x3",
    label: "6 Charts",
    count: 6,
    icon: (
      <div className="grid grid-cols-3 grid-rows-2 gap-[2px] w-[28px] h-[18px]">
        {[0,1,2,3,4,5].map(i => <div key={i} className="rounded-[1px] bg-current" />)}
      </div>
    ),
  },
]

const DEFAULT_MULTI_PAIRS = [
  "BTC/USDT",
  "ETH/USDT",
  "SOL/USDT",
  "BNB/USDT",
  "XRP/USDT",
  "DOGE/USDT",
]

// ─── Main exported wrapper ──────────────────────────
interface CandlestickChartAreaProps {
  pair: string
  onPairChange?: (pair: string) => void
  activeTool?: string | null
  onToolSelect?: (tool: string | null) => void
  activeIndicators?: ActiveIndicator[]
  onIndicatorsChange?: (indicators: ActiveIndicator[]) => void
}

export function CandlestickChartArea({
  pair,
  onPairChange,
  activeTool,
  onToolSelect,
  activeIndicators: externalIndicators,
  onIndicatorsChange: externalOnIndicatorsChange,
}: CandlestickChartAreaProps) {
  const [viewMode, setViewMode] = useState<"single" | "multi">("single")
  const [multiLayout, setMultiLayout] = useState<MultiLayout>("2x2")
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const layoutPickerRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [multiPairs, setMultiPairs] = useState(DEFAULT_MULTI_PAIRS)
  const [internalIndicators, setInternalIndicators] = useState<ActiveIndicator[]>([])
  const indicators = externalIndicators || internalIndicators
  const setIndicators = externalOnIndicatorsChange || setInternalIndicators

  const selectedPair = pair

  // Close layout picker on outside click
  useEffect(() => {
    if (!showLayoutPicker) return
    const close = (e: MouseEvent) => {
      if (layoutPickerRef.current && !layoutPickerRef.current.contains(e.target as Node)) {
        setShowLayoutPicker(false)
      }
    }
    // Use a short delay so the toggle button's own click handler fires first
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", close)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener("mousedown", close)
    }
  }, [showLayoutPicker])

  const handleMultiPairChange = (index: number, newPair: string) => {
    setMultiPairs((prev) => {
      const next = [...prev]
      next[index] = newPair
      return next
    })
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isFullscreen])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f)
  }, [])

  const handleSelectLayout = useCallback((layout: MultiLayout) => {
    setMultiLayout(layout)
    setViewMode("multi")
    setShowLayoutPicker(false)
  }, [])

  // Get grid classes for selected multi layout
  const getMultiGridClasses = () => {
    switch (multiLayout) {
      case "1x3": return "grid-cols-3 grid-rows-1"
      case "2x2": return "grid-cols-2 grid-rows-2"
      case "2x3": return "grid-cols-3 grid-rows-2"
      default: return "grid-cols-2 grid-rows-2"
    }
  }

  const getVisiblePairs = () => {
    const layoutDef = MULTI_LAYOUTS.find(l => l.value === multiLayout)
    const count = layoutDef?.count || 4
    return multiPairs.slice(0, count)
  }

  // ── Inline render helper ──
  const renderChartContent = (fullscreen: boolean) => {
    if (viewMode === "single") {
      return (
        <SingleChart
          pair={selectedPair}
          onPairChange={onPairChange}
          isFullscreen={fullscreen}
          activeIndicators={indicators}
          onIndicatorsChange={setIndicators}
          activeTool={activeTool}
          onToolSelect={onToolSelect}
          viewMode={viewMode}
          onToggleViewMode={() => {
            setShowLayoutPicker(false)
            setViewMode("multi")
          }}
          onToggleFullscreen={toggleFullscreen}
          multiLayout={multiLayout}
          showLayoutPicker={showLayoutPicker}
          onShowLayoutPicker={() => setShowLayoutPicker((prev) => !prev)}
          onSelectLayout={handleSelectLayout}
          layoutPickerRef={layoutPickerRef}
        />
      )
    }

    const visiblePairs = getVisiblePairs()
    return (
      <div className={cn("grid h-full gap-[2px] p-[2px] bg-background", getMultiGridClasses())}>
        {visiblePairs.map((p, idx) => (
          <div key={`${multiLayout}-${idx}`} className="min-h-0 min-w-0">
            <SingleChart
              pair={p}
              showPairSelector
              onPairChange={(newPair) => handleMultiPairChange(idx, newPair)}
              isFullscreen={fullscreen}
              activeIndicators={indicators}
              onIndicatorsChange={setIndicators}
              activeTool={activeTool}
              onToolSelect={onToolSelect}
              viewMode={viewMode}
              onToggleViewMode={() => {
                setViewMode("single")
                setShowLayoutPicker(false)
              }}
              onToggleFullscreen={toggleFullscreen}
              multiLayout={multiLayout}
              showLayoutPicker={showLayoutPicker}
              onShowLayoutPicker={() => setShowLayoutPicker((prev) => !prev)}
              onSelectLayout={handleSelectLayout}
              layoutPickerRef={layoutPickerRef}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Normal view */}
      <div className={cn("h-full", isFullscreen && "invisible")}>
        <div className="flex h-full flex-col bg-card">
          <div className="flex-1 min-h-0">
            {renderChartContent(false)}
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Fullscreen body: sidebar + chart, full height */}
          <div className="flex flex-1 min-h-0">
            {/* Chart Tools Sidebar in fullscreen */}
            <div className="flex shrink-0">
              <ChartToolsSidebar
                activeTool={activeTool || null}
                onToolSelect={(tool) => onToolSelect?.(tool)}
                selectedPair={selectedPair}
                activeIndicators={indicators}
                compact
              />
            </div>

            {/* Chart area */}
            <div className="flex-1 min-h-0 min-w-0 relative">
              <div className="flex h-full flex-col bg-card">
                <div className="flex-1 min-h-0">
                  {renderChartContent(true)}
                </div>
              </div>

              {/* Floating exit button — below navbar, mid-upper right */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute right-4 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-card/90 hover:bg-secondary/90 backdrop-blur-sm transition-all duration-150 border border-border/40 hover:border-border/70 shadow-lg group z-[60]"
                style={{ top: "76px" }}
                title="Exit fullscreen (Esc)"
              >
                <X className="h-3.5 w-3.5 transition-colors" />
                <span>Exit fullscreen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
