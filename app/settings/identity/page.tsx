"use client"

import { useState } from "react"
import { Fingerprint, Upload, Camera, FileText, CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react"
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Identity Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete verification to unlock higher trading limits and full platform access.
        </p>
      </div>

      {/* Verification Level Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["none", "basic", "advanced"] as VerificationLevel[]).map((level) => {
          const isActive = currentLevel === level
          const labels: Record<VerificationLevel, { title: string; limit: string }> = {
            none: { title: "Unverified", limit: "No trading access" },
            basic: { title: "Basic (Level 1)", limit: "Up to $10,000/day" },
            advanced: { title: "Advanced (Level 2)", limit: "Unlimited trading" },
          }
          return (
            <div
              key={level}
              className={cn(
                "rounded-lg border p-4 transition-all",
                isActive ? "border-primary/50 bg-primary/5" : "border-border/50 bg-card"
              )}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {labels[level].title}
              </div>
              <div className="text-sm font-medium text-foreground">{labels[level].limit}</div>
              {isActive && (
                <div className="mt-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary inline-block">
                  Current Level
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Progress */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Verification Progress</span>
          </div>
          <span className="text-sm font-mono text-primary">
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
                "rounded-lg border bg-card p-4 transition-all",
                step.status === "completed"
                  ? "border-trading-green/20"
                  : step.status === "in-progress"
                  ? "border-primary/30"
                  : "border-border/50"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    step.status === "completed"
                      ? "bg-trading-green/10 text-trading-green"
                      : step.status === "in-progress"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
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
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {step.status === "pending" && (
                  <button
                    onClick={() => handleStartStep(step.id)}
                    className="shrink-0 flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Start
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
