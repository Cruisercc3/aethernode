// Shape of /api/liquidations. Shared by the route and the analytics page.

export type LiquidationBucket = {
  price: number
  longUsd: number
  shortUsd: number
  longCount: number
  shortCount: number
}

export type LiquidationSummary =
  | {
      available: true
      source: "OKX"
      instId: string
      count: number
      from: number
      to: number
      longUsd: number
      shortUsd: number
      longCount: number
      shortCount: number
      bucketSize: number
      buckets: LiquidationBucket[]
      largest: { price: number; usd: number; side: "long" | "short"; time: number } | null
    }
  | { available: false; reason: string }
