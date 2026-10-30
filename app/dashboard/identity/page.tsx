"use client"

import { useState } from "react"
import { Fingerprint, Upload, Camera, FileText, CheckCircle2, Clock, AlertCircle, ChevronRight, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

type VerificationLevel = "none" | "basic" | "advanced"
type StepStatus = "pending" | "in-progress" | "completed" | "failed"

interface VerificationStep {
  id: string
  label: string
  description: string
  icon: typeof FileText
  status: StepStatus
  level: VerificationLevel
}

export default function IdentityPage() {
  const [currentLevel] = useState<VerificationLevel>("basic")
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: "email",
      label: "Email Verification",
      description: "Confirm your email address to access basic features.",
      icon: FileText,
      status: "completed",
      level: "basic",
    },
    {
      id: "personal",
      label: "Personal Information",
      description: "Provide your full name, date of birth, and residential address.",
      icon: FileText,
      status: "completed",
      level: "basic",
    },
    {
      id: "government-id",
      label: "Government-Issued ID",
      description: "Upload a clear photo of your passport, national ID, or drivers license.",
      icon: Upload,
      status: "in-progress",
      level: "advanced",
    },
    {
      id: "selfie",
      label: "Selfie Verification",
      description: "Take a live selfie holding your ID for facial recognition matching.",
      icon: Camera,
      status: "pending",
      level: "advanced",
    },
    {
      id: "proof-of-address",
      label: "Proof of Address",
      description: "Upload a utility bill, bank statement, or government letter dated within 3 months.",
      icon: FileText,
      status: "pending",
      level: "advanced",
    },
  ])

  const completedSteps = steps.filter((s) => s.status === "completed").length
  const progress = (completedSteps / steps.length) * 100

  const statusConfig: Record<StepStatus, { label: string; color: string; Icon: typeof CheckCircle2 }> = {
    completed: { label: "Verified", color: "text-trading-green", Icon: CheckCircle2 },
    "in-progress": { label: "In Review", color: "text-primary", Icon: Clock },
    pending: { label: "Pending", color: "text-muted-foreground", Icon: AlertCircle },
    failed: { label: "Failed", color: "text-destructive", Icon: AlertCircle },
  }

  const handleStartStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id && s.status === "pending" ? { ...s, status: "in-progress" } : s))
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Identity Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete verification to unlock higher trading limits and full platform access.
        </p>
      </div>

      {/* Verification Level Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["none", "basic", "advanced"] as VerificationLevel[]).map((level) => {
          const isActive = currentLevel === level
          const labels: Record<VerificationLevel, { title: string; limit: string; features: string[] }> = {
            none: { title: "Unverified", limit: "No trading access", features: ["View markets", "Demo trading"] },
            basic: { title: "Basic (Level 1)", limit: "Up to $10,000/day", features: ["Spot trading", "Basic withdrawals", "P2P trading"] },
            advanced: { title: "Advanced (Level 2)", limit: "Unlimited trading", features: ["Futures trading", "Margin trading", "OTC access", "Higher API limits"] },
          }
          return (
            <div
              key={level}
              className={cn(
                "rounded-xl border p-5 transition-all",
                isActive ? "border-primary/50 bg-primary/5 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)]" : "border-border/50 bg-card"
              )}
            >
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                {labels[level].title}
              </div>
              <div className="text-sm font-bold text-foreground mb-3">{labels[level].limit}</div>
              <ul className="space-y-1">
                {labels[level].features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className={cn("h-3 w-3", isActive ? "text-primary" : "text-muted-foreground/40")} />
                    {f}
                  </li>
                ))}
              </ul>
              {isActive && (
                <div className="mt-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary inline-block">
                  Current Level
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Fingerprint className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-sm font-bold text-foreground">Verification Progress</span>
              <p className="text-xs text-muted-foreground">Complete all steps for full access</p>
            </div>
          </div>
          <span className="text-2xl font-mono font-bold text-primary">
            {completedSteps}/{steps.length}
          </span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon
          const status = statusConfig[step.status]
          const StatusIcon = status.Icon
          return (
            <div
              key={step.id}
              className={cn(
                "rounded-xl border bg-card p-5 transition-all",
                step.status === "completed"
                  ? "border-trading-green/20"
                  : step.status === "in-progress"
                  ? "border-primary/30"
                  : "border-border/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  step.status === "completed"
                    ? "bg-trading-green/10 text-trading-green"
                    : step.status === "in-progress"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{step.label}</span>
                    <div className={cn("flex items-center gap-1", status.color)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold">{status.label}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {step.status === "pending" && (
                  <button
                    onClick={() => handleStartStep(step.id)}
                    className="shrink-0 flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Start <ChevronRight className="h-3 w-3" />
                  </button>
                )}
                {step.status === "in-progress" && (
                  <div className="shrink-0 flex items-center gap-1 rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
                    <Clock className="h-3 w-3" /> Reviewing
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Trusted badge */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">Your data is protected</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            AetherNode uses bank-grade encryption and never shares your verification data with third parties. All documents are processed securely and deleted after verification.
          </p>
        </div>
      </div>
    </div>
  )
}
