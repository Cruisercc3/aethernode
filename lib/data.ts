// ========================================
// NovaTrade - Mock Data Layer
// All data is structured with typed interfaces
// for easy replacement with real API calls.
// Updated: All sparklines now use static data
// ========================================

export interface CryptoPair {
  symbol: string
  name: string
  price: number
  change24h: number
  high24h: number
  low24h: number
  volume24h: string
  fundingRate: string
  sparkline: number[]
}

export interface OrderBookEntry {
  price: number
  amount: number
  total: number
}

export interface RecentTrade {
  price: number
  amount: number
  time: string
  side: "buy" | "sell"
}

export interface TeamMember {
  name: string
  role: string
  bio: string
  avatar: string
}

export interface StatItem {
  label: string
  value: number
  suffix: string
  prefix?: string
}

// Static sparkline data (prevents hydration mismatch)
const sparklines = {
  btc: [95, 96, 94, 97, 98, 97, 99, 100, 98, 101, 103, 102, 104, 105, 103, 106, 108, 107, 109, 110, 108, 111, 112, 110],
  eth: [98, 97, 99, 100, 98, 101, 102, 100, 103, 104, 102, 105, 106, 104, 107, 108, 106, 109, 110, 108, 111, 112, 110, 113],
  sol: [92, 94, 93, 96, 98, 97, 100, 102, 101, 104, 106, 105, 108, 110, 109, 112, 114, 113, 116, 118, 117, 120, 122, 121],
  bnb: [100, 99, 101, 102, 100, 103, 104, 102, 105, 106, 104, 107, 108, 106, 109, 110, 108, 111, 112, 110, 113, 114, 112, 115],
  ada: [105, 104, 106, 107, 105, 108, 109, 107, 110, 111, 109, 112, 113, 111, 114, 115, 113, 116, 117, 115, 118, 119, 117, 120],
  doge: [90, 92, 91, 94, 96, 95, 98, 100, 99, 102, 104, 103, 106, 108, 107, 110, 112, 111, 114, 116, 115, 118, 120, 119],
  xrp: [97, 96, 98, 99, 97, 100, 101, 99, 102, 103, 101, 104, 105, 103, 106, 107, 105, 108, 109, 107, 110, 111, 109, 112],
  dot: [88, 90, 89, 92, 94, 93, 96, 98, 97, 100, 102, 101, 104, 106, 105, 108, 110, 109, 112, 114, 113, 116, 118, 117],
  avax: [93, 95, 94, 97, 99, 98, 101, 103, 102, 105, 107, 106, 109, 111, 110, 113, 115, 114, 117, 119, 118, 121, 123, 122],
  xrp2: [102, 101, 103, 104, 102, 105, 106, 104, 107, 108, 106, 109, 110, 108, 111, 112, 110, 113, 114, 112, 115, 116, 114, 117],
  ada2: [96, 98, 97, 100, 102, 101, 104, 106, 105, 108, 110, 109, 112, 114, 113, 116, 118, 117, 120, 122, 121, 124, 126, 125],
  doge2: [94, 93, 95, 96, 94, 97, 98, 96, 99, 100, 98, 101, 102, 100, 103, 104, 102, 105, 106, 104, 107, 108, 106, 109],
}

export const cryptoPairs: CryptoPair[] = [
  {
    symbol: "BTC/USDT",
    name: "Bitcoin",
    price: 97842.5,
    change24h: 2.34,
    high24h: 98500.0,
    low24h: 95200.0,
    volume24h: "4.2B",
    fundingRate: "0.0100%",
    sparkline: sparklines.btc,
  },
  {
    symbol: "ETH/USDT",
    name: "Ethereum",
    price: 3456.78,
    change24h: -1.25,
    high24h: 3520.0,
    low24h: 3410.0,
    volume24h: "2.1B",
    fundingRate: "0.0085%",
    sparkline: sparklines.eth,
  },
  {
    symbol: "SOL/USDT",
    name: "Solana",
    price: 198.45,
    change24h: 5.67,
    high24h: 202.0,
    low24h: 187.0,
    volume24h: "890M",
    fundingRate: "0.0150%",
    sparkline: sparklines.sol,
  },
  {
    symbol: "BNB/USDT",
    name: "BNB",
    price: 678.9,
    change24h: -0.45,
    high24h: 690.0,
    low24h: 672.0,
    volume24h: "320M",
    fundingRate: "0.0092%",
    sparkline: sparklines.bnb,
  },
  {
    symbol: "ADA/USDT",
    name: "Cardano",
    price: 1.234,
    change24h: 3.12,
    high24h: 1.28,
    low24h: 1.19,
    volume24h: "450M",
    fundingRate: "0.0078%",
    sparkline: sparklines.ada,
  },
  {
    symbol: "DOGE/USDT",
    name: "Dogecoin",
    price: 0.3456,
    change24h: -2.34,
    high24h: 0.36,
    low24h: 0.33,
    volume24h: "890M",
    fundingRate: "0.0112%",
    sparkline: sparklines.doge,
  },
  {
    symbol: "XRP/USDT",
    name: "Ripple",
    price: 2.345,
    change24h: 1.89,
    high24h: 2.42,
    low24h: 2.28,
    volume24h: "720M",
    fundingRate: "0.0095%",
    sparkline: sparklines.xrp,
  },
  {
    symbol: "DOT/USDT",
    name: "Polkadot",
    price: 23.45,
    change24h: 4.56,
    high24h: 24.2,
    low24h: 22.1,
    volume24h: "280M",
    fundingRate: "0.0125%",
    sparkline: sparklines.dot,
  },
  {
    symbol: "AVAX/USDT",
    name: "Avalanche",
    price: 42.67,
    change24h: 4.12,
    high24h: 43.5,
    low24h: 40.2,
    volume24h: "250M",
    fundingRate: "0.0095%",
    sparkline: sparklines.avax,
  },
  {
    symbol: "MATIC/USDT",
    name: "Polygon",
    price: 1.823,
    change24h: 2.67,
    high24h: 1.89,
    low24h: 1.77,
    volume24h: "180M",
    fundingRate: "0.0065%",
    sparkline: sparklines.ada2,
  },
  {
    symbol: "LINK/USDT",
    name: "Chainlink",
    price: 24.56,
    change24h: 3.45,
    high24h: 25.1,
    low24h: 23.8,
    volume24h: "250M",
    fundingRate: "0.0095%",
    sparkline: sparklines.xrp2,
  },
  {
    symbol: "ATOM/USDT",
    name: "Cosmos",
    price: 12.34,
    change24h: -0.58,
    high24h: 12.8,
    low24h: 12.1,
    volume24h: "520M",
    fundingRate: "0.0110%",
    sparkline: sparklines.doge2,
  },
]

