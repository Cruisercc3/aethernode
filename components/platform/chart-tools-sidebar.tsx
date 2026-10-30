"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  Minus,
  Square,
  ArrowUpRight,
  PenTool,
  Type,
  Crosshair,
  Trash2,
  Ruler,
  Waves,
  ChevronRight,
  List,
  Target,
  Eraser,
  TrendingDown,
  ScanLine,
  GitFork,
  Compass,
  AreaChart,
} from "lucide-react"

// Custom SVG icon for Projection (triangle-shaped forecast symbol)
function ProjectionIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Base line */}
      <line x1="2" y1="13" x2="14" y2="13" />
      {/* Left arm — up (bullish) */}
      <polyline points="2,13 8,4" />
      {/* Right arm — down (bearish) */}
      <polyline points="8,4 14,9" />
      {/* Dashed projection extension */}
      <line x1="14" y1="9" x2="14" y2="13" strokeDasharray="2 1.5" />
    </svg>
  )
}

interface SubTool {
  id: string
  label: string
}

interface ToolGroup {
  id: string
  icon: React.ElementType
  label: string
  subTools?: SubTool[]
}

const toolGroups: ToolGroup[] = [
  { id: "cursor", icon: Crosshair, label: "Cursor" },
  {
    id: "trendline",
    icon: TrendingUp,
    label: "Trend Line",
    subTools: [
      { id: "trendline", label: "Trend Line" },
      { id: "ray", label: "Ray" },
      { id: "extended-line", label: "Extended Line" },
      { id: "info-line", label: "Info Line" },
      { id: "parallel-channel", label: "Parallel Channel" },
    ],
  },
  {
    id: "horizontal",
    icon: Minus,
    label: "Horizontal Line",
    subTools: [
      { id: "horizontal", label: "Horizontal Line" },
      { id: "horizontal-ray", label: "Horizontal Ray" },
      { id: "vertical-line", label: "Vertical Line" },
      { id: "cross-line", label: "Cross Line" },
    ],
  },
  {
    id: "fibonacci",
    icon: Waves,
    label: "Fibonacci",
    subTools: [
      { id: "fib-retracement", label: "Fib Retracement" },
      { id: "fib-extension", label: "Fib Extension" },
      { id: "fib-channel", label: "Fib Channel" },
      { id: "fib-time-zone", label: "Fib Time Zone" },
      { id: "gann-box", label: "Gann Box" },
      { id: "gann-fan", label: "Gann Fan" },
    ],
  },
  {
    id: "projection",
    icon: Target,
    label: "Position",
    subTools: [
      { id: "long-position", label: "Long Position" },
      { id: "short-position", label: "Short Position" },
      { id: "price-range", label: "Price Range" },
      { id: "projection", label: "Projection" },
    ],
  },
  {
    id: "forecast",
    icon: ProjectionIcon as unknown as React.ElementType,
    label: "Projection",
    subTools: [
      { id: "forecast-long", label: "Long Position" },
      { id: "forecast-short", label: "Short Position" },
      { id: "forecast-time-range", label: "Time Range" },
      { id: "forecast-price-projection", label: "Price Projection" },
      { id: "forecast-risk-reward", label: "Risk / Reward" },
    ],
  },
  {
    id: "shapes",
    icon: Square,
    label: "Shapes",
    subTools: [
      { id: "rectangle", label: "Rectangle" },
      { id: "circle", label: "Circle" },
      { id: "ellipse", label: "Ellipse" },
      { id: "triangle", label: "Triangle" },
      { id: "arc", label: "Arc" },
    ],
  },
  {
    id: "arrow",
    icon: ArrowUpRight,
    label: "Arrow",
    subTools: [
      { id: "arrow", label: "Arrow" },
    ],
  },
  {
    id: "measure",
    icon: Ruler,
    label: "Measure",
    subTools: [
      { id: "measure", label: "Measure" },
      { id: "date-range", label: "Date Range" },
      { id: "price-range-tool", label: "Price Range" },
      { id: "date-price-range", label: "Date & Price Range" },
    ],
  },
  { id: "pen", icon: PenTool, label: "Free Draw" },
  { id: "text", icon: Type, label: "Text" },
]

