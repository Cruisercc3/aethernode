"use client"

import { useState } from "react"
import { Shield, Smartphone, Mail, KeyRound, Fingerprint, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SecurityMethod {
  id: string
  label: string
  description: string
  icon: typeof Shield
  enabled: boolean
  status: "active" | "inactive" | "recommended"
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your verification methods and account security settings.
        </p>
      </div>

      {/* Security Score */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Security Score</span>
          </div>
          <span className="text-sm font-mono font-bold text-primary">
            {enabledCount}/{methods.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(enabledCount / methods.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {enabledCount < 3
            ? "Enable more verification methods to increase your account security."
            : "Your account has strong security coverage."}
        </p>
      </div>

      {/* Verification Methods */}
      <div className="space-y-3">
        {methods.map((method) => {
          const Icon = method.icon
          return (
            <div
              key={method.id}
              className={cn(
                "rounded-lg border bg-card p-4 transition-all",
                method.enabled
                  ? "border-primary/30"
                  : "border-border/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                    method.enabled
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
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
                    {method.enabled && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-trading-green" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {method.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleMethod(method.id)}
                  className={cn(
                    "relative h-6 w-11 rounded-full shrink-0 transition-colors",
                    method.enabled ? "bg-primary" : "bg-secondary"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform",
                      method.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-semibold text-destructive">Danger Zone</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Disabling all security methods will leave your account vulnerable. Proceed with caution.
        </p>
        <button className="rounded-md border border-destructive/50 bg-transparent px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors">
          Reset All Security Methods
        </button>
      </div>
    </div>
  )
}