export function generateOrderBook(): {
  asks: OrderBookEntry[]
  bids: OrderBookEntry[]
} {
  const basePrice = 97842.5
  const asks: OrderBookEntry[] = []
  const bids: OrderBookEntry[] = []

  let askTotal = 0
  let bidTotal = 0

  for (let i = 0; i < 15; i++) {
    const askAmount = Math.random() * 2.5 + 0.1
    askTotal += askAmount
    asks.push({
      price: basePrice + (i + 1) * 5 + Math.random() * 3,
      amount: parseFloat(askAmount.toFixed(4)),
      total: parseFloat(askTotal.toFixed(4)),
    })

    const bidAmount = Math.random() * 2.5 + 0.1
    bidTotal += bidAmount
    bids.push({
      price: basePrice - (i + 1) * 5 - Math.random() * 3,
      amount: parseFloat(bidAmount.toFixed(4)),
      total: parseFloat(bidTotal.toFixed(4)),
    })
  }

  return { asks: asks.reverse(), bids }
}

export function generateRecentTrades(): RecentTrade[] {
  const trades: RecentTrade[] = []
  const basePrice = 97842.5

  for (let i = 0; i < 20; i++) {
    const side = Math.random() > 0.5 ? "buy" : "sell"
    trades.push({
      price: basePrice + (Math.random() - 0.5) * 20,
      amount: parseFloat((Math.random() * 1.5 + 0.01).toFixed(4)),
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
      side: side as "buy" | "sell",
    })
  }

  return trades.sort((a, b) => (a.time > b.time ? -1 : 1))
}

export function generateCandlestickData() {
  const data = []
  const basePrice = 96000
  let current = basePrice

  for (let i = 0; i < 60; i++) {
    const open = current
    const change = (Math.random() - 0.48) * 500
    const close = open + change
    const high = Math.max(open, close) + Math.random() * 200
    const low = Math.min(open, close) - Math.random() * 200
    const volume = Math.floor(Math.random() * 5000 + 500)

    data.push({
      time: `${i}`,
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume,
    })

    current = close
  }

  return data
}

export const heroStats: StatItem[] = [
  { label: "Architecture Layers", value: 8, suffix: "" },
  { label: "Technical Indicators", value: 25, suffix: "+" },
  { label: "Built Pages", value: 19, suffix: "+" },
  { label: "Trading Pairs", value: 20, suffix: "+" },
]

export const features = [
  {
    title: "Real-Time Data",
    description:
      "Stream live market data with sub-millisecond latency. Stay ahead of the market with instant price updates and volume tracking.",
    icon: "Zap",
  },
  {
    title: "Advanced Charting",
    description:
      "Professional-grade charting with 50+ indicators, custom drawing tools, and multi-timeframe analysis for precise trade entries.",
    icon: "LineChart",
  },
  {
    title: "Liquidation Heatmaps",
    description:
      "Visualize liquidation clusters across price levels. Identify high-liquidity zones and anticipate major market moves.",
    icon: "Flame",
  },
  {
    title: "Multi-Chart View",
    description:
      "Monitor multiple trading pairs simultaneously with our split-view charting. Customize your workspace for maximum efficiency.",
    icon: "LayoutGrid",
  },
]

export const teamMembers: TeamMember[] = [
  {
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    bio: "Former quant trader with 12 years of experience in financial markets and algorithmic trading systems.",
    avatar: "AC",
  },
  {
    name: "Sarah Williams",
    role: "CTO & Co-Founder",
    bio: "Engineering specialist with expertise in distributed systems and real-time data infrastructure. Built trading engines processing 1M+ orders/sec.",
    avatar: "SW",
  },
  {
    name: "Marcus Johnson",
    role: "Head of Product",
    bio: "Product leader with deep expertise in fintech UX. Previously led product development and designed interfaces used by millions.",
    avatar: "MJ",
  },
  {
    name: "Elena Rodriguez",
    role: "Head of Security",
    bio: "Cybersecurity expert with a background in cryptographic protocols. Former security lead at a major cryptocurrency exchange.",
    avatar: "ER",
  },
]

export const footerLinks = {
  products: [
    { label: "Spot Trading", href: "/spot" },
    { label: "Futures", href: "/platform" },
    { label: "Options", href: "/options" },
    { label: "Staking", href: "/staking" },
  ],
  company: [
    { label: "Details", href: "/details" },
    { label: "Architecture", href: "/company" },
    { label: "Acquisition", href: "/details" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Press", href: "/press" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "API Docs", href: "/api-docs" },
    { label: "Status", href: "/status" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Compliance", href: "/compliance" },
  ],
}
