"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { INDICATOR_DEFINITIONS, type IndicatorDefinition, type IndicatorGroup } from "@/lib/indicators"
import { Search, Star, X, TrendingUp, Activity, BarChart3, Waves, Gauge } from "lucide-react"

interface IndicatorSearchPanelProps {
  open: boolean
  onClose: () => void
  onAddIndicator: (def: IndicatorDefinition) => void
  activeIndicatorTypes: string[]
  favorites: string[]
  onToggleFavorite: (type: string) => void
}

const GROUP_ICONS: Record<IndicatorGroup, React.ReactNode> = {
  Trend: <TrendingUp className="h-3.5 w-3.5" />,
  Momentum: <Activity className="h-3.5 w-3.5" />,
  Volume: <BarChart3 className="h-3.5 w-3.5" />,
  Volatility: <Waves className="h-3.5 w-3.5" />,
  Oscillator: <Gauge className="h-3.5 w-3.5" />,
}

const GROUP_ORDER: IndicatorGroup[] = ["Trend", "Momentum", "Volatility", "Volume", "Oscillator"]

export function IndicatorSearchPanel({
  open,
  onClose,
  onAddIndicator,
  activeIndicatorTypes,
  favorites,
  onToggleFavorite,
}: IndicatorSearchPanelProps) {
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus search on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearch("")
    }
  }, [open])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open, onClose])

  const filtered = useMemo(() => {
    if (!search.trim()) return INDICATOR_DEFINITIONS
    const q = search.toLowerCase()
    return INDICATOR_DEFINITIONS.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.group.toLowerCase().includes(q)
    )
  }, [search])

  const favoriteList = useMemo(
    () => INDICATOR_DEFINITIONS.filter((d) => favorites.includes(d.type)),
    [favorites]
  )

  const groupedFiltered = useMemo(() => {
    const map = new Map<IndicatorGroup, IndicatorDefinition[]>()
    for (const g of GROUP_ORDER) map.set(g, [])
    for (const d of filtered) {
      const arr = map.get(d.group)
      if (arr) arr.push(d)
    }
    return map
  }, [filtered])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-1 z-50 w-[320px] rounded-lg border border-border/50 bg-card shadow-xl overflow-hidden"
      style={{ maxHeight: "440px" }}
    >
      {/* Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30 bg-card">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search indicators..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
        {/* Favorites Section */}
        {!search && favoriteList.length > 0 && (
          <div className="px-2 pt-2 pb-1">
            <div className="flex items-center gap-1.5 px-2 pb-1.5">
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Favorites
              </span>
            </div>
            {favoriteList.map((def) => (
              <IndicatorRow
                key={def.type}
                def={def}
                isActive={activeIndicatorTypes.includes(def.type)}
                isFavorite
                onAdd={() => onAddIndicator(def)}
                onToggleFavorite={() => onToggleFavorite(def.type)}
              />
            ))}
          </div>
        )}

        {/* Grouped Indicators */}
        {GROUP_ORDER.map((group) => {
          const items = groupedFiltered.get(group) || []
          if (items.length === 0) return null
          return (
            <div key={group} className="px-2 pt-2 pb-1">
              <div className="flex items-center gap-1.5 px-2 pb-1.5">
                <span className="text-muted-foreground">{GROUP_ICONS[group]}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group}
                </span>
                <span className="text-[10px] text-muted-foreground/50 ml-auto">{items.length}</span>
              </div>
              {items.map((def) => (
                <IndicatorRow
                  key={def.type}
                  def={def}
                  isActive={activeIndicatorTypes.includes(def.type)}
                  isFavorite={favorites.includes(def.type)}
                  onAdd={() => onAddIndicator(def)}
                  onToggleFavorite={() => onToggleFavorite(def.type)}
                />
              ))}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-30" />
            <span className="text-sm">No indicators found</span>
            <span className="text-xs opacity-60 mt-0.5">Try a different search term</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Individual Indicator Row ─────────────────────────────────
function IndicatorRow({
  def,
  isActive,
  isFavorite,
  onAdd,
  onToggleFavorite,
}: {
  def: IndicatorDefinition
  isActive: boolean
  isFavorite: boolean
  onAdd: () => void
  onToggleFavorite: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all group",
        isActive
          ? "bg-primary/8 text-foreground"
          : "hover:bg-secondary/60 text-foreground"
      )}
      onClick={onAdd}
    >
      {/* Favorite Star */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite()
        }}
        className={cn(
          "shrink-0 transition-all",
          isFavorite
            ? "text-amber-400"
            : "text-muted-foreground/30 opacity-0 group-hover:opacity-100 hover:text-amber-400"
        )}
      >
        <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-amber-400")} />
      </button>

      {/* Color Dot */}
      <div
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: def.defaultColor }}
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium">{def.label}</span>
          <span className="text-[10px] text-muted-foreground truncate">{def.description}</span>
        </div>
      </div>

      {/* Category Badge */}
      <span
        className={cn(
          "text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 uppercase tracking-wider",
          def.category === "overlay"
            ? "bg-blue-500/10 text-blue-400"
            : "bg-amber-500/10 text-amber-500"
        )}
      >
        {def.category === "overlay" ? "Chart" : "Pane"}
      </span>

      {/* Active indicator */}
      {isActive && (
        <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
      )}
    </div>
  )
}
