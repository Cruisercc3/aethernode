"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Shield, Fingerprint, Key, Users, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

const settingsLinks = [
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Identity Verification", href: "/settings/identity", icon: Fingerprint },
  { label: "API Keys", href: "/settings/api-keys", icon: Key },
  { label: "Sub Accounts", href: "/settings/sub-accounts", icon: Users },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Back Link */}
        <Link
          href="/platform"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Platform
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-6">Account Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <nav className="w-56 shrink-0">
            <div className="rounded-lg border border-border/50 bg-card p-2 space-y-0.5">
              {settingsLinks.map((link) => {
                const isActive = pathname === link.href
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
