"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ShieldCheck, UserCheck, FileText, KeyRound, AlertTriangle,
  ArrowRight, Globe, Users, Vault, CreditCard, Cog, Search,
} from "lucide-react"

/* ── Section 1 — Built-In Compliance Infrastructure ──────── */
const builtInCards = [
  {
    icon: UserCheck,
    title: "KYC Verification Flow",
    description:
      "Complete Know Your Customer interface with identity verification, document upload, and multi-level verification status tracking. Frontend flows are built — the buyer connects their preferred KYC provider (Jumio, Onfido, Sumsub, or similar) to activate identity verification.",
  },
  {
    icon: FileText,
    title: "Legal Documentation Suite",
    description:
      "Terms of Service, Privacy Policy, Cookie Policy, and Compliance pages are built and structured. Content follows standard exchange legal frameworks and can be customized by the buyer's legal counsel for their specific jurisdiction and business model.",
  },
  {
    icon: KeyRound,
    title: "API Authentication & Access Control",
    description:
      "API key management with create, revoke, and permissions controls. HMAC-SHA256 authentication specification in the API documentation. Sub-account support for institutional and team-based trading configurations.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Disclosure Framework",
    description:
      "Trading risk disclaimers integrated across the platform — footer risk warnings, futures risk notifications, and leverage warnings. These follow standard regulatory expectations for derivative trading platforms.",
  },
]

/* ── Section 2 — Deployment Compliance Pathways ──────────── */
const deploymentSteps = [
  {
    icon: Globe,
    title: "Jurisdictional Assessment",
    description:
      "Determine the regulatory environment for your target market. Common frameworks include MiCA (EU), FCA registration (UK), MSB licensing (US/FinCEN), and MAS licensing (Singapore). AetherNode's architecture supports deployment in any of these frameworks with appropriate backend integration.",
  },
  {
    icon: Users,
    title: "KYC/AML Provider Integration",
    description:
      "Connect a KYC/AML provider to the existing verification flow. The frontend supports tiered verification levels — basic identity for spot trading, enhanced verification for derivatives. Providers like Sumsub, Jumio, and Onfido offer plug-and-play APIs compatible with the existing UI.",
  },
  {
    icon: Vault,
    title: "Custody & Fund Management",
    description:
      "Select a custody solution for user funds. Options range from self-custody (Fireblocks, BitGo) to third-party custodians. The wallet management UI supports per-asset balance display and deposit/withdraw flows — the buyer connects their custody backend.",
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description:
      "Integrate fiat on-ramp and payment processing. The platform includes Stripe environment variable placeholders for payment integration. Additional providers (MoonPay, Transak, Wyre) can be integrated through the existing API route structure.",
  },
  {
    icon: Cog,
    title: "Matching Engine & Order Execution",
    description:
      "Connect a matching engine for live order execution. The trading terminal UI — order types, leverage controls, position management — is built and functional. The buyer provides the execution backend, either through a third-party engine (e.g., Matching-Engine-as-a-Service providers) or a custom implementation.",
  },
  {
    icon: Search,
    title: "Security Audit & Penetration Testing",
    description:
      "Commission a third-party security audit before public launch. Firms like CertiK, Hacken, and Trail of Bits specialize in exchange security assessments. The clean, documented codebase facilitates efficient audit processes.",
  },
]

export default function CompliancePage() {
  return (
    <div className="relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.1)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.1)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-24">
        {/* ── Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Regulatory Framework
            </span>
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Compliance &<br />
            <span className="text-primary">Deployment Readiness</span>
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            AetherNode is architected with regulatory awareness at every layer. This page outlines
            the compliance-ready infrastructure included in the platform and the regulatory pathways
            available for commercial deployment.
          </p>
          <div className="mt-8 h-px w-20 bg-primary/40" />
        </motion.div>

        {/* ── Section 1 — Built-In Compliance Infrastructure ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            {"What's Already in Place"}
          </p>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Built-In Compliance Infrastructure
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            The platform ships with foundational compliance components that most exchange projects never build.
          </p>
          <div className="h-px w-12 bg-primary/40 mb-8" />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {builtInCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 + i * 0.07 }}
                className="group rounded-2xl border border-border/50 bg-card/60 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-card/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mb-4">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 2 — Deployment Compliance Pathways ───── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-20"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            Regulatory Pathways for Commercial Launch
          </p>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Deployment Compliance Pathways
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            {"A framework for deploying AetherNode as a regulated or compliant trading platform, depending on the buyer's jurisdiction and business model."}
          </p>
          <div className="h-px w-12 bg-primary/40 mb-8" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {deploymentSteps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
                className="group flex gap-4 rounded-xl border border-border/40 bg-card/40 p-5 transition-all duration-200 hover:border-primary/25 hover:bg-card/60"
              >
                <div className="shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <step.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono font-bold text-primary/60">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Section 3 — Why This Matters ────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="mb-20"
        >
          <div className="rounded-2xl border border-primary/20 bg-card/80 p-8 md:p-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Why This Matters</h2>
            </div>
            <div className="max-w-3xl space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Most exchange projects sold on marketplaces ship without any compliance infrastructure — no
                KYC flows, no legal pages, no risk disclosures, no documentation of regulatory pathways.
                Buyers acquire the frontend and then spend weeks or months building these foundational
                layers before they can even consider a commercial launch.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {"AetherNode includes these components because a production exchange requires them. The buyer's path from acquisition to deployment is shorter because the compliance groundwork is already in place."}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border/30 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/architecture"
                className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                View Architecture
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/acquisition"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
              >
                Acquisition Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
