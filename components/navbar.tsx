"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { 
  Menu, X, Wallet, Sun, Moon, Terminal, ArrowRight, ChevronDown,
  LayoutDashboard, LineChart, Briefcase, Shield, Settings, User,
  TrendingUp, BarChart3, Zap, LogOut, BadgeCheck, Coins, ArrowDownToLine,
  ArrowUpFromLine, ArrowLeftRight, ClipboardList, History, FileText,
  DollarSign, Bitcoin, Receipt, QrCode, Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { WalletConnectModal } from "@/components/wallet-connect-modal"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null)
  const [time, setTime] = useState("")
  const [platformOpen, setPlatformOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false)
  const [ordersExpanded, setOrdersExpanded] = useState(false)
  const [qrDropdownOpen, setQrDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleConnectWallet = (address: string) => {
    setConnectedAddress(address)
  }

  const platformLinks = [
    { label: "Futures Trading", href: "/platform", icon: TrendingUp, desc: "Perpetual contracts" },
    { label: "Spot Trading", href: "/spot", icon: Zap, desc: "Direct asset exchange" },
    { label: "Markets", href: "/markets", icon: BarChart3, desc: "Live market data" },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, desc: "Portfolio overview" },
    { label: "Wallet", href: "/wallet", icon: Wallet, desc: "Asset management" },
    { label: "Analytics", href: "/analytics", icon: LineChart, desc: "Trading insights" },
  ]

  const accountLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Security", href: "/dashboard/security", icon: Shield },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Identity", href: "/dashboard/identity", icon: User },
  ]

  // Wallet dropdown items. The wallet page opens the matching demo modal from ?action=
  const walletMenuItems = [
    { label: "Assets", href: "/wallet", icon: Coins },
    { label: "Deposit", href: "/wallet?action=deposit", icon: ArrowDownToLine },
    { label: "Withdraw", href: "/wallet?action=withdraw", icon: ArrowUpFromLine },
    { label: "Transfer", href: "/wallet?action=transfer", icon: ArrowLeftRight },
  ]

  // Orders submenu items. These all live in the futures terminal's position tabs.
  const ordersItems = [
    { label: "Open Orders", href: "/platform" },
    { label: "Order History", href: "/platform" },
    { label: "Position History", href: "/platform" },
    { label: "Order Details", href: "/platform" },
    { label: "Closed PnL", href: "/platform" },
    { label: "Interest History", href: "/platform" },
    { label: "Transactions", href: "/platform" },
  ]

  // One futures terminal serves every contract type in this demo
  const futuresTypes = [
    { label: "USDT-M Futures", href: "/platform" },
    { label: "Coin-M Futures", href: "/platform" },
    { label: "USDC-M Futures", href: "/platform" },
    { label: "USDT-M Futures Demo", href: "/platform" },
    { label: "Coin-M Futures Demo", href: "/platform" },
    { label: "USDC-M Futures Demo", href: "/platform" },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Top status bar */}
        <div className="border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-1 text-[10px] font-mono text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                SYSTEM ONLINE
              </span>
              <span className="hidden sm:inline">NODE: PRIMARY</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">UTC {time}</span>
              <span>v2.4.1</span>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="border-b-2 border-foreground/10 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-9 w-9 items-center justify-center border-2 border-primary bg-primary/10">
                <Terminal className="h-4 w-4 text-primary" />
                <div className="absolute -top-px -right-px h-2 w-2 bg-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wider uppercase text-foreground">
                  AetherNode
                </span>
                <span className="text-[9px] font-mono text-muted-foreground tracking-widest">
                  TRADING INFRASTRUCTURE
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {/* Platform Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setPlatformOpen(true)}
                onMouseLeave={() => setPlatformOpen(false)}
              >
                <button
                  className={cn(
                    "relative flex items-center gap-1 px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all",
                    pathname?.startsWith("/platform") || pathname === "/spot" || pathname === "/markets" || pathname === "/dashboard" || pathname === "/wallet" || pathname === "/analytics"
                      ? "text-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  Platform
                  <ChevronDown className={cn("h-3 w-3 transition-transform", platformOpen && "rotate-180")} />
                </button>

                <div
                  className={cn(
                    "absolute left-0 top-full pt-2 z-50 transition-all duration-100",
                    platformOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                  )}
                >
                  <div className="w-64 border-2 border-foreground/10 bg-card p-2">
                    {platformLinks.map((link) => {
                      const Icon = link.icon
                      const isActive = pathname === link.href
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 transition-all border-l-2",
                            isActive
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-transparent hover:bg-muted/50 hover:border-muted-foreground/50"
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="text-xs font-mono uppercase tracking-wider">{link.label}</span>
                            <span className="text-[10px] text-muted-foreground">{link.desc}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Architecture */}
              <Link
                href="/architecture"
                className={cn(
                  "relative px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all",
                  pathname === "/architecture"
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {pathname === "/architecture" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary" />
                )}
                Architecture
              </Link>

              {/* Acquisition */}
              <Link
                href="/acquisition"
                className={cn(
                  "relative px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all",
                  pathname === "/acquisition"
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {pathname === "/acquisition" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary" />
                )}
                Acquisition
              </Link>

              {/* Request Docs */}
              <Link
                href="/request-docs"
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider hover:bg-primary/90 transition-all"
              >
                Request Docs
              </Link>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* QR Code Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setQrDropdownOpen(true)}
                onMouseLeave={() => setQrDropdownOpen(false)}
              >
                <button
                  className={cn(
                    "flex h-8 w-8 items-center justify-center border transition-all",
                    qrDropdownOpen 
                      ? "border-primary text-primary bg-primary/5" 
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                  title="Download App"
                >
                  <QrCode className="h-4 w-4" />
                </button>

                <div
                  className={cn(
                    "absolute right-0 top-full pt-2 z-50 transition-all duration-100",
                    qrDropdownOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                  )}
                >
                  <div className="w-64 border-2 border-foreground/10 bg-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <span className="text-xs font-mono font-semibold text-foreground uppercase tracking-wider">Download App</span>
                    </div>
                    
                    {/* QR Code SVG */}
                    <div className="bg-white p-3 rounded-lg mb-3">
                      <svg viewBox="0 0 100 100" className="w-full h-auto">
                        {/* QR Code Pattern - Realistic looking */}
                        <rect fill="white" width="100" height="100"/>
                        {/* Position detection patterns (corners) */}
                        <rect fill="black" x="4" y="4" width="20" height="20"/>
                        <rect fill="white" x="7" y="7" width="14" height="14"/>
                        <rect fill="black" x="10" y="10" width="8" height="8"/>
                        
                        <rect fill="black" x="76" y="4" width="20" height="20"/>
                        <rect fill="white" x="79" y="7" width="14" height="14"/>
                        <rect fill="black" x="82" y="10" width="8" height="8"/>
                        
                        <rect fill="black" x="4" y="76" width="20" height="20"/>
                        <rect fill="white" x="7" y="79" width="14" height="14"/>
                        <rect fill="black" x="10" y="82" width="8" height="8"/>
                        
                        {/* Data modules - realistic pattern */}
                        <rect fill="black" x="28" y="4" width="4" height="4"/>
                        <rect fill="black" x="36" y="4" width="4" height="4"/>
                        <rect fill="black" x="44" y="4" width="4" height="4"/>
                        <rect fill="black" x="52" y="4" width="4" height="4"/>
                        <rect fill="black" x="60" y="4" width="4" height="4"/>
                        <rect fill="black" x="68" y="4" width="4" height="4"/>
                        
                        <rect fill="black" x="28" y="12" width="4" height="4"/>
                        <rect fill="black" x="40" y="12" width="4" height="4"/>
                        <rect fill="black" x="48" y="12" width="4" height="4"/>
                        <rect fill="black" x="64" y="12" width="4" height="4"/>
                        
                        <rect fill="black" x="32" y="20" width="4" height="4"/>
                        <rect fill="black" x="44" y="20" width="4" height="4"/>
                        <rect fill="black" x="56" y="20" width="4" height="4"/>
                        <rect fill="black" x="68" y="20" width="4" height="4"/>
                        
                        <rect fill="black" x="28" y="28" width="4" height="4"/>
                        <rect fill="black" x="36" y="28" width="4" height="4"/>
                        <rect fill="black" x="44" y="28" width="4" height="4"/>
                        <rect fill="black" x="52" y="28" width="4" height="4"/>
                        <rect fill="black" x="60" y="28" width="4" height="4"/>
                        <rect fill="black" x="68" y="28" width="4" height="4"/>
                        <rect fill="black" x="76" y="28" width="4" height="4"/>
                        <rect fill="black" x="84" y="28" width="4" height="4"/>
                        <rect fill="black" x="92" y="28" width="4" height="4"/>
                        
                        <rect fill="black" x="4" y="28" width="4" height="4"/>
                        <rect fill="black" x="12" y="28" width="4" height="4"/>
                        <rect fill="black" x="20" y="28" width="4" height="4"/>
                        
                        {/* Middle section */}
                        <rect fill="black" x="4" y="36" width="4" height="4"/>
                        <rect fill="black" x="16" y="36" width="4" height="4"/>
                        <rect fill="black" x="28" y="36" width="4" height="4"/>
                        <rect fill="black" x="40" y="36" width="4" height="4"/>
                        <rect fill="black" x="52" y="36" width="4" height="4"/>
                        <rect fill="black" x="64" y="36" width="4" height="4"/>
                        <rect fill="black" x="76" y="36" width="4" height="4"/>
                        <rect fill="black" x="88" y="36" width="4" height="4"/>
                        
                        <rect fill="black" x="8" y="44" width="4" height="4"/>
                        <rect fill="black" x="20" y="44" width="4" height="4"/>
                        <rect fill="black" x="32" y="44" width="4" height="4"/>
                        <rect fill="black" x="44" y="44" width="4" height="4"/>
                        <rect fill="black" x="56" y="44" width="4" height="4"/>
                        <rect fill="black" x="68" y="44" width="4" height="4"/>
                        <rect fill="black" x="80" y="44" width="4" height="4"/>
                        <rect fill="black" x="92" y="44" width="4" height="4"/>
                        
                        <rect fill="black" x="4" y="52" width="4" height="4"/>
                        <rect fill="black" x="12" y="52" width="4" height="4"/>
                        <rect fill="black" x="24" y="52" width="4" height="4"/>
                        <rect fill="black" x="36" y="52" width="4" height="4"/>
                        <rect fill="black" x="48" y="52" width="4" height="4"/>
                        <rect fill="black" x="60" y="52" width="4" height="4"/>
                        <rect fill="black" x="72" y="52" width="4" height="4"/>
                        <rect fill="black" x="84" y="52" width="4" height="4"/>
                        
                        <rect fill="black" x="8" y="60" width="4" height="4"/>
                        <rect fill="black" x="20" y="60" width="4" height="4"/>
                        <rect fill="black" x="32" y="60" width="4" height="4"/>
                        <rect fill="black" x="44" y="60" width="4" height="4"/>
                        <rect fill="black" x="56" y="60" width="4" height="4"/>
                        <rect fill="black" x="68" y="60" width="4" height="4"/>
                        <rect fill="black" x="80" y="60" width="4" height="4"/>
                        
                        <rect fill="black" x="4" y="68" width="4" height="4"/>
                        <rect fill="black" x="12" y="68" width="4" height="4"/>
                        <rect fill="black" x="20" y="68" width="4" height="4"/>
                        <rect fill="black" x="28" y="68" width="4" height="4"/>
                        <rect fill="black" x="36" y="68" width="4" height="4"/>
                        <rect fill="black" x="44" y="68" width="4" height="4"/>
                        <rect fill="black" x="52" y="68" width="4" height="4"/>
                        <rect fill="black" x="60" y="68" width="4" height="4"/>
                        <rect fill="black" x="68" y="68" width="4" height="4"/>
                        
                        {/* Bottom right area */}
                        <rect fill="black" x="28" y="76" width="4" height="4"/>
                        <rect fill="black" x="40" y="76" width="4" height="4"/>
                        <rect fill="black" x="52" y="76" width="4" height="4"/>
                        <rect fill="black" x="64" y="76" width="4" height="4"/>
                        <rect fill="black" x="76" y="76" width="4" height="4"/>
                        <rect fill="black" x="88" y="76" width="4" height="4"/>
                        
                        <rect fill="black" x="32" y="84" width="4" height="4"/>
                        <rect fill="black" x="44" y="84" width="4" height="4"/>
                        <rect fill="black" x="56" y="84" width="4" height="4"/>
                        <rect fill="black" x="68" y="84" width="4" height="4"/>
                        <rect fill="black" x="80" y="84" width="4" height="4"/>
                        <rect fill="black" x="92" y="84" width="4" height="4"/>
                        
                        <rect fill="black" x="28" y="92" width="4" height="4"/>
                        <rect fill="black" x="36" y="92" width="4" height="4"/>
                        <rect fill="black" x="48" y="92" width="4" height="4"/>
                        <rect fill="black" x="60" y="92" width="4" height="4"/>
                        <rect fill="black" x="72" y="92" width="4" height="4"/>
                        <rect fill="black" x="84" y="92" width="4" height="4"/>
                      </svg>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground text-center mb-3">
                      Scan to download AetherNode mobile app
                    </p>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-border text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-foreground transition-all">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                        iOS
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 border border-border text-[10px] font-mono text-muted-foreground hover:text-foreground hover:border-foreground transition-all">
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                        Android
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Dropdown - Icon only */}
              <div
                className="relative"
                onMouseEnter={() => setWalletDropdownOpen(true)}
                onMouseLeave={() => { setWalletDropdownOpen(false); setOrdersExpanded(false) }}
              >
                <button
                  className={cn(
                    "flex h-8 w-8 items-center justify-center border transition-all",
                    walletDropdownOpen 
                      ? "border-primary text-primary bg-primary/5" 
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                  title="Wallet"
                >
                  <Wallet className="h-4 w-4" />
                </button>

                <div
                  className={cn(
                    "absolute right-0 top-full pt-2 z-50 transition-all duration-100",
                    walletDropdownOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                  )}
                >
                  <div className="w-72 border-2 border-foreground/10 bg-card max-h-[70vh] overflow-y-auto">
                    {/* Balance Display */}
                    <div className="p-3 border-b border-border bg-muted/20">
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                        Total Balance
                      </div>
                      <div className="text-lg font-bold font-mono text-foreground">
                        $12,847.32
                      </div>
                      <div className="text-[10px] font-mono text-trading-green mt-0.5">
                        +$234.56 (1.86%)
                      </div>
                    </div>
                    
                    {/* Wallet Actions */}
                    <div className="p-2 border-b border-border">
                      <div className="px-2 py-1.5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                        Quick Actions
                      </div>
                      {walletMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-mono hover:bg-muted/50 transition-all"
                          >
                            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>

                    {/* Orders Section */}
                    <div className="p-2 border-b border-border">
                      <button
                        onClick={() => setOrdersExpanded(!ordersExpanded)}
                        className="flex items-center justify-between w-full px-2 py-1.5 text-[9px] font-mono text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <ClipboardList className="h-3 w-3" />
                          Orders
                        </span>
                        <ChevronDown className={cn("h-3 w-3 transition-transform", ordersExpanded && "rotate-180")} />
                      </button>
                      
                      <div className={cn(
                        "overflow-hidden transition-all duration-200",
                        ordersExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                      )}>
                        {/* Order Items */}
                        <div className="pl-2 mt-1">
                          {ordersItems.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                            >
                              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                              {item.label}
                            </Link>
                          ))}
                        </div>

                        {/* Futures Types */}
                        <div className="pl-2 mt-2 pt-2 border-t border-border/50">
                          <div className="px-3 py-1 text-[8px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                            Futures
                          </div>
                          {futuresTypes.map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all"
                            >
                              <span className="w-1 h-1 rounded-full bg-primary/50" />
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Connect Wallet Button */}
                    <div className="p-2">
                      {connectedAddress ? (
                        <div className="flex items-center gap-2 px-3 py-2 border border-accent/50 bg-accent/5 text-accent">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                          <span className="text-[10px] font-mono">{connectedAddress}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setWalletModalOpen(true)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-primary bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider hover:bg-primary/20 transition-all"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                          Connect Wallet
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign In - Text link style */}
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all"
              >
                Sign In
              </Link>

              {/* Sign Up CTA - Same style as Request Docs */}
              <Link
                href="/signup"
                className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider hover:bg-primary/90 transition-all"
              >
                Sign Up
              </Link>

              {/* User Account Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setAccountOpen(true)}
                onMouseLeave={() => setAccountOpen(false)}
              >
                <button
                  className={cn(
                    "flex h-8 w-8 items-center justify-center border transition-all overflow-hidden",
                    accountOpen ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  )}
                >
                  {/* Profile avatar placeholder */}
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </button>

                <div
                  className={cn(
                    "absolute right-0 top-full pt-2 z-50 transition-all duration-100",
                    accountOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                  )}
                >
                  <div className="w-60 border-2 border-foreground/10 bg-card">
                    {/* Profile Header */}
                    <div className="flex items-center gap-3 px-3 py-3 border-b border-border bg-muted/30">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border border-primary/20">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <BadgeCheck className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-accent fill-accent/20" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-semibold text-foreground truncate">Demo User</span>
                          <span className="text-[8px] px-1 py-0.5 bg-accent/10 text-accent font-mono rounded">VERIFIED</span>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground">UID: 847291035</span>
                      </div>
                    </div>
                    
                    {/* Verified Status + Level */}
                    <div className="grid grid-cols-2 gap-px bg-border/30 border-b border-border">
                      <div className="bg-card px-3 py-2">
                        <span className="text-[9px] text-muted-foreground font-mono block">Status</span>
                        <span className="flex items-center gap-1 text-xs font-mono text-trading-green">
                          <BadgeCheck className="h-3 w-3" />
                          Verified
                        </span>
                      </div>
                      <div className="bg-card px-3 py-2">
                        <span className="text-[9px] text-muted-foreground font-mono block">Level</span>
                        <span className="text-xs font-mono text-foreground">VIP 2</span>
                      </div>
                    </div>

                    {/* Account Links */}
                    <div className="py-1">
                      {accountLinks.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center gap-2.5 px-3 py-2 transition-all",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-xs font-mono">{link.label}</span>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Theme Toggle */}
                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="flex items-center justify-between w-full px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                      >
                        <span className="flex items-center gap-2.5">
                          {!mounted ? (
                            <Sun className="h-3.5 w-3.5" />
                          ) : theme === "dark" ? (
                            <Sun className="h-3.5 w-3.5" />
                          ) : (
                            <Moon className="h-3.5 w-3.5" />
                          )}
                          <span className="text-xs font-mono">
                            {!mounted ? "Theme" : theme === "dark" ? "Light Mode" : "Dark Mode"}
                          </span>
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground/60 uppercase">
                          {!mounted ? "" : theme === "dark" ? "Dark" : "Light"}
                        </span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-border py-1">
                      <button
                        className="flex items-center gap-2.5 px-3 py-2 w-full text-left text-muted-foreground hover:text-trading-red hover:bg-trading-red/5 transition-all"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span className="text-xs font-mono">Log Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center border border-border md:hidden hover:bg-muted transition-all"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-200 bg-background border-b-2 border-foreground/10",
            mobileOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0 border-b-0"
          )}
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {/* Platform Section */}
            <div className="px-4 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border mb-1">
              Platform
            </div>
            {platformLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-all border-l-2",
                    isActive
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
            
            <div className="h-px bg-border my-2" />

            {/* Other Links */}
            <Link
              href="/architecture"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-all border-l-2",
                pathname === "/architecture"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Architecture
            </Link>
            <Link
              href="/acquisition"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-all border-l-2",
                pathname === "/acquisition"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              Acquisition
            </Link>
            <Link
              href="/request-docs"
              onClick={() => setMobileOpen(false)}
              className="mx-4 mt-2 flex items-center justify-center py-2.5 bg-primary text-primary-foreground text-sm font-mono uppercase tracking-wider hover:bg-primary/90 transition-all"
            >
              Request Docs
            </Link>

            <div className="h-px bg-border my-2" />

            {/* Wallet Section */}
            <div className="px-4 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border mb-1">
              <span className="flex items-center gap-1.5">
                <Wallet className="h-3 w-3" />
                Wallet
              </span>
            </div>
            {walletMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-all border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}

            <div className="h-px bg-border my-2" />

            {/* Account Section */}
            <div className="px-4 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest border-b border-border mb-1">
              Account
            </div>
            {accountLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-all border-l-2",
                    isActive
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-mono uppercase tracking-wider transition-all border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              {!mounted ? (
                <Sun className="h-4 w-4" />
              ) : theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {!mounted ? "Theme" : theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>

            <div className="h-px bg-border my-2" />

            {/* Actions */}
            <div className="flex gap-2 px-4 py-2">
              <button
                onClick={() => {
                  setMobileOpen(false)
                  setWalletModalOpen(true)
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border text-xs font-mono uppercase text-muted-foreground hover:text-foreground transition-all"
              >
                <Wallet className="h-3.5 w-3.5" />
                Connect
              </button>
            </div>

            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="mx-4 mt-2 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground text-sm font-mono uppercase tracking-wider hover:bg-primary/90 transition-all"
            >
              Sign Up
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        open={walletModalOpen}
        onOpenChange={setWalletModalOpen}
        onConnect={handleConnectWallet}
      />
    </>
  )
}
