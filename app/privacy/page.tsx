"use client"

import { Shield, Server, Lock, Eye, Database, Globe, AlertTriangle, Clock } from "lucide-react"
import { PageShell, ContentSection } from "@/components/page-shell"

export default function PrivacyPage() {
  return (
    <PageShell
      icon={Shield}
      tag="Infrastructure Policy"
      title="Data Protection & Privacy"
      description="AetherNode's institutional-grade data handling protocols. Last updated: February 1, 2026."
    >
      <div className="mb-8 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <p className="text-sm text-foreground font-medium mb-2">Trading Infrastructure Commitment</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          AetherNode processes over $2.4B in daily trading volume. Our data protection framework is designed
          for institutional acquirers and enterprise deployments, meeting SOC 2 Type II, ISO 27001, and 
          GDPR compliance requirements.
        </p>
      </div>

      <ContentSection title="1. Data Collection Architecture">
        <div className="space-y-3">
          <p className="font-medium text-sm text-foreground">Identity & Compliance Layer</p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Full legal name, date of birth, nationality, and residential address</li>
            <li>Government-issued identification (passport, national ID, driver's license)</li>
            <li>Proof of address documentation (utility bills, bank statements)</li>
            <li>Source of funds declarations for institutional accounts ({">"}$100K)</li>
            <li>Beneficial ownership information for corporate entities</li>
          </ul>
          
          <p className="font-medium text-sm text-foreground mt-4">Trading & Transaction Layer</p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Complete order history: timestamps, pairs, quantities, prices, order types</li>
            <li>Position data: entry/exit points, leverage ratios, liquidation events</li>
            <li>Wallet addresses (deposit/withdrawal), transaction hashes, network fees</li>
            <li>API key usage patterns, rate limit consumption, error logs</li>
            <li>Trading algorithm identifiers and execution metadata</li>
          </ul>

          <p className="font-medium text-sm text-foreground mt-4">Infrastructure Telemetry</p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>IP addresses, geolocation data, ISP information</li>
            <li>Device fingerprints, browser signatures, session tokens</li>
            <li>WebSocket connection metrics, latency measurements</li>
            <li>UI interaction patterns for fraud detection models</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection title="2. Processing & Storage Infrastructure">
        <div className="grid gap-4 sm:grid-cols-2 not-prose mb-4">
          <div className="p-3 rounded-lg border border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Primary Data Centers</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Singapore (SG1), Tokyo (JP1), Frankfurt (EU1), Virginia (US1)</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Encryption Standards</span>
            </div>
            <p className="text-[10px] text-muted-foreground">AES-256-GCM at rest, TLS 1.3 in transit, HSM key management</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Hot wallet data encrypted with threshold signatures (3-of-5 MPC). Cold storage air-gapped with
          geographic distribution. Database replication across 3 availability zones with 15-minute RPO.
          All PII tokenized and stored separately from trading data with role-based access controls.
        </p>
      </ContentSection>

      <ContentSection title="3. Data Sharing & Third-Party Integrations">
        <div className="space-y-3">
          <p className="font-medium text-sm text-foreground">Mandatory Disclosures</p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Monetary Authority of Singapore (MAS) - Regulatory reporting</li>
            <li>Financial Crimes Enforcement Network (FinCEN) - SAR filings</li>
            <li>Tax authorities under FATCA/CRS frameworks</li>
            <li>Court orders and valid legal process from competent jurisdictions</li>
          </ul>

          <p className="font-medium text-sm text-foreground mt-4">Service Providers (Under NDA)</p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Chainalysis, Elliptic - Blockchain analytics and AML screening</li>
            <li>Jumio, Onfido - Identity verification and document authentication</li>
            <li>AWS, Google Cloud - Infrastructure (data processed in-region)</li>
            <li>Cloudflare - DDoS protection, WAF, edge caching</li>
          </ul>

          <div className="mt-4 p-3 rounded-lg border border-trading-red/20 bg-trading-red/5">
            <p className="text-xs text-foreground font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3 text-trading-red" />
              We do not sell personal data. Ever.
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              No data broker relationships. No advertising partnerships. No monetization of user data.
            </p>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="4. Retention & Deletion Schedules">
        <div className="space-y-2 not-prose">
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">Trading records & transaction history</span>
            <span className="text-xs text-muted-foreground font-mono">7 years (regulatory)</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">KYC/AML documentation</span>
            <span className="text-xs text-muted-foreground font-mono">5 years post-closure</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">API logs & session data</span>
            <span className="text-xs text-muted-foreground font-mono">90 days rolling</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">Marketing preferences</span>
            <span className="text-xs text-muted-foreground font-mono">Until withdrawal</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-foreground">Anonymized analytics</span>
            <span className="text-xs text-muted-foreground font-mono">Indefinite</span>
          </div>
        </div>
      </ContentSection>

      <ContentSection title="5. Your Rights & Controls">
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Access the Data Control Center in Dashboard {">"} Settings {">"} Privacy to:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
          <li>Export complete data archive (JSON/CSV) - processed within 72 hours</li>
          <li>Request correction of inaccurate personal information</li>
          <li>Restrict processing (freezes account during review)</li>
          <li>Request deletion (subject to regulatory retention requirements)</li>
          <li>Object to profiling for marketing purposes</li>
          <li>Withdraw consent for non-essential processing</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          Data Protection Officer: <span className="font-mono text-foreground">dpo@aethernode.io</span>
        </p>
      </ContentSection>

      <ContentSection title="6. Acquisition & Transfer Provisions">
        <p className="text-xs text-muted-foreground leading-relaxed">
          In the event of acquisition, merger, or asset sale, user data may be transferred to the acquiring
          entity. Users will receive 30 days advance notice and the option to export data or close accounts
          before transfer. The acquiring entity will be bound by equivalent or stronger privacy protections.
          Institutional acquirers receive detailed data architecture documentation under NDA during due diligence.
        </p>
      </ContentSection>

      <div className="mt-8 p-4 rounded-lg border border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Questions about data handling for acquisition due diligence? Contact <span className="font-mono text-foreground">legal@aethernode.io</span>
        </p>
      </div>
    </PageShell>
  )
}
