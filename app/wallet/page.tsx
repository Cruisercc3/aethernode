"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Search,
  Eye,
  EyeOff,
  ChevronDown,
  Copy,
  CheckCircle2,
  X,
  ArrowRightLeft,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  Tag,
  Landmark,
  CreditCard,
  ChevronRight,
  Star,
  Filter,
  LayoutGrid,
  List,
  ExternalLink,
  QrCode,
  Shield,
  Zap,
  Coins,
  PieChart,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMarketsTicker } from "@/hooks/useMarketsTicker"
import { CryptoIcon } from "@/components/crypto-icon"

// ── Types ──
interface CryptoAsset {
  symbol: string
  name: string
  balance: number
  usdValue: number
  change24h: number
  icon: string
  color: string
  network?: string
  frozen: number
  available: number
}

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "transfer"
  asset: string
  amount: number
  status: "completed" | "pending" | "failed"
  date: string
  direction: string
  txHash?: string
}

type SidebarSection = "assets" | "spot" | "margin" | "futures" | "earn" | "onchain"
type ActiveModal = null | "deposit" | "withdraw" | "history" | "transfer" | "buy" | "sell"
type AssetView = "list" | "grid"
type SidebarPopup = null | "spot-account" | "margin-account" | "usdt-m" | "coin-m" | "simple-earn" | "staking" | "onchain-wallet"

interface SidebarPopupInfo {
  title: string
  subtitle: string
  stats: { label: string; value: string; highlight?: boolean }[]
  actions: { label: string; variant: "primary" | "secondary" }[]
  description: string
}

const sidebarPopupContent: Record<string, SidebarPopupInfo> = {
  "spot-account": {
    title: "Spot Account",
    subtitle: "Trade crypto pairs with real-time market prices",
    stats: [
      { label: "Total Balance", value: "$36,405.12", highlight: true },
      { label: "Available", value: "$34,200.00" },
      { label: "In Orders", value: "$2,205.12" },
      { label: "Open Positions", value: "7" },
    ],
    actions: [{ label: "Go to Spot Trading", variant: "primary" }, { label: "View Orders", variant: "secondary" }],
    description: "Your Spot Account holds all assets for direct crypto-to-crypto trading. Funds are available instantly for market and limit orders across 300+ trading pairs.",
  },
  "margin-account": {
    title: "Margin Account",
    subtitle: "Trade with up to 10x leverage using borrowed funds",
    stats: [
      { label: "Net Asset Value", value: "$8,120.50", highlight: true },
      { label: "Margin Ratio", value: "342.5%" },
      { label: "Borrowed", value: "$15,400.00" },
      { label: "Risk Level", value: "Low" },
    ],
    actions: [{ label: "Start Margin Trading", variant: "primary" }, { label: "Repay Loan", variant: "secondary" }],
    description: "Margin Account lets you amplify returns by borrowing funds. Maintain a healthy margin ratio above 110% to avoid liquidation. Interest accrues hourly.",
  },
  "usdt-m": {
    title: "USDT-M Futures",
    subtitle: "USDT-margined perpetual and delivery contracts",
    stats: [
      { label: "Wallet Balance", value: "$12,847.00", highlight: true },
      { label: "Unrealized PNL", value: "+$324.18" },
      { label: "Open Positions", value: "3" },
      { label: "Margin Used", value: "$4,200.00" },
    ],
    actions: [{ label: "Open Futures", variant: "primary" }, { label: "Transfer Funds", variant: "secondary" }],
    description: "USDT-M Futures are settled in USDT and support up to 125x leverage. Your profits and losses are calculated in USDT, simplifying PNL tracking.",
  },
  "coin-m": {
    title: "COIN-M Futures",
    subtitle: "Coin-margined futures settled in the base asset",
    stats: [
      { label: "Wallet Balance", value: "0.04521 BTC", highlight: true },
      { label: "Unrealized PNL", value: "+0.00082 BTC" },
      { label: "Open Positions", value: "1" },
      { label: "Margin Used", value: "0.01200 BTC" },
    ],
    actions: [{ label: "Open COIN-M Futures", variant: "primary" }, { label: "Transfer Funds", variant: "secondary" }],
    description: "COIN-M Futures are margined and settled in the underlying cryptocurrency. Ideal for miners and long-term holders who want to hedge without converting to USDT.",
  },
  "simple-earn": {
    title: "Simple Earn",
    subtitle: "Earn passive yield on your idle crypto assets",
    stats: [
      { label: "Total Earning", value: "$4,320.00", highlight: true },
      { label: "Est. Daily Income", value: "$8.24" },
      { label: "Locked Assets", value: "$3,100.00" },
      { label: "Avg. APY", value: "6.8%" },
    ],
    actions: [{ label: "Subscribe Now", variant: "primary" }, { label: "View Positions", variant: "secondary" }],
    description: "Simple Earn lets you deposit idle assets to earn competitive yields. Choose flexible (instant redemption) or locked (higher APY) products with daily income distribution.",
  },
  "staking": {
    title: "Staking",
    subtitle: "Stake proof-of-stake assets and earn rewards",
    stats: [
      { label: "Staked Value", value: "$9,850.00", highlight: true },
      { label: "Est. Monthly", value: "$124.30" },
      { label: "Active Stakes", value: "4" },
      { label: "Avg. APR", value: "15.2%" },
    ],
    actions: [{ label: "Stake Assets", variant: "primary" }, { label: "Claim Rewards", variant: "secondary" }],
    description: "Participate in network validation by staking PoS assets. Rewards are auto-compounded weekly. Supported assets include ETH, SOL, ADA, DOT, and ATOM.",
  },
  "onchain-wallet": {
    title: "Onchain Wallet",
    subtitle: "Self-custody wallet connected to DeFi protocols",
    stats: [
      { label: "Onchain Balance", value: "$2,140.00", highlight: true },
      { label: "DeFi Positions", value: "$1,060.00" },
      { label: "Connected dApps", value: "5" },
      { label: "Gas Saved", value: "$48.20" },
    ],
    actions: [{ label: "Open Wallet", variant: "primary" }, { label: "Connect dApp", variant: "secondary" }],
    description: "Your non-custodial onchain wallet gives you direct access to DeFi protocols, NFT marketplaces, and Web3 apps. You hold your private keys at all times.",
  },
}

