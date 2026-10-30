"use client"

import { Briefcase, MapPin, Clock } from "lucide-react"
import { PageShell, ContentSection } from "@/components/page-shell"
import { TemplateNotice } from "@/components/template-notice"

const openings = [
  { title: "Senior Backend Engineer", team: "Core Infrastructure", location: "Remote", type: "Full-time", description: "Build and scale our high-throughput trading engine and real-time market data infrastructure." },
  { title: "Frontend Engineer", team: "Product", location: "Remote", type: "Full-time", description: "Craft responsive, performant trading interfaces with React, Next.js, and WebSocket integrations." },
  { title: "Smart Contract Developer", team: "Blockchain", location: "Remote", type: "Full-time", description: "Design, audit, and deploy smart contracts for our DeFi protocols and cross-chain bridges." },
  { title: "ML Engineer - Trading Signals", team: "AI/ML", location: "Remote", type: "Full-time", description: "Develop machine learning models for market prediction, sentiment analysis, and anomaly detection." },
  { title: "Product Designer", team: "Design", location: "Remote", type: "Full-time", description: "Design intuitive trading experiences across web and mobile. Deep understanding of financial UX required." },
  { title: "DevOps / SRE", team: "Infrastructure", location: "Remote", type: "Full-time", description: "Maintain 99.99% uptime across our global infrastructure. Kubernetes, Terraform, and monitoring expertise." },
  { title: "Compliance Analyst", team: "Legal & Compliance", location: "Singapore", type: "Full-time", description: "Navigate global crypto regulations and ensure platform compliance across multiple jurisdictions." },
  { title: "Technical Writer", team: "Developer Relations", location: "Remote", type: "Contract", description: "Create comprehensive API documentation, tutorials, and developer guides for our public APIs." },
]

const perks = [
  "Competitive salary + token allocation",
  "Fully remote with async-first culture",
  "Unlimited PTO with mandatory minimums",
  "Top-tier health, dental, and vision",
  "Annual learning & development budget",
  "Home office setup allowance",
  "Quarterly team retreats worldwide",
  "Cutting-edge tech stack",
]

export default function CareersPage() {
  return (
    <PageShell
      icon={Briefcase}
      tag="Join Us"
      title="Careers at AetherNode"
      description="We are building the future of decentralized finance. Join a team of world-class engineers, designers, and traders shaping the next generation of trading infrastructure."
    >
      <TemplateNotice>
        These roles are placeholder copy for an operator&apos;s careers page. Nobody is hiring through this site.
      </TemplateNotice>

      <ContentSection title="Why AetherNode?">
        <p>
          At AetherNode, you will work on problems at the intersection of high-performance systems, financial markets,
          and blockchain technology. Our team is small but mighty - every person has a direct impact on the product
          and the direction of the company.
        </p>
      </ContentSection>

      <ContentSection title="Benefits & Perks">
        <div className="grid gap-2 sm:grid-cols-2 not-prose">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-2 rounded-lg bg-card/60 border border-border/30 px-4 py-3">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span className="text-sm text-foreground">{perk}</span>
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Open Positions">
        <div className="space-y-3 not-prose">
          {openings.map((job) => (
            <div key={job.title} className="rounded-xl border border-border/50 bg-card/60 p-5 hover:border-primary/20 transition-colors">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{job.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{job.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                      <Briefcase className="h-2.5 w-2.5" />{job.team}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" />{job.location}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-0.5 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />{job.type}
                    </span>
                  </div>
                </div>
                <button className="shrink-0 rounded-lg bg-primary/10 px-4 py-2 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </ContentSection>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-8">
        <p className="text-sm font-semibold text-foreground">{"Don't see your role?"}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {"We're always looking for exceptional talent. Send your resume to careers@aethernode.io and tell us how you'd contribute."}
        </p>
      </div>
    </PageShell>
  )
}
