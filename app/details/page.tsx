import { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react"

export const metadata: Metadata = {
  title: "Token Details | AetherNode",
  description: "Comprehensive token information, tokenomics, ranking, and market data.",
}

export default function DetailsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      {/* Header with Token Overview */}
      <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              BT
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                Bitcoin
              </h1>
              <p className="text-sm font-medium text-muted-foreground">BTC</p>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Digital Asset
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="rounded-lg bg-card border border-border/50 p-4">
            <p className="text-xs text-muted-foreground">Current Price</p>
            <p className="mt-2 text-2xl font-bold text-foreground">$97,842.50</p>
          </div>
          <div className="rounded-lg bg-card border border-border/50 p-4">
            <p className="text-xs text-muted-foreground">24h Change</p>
            <p className="mt-2 flex items-center gap-1 text-2xl font-bold text-trading-green">
              <TrendingUp className="h-5 w-5" />
              +2.34%
            </p>
          </div>
        </div>
      </div>

      {/* Error/Notice Banner */}
      <div className="mb-8 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">See something wrong?</p>
          <p className="text-xs text-amber-800">
            Click to report
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="information" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 mb-8">
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="tokenomics">Tokenomics</TabsTrigger>
          <TabsTrigger value="ranking" className="hidden lg:inline-flex">Ranking</TabsTrigger>
        </TabsList>

        {/* Information Tab */}
        <TabsContent value="information" className="space-y-8">
          <div className="rounded-xl border border-border/50 bg-card p-8">
            <h2 className="mb-6 text-xl font-bold text-foreground">
              BTC Introduction
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Bitcoin is a digital asset and a payment system invented by Satoshi
              Nakamoto, who published a related paper in 2008 and released it as
              open-source software in 2009. The system operates as peer-to-peer,
              allowing users to transact directly without an intermediary.
            </p>
          </div>

          {/* Key Information Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-border/50 bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Public Chain
              </p>
              <p className="mt-3 text-2xl font-bold text-foreground">BTC</p>
            </Card>
            <Card className="border-border/50 bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Listing Date
              </p>
              <p className="mt-3 text-2xl font-bold text-foreground">
                2008-10-31
              </p>
            </Card>
            <Card className="border-border/50 bg-card p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Sector
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary">Layer 1</Badge>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Tokenomics Tab */}
        <TabsContent value="tokenomics" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Market cap", value: "$1.29T", change: "-5.48%" },
              {
                label: "Fully diluted market cap (FDMC)",
                value: "$1.35T",
                change: "-5.19%",
              },
              {
                label: "24h volume/market cap",
                value: "1.99%",
                change: "-5.37%",
              },
              { label: "Market share", value: "55.31%", change: "" },
              { label: "Circulating supply", value: "19.99M", change: "" },
              { label: "Maximum supply", value: "21.00M", change: "" },
              { label: "Total supply", value: "19.99M", change: "" },
              {
                label: "Circulation rate",
                value: "95.21%",
                change: "",
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="border-border/50 bg-card p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-2xl font-bold text-foreground">
                    {item.value}
                  </p>
                  {item.change && (
                    <p className="text-sm font-medium text-trading-red">
                      {item.change}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { label: "Ranking", value: "No.1" },
              { label: "All-time high (ATH)", value: "$126,198.07", date: "2025-10-06" },
              {
                label: "All-time low (ATL)",
                value: "$0.04865",
                date: "2010-07-14",
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="border-border/50 bg-card p-6 lg:col-span-1"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-bold text-foreground">
                  {item.value}
                </p>
                {item.date && (
                  <p className="mt-2 text-xs text-muted-foreground">{item.date}</p>
                )}
              </Card>
            ))}
          </div>

          {/* Sector Performance */}
          <div className="rounded-xl border border-border/50 bg-card p-8">
            <h3 className="mb-6 text-lg font-bold text-foreground">
              Sector Performance
            </h3>
            <div className="space-y-4">
              {[
                { sector: "Layer 1", change: "-5.48%", isNegative: true },
                { sector: "BTC Ecosystem", change: "-5.19%", isNegative: true },
                { sector: "POW", change: "-5.37%", isNegative: true },
              ].map((item) => (
                <div
                  key={item.sector}
                  className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
                >
                  <p className="font-medium text-foreground">{item.sector}</p>
                  <div className="flex items-center gap-2">
                    {item.isNegative ? (
                      <TrendingDown className="h-4 w-4 text-trading-red" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-trading-green" />
                    )}
                    <span
                      className={`font-medium ${
                        item.isNegative
                          ? "text-trading-red"
                          : "text-trading-green"
                      }`}
                    >
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
