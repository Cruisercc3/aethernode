"use client"

import { useState, useCallback } from "react"
import { TickerBar } from "@/components/platform/ticker-bar"
import { CoinInfoHeader, type PlatformTab } from "@/components/platform/coin-info-header"
import { ChartToolsSidebar } from "@/components/platform/chart-tools-sidebar"
import { CandlestickChartArea } from "@/components/platform/candlestick-chart"
import { OrderBook } from "@/components/platform/order-book"
import { SpotOrderPanel } from "@/components/platform/spot-order-panel"
import { PositionsPanel } from "@/components/platform/positions-panel"
import { CoinDetailsPanel } from "@/components/platform/coin-details-panel"
import { NewsPanel } from "@/components/platform/news-panel"
import { TradingDataPanel } from "@/components/platform/trading-data-panel"
import type { ActiveIndicator } from "@/lib/indicators"

export type DrawingTool = string | null

export default function SpotPage() {
  const [selectedPair, setSelectedPair] = useState("BTC/USDT")
  const [activeTool, setActiveTool] = useState<DrawingTool>(null)
  const [activeIndicators, setActiveIndicators] = useState<ActiveIndicator[]>([])
  const [activeTab, setActiveTab] = useState<PlatformTab>("chart")
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null)

  const handleToolSelect = useCallback((tool: DrawingTool) => {
    setActiveTool(tool)
  }, [])

  // Mirror the futures/platform page: swap the right panel based on active tab
  const renderSidePanel = () => {
    switch (activeTab) {
      case "details":
        return <CoinDetailsPanel selectedPair={selectedPair} />
      case "news":
        return <NewsPanel selectedPair={selectedPair} />
      case "trading-data":
        return <TradingDataPanel selectedPair={selectedPair} />
      default:
        return <OrderBook selectedPair={selectedPair} onPriceClick={setSelectedPrice} />
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <TickerBar selectedPair={selectedPair} onPairChange={setSelectedPair} />
      <CoinInfoHeader selectedPair={selectedPair} activeTab={activeTab} onTabChange={setActiveTab} onPairChange={setSelectedPair} />

      <div className="flex flex-1 gap-0 overflow-hidden">
        <div className="hidden lg:flex">
          <ChartToolsSidebar 
            activeTool={activeTool} 
            onToolSelect={handleToolSelect}
            selectedPair={selectedPair}
            activeIndicators={activeIndicators}
          />
        </div>

        <div className="flex flex-1 flex-col gap-0 min-h-0 min-w-0">
          <div className="h-[62%] min-h-0 flex gap-0">
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 min-h-0">
                <CandlestickChartArea 
                  pair={selectedPair} 
                  activeTool={activeTool} 
                  onToolSelect={handleToolSelect}
                  activeIndicators={activeIndicators}
                  onIndicatorsChange={setActiveIndicators}
                />
              </div>
            </div>
            <div className="hidden lg:block w-[333px] min-h-0">
              {renderSidePanel()}
            </div>
          </div>
          <div className="h-[38%] min-h-[180px]">
            <PositionsPanel />
          </div>
        </div>

        <div className="hidden lg:block w-[382px]">
          <SpotOrderPanel selectedPrice={selectedPrice} pair={selectedPair} />
        </div>
      </div>
    </div>
  )
}
