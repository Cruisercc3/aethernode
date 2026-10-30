"use client"

import Link from "next/link"
import {
  Shield,
  Fingerprint,
  Key,
  Users,
  Settings,
  User,
  ChevronRight,
  Smartphone,
  FileCheck,
  Activity,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const dashboardItems = [
  {
    icon: Shield,
    label: "Security",
    description: "Manage 2FA, anti-phishing codes, session management, and account protection.",
    href: "/dashboard/security",
    badge: "Recommended",
    badgeColor: "bg-primary/10 text-primary",
    iconColor: "bg-primary/10 text-primary",
  },
  {
    icon: Fingerprint,
    label: "Identity Verification",
    description: "Complete KYC verification to unlock higher limits and full platform access.",
    href: "/dashboard/identity",
    badge: "Required",
    badgeColor: "bg-amber-500/10 text-amber-500",
    iconColor: "bg-amber-500/10 text-amber-500",
  },
  {
    icon: Key,
    label: "API Keys",
    description: "Create and manage API keys for algorithmic trading and third-party integrations.",
    href: "/dashboard/api-keys",
    badge: "2 Active",
    badgeColor: "bg-trading-green/10 text-trading-green",
    iconColor: "bg-indigo-500/10 text-indigo-500",
  },
  {
    icon: Users,
    label: "Sub Accounts",
    description: "Manage sub-accounts for portfolio separation and team-based trading strategies.",
    href: "/dashboard/sub-accounts",
    badge: "3 Accounts",
    badgeColor: "bg-secondary text-muted-foreground",
    iconColor: "bg-fuchsia-500/10 text-fuchsia-500",
  },
  {
    icon: Settings,
    label: "Settings",
    description: "Preferences, notifications, trade settings, and display configuration.",
    href: "/dashboard/settings",
    badge: null,
    badgeColor: "",
    iconColor: "bg-secondary text-muted-foreground",
  },
]

const quickStats = [
  { label: "Security Level", value: "Medium", icon: Shield, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  { label: "Verification", value: "Basic (L1)", icon: FileCheck, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "2FA Status", value: "Enabled", icon: Smartphone, color: "text-trading-green", bgColor: "bg-trading-green/10" },
  { label: "Active Sessions", value: "2", icon: Activity, color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
]

const recentActivity = [
  { action: "API Key created", detail: "Trading Bot Alpha", time: "2 hours ago", icon: Key, color: "text-primary" },
  { action: "Login detected", detail: "Chrome on macOS - New York, US", time: "4 hours ago", icon: Globe, color: "text-trading-green" },
  { action: "2FA enabled", detail: "Google Authenticator", time: "1 day ago", icon: Lock, color: "text-amber-500" },
  { action: "Withdrawal", detail: "0.005 BTC to external wallet", time: "3 days ago", icon: TrendingUp, color: "text-destructive" },
]

export default function DashboardPage() {
  const [balanceVisible, setBalanceVisible] = useState(true)

  return (
    <div className="space-y-8">
      {/* Header with Profile & Verification */}
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Profile Picture with Change Option */}
        <div className="relative group">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 overflow-hidden">
            <User className="h-10 w-10 text-primary" />
          </div>
          <button className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
            <span className="text-[10px] font-medium text-white">Change</span>
          </button>
          <CheckCircle2 className="absolute -bottom-1 -right-1 h-6 w-6 text-trading-green fill-trading-green/20 bg-card rounded-full" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Demo User</h1>
            <span className="text-[10px] px-2 py-0.5 bg-trading-green/10 text-trading-green font-semibold rounded uppercase">Verified</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            UID: 847291035
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">Level 2 KYC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-trading-green" />
              <span className="text-muted-foreground">2FA Enabled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Last login: 2 hours ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Overview Card */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">Account Overview</span>
                <button onClick={() => setBalanceVisible(!balanceVisible)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {balanceVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                  {balanceVisible ? "$46,897.62" : "****"}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-trading-green">
                  <TrendingUp className="h-3 w-3" /> +2.34%
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {balanceVisible ? "= 0.4835 BTC" : ""}
              </p>
            </div>
            <Link
              href="/wallet"
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors"
            >
              <Wallet className="h-4 w-4" />
              Go to Wallet
            </Link>
          </div>

          {/* Mini chart */}
          <div className="h-16">
            <svg viewBox="0 0 400 60" className="w-full h-full">
              <defs>
                <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,45 Q30,42 60,38 T120,30 T180,35 T240,22 T300,18 T360,12 T400,10"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              <path
                d="M0,45 Q30,42 60,38 T120,30 T180,35 T240,22 T300,18 T360,12 T400,10 V60 H0 Z"
                fill="url(#dashGrad)"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 hover:border-primary/20 transition-all"
          >
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.bgColor)}>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Security Alert */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">Complete your verification</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Your account is currently at Basic (Level 1). Complete Advanced verification to unlock unlimited trading, margin access, and higher API limits.
          </p>
        </div>
        <Link
          href="/dashboard/identity"
          className="shrink-0 flex items-center gap-1 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-card hover:bg-amber-500/90 transition-colors"
        >
          Verify Now <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Main Navigation Cards */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">Account Management</h2>
        <div className="flex flex-col gap-2.5">
          {dashboardItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-4 rounded-xl border border-border/50 bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)]"
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                item.iconColor
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{item.label}</h3>
                  {item.badge && (
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", item.badgeColor)}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Account Activity */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
          <h2 className="text-sm font-bold text-foreground">Recent Account Activity</h2>
          <span className="text-[10px] text-muted-foreground">Last 7 days</span>
        </div>
        <div>
          {recentActivity.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5 border-b border-border/10 last:border-0 hover:bg-secondary/20 transition-colors">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg bg-secondary")}>
                  <Icon className={cn("h-4 w-4", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{item.action}</p>
                  <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {item.time}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Enable 2FA", icon: Smartphone, href: "/dashboard/security", color: "text-trading-green" },
          { label: "Create API Key", icon: Key, href: "/dashboard/api-keys", color: "text-indigo-400" },
          { label: "Verify Identity", icon: Fingerprint, href: "/dashboard/identity", color: "text-amber-500" },
          { label: "New Sub Account", icon: Users, href: "/dashboard/sub-accounts", color: "text-fuchsia-400" },
        ].map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-card p-5 text-center hover:border-primary/20 transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                <Icon className={cn("h-5 w-5", action.color, "group-hover:text-primary transition-colors")} />
              </div>
              <span className="text-xs font-semibold text-foreground">{action.label}</span>
              <Zap className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
