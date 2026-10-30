"use client"

import { Newspaper, ExternalLink, Calendar } from "lucide-react"
import { PageShell, ContentSection } from "@/components/page-shell"
import { TemplateNotice } from "@/components/template-notice"

const pressReleases = [
  { title: "AetherNode Raises $45M Series B to Expand Institutional Trading Infrastructure", date: "Feb 2026", outlet: "TechCrunch" },
  { title: "AetherNode Launches AI-Powered Trading Signals for Professional Traders", date: "Feb 2026", outlet: "CoinDesk" },
  { title: "AetherNode Reports Record $48B Q4 Trading Volume", date: "Jan 2026", outlet: "The Block" },
  { title: "How AetherNode is Bridging CeFi and DeFi with Hybrid Order Matching", date: "Dec 2025", outlet: "Decrypt" },
  { title: "AetherNode Obtains MiCA License for European Operations", date: "Nov 2025", outlet: "Bloomberg" },
]

export default function PressPage() {
  return (
    <PageShell
      icon={Newspaper}
      tag="Press"
      title="Press & Media"
      description="Latest news, press releases, and media coverage about AetherNode. For press inquiries, contact press@aethernode.io."
    >
      <TemplateNotice>
        These headlines are placeholders showing where an operator&apos;s own press would go. None of this coverage is real.
      </TemplateNotice>

      <ContentSection title="Recent Coverage">
        <div className="space-y-3 not-prose">
          {pressReleases.map((pr) => (
            <div key={pr.title} className="group rounded-xl border border-border/50 bg-card/60 p-5 hover:border-primary/20 transition-colors flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{pr.title}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />{pr.date}
                  </span>
                  <span className="text-[11px] font-medium text-primary">{pr.outlet}</span>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </div>
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Brand Assets">
        <p>
          Download our logo, brand guidelines, and media kit for use in publications and articles.
          Please follow our brand guidelines when using AetherNode assets in any media.
        </p>
      </ContentSection>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-8">
        <p className="text-sm font-semibold text-foreground">Media Contact</p>
        <p className="text-xs text-muted-foreground mt-1">
          For press inquiries, interviews, and media requests: press@aethernode.io
        </p>
      </div>
    </PageShell>
  )
}
