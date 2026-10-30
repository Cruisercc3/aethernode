"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Shield, Fingerprint, Key, Users, Settings, ArrowLeft, LayoutDashboard,
  Wallet, Coins, LineChart, TrendingUp, Layers, Globe, BadgeCheck, 
  ChevronRight, Zap, Lock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Account navigation
const accountNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Security", href: "/dashboard/security", icon: Shield },
  { label: "Verification", href: "/dashboard/identity", icon: Fingerprint },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Sub Accounts", href: "/dashboard/sub-accounts", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

// Asset categories with balances
const assetCategories = [
  { label: "Wallet", href: "/wallet", icon: Wallet, balance: "$12,847.32", change: "+2.4%" },
  { label: "Spot", href: "/spot", icon: Coins, balance: "$24,102.50", change: "+1.8%" },
  { label: "Futures", href: "/platform", icon: TrendingUp, balance: "$8,947.80", change: "-0.6%" },
  { label: "Earn", href: "/staking", icon: Layers, balance: "$1,000.00", change: "+5.2%" },
  { label: "Onchain", href: "/wallet", icon: Globe, balance: "$0.00", change: "0.0%" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [assetsExpanded, setAssetsExpanded] = useState(true)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex gap-6">
        {/* Enhanced Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <nav className="sticky top-24 space-y-4">
            {/* Back link */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>

            {/* Security Verification Card */}
            <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-4">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Status</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">Verified</span>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-trading-green animate-pulse" />
                    </div>
                  </div>
                </div>
                
                {/* Verification progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Security Level</span>
                    <span className="font-mono text-foreground">Level 2</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-primary/60" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>2FA Enabled</span>
                    <span className="mx-1">-</span>
                    <Zap className="h-3 w-3 text-amber-500" />
                    <span>KYC Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assets Section */}
            <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              <button
                onClick={() => setAssetsExpanded(!assetsExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors"
              >
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Assets</span>
                <ChevronRight className={cn(
                  "h-3.5 w-3.5 text-muted-foreground transition-transform",
                  assetsExpanded && "rotate-90"
                )} />
              </button>
              
              <div className={cn(
                "overflow-hidden transition-all duration-300",
                assetsExpanded ? "max-h-96" : "max-h-0"
              )}>
                <div className="px-2 pb-2 space-y-0.5">
                  {assetCategories.map((item) => {
                    const Icon = item.icon
                    const isPositive = item.change.startsWith("+")
                    const isNeutral = item.change === "0.0%"
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-secondary/50 transition-all"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground">{item.label}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground">{item.balance}</span>
                            <span className={cn(
                              "text-[9px] font-mono",
                              isNeutral ? "text-muted-foreground" : isPositive ? "text-trading-green" : "text-trading-red"
                            )}>
                              {item.change}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Account Navigation */}
            <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Account</span>
              </div>
              <div className="px-2 py-2 space-y-0.5">
                {accountNav.map((link) => {
                  const isActive = pathname === link.href
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                      <span className="text-xs font-medium">{link.label}</span>
                      {isActive && (
                        <div className="ml-auto flex h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Quick Stats Mini */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/30 bg-card/30 p-3">
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Total</div>
                <div className="text-sm font-bold font-mono text-foreground">$46,897</div>
              </div>
              <div className="rounded-lg border border-border/30 bg-card/30 p-3">
                <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-1">24h P&L</div>
                <div className="text-sm font-bold font-mono text-trading-green">+$1,082</div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