// ── Crypto Data ──
const cryptoAssets: CryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", balance: 0.04521, usdValue: 4382.53, change24h: 2.34, icon: "B", color: "bg-amber-500", network: "Bitcoin", frozen: 0, available: 0.04521 },
  { symbol: "ETH", name: "Ethereum", balance: 1.2847, usdValue: 4521.80, change24h: -1.12, icon: "E", color: "bg-indigo-500", network: "Ethereum", frozen: 0.1, available: 1.1847 },
  { symbol: "USDT", name: "Tether", balance: 12450.00, usdValue: 12450.00, change24h: 0.01, icon: "T", color: "bg-emerald-500", network: "Multi-chain", frozen: 0, available: 12450.00 },
  { symbol: "SOL", name: "Solana", balance: 28.453, usdValue: 4268.00, change24h: 5.67, icon: "S", color: "bg-fuchsia-500", network: "Solana", frozen: 0, available: 28.453 },
  { symbol: "BNB", name: "BNB", balance: 3.218, usdValue: 1945.29, change24h: -0.45, icon: "B", color: "bg-yellow-500", network: "BSC", frozen: 0, available: 3.218 },
  { symbol: "XRP", name: "Ripple", balance: 5420.00, usdValue: 3252.00, change24h: 3.21, icon: "X", color: "bg-cyan-400", network: "XRP Ledger", frozen: 0, available: 5420.00 },
  { symbol: "ADA", name: "Cardano", balance: 8240.00, usdValue: 3296.00, change24h: -2.18, icon: "A", color: "bg-blue-500", network: "Cardano", frozen: 0, available: 8240.00 },
  { symbol: "DOGE", name: "Dogecoin", balance: 15000.00, usdValue: 2250.00, change24h: 8.45, icon: "D", color: "bg-amber-400", network: "Dogecoin", frozen: 0, available: 15000.00 },
  { symbol: "AVAX", name: "Avalanche", balance: 42.5, usdValue: 1487.50, change24h: 1.89, icon: "A", color: "bg-red-500", network: "Avalanche", frozen: 0, available: 42.5 },
  { symbol: "DOT", name: "Polkadot", balance: 180.0, usdValue: 1260.00, change24h: -0.92, icon: "D", color: "bg-pink-500", network: "Polkadot", frozen: 0, available: 180.0 },
  { symbol: "LINK", name: "Chainlink", balance: 95.0, usdValue: 1425.00, change24h: 4.12, icon: "L", color: "bg-blue-400", network: "Ethereum", frozen: 0, available: 95.0 },
  { symbol: "MATIC", name: "Polygon", balance: 3200.0, usdValue: 2560.00, change24h: -1.56, icon: "M", color: "bg-violet-500", network: "Polygon", frozen: 0, available: 3200.0 },
  { symbol: "UNI", name: "Uniswap", balance: 120.0, usdValue: 840.00, change24h: 2.78, icon: "U", color: "bg-pink-400", network: "Ethereum", frozen: 0, available: 120.0 },
  { symbol: "ATOM", name: "Cosmos", balance: 85.0, usdValue: 765.00, change24h: 0.34, icon: "A", color: "bg-indigo-400", network: "Cosmos", frozen: 0, available: 85.0 },
  { symbol: "FTM", name: "Fantom", balance: 4500.0, usdValue: 1350.00, change24h: 6.23, icon: "F", color: "bg-sky-500", network: "Fantom", frozen: 0, available: 4500.0 },
]

