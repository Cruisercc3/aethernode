"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { getIndicatorDef, type ActiveIndicator } from "@/lib/indicators"
import { X, ChevronDown } from "lucide-react"

interface IndicatorSettingsDialogProps {
  indicator: ActiveIndicator
  onUpdate: (id: string, updates: Partial<ActiveIndicator>) => void
  onClose: () => void
}

type Tab = "inputs" | "style" | "visibility"

const LINE_STYLES = [
  { label: "Solid", value: "solid", dash: [] },
  { label: "Dashed", value: "dashed", dash: [4, 4] },
  { label: "Dotted", value: "dotted", dash: [2, 2] },
]

const PRESET_COLORS = [
  "#2196F3", "#FF6D00", "#4CAF50", "#ef4444", "#9C27B0",
  "#00BCD4", "#FF9800", "#E91E63", "#795548", "#607D8B",
  "#CDDC39", "#3F51B5", "#009688", "#FFC107", "#8BC34A",
]

export function IndicatorSettingsDialog({
  indicator,
  onUpdate,
  onClose,
}: IndicatorSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<Tab>("inputs")
  const [localParams, setLocalParams] = useState<Record<string, number | string>>({ ...indicator.params })
  const [localColor, setLocalColor] = useState(indicator.color || "#2196F3")
  const [localExtraColors, setLocalExtraColors] = useState<Record<string, string>>(indicator.extraColors || {})
  const [localLineWidth, setLocalLineWidth] = useState(indicator.lineWidth || 2)
  const [localVisible, setLocalVisible] = useState(indicator.visible !== false)
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const def = getIndicatorDef(indicator.type)
  const paramLabels = def?.paramLabels || {}

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const handleOk = () => {
    onUpdate(indicator.id, {
      params: localParams,
      color: localColor,
      extraColors: localExtraColors,
      lineWidth: localLineWidth,
      visible: localVisible,
    })
    onClose()
  }

  const handleDefaults = () => {
    if (def) {
      setLocalParams({ ...def.defaultParams })
      setLocalColor(def.defaultColor)
      setLocalExtraColors(def.extraColors || {})
      setLocalLineWidth(2)
      setLocalVisible(true)
    }
  }

  // Get the line names for the Style tab
  const getLineNames = (): { key: string; label: string; colorKey: string }[] => {
    const lines: { key: string; label: string; colorKey: string }[] = []
    lines.push({ key: "main", label: def?.label || indicator.type, colorKey: "main" })
    if (def?.extraColors) {
      Object.keys(def.extraColors).forEach((k) => {
        const label = k.charAt(0).toUpperCase() + k.slice(1)
        lines.push({ key: k, label, colorKey: k })
      })
    }
    return lines
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="w-[360px] rounded-xl border border-border/50 bg-card shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h3 className="text-base font-semibold text-foreground">{def?.label || indicator.type}</h3>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 px-5 border-b border-border/30">
          {(["inputs", "style", "visibility"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-sm pb-2 transition-colors capitalize",
                activeTab === tab
                  ? "text-foreground font-medium border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-5 py-4 min-h-[200px] max-h-[360px] overflow-y-auto">
          {activeTab === "inputs" && (
            <InputsTab
              params={localParams}
              paramLabels={paramLabels}
              onChange={setLocalParams}
            />
          )}
          {activeTab === "style" && (
            <StyleTab
              lines={getLineNames()}
              mainColor={localColor}
              extraColors={localExtraColors}
              lineWidth={localLineWidth}
              showColorPicker={showColorPicker}
              onShowColorPicker={setShowColorPicker}
              onMainColorChange={setLocalColor}
              onExtraColorChange={(key, color) =>
                setLocalExtraColors((prev) => ({ ...prev, [key]: color }))
              }
              onLineWidthChange={setLocalLineWidth}
            />
          )}
          {activeTab === "visibility" && (
            <VisibilityTab
              visible={localVisible}
              onVisibleChange={setLocalVisible}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-card">
          <button
            onClick={handleDefaults}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-secondary"
          >
            Defaults
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs rounded-md border border-border/50 text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOk}
              className="px-4 py-1.5 text-xs rounded-md bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inputs Tab ──────────────────────────────────────────────
function InputsTab({
  params,
  paramLabels,
  onChange,
}: {
  params: Record<string, number | string>
  paramLabels: Record<string, string>
  onChange: (params: Record<string, number | string>) => void
}) {
  const paramKeys = Object.keys(params)

  if (paramKeys.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        No configurable parameters
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Source Radio (for indicators that support source selection) */}
      {params.source !== undefined && (
        <div className="space-y-2 pb-3 border-b border-border/20">
          <label className="text-xs text-muted-foreground font-medium">Source</label>
          <div className="flex flex-wrap gap-1.5">
            {["close", "open", "high", "low", "hl2", "hlc3", "ohlc4"].map((src) => (
              <button
                key={src}
                onClick={() => onChange({ ...params, source: src })}
                className={cn(
                  "px-2 py-1 text-[10px] rounded-md border transition-colors uppercase tracking-wide",
                  params.source === src
                    ? "border-foreground bg-foreground/10 text-foreground"
                    : "border-border/40 text-muted-foreground hover:bg-secondary"
                )}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Numeric Parameters */}
      {paramKeys
        .filter((k) => k !== "source" && k !== "type")
        .map((key) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <label className="text-sm text-foreground">
              {paramLabels[key] || key}
            </label>
            <input
              type="number"
              value={params[key]}
              onChange={(e) => {
                const val = parseFloat(e.target.value)
                if (!isNaN(val)) onChange({ ...params, [key]: val })
              }}
              className="w-20 px-2.5 py-1.5 text-sm text-foreground bg-secondary/60 border border-border/40 rounded-md outline-none focus:border-foreground/40 transition-colors tabular-nums text-right"
              step={typeof params[key] === "number" && params[key] < 1 ? 0.01 : 1}
            />
          </div>
        ))}
    </div>
  )
}

// ─── Style Tab ───────────────────────────────────────────────
function StyleTab({
  lines,
  mainColor,
  extraColors,
  lineWidth,
  showColorPicker,
  onShowColorPicker,
  onMainColorChange,
  onExtraColorChange,
  onLineWidthChange,
}: {
  lines: { key: string; label: string; colorKey: string }[]
  mainColor: string
  extraColors: Record<string, string>
  lineWidth: number
  showColorPicker: string | null
  onShowColorPicker: (key: string | null) => void
  onMainColorChange: (color: string) => void
  onExtraColorChange: (key: string, color: string) => void
  onLineWidthChange: (width: number) => void
}) {
  return (
    <div className="space-y-3">
      {/* Line Colors */}
      {lines.map((line) => {
        const currentColor = line.key === "main" ? mainColor : extraColors[line.key] || mainColor
        return (
          <div key={line.key} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded accent-foreground" />
              <span className="text-sm text-foreground">{line.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Color Swatch */}
              <div className="relative">
                <button
                  onClick={() => onShowColorPicker(showColorPicker === line.key ? null : line.key)}
                  className="h-6 w-6 rounded border border-border/50 transition-transform hover:scale-110"
                  style={{ backgroundColor: currentColor }}
                />
                {showColorPicker === line.key && (
                  <div className="absolute right-0 top-full mt-1 z-10 p-2 rounded-lg bg-card border border-border/50 shadow-xl">
                    <div className="grid grid-cols-5 gap-1.5">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            if (line.key === "main") onMainColorChange(c)
                            else onExtraColorChange(line.key, c)
                            onShowColorPicker(null)
                          }}
                          className={cn(
                            "h-5 w-5 rounded-sm border transition-transform hover:scale-125",
                            currentColor === c ? "border-foreground scale-110" : "border-transparent"
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Line Preview */}
              <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: currentColor }} />
            </div>
          </div>
        )
      })}

      {/* Separator */}
      <div className="border-t border-border/20 pt-3 mt-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Outputs
        </span>
      </div>

      {/* Line Width */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-foreground">Line Width</span>
        <select
          value={lineWidth}
          onChange={(e) => onLineWidthChange(parseInt(e.target.value))}
          className="px-2 py-1 text-sm bg-secondary/60 border border-border/40 rounded-md text-foreground outline-none"
        >
          {[1, 2, 3, 4].map((w) => (
            <option key={w} value={w}>{w}px</option>
          ))}
        </select>
      </div>

      {/* Labels on price scale */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded accent-foreground" />
        <span className="text-sm text-foreground">Labels on price scale</span>
      </label>

      {/* Values in status line */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" defaultChecked className="h-3.5 w-3.5 rounded accent-foreground" />
        <span className="text-sm text-foreground">Values in status line</span>
      </label>
    </div>
  )
}

// ─── Visibility Tab ──────────────────────────────────────────
function VisibilityTab({
  visible,
  onVisibleChange,
}: {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}) {
  const timeframes = ["1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "12h", "1D", "1W", "1M"]

  return (
    <div className="space-y-3">
      {/* Main Visibility */}
      <label className="flex items-center gap-2 cursor-pointer pb-2 border-b border-border/20">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onVisibleChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded accent-foreground"
        />
        <span className="text-sm text-foreground font-medium">Visible</span>
      </label>

      {/* Timeframe Visibility */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Show on timeframes
        </span>
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {timeframes.map((tf) => (
            <label
              key={tf}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-border/30 bg-secondary/30 cursor-pointer hover:bg-secondary/60 transition-colors"
            >
              <input type="checkbox" defaultChecked className="h-3 w-3 rounded accent-foreground" />
              <span className="text-[10px] text-foreground">{tf}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