interface ChartToolsSidebarProps {
  activeTool: string | null
  onToolSelect: (tool: string | null) => void
  selectedPair?: string
  activeIndicators?: Array<{ id: string; type: string; params: Record<string, any>; color?: string }>
  compact?: boolean
}

export function ChartToolsSidebar({ activeTool, onToolSelect, selectedPair = "BTC/USDT", activeIndicators = [], compact = false }: ChartToolsSidebarProps) {
  const [contextMenu, setContextMenu] = useState<{ groupId: string; x: number; y: number } | null>(null)
  const [selectedSubTools, setSelectedSubTools] = useState<Record<string, string>>({})
  const [showObjectTree, setShowObjectTree] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  // Get the active sub-tool for a group (defaults to group id)
  const getActiveSubTool = (groupId: string) => selectedSubTools[groupId] || groupId

  const handleLeftClick = (group: ToolGroup) => {
    const toolId = getActiveSubTool(group.id)
    onToolSelect(toolId === activeTool ? null : toolId)
  }

  const handleRightClick = (e: React.MouseEvent, group: ToolGroup) => {
    e.preventDefault()
    e.stopPropagation()
    if (group.subTools && group.subTools.length > 0) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      setContextMenu({
        groupId: group.id,
        x: rect.right + 4,
        y: rect.top,
      })
    }
  }

  const handleSubToolSelect = (groupId: string, subToolId: string) => {
    setSelectedSubTools(prev => ({ ...prev, [groupId]: subToolId }))
    onToolSelect(subToolId)
    setContextMenu(null)
  }

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    document.addEventListener("click", close)
    document.addEventListener("contextmenu", close)
    return () => {
      document.removeEventListener("click", close)
      document.removeEventListener("contextmenu", close)
    }
  }, [contextMenu])

  // Check if any sub-tool in a group is active
  const isGroupActive = (group: ToolGroup) => {
    if (!activeTool) return false
    if (activeTool === group.id) return true
    return group.subTools?.some(st => st.id === activeTool) || false
  }

  return (
    <>
      <div
        ref={sidebarRef}
        className={cn(
          "flex flex-col items-center bg-card border-r border-border/20 w-[38px] relative overflow-hidden",
          compact ? "pt-[16vh] pb-2" : "pt-[72px] pb-[120px]"
        )}
      >
        {/* Connection line above cursor (non-compact only) */}
        {!compact && <div className="absolute top-[68px] left-1 right-1 h-px bg-border/20" />}

        {/* Tool groups */}
        <div className="flex flex-col items-center gap-[1px] px-[3px]">
          {toolGroups.map((group) => {
            const Icon = group.icon
            const active = isGroupActive(group)
            const hasSubMenu = group.subTools && group.subTools.length > 0
            return (
              <div key={group.id} className="relative flex items-center w-full">
                <button
                  onClick={() => handleLeftClick(group)}
                  onContextMenu={(e) => handleRightClick(e, group)}
                  className={cn(
                    "relative flex items-center justify-center h-[30px] transition-all duration-150 group/tool",
                    hasSubMenu ? "w-[24px] rounded-l-[4px]" : "w-full rounded-[4px]",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/60"
                  )}
                  title={group.label}
                >
                  <Icon className="h-4 w-4" strokeWidth={active ? 2.2 : 1.8} />
                  
                  {/* Active indicator dot */}
                  {active && (
                    <div className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-[2px] h-3 rounded-full bg-primary" />
                  )}

                  {/* Tooltip */}
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-card text-foreground text-[10px] font-medium rounded-md opacity-0 pointer-events-none group-hover/tool:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-lg border border-border/30">
                    {group.label}
                    {hasSubMenu && <span className="text-muted-foreground ml-1 text-[9px]">(right-click)</span>}
                  </span>
                </button>

                {/* Submenu expander button */}
                {hasSubMenu && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const rect = e.currentTarget.getBoundingClientRect()
                      setContextMenu({
                        groupId: group.id,
                        x: rect.right + 6,
                        y: rect.top - 4,
                      })
                    }}
                    className={cn(
                      "flex items-center justify-center h-[30px] w-[8px] rounded-r-[4px] transition-all duration-150 border-l",
                      active
                        ? "bg-primary/10 text-primary border-primary/10 hover:bg-primary/20"
                        : "text-muted-foreground/30 border-border/10 hover:bg-secondary/60 hover:text-muted-foreground/60"
                    )}
                  >
                    <svg width="4" height="8" viewBox="0 0 4 8" fill="none">
                      <path d="M0.5 0.5L3.5 4L0.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Separator */}
        <div className="h-px bg-border/15 mx-2 my-2 w-6" />

        {/* Utility buttons */}
        <div className="flex flex-col items-center gap-[1px] px-[3px]">
          <button
            onClick={() => setShowObjectTree(!showObjectTree)}
            className={cn(
              "flex items-center justify-center h-[30px] w-full rounded-[4px] transition-all duration-150 group relative",
              showObjectTree
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground/70 hover:text-foreground hover:bg-secondary/60"
            )}
            title="Object Tree"
          >
            <List className="h-4 w-4" strokeWidth={1.8} />
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-card text-foreground text-[10px] font-medium rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-lg border border-border/30">
              Object Tree
            </span>
          </button>

          <button
            onClick={() => onToolSelect("__clear_drawings__")}
            className="flex items-center justify-center h-[30px] w-full rounded-[4px] text-muted-foreground/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 group relative"
            title="Clear All Drawings"
          >
            <Eraser className="h-4 w-4" strokeWidth={1.8} />
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-card text-foreground text-[10px] font-medium rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-lg border border-border/30">
              Clear All
            </span>
          </button>
        </div>
      </div>

      {/* Object Tree Panel */}
      {showObjectTree && (
        <div className="fixed left-10 top-[180px] z-[100] w-64 rounded-lg border border-border/40 bg-card shadow-2xl backdrop-blur-xl animate-in slide-in-from-left-2 fade-in-0 duration-200">
          <div className="p-3">
            <div className="text-[11px] font-semibold text-foreground mb-3 flex items-center justify-between">
              <span>Object Tree</span>
              <button
                onClick={() => setShowObjectTree(false)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
            
            {/* Symbol Section */}
            <div className="mb-3">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Symbol
              </div>
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-secondary/40 text-xs border border-border/20">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="font-mono font-medium">{selectedPair}</span>
              </div>
            </div>

            {/* Indicators Section */}
            <div className="mb-3">
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Indicators ({activeIndicators.length})
              </div>
              {activeIndicators.length > 0 ? (
                <div className="space-y-0.5">
                  {activeIndicators.map((ind) => (
                    <div key={ind.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-secondary/40 text-xs cursor-pointer transition-colors border border-transparent hover:border-border/20">
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: ind.color || "#2196F3" }} />
                      <span className="font-medium">{ind.type}{ind.params.period ? `(${ind.params.period})` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground/60 italic px-2.5 py-1.5">
                  No indicators added
                </div>
              )}
            </div>

            {/* Drawings Section */}
            <div>
              <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Drawings
              </div>
              <div className="text-[10px] text-muted-foreground/60 italic px-2.5 py-1.5">
                Click chart to add drawings
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right-click Context Submenu */}
      {contextMenu && (() => {
        const group = toolGroups.find(g => g.id === contextMenu.groupId)
        if (!group?.subTools) return null
        return (
          <div
            className="fixed z-[100] w-52 rounded-lg border border-border/40 bg-card shadow-2xl backdrop-blur-xl animate-in slide-in-from-left-1 fade-in-0 duration-150"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="px-3 pt-2.5 pb-1">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                {group.label}
              </div>
            </div>
            <div className="p-1">
              {group.subTools.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => handleSubToolSelect(group.id, sub.id)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[11px] transition-all duration-100",
                    activeTool === sub.id
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-foreground/80 hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
                  <span>{sub.label}</span>
                  {activeTool === sub.id && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )
      })()}
    </>
  )
}