const transactionHistory: Transaction[] = [
  { id: "1", type: "transfer", asset: "USDT", amount: 16.634, status: "completed", date: "2025-11-18 16:33", direction: "Spot to USDT-M Futures", txHash: "0x3f8a...c2d1" },
  { id: "2", type: "deposit", asset: "USDT", amount: 16.634, status: "completed", date: "2025-11-18 16:32", direction: "to Spot account", txHash: "0x7b2e...a4f9" },
  { id: "3", type: "transfer", asset: "USDT", amount: 41.0978, status: "completed", date: "2025-11-17 19:27", direction: "Spot to USDT-M Futures", txHash: "0x9d1c...b7e3" },
  { id: "4", type: "deposit", asset: "USDT", amount: 41.0978, status: "completed", date: "2025-11-17 19:27", direction: "to Spot account", txHash: "0x2f5a...d8c6" },
  { id: "5", type: "transfer", asset: "USDT", amount: 33.3944, status: "completed", date: "2025-11-13 23:22", direction: "Spot to USDT-M Futures", txHash: "0x6e8b...f1a4" },
  { id: "6", type: "withdrawal", asset: "BTC", amount: 0.005, status: "completed", date: "2025-11-10 14:15", direction: "to External Wallet", txHash: "0xab12...9e7d" },
  { id: "7", type: "deposit", asset: "ETH", amount: 0.5, status: "pending", date: "2025-11-09 08:42", direction: "to Spot account", txHash: "0xcd34...2b8f" },
  { id: "8", type: "withdrawal", asset: "SOL", amount: 10.0, status: "failed", date: "2025-11-08 22:10", direction: "to External Wallet" },
]

const sidebarItems: { key: SidebarSection; label: string; icon: React.ElementType; children?: { label: string; key: string }[] }[] = [
  { key: "assets", label: "Assets", icon: Wallet },
  { key: "spot", label: "Spot", icon: BarChart3, children: [{ label: "Spot Account", key: "spot-account" }, { label: "Margin Account", key: "margin-account" }] },
  { key: "futures", label: "Futures", icon: TrendingUp, children: [{ label: "USDT-M", key: "usdt-m" }, { label: "COIN-M", key: "coin-m" }] },
  { key: "earn", label: "Earn", icon: Coins, children: [{ label: "Simple Earn", key: "simple-earn" }, { label: "Staking", key: "staking" }] },
  { key: "onchain", label: "Onchain", icon: Zap },
]

