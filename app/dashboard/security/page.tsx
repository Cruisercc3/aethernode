"use client"

import { useState } from "react"
import { Shield, Smartphone, Mail, KeyRound, Fingerprint, CheckCircle2, AlertTriangle, Monitor, Globe, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface SecurityMethod {
  id: string
  label: string
  description: string
  icon: typeof Shield
  enabled: boolean
  status: "active" | "inactive" | "recommended"
}

interface LoginSession {
  id: string
  device: string
  location: string
  ip: string
  lastActive: string
  current: boolean
}

export default function SecurityPage() {
  const [methods, setMethods] = useState<SecurityMethod[]>([
    {
      id: "passkey",
      label: "Passkey",
      description: "Use biometric authentication or a security key for passwordless sign-in.",
      icon: Fingerprint,
      enabled: false,
      status: "recommended",
    },
    {
      id: "authenticator",
      label: "Google Authenticator",
      description: "Generate time-based one-time passwords (TOTP) using an authenticator app.",
      icon: Smartphone,
      enabled: true,
      status: "active",
    },
    {
      id: "email",
      label: "Email Verification",
      description: "Receive a verification code via email for account actions.",
      icon: Mail,
      enabled: true,
      status: "active",
    },
    {
      id: "sms",
      label: "SMS Authentication",
      description: "Receive verification codes via SMS text message.",
      icon: Smartphone,
      enabled: false,
      status: "inactive",
    },
    {
      id: "hardware",
      label: "Hardware Security Key",
      description: "Use a physical FIDO2/WebAuthn security key for maximum protection.",
      icon: KeyRound,
      enabled: false,
      status: "inactive",
    },
  ])

  const [sessions] = useState<LoginSession[]>([
    { id: "1", device: "Chrome on macOS", location: "New York, US", ip: "192.168.1.xxx", lastActive: "Active now", current: true },
    { id: "2", device: "Safari on iPhone", location: "New York, US", ip: "10.0.0.xxx", lastActive: "2 hours ago", current: false },
    { id: "3", device: "Firefox on Windows", location: "London, UK", ip: "172.16.0.xxx", lastActive: "3 days ago", current: false },
  ])

  const [antiPhishing, setAntiPhishing] = useState("")
  const [showAntiPhishing, setShowAntiPhishing] = useState(false)

  const toggleMethod = (id: string) => {
    setMethods((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, enabled: !m.enabled, status: !m.enabled ? "active" : "inactive" }
          : m
      )
    )
  }

  const enabledCount = methods.filter((m) => m.enabled).length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your verification methods and account security settings.
        </p>
      </div>

      {/* Security Score */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Security Score</span>
              <p className="text-xs text-muted-foreground">
                {enabledCount < 3 ? "Needs improvement" : "Strong coverage"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono font-bold text-primary">
              {enabledCount}/{methods.length}
            </span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(enabledCount / methods.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Verification Methods */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Verification Methods</h3>
        <div className="space-y-3">
          {methods.map((method) => {
            const Icon = method.icon
            return (
              <div
                key={method.id}
                className={cn(
                  "rounded-xl border bg-card p-5 transition-all",
                  method.enabled ? "border-primary/30" : "border-border/50"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                    method.enabled ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{method.label}</span>
                      {method.status === "recommended" && !method.enabled && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          Recommended
                        </span>
                      )}
                      {method.enabled && <CheckCircle2 className="h-3.5 w-3.5 text-trading-green" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{method.description}</p>
                  </div>
                  <button
                    onClick={() => toggleMethod(method.id)}
                    className={cn(
                      "relative h-6 w-11 rounded-full shrink-0 transition-colors duration-200",
                      method.enabled ? "bg-primary" : "bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform duration-200",
                      method.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    )} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Anti-Phishing Code */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Anti-Phishing Code</h3>
            <p className="text-xs text-muted-foreground">Set a code that appears in all genuine AetherNode emails.</p>
          </div>
        </div>
        {showAntiPhishing ? (
          <div className="flex gap-2">
            <input
              type="text"
              value={antiPhishing}
              onChange={(e) => setAntiPhishing(e.target.value)}
              placeholder="Enter your anti-phishing code"
              maxLength={20}
              className="flex-1 rounded-lg border border-border/50 bg-secondary/50 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
            />
            <button
              onClick={() => setShowAntiPhishing(false)}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAntiPhishing(true)}
            className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            Set Anti-Phishing Code
          </button>
        )}
      </div>

      {/* Active Sessions */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-3">Active Sessions</h3>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Monitor className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{session.device}</span>
                  {session.current && (
                    <span className="rounded-full bg-trading-green/10 px-2 py-0.5 text-[10px] font-semibold text-trading-green">
                      Current
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {session.location}</span>
                  <span>IP: {session.ip}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.lastActive}</span>
                </div>
              </div>
              {!session.current && (
                <button className="rounded-lg border border-destructive/30 bg-transparent px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-bold text-destructive">Danger Zone</span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          These actions are irreversible. Proceed with extreme caution.
        </p>
        <div className="flex gap-3">
          <button className="rounded-lg border border-destructive/50 bg-transparent px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors">
            Reset All Security
          </button>
          <button className="rounded-lg border border-destructive/50 bg-transparent px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}
