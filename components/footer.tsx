"use client"

import Link from "next/link"
import { Rocket, Github, FileText, Terminal } from "lucide-react"

const externalLinks = [
  { icon: Rocket, href: "https://www.sideprojectors.com/project/74967/aethernode", label: "SideProjectors", external: true },
  { icon: Github, href: "https://github.com/Cruisercc3", label: "GitHub", external: true },
  { icon: FileText, href: "/request-docs", label: "Request Docs", external: false },
]

const footerSections = [
  {
    title: "Platform",
    links: [
      { label: "Futures", href: "/platform" },
      { label: "Spot", href: "/spot" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Wallet", href: "/wallet" },
      { label: "Analytics", href: "/analytics" },
      { label: "Markets", href: "/markets" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Identity", href: "/dashboard/identity" },
      { label: "Settings", href: "/dashboard/settings" },
      { label: "Security", href: "/dashboard/security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Architecture", href: "/architecture" },
      { label: "Acquisition", href: "/acquisition" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "API Docs", href: "/api-docs" },
      { label: "Status", href: "/status" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Compliance", href: "/compliance" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative">
      {/* Seamless transition gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Header bar — logo section with same background as navbar */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between py-6">
            {/* Logo — flows naturally from content */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center border-2 border-primary bg-primary/10 transition-all group-hover:bg-primary/20">
                <Terminal className="h-5 w-5 text-primary" />
                <div className="absolute -top-px -right-px h-2 w-2 bg-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-wider uppercase text-foreground">
                  AetherNode
                </span>
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest">
                  TRADING INFRASTRUCTURE
                </span>
              </div>
            </Link>

            {/* External links — aligned to the right */}
            <div className="flex items-center gap-2">
              {externalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  aria-label={link.label}
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted-foreground transition-all hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                >
                  <link.icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content - same background as navbar for cohesion */}
      <div className="bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-12">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            {/* Link Sections */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-[11px] font-mono font-semibold uppercase tracking-widest text-primary mb-4">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[13px] font-mono text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 md:flex-row">
            <p className="text-[11px] font-mono text-muted-foreground">
              &copy; 2026 Conor Cruise. All rights reserved. Complete platform available for acquisition.
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/50">
              Trading cryptocurrency involves significant risk.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