// ── Sidebar Component ──
function WalletSidebar({
  active,
  onSelect,
  onPopup,
}: {
  active: SidebarSection
  onSelect: (s: SidebarSection) => void
  onPopup: (key: SidebarPopup) => void
}) {
  const [expanded, setExpanded] = useState<SidebarSection | null>(null)

  return (
    <aside className="w-52 shrink-0 hidden lg:block">
      <nav className="sticky top-24 space-y-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          const isExpanded = expanded === item.key
          return (
            <div key={item.key}>
              <button
                onClick={() => {
                  onSelect(item.key)
                  if (item.children) setExpanded(isExpanded ? null : item.key)
                  else if (item.key === "onchain") onPopup("onchain-wallet")
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.children && (
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isExpanded && "rotate-180")} />
                )}
              </button>
              {item.children && isExpanded && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l border-border/30 pl-3">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      onClick={() => onPopup(child.key as SidebarPopup)}
                      className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors group"
                    >
                      <span>{child.label}</span>
                      <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}

// ── Deposit Modal ──
function DepositModal({ onClose }: { onClose: () => void }) {
  const [selectedAsset, setSelectedAsset] = useState("USDT")
  const [selectedNetwork, setSelectedNetwork] = useState("TRC20")
  const [copied, setCopied] = useState(false)

  const address = "TN8f3Kp9mXq7vR2sW6jY4cL1bA8hD5eZxU"
  const networks = ["TRC20", "ERC20", "BEP20", "SOL", "Polygon"]

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Deposit Crypto</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Select Coin */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Select Coin</label>
            <div className="flex flex-wrap gap-2">
              {["BTC", "ETH", "USDT", "SOL", "BNB", "XRP"].map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedAsset(coin)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    selectedAsset === coin
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  <CryptoIcon base={coin} size="sm" />
                  {coin}
                </button>
              ))}
            </div>
          </div>

          {/* Select Network */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Network</label>
            <div className="flex flex-wrap gap-2">
              {networks.map((net) => (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                    selectedNetwork === net
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          {/* QR & Address */}
          <div className="rounded-xl border border-border/30 bg-secondary/30 p-5">
            <div className="flex items-center justify-center mb-4">
              <div className="h-36 w-36 rounded-xl bg-card border border-border/30 flex items-center justify-center">
                <QrCode className="h-20 w-20 text-muted-foreground/30" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground mb-1 block uppercase tracking-wider">
                {selectedAsset} Deposit Address ({selectedNetwork})
              </label>
              <div className="flex items-center gap-2 rounded-lg bg-card border border-border/30 px-3 py-2.5">
                <code className="flex-1 text-xs font-mono text-foreground truncate">{address}</code>
                <button onClick={handleCopy} className="shrink-0 text-muted-foreground hover:text-primary transition-colors">
                  {copied ? <CheckCircle2 className="h-4 w-4 text-trading-green" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
            <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-500/80 leading-relaxed">
              Only send {selectedAsset} on the {selectedNetwork} network. Sending any other asset may result in permanent loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Withdraw Modal ──
function WithdrawModal({ onClose }: { onClose: () => void }) {
  const [selectedAsset, setSelectedAsset] = useState("USDT")
  const [address, setAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState("TRC20")
  const [step, setStep] = useState<"form" | "confirm">("form")

  const asset = cryptoAssets.find(a => a.symbol === selectedAsset)
  const networks = ["TRC20", "ERC20", "BEP20", "SOL"]
  const fee = selectedNetwork === "TRC20" ? 1.0 : selectedNetwork === "ERC20" ? 5.0 : 0.5

  const handleConfirm = () => {
    if (step === "form") {
      setStep("confirm")
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            {step === "form" ? "Withdraw Crypto" : "Confirm Withdrawal"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {step === "form" ? (
            <>
              {/* Select Coin */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Select Coin</label>
                <div className="flex flex-wrap gap-2">
                  {["BTC", "ETH", "USDT", "SOL", "BNB", "XRP"].map((coin) => (
                    <button
                      key={coin}
                      onClick={() => setSelectedAsset(coin)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                        selectedAsset === coin
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      )}
                    >
                      <CryptoIcon base={coin} size="sm" />
                      {coin}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">Network</label>
                <div className="flex flex-wrap gap-2">
                  {networks.map((net) => (
                    <button
                      key={net}
                      onClick={() => setSelectedNetwork(net)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all",
                        selectedNetwork === net
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/50 text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {net}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Withdrawal Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter or paste address"
                  className="w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Amount</label>
                  <span className="text-[11px] text-muted-foreground">
                    Available: <span className="text-foreground font-mono">{asset?.available.toLocaleString()}</span> {selectedAsset}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-4 py-3 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <button
                    onClick={() => setAmount(String(asset?.available || 0))}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                  <span>Network fee: ~{fee} {selectedAsset}</span>
                  <span>Receive: ~{Math.max(0, parseFloat(amount || "0") - fee).toFixed(4)} {selectedAsset}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/30 border border-border/30 p-4 space-y-3">
                {[
                  { label: "Asset", value: selectedAsset },
                  { label: "Network", value: selectedNetwork },
                  { label: "Address", value: address || "Not provided" },
                  { label: "Amount", value: `${amount} ${selectedAsset}` },
                  { label: "Fee", value: `${fee} ${selectedAsset}` },
                  { label: "You Receive", value: `${Math.max(0, parseFloat(amount || "0") - fee).toFixed(4)} ${selectedAsset}` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-mono font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5">
                <Shield className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-500/80 leading-relaxed">
                  Please verify the address is correct. Withdrawals cannot be reversed once confirmed.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {step === "confirm" && (
              <button
                onClick={() => setStep("form")}
                className="flex-1 rounded-lg border border-border/50 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={step === "form" && (!address || !amount)}
              className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "form" ? "Continue" : "Confirm Withdrawal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── History Modal ──
function HistoryModal({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState<"all" | "deposit" | "withdrawal" | "transfer">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = transactionHistory.filter((tx) => {
    const matchesType = filter === "all" || tx.type === filter
    const matchesSearch = tx.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.direction.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const statusColors: Record<string, string> = {
    completed: "text-trading-green",
    pending: "text-amber-500",
    failed: "text-destructive",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[78vh] rounded-2xl border border-border/50 bg-card shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-border/30 px-6 py-4 shrink-0">
          <h2 className="text-lg font-bold text-foreground">Transaction History</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4 shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          {/* Filters */}
          <div className="flex gap-2">
            {(["all", "deposit", "withdrawal", "transfer"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all",
                  filter === f
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border/30"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-2">
            {filtered.map((tx) => (
              <div key={tx.id} className="rounded-lg border border-border/30 bg-secondary/20 p-4 hover:bg-secondary/40 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      tx.type === "deposit" ? "bg-trading-green/10" : tx.type === "withdrawal" ? "bg-destructive/10" : "bg-primary/10"
                    )}>
                      {tx.type === "deposit" ? (
                        <ArrowDownToLine className={cn("h-4 w-4", "text-trading-green")} />
                      ) : tx.type === "withdrawal" ? (
                        <ArrowUpFromLine className="h-4 w-4 text-destructive" />
                      ) : (
                        <ArrowRightLeft className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground capitalize">{tx.type}</p>
                      <p className="text-[11px] text-muted-foreground">{tx.direction}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {tx.type === "deposit" ? "+" : tx.type === "withdrawal" ? "-" : ""}{tx.amount} {tx.asset}
                    </p>
                    <p className={cn("text-[11px] font-semibold capitalize", statusColors[tx.status])}>
                      {tx.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{tx.date}</span>
                  {tx.txHash && (
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      {tx.txHash} <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center">
                <History className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No transactions found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ──
// The navbar links to /wallet?action=deposit (or withdraw, transfer).
// This opens the matching demo modal, on first load and on later clicks.
function ActionFromUrl({ onAction }: { onAction: (a: "deposit" | "withdraw" | "transfer") => void }) {
  const params = useSearchParams()
  const action = params.get("action")
  useEffect(() => {
    if (action === "deposit" || action === "withdraw" || action === "transfer") onAction(action)
  }, [action, onAction])
  return null
}

export default function WalletPage() {
  const [activeSection, setActiveSection] = useState<SidebarSection>("assets")
  const [searchQuery, setSearchQuery] = useState("")
  const [hideSmall, setHideSmall] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [activeModal, setActiveModal] = useState<ActiveModal>(null)
  const [sidebarPopup, setSidebarPopup] = useState<SidebarPopup>(null)
  const [viewMode, setViewMode] = useState<AssetView>("list")
  const [sortBy, setSortBy] = useState<"value" | "change" | "name">("value")
  const [favorites, setFavorites] = useState<string[]>(["BTC", "ETH", "USDT"])
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all")
  const [currencyUnit, setCurrencyUnit] = useState<"USD" | "BTC">("USD")
  const [activeSector, setActiveSector] = useState("All")
  const [walletPageSize, setWalletPageSize] = useState<25 | 50>(25)
  const [walletPage, setWalletPage] = useState(1)

  // Live prices from Bybit — enrich the static holdings
  const { coins: liveCoins, dynamicSectors } = useMarketsTicker()
  const SECTOR_KEYS = useMemo(() => Object.keys(dynamicSectors), [dynamicSectors])

  // Build a quick lookup: baseAsset → livePrice & change
  const livePriceMap = useMemo(() => {
    const map = new Map<string, { price: number; change24h: number }>()
    for (const c of liveCoins) map.set(c.baseAsset, { price: c.price, change24h: c.change24h })
    return map
  }, [liveCoins])

  // Merge live prices into cryptoAssets holdings
  const enrichedAssets = useMemo(() => {
    return cryptoAssets.map((asset) => {
      const live = livePriceMap.get(asset.symbol)
      if (!live) return asset
      return { ...asset, usdValue: asset.balance * live.price, change24h: live.change24h }
    })
  }, [livePriceMap])

  const btcPrice = livePriceMap.get("BTC")?.price ?? 97000
  const totalUSD = useMemo(() => enrichedAssets.reduce((a, c) => a + c.usdValue, 0), [enrichedAssets])
  const totalBTC = totalUSD / btcPrice

  // Browse mode: "All" tab shows full Bybit list, sector chips narrow it further.
  // Favorites tab shows only favorited holdings.
  const isBrowseMode = activeTab === "all" || activeSector !== "All"

  const allFilteredAssets = useMemo(() => {
    const holdingSet = new Set(cryptoAssets.map(a => a.symbol))

    if (isBrowseMode && activeTab !== "favorites") {
      // Build full list from live Bybit data
      let list = activeSector !== "All"
        ? liveCoins.filter(c => (dynamicSectors[activeSector] || []).includes(c.baseAsset))
        : liveCoins

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        list = list.filter(c => c.baseAsset.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
      }

      return list.map(c => {
        const holding = enrichedAssets.find(a => a.symbol === c.baseAsset)
        if (holding) return holding
        return {
          symbol: c.baseAsset,
          name: c.name,
          balance: 0,
          usdValue: 0,
          change24h: c.change24h,
          icon: c.baseAsset[0],
          color: "bg-muted",
          frozen: 0,
          available: 0,
        } as CryptoAsset
      }).sort((a, b) => {
        if (sortBy === "change") return b.change24h - a.change24h
        if (sortBy === "name") return a.name.localeCompare(b.name)
        const aH = holdingSet.has(a.symbol) ? 1 : 0
        const bH = holdingSet.has(b.symbol) ? 1 : 0
        if (bH !== aH) return bH - aH
        return b.usdValue - a.usdValue
      })
    }

    // Favorites / holdings only mode
    let list = enrichedAssets
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(a => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
    }
    if (hideSmall) list = list.filter(a => a.usdValue >= 1)
    if (activeTab === "favorites") list = list.filter(a => favorites.includes(a.symbol))
    return [...list].sort((a, b) => {
      if (sortBy === "value") return b.usdValue - a.usdValue
      if (sortBy === "change") return b.change24h - a.change24h
      return a.name.localeCompare(b.name)
    })
  }, [enrichedAssets, liveCoins, searchQuery, hideSmall, activeTab, favorites, sortBy, activeSector, dynamicSectors, isBrowseMode])

  // Pagination
  const walletTotalPages = Math.max(1, Math.ceil(allFilteredAssets.length / walletPageSize))
  const walletSafePage = Math.min(walletPage, walletTotalPages)
  const filteredAssets = allFilteredAssets.slice((walletSafePage - 1) * walletPageSize, walletSafePage * walletPageSize)

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    )
  }

  const handleWalletSector = (s: string) => { setActiveSector(s); setWalletPage(1) }
  const handleWalletTab = (t: "all" | "favorites") => { setActiveTab(t); setActiveSector("All"); setWalletPage(1) }
  const handleWalletPageSize = (ps: 25 | 50) => { setWalletPageSize(ps); setWalletPage(1) }

  return (
    <>
      <Suspense fallback={null}>
        <ActionFromUrl onAction={setActiveModal} />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <WalletSidebar active={activeSection} onSelect={setActiveSection} onPopup={setSidebarPopup} />

          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Assets</h1>
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <PieChart className="h-3.5 w-3.5" />
                  Portfolio Analytics
                </Link>
              </div>
            </div>

            {/* Balance Card */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">Total Balance</span>
                      <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-muted-foreground hover:text-foreground transition-colors">
                        {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-bold tracking-tight tabular-nums text-foreground">
                        {balanceVisible ? (
                          currencyUnit === "USD"
                            ? `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : `${totalBTC.toFixed(6)} BTC`
                        ) : "****"}
                      </span>
                      <button
                        onClick={() => setCurrencyUnit(currencyUnit === "USD" ? "BTC" : "USD")}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {currencyUnit} <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {balanceVisible
                        ? currencyUnit === "USD"
                          ? `= ${totalBTC.toFixed(6)} BTC`
                          : `= $${totalUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                        : ""}
                    </p>
                  </div>

                  {/* Mini chart placeholder */}
                  <div className="hidden md:block w-48 h-20">
                    <svg viewBox="0 0 200 80" className="w-full h-full">
                      <defs>
                        <linearGradient id="walletGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,60 Q20,55 40,50 T80,35 T120,40 T160,20 T200,15"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                      />
                      <path
                        d="M0,60 Q20,55 40,50 T80,35 T120,40 T160,20 T200,15 V80 H0 Z"
                        fill="url(#walletGrad)"
                      />
                    </svg>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {[
                    { key: "deposit" as ActiveModal, label: "Deposit", icon: ArrowDownToLine, variant: "primary" },
                    { key: "buy" as ActiveModal, label: "Buy Crypto", icon: ShoppingCart, variant: "secondary" },
                    { key: "withdraw" as ActiveModal, label: "Withdraw", icon: ArrowUpFromLine, variant: "secondary" },
                    { key: "transfer" as ActiveModal, label: "Transfer", icon: ArrowRightLeft, variant: "secondary" },
                    { key: "sell" as ActiveModal, label: "Sell Crypto", icon: Tag, variant: "secondary" },
                  ].map((btn) => {
                    const Icon = btn.icon
                    return (
                      <button
                        key={btn.key}
                        onClick={() => setActiveModal(btn.key)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                          btn.variant === "primary"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
                            : "border border-border/50 text-foreground hover:bg-secondary hover:border-primary/20"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {btn.label}
                        {btn.key === "deposit" && <ChevronDown className="h-3 w-3 ml-0.5" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Assets / Accounts Tabs + Controls */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              {/* Top Bar */}
              <div className="flex items-center justify-between border-b border-border/30 px-6 py-3">
                <div className="flex items-center gap-1">
                  {(["all", "favorites"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleWalletTab(tab)}
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium transition-colors rounded-md capitalize",
                        activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab === "favorites" ? "Favorites" : "All Assets"}
                      {activeTab === tab && (
                        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideSmall}
                      onChange={() => setHideSmall(!hideSmall)}
                      className="h-3.5 w-3.5 rounded border-border accent-primary"
                    />
                    Hide small balances
                  </label>
                  <div className="flex items-center gap-1 rounded-lg border border-border/30 p-0.5">
                    <button onClick={() => setViewMode("list")} className={cn("rounded-md p-1.5 transition-colors", viewMode === "list" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setViewMode("grid")} className={cn("rounded-md p-1.5 transition-colors", viewMode === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}>
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-3 py-1.5 w-56">
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search coins..."
                      className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Sector Chips */}
              <div className="flex items-center gap-2 overflow-x-auto px-6 py-2 border-b border-border/20 bg-secondary/10 scrollbar-none">
                {SECTOR_KEYS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleWalletSector(s)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1 text-[10px] font-medium border transition-colors",
                      activeSector === s
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-secondary/30 border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Sort Bar */}
              <div className="flex items-center gap-4 px-6 py-2 border-b border-border/20 bg-secondary/20">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sort by:</span>
                {(["value", "change", "name"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={cn(
                      "text-[11px] font-semibold capitalize transition-colors",
                      sortBy === s ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s === "value" ? "USD Value" : s === "change" ? "24h Change" : "Name"}
                  </button>
                ))}
              </div>

              {/* Asset List */}
              {viewMode === "list" ? (
                <div>
                  {/* Browse mode banner */}
                  {isBrowseMode && (
                    <div className="mx-6 my-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2">
                      <span className="text-[11px] text-primary font-medium">
                        {activeSector !== "All"
                          ? `Showing ${allFilteredAssets.length} ${activeSector} coins from Bybit`
                          : `Showing all ${allFilteredAssets.length} Bybit coins`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">· Owned coins highlighted</span>
                      {activeSector !== "All" && (
                        <button
                          onClick={() => handleWalletSector("All")}
                          className="ml-auto text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear ×
                        </button>
                      )}
                    </div>
                  )}
                  {/* Table Header */}
                  <div className={cn(
                    "grid gap-4 px-6 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/20",
                    isBrowseMode ? "grid-cols-[2rem_1fr_auto_auto_auto]" : "grid-cols-[2rem_1fr_1fr_1fr_1fr_7rem]"
                  )}>
                    <span></span>
                    <span>Coin</span>
                    {isBrowseMode ? (
                      <>
                        <span className="text-right">Price</span>
                        <span className="text-right">24h Change</span>
                        <span className="text-right w-24">Actions</span>
                      </>
                    ) : (
                      <>
                        <span className="text-right">Available</span>
                        <span className="text-right">Frozen</span>
                        <span className="text-right">USD Value</span>
                        <span className="text-right">Actions</span>
                      </>
                    )}
                  </div>
                  {filteredAssets.length === 0 && (
                    <div className="py-12 text-center text-sm text-muted-foreground">No assets found</div>
                  )}
                  {filteredAssets.map((asset) => {
                    const liveEntry = livePriceMap.get(asset.symbol)
                    const isHolding = asset.usdValue > 0
                    return (
                    <div
                      key={asset.symbol}
                      className={cn(
                        "grid gap-4 items-center px-6 py-3.5 border-b border-border/10 hover:bg-secondary/30 transition-colors group",
                        isBrowseMode ? "grid-cols-[2rem_1fr_auto_auto_auto]" : "grid-cols-[2rem_1fr_1fr_1fr_1fr_7rem]",
                        isBrowseMode && isHolding && "bg-primary/5"
                      )}
                    >
                      <button onClick={() => toggleFavorite(asset.symbol)} className="text-muted-foreground hover:text-amber-400 transition-colors">
                        <Star className={cn("h-3.5 w-3.5", favorites.includes(asset.symbol) && "fill-amber-400 text-amber-400")} />
                      </button>
                      <div className="flex items-center gap-3">
                        <CryptoIcon base={asset.symbol} size="lg" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{asset.symbol}</span>
                            {isBrowseMode && isHolding && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded">Owned</span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">{asset.name}</span>
                        </div>
                      </div>
                      {isBrowseMode ? (
                        <>
                          <div className="text-right">
                            <p className="text-sm font-mono font-medium text-foreground tabular-nums">
                              {liveEntry
                                ? liveEntry.price >= 1
                                  ? `$${liveEntry.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                                  : `$${liveEntry.price.toFixed(6)}`
                                : "—"}
                            </p>
                          </div>
                          <div className="text-right w-24">
                            <p className={cn(
                              "text-sm font-mono font-semibold tabular-nums",
                              asset.change24h >= 0 ? "text-trading-green" : "text-destructive"
                            )}>
                              {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                      <div className="text-right">
                        <p className="text-sm font-mono font-medium text-foreground tabular-nums">
                          {balanceVisible ? asset.available.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "****"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-muted-foreground tabular-nums">
                          {balanceVisible ? asset.frozen.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "****"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono font-medium text-foreground tabular-nums">
                          {balanceVisible ? `$${asset.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "****"}
                        </p>
                        {/* Mini ratio bar */}
                        <div className="mt-1 h-1 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/50"
                            style={{ width: `${(asset.usdValue / totalUSD) * 100}%` }}
                          />
                        </div>
                      </div>
                      </>
                      )}
                      {/* Actions — always visible */}
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setActiveModal("deposit")}
                          className="rounded-md px-2 py-1 text-[10px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          {isBrowseMode ? "Buy" : "Deposit"}
                        </button>
                        {!isBrowseMode && (
                          <button
                            onClick={() => setActiveModal("withdraw")}
                            className="rounded-md px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-secondary transition-colors"
                          >
                            Withdraw
                          </button>
                        )}
                        <button className="rounded-md px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-secondary transition-colors">
                          Trade
                        </button>
                      </div>
                    </div>
                  )
                  })}
                  {filteredAssets.length === 0 && (
                    <div className="py-16 text-center">
                      <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No assets found</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-4">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.symbol}
                      className="rounded-xl border border-border/30 bg-secondary/20 p-4 hover:border-primary/20 hover:bg-secondary/40 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <CryptoIcon base={asset.symbol} size="lg" />
                        <button onClick={() => toggleFavorite(asset.symbol)} className="text-muted-foreground hover:text-amber-400 transition-colors">
                          <Star className={cn("h-3.5 w-3.5", favorites.includes(asset.symbol) && "fill-amber-400 text-amber-400")} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-foreground">{asset.symbol}</span>
                        <span className={cn(
                          "text-[10px] font-semibold",
                          asset.change24h >= 0 ? "text-trading-green" : "text-destructive"
                        )}>
                          {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-2">{asset.name}</p>
                      <p className="text-sm font-mono font-semibold text-foreground tabular-nums">
                        {balanceVisible ? `$${asset.usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "****"}
                      </p>
                      <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setActiveModal("deposit")} className="flex-1 rounded-md bg-primary/10 py-1 text-[10px] font-semibold text-primary hover:bg-primary/20 transition-colors">
                          Deposit
                        </button>
                        <button onClick={() => setActiveModal("withdraw")} className="flex-1 rounded-md bg-secondary py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">
                          Withdraw
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="flex flex-col gap-2 px-6 py-3 border-t border-border/20 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>
                    {allFilteredAssets.length === 0 ? "No results" : `${(walletSafePage - 1) * walletPageSize + 1}–${Math.min(walletSafePage * walletPageSize, allFilteredAssets.length)} of ${allFilteredAssets.length}`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span>Per page:</span>
                    {([25, 50] as const).map((ps) => (
                      <button
                        key={ps}
                        onClick={() => handleWalletPageSize(ps)}
                        className={cn(
                          "px-2 py-0.5 rounded border text-[11px] font-medium transition-colors",
                          walletPageSize === ps
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "border-border/40 hover:border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {ps}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setWalletPage(p => Math.max(1, p - 1))}
                    disabled={walletSafePage === 1}
                    className="px-2.5 py-1 rounded border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  {(() => {
                    const total = walletTotalPages
                    const cur = walletSafePage
                    const pages: (number | "…")[] = []
                    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i) }
                    else {
                      pages.push(1)
                      if (cur > 3) pages.push("…")
                      for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i)
                      if (cur < total - 2) pages.push("…")
                      pages.push(total)
                    }
                    return pages.map((p, idx) =>
                      p === "…" ? (
                        <span key={`e-${idx}`} className="px-1 text-[11px] text-muted-foreground">…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setWalletPage(p as number)}
                          className={cn(
                            "min-w-[28px] px-2 py-1 rounded border text-[11px] font-medium transition-colors",
                            walletSafePage === p
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "border-border/40 hover:border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {p}
                        </button>
                      )
                    )
                  })()}
                  <button
                    onClick={() => setWalletPage(p => Math.min(walletTotalPages, p + 1))}
                    disabled={walletSafePage === walletTotalPages}
                    className="px-2.5 py-1 rounded border border-border/40 text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Promo Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button className="group rounded-2xl border border-border/50 bg-card p-5 text-left hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Flexible loans, seamless trading</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">VIP only: Up to 20% off interest rates</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Crypto Loans <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Landmark className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </button>
              <button className="group rounded-2xl border border-border/50 bg-card p-5 text-left hover:border-primary/20 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">Guaranteed returns, flexible access</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">Earn steady returns on your deposits</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                      Simple Earn <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-trading-green/10">
                    <Coins className="h-7 w-7 text-trading-green" />
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
                <h2 className="text-base font-bold text-foreground">Recent Activity</h2>
                <button
                  onClick={() => setActiveModal("history")}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  View All <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div>
                {transactionHistory.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-6 py-3.5 border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        tx.type === "deposit" ? "bg-trading-green/10" : tx.type === "withdrawal" ? "bg-destructive/10" : "bg-primary/10"
                      )}>
                        {tx.type === "deposit" ? (
                          <ArrowDownToLine className="h-3.5 w-3.5 text-trading-green" />
                        ) : tx.type === "withdrawal" ? (
                          <ArrowUpFromLine className="h-3.5 w-3.5 text-destructive" />
                        ) : (
                          <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground capitalize">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.direction}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold text-foreground tabular-nums">
                        {tx.type === "deposit" ? "+" : tx.type === "withdrawal" ? "-" : ""}{tx.amount} {tx.asset}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold capitalize ml-4",
                      tx.status === "completed" ? "text-trading-green" : tx.status === "pending" ? "text-amber-500" : "text-destructive"
                    )}>
                      {tx.status === "completed" ? "Success" : tx.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Account Popup */}
      {sidebarPopup && sidebarPopupContent[sidebarPopup] && (() => {
        const info = sidebarPopupContent[sidebarPopup]
        return (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarPopup(null)} />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/30 px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{info.title}</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{info.subtitle}</p>
                </div>
                <button
                  onClick={() => setSidebarPopup(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 p-5">
                {info.stats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border/30 bg-secondary/30 p-3.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className={cn(
                      "text-base font-bold tabular-nums font-mono",
                      stat.highlight ? "text-primary" : "text-foreground"
                    )}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              {/* Description */}
              <div className="px-5 pb-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
                  {info.description}
                </p>
              </div>
              {/* Actions */}
              <div className="flex gap-3 px-5 pb-5">
                {info.actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setSidebarPopup(null)}
                    className={cn(
                      "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all",
                      action.variant === "primary"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.4)]"
                        : "border border-border/50 text-foreground hover:bg-secondary"
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modals */}
      {activeModal === "deposit" && <DepositModal onClose={() => setActiveModal(null)} />}
      {activeModal === "withdraw" && <WithdrawModal onClose={() => setActiveModal(null)} />}
      {activeModal === "history" && <HistoryModal onClose={() => setActiveModal(null)} />}
      {(activeModal === "transfer" || activeModal === "buy" || activeModal === "sell") && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card shadow-2xl p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
              {activeModal === "transfer" ? <ArrowRightLeft className="h-8 w-8 text-primary" /> :
               activeModal === "buy" ? <ShoppingCart className="h-8 w-8 text-primary" /> :
               <Tag className="h-8 w-8 text-primary" />}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2 capitalize">{activeModal} Crypto</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {activeModal === "transfer"
                ? "Transfer funds between your spot, futures, and margin accounts."
                : activeModal === "buy"
                ? "Purchase crypto using credit card, bank transfer, or P2P."
                : "Sell your crypto for fiat currency or stablecoins."}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 rounded-lg border border-border/50 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors">
                Close
              </button>
              <button className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
