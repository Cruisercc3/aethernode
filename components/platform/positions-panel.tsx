"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Filter, ArrowUpDown, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = "All" | "BTC" | "ETH" | "SOL" | "BNB"
type SortType = "default" | "a-z" | "position-high-low" | "margin-high-low" | "pnl-high-low" | "roi-high-low"

const FILTER_OPTIONS: FilterType[] = ["All", "BTC", "ETH", "SOL", "BNB"]
const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "a-z", label: "A-Z" },
  { value: "position-high-low", label: "Position Value: High to Low" },
  { value: "margin-high-low", label: "Margin: High to Low" },
  { value: "pnl-high-low", label: "Unrealized PNL: High to Low" },
  { value: "roi-high-low", label: "ROI: High to Low" },
]

export function PositionsPanel() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("All")
  const [selectedSort, setSelectedSort] = useState<SortType>("default")
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  // Mock available balance
  const availableBalance = "10,250.43"

  return (
    <div className="flex h-full flex-col bg-card border border-border/30 overflow-hidden">
      <Tabs defaultValue="positions" className="flex h-full flex-col">
        <div className="border-b border-border/30">
          {/* Tabs */}
          <TabsList className="h-8 w-full justify-start rounded-none border-none bg-transparent p-0">
            {["Positions", "Copy trades", "Trading bots", "Open orders", "Order history", "Position history", "Transaction history", "Assets"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab.toLowerCase().replace(/\s+/g, "-")}
                className="h-8 rounded-none border-b border-transparent px-3 text-[12.2px] data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none text-muted-foreground capitalize"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Filter and Sort */}
          <div className="flex items-center gap-2 px-2 py-1 border-t border-border/30">
            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu)
                  setShowSortMenu(false)
                }}
                className="flex items-center gap-1 rounded border border-border/50 bg-secondary/30 px-1.5 py-0.5 text-[9px] text-foreground hover:bg-secondary transition-colors"
              >
                <Filter className="h-2.5 w-2.5" />
                <span>{selectedFilter}</span>
                <ChevronDown className="h-2.5 w-2.5" />
              </button>

              {showFilterMenu && (
                <div className="absolute left-0 top-full mt-1 z-50 w-32 rounded-lg border border-border/50 bg-card shadow-lg">
                  <div className="p-1">
                    {FILTER_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSelectedFilter(option)
                          setShowFilterMenu(false)
                        }}
                        className={cn(
                          "flex w-full items-center rounded px-2 py-1.5 text-left text-xs transition-colors",
                          selectedFilter === option
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSortMenu(!showSortMenu)
                  setShowFilterMenu(false)
                }}
                className="flex items-center gap-1.5 rounded border border-border/50 bg-secondary/30 px-2 py-1 text-[11px] text-foreground hover:bg-secondary transition-colors"
              >
                <ArrowUpDown className="h-3 w-3" />
                <span>{SORT_OPTIONS.find(s => s.value === selectedSort)?.label || "Sort"}</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showSortMenu && (
                <div className="absolute left-0 top-full mt-1 z-50 w-64 rounded-lg border border-border/50 bg-card shadow-lg">
                  <div className="p-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedSort(option.value)
                          setShowSortMenu(false)
                        }}
                        className={cn(
                          "flex w-full items-center rounded px-2 py-1.5 text-left text-xs transition-colors",
                          selectedSort === option.value
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-foreground hover:bg-secondary"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <TabsContent value="positions" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">No open positions</p>
              <p className="text-sm font-medium text-foreground">
                Available Balance: <span className="text-primary">${availableBalance}</span>
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="open-orders" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No open orders</p>
          </div>
        </TabsContent>

        <TabsContent value="order-history" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No order history</p>
          </div>
        </TabsContent>

        <TabsContent value="position-history" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No position history</p>
          </div>
        </TabsContent>

        <TabsContent value="order-details" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No order details</p>
          </div>
        </TabsContent>

        <TabsContent value="transaction-history" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted-foreground">No transactions</p>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="flex-1 mt-0 min-h-0 overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground mb-1">Total Balance</p>
              <p className="text-2xl font-bold text-primary">${availableBalance}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
