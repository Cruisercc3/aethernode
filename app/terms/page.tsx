"use client"

import { FileText, AlertTriangle, Scale, Gavel, Shield, Zap, DollarSign, Globe } from "lucide-react"
import { PageShell, ContentSection } from "@/components/page-shell"

export default function TermsPage() {
  return (
    <PageShell
      icon={FileText}
      tag="Trading Agreement"
      title="Terms of Service"
      description="Governing agreement for AetherNode trading infrastructure access. Last updated: February 1, 2026."
    >
      <div className="mb-8 p-4 rounded-lg border border-trading-red/20 bg-trading-red/5">
        <p className="text-sm text-foreground font-medium flex items-center gap-2 mb-2">
          <AlertTriangle className="h-4 w-4 text-trading-red" />
          Risk Acknowledgment Required
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Cryptocurrency derivatives trading involves substantial risk of loss. Leveraged positions can result
          in losses exceeding your initial margin. AetherNode provides infrastructure only—not investment advice.
          You may lose your entire investment. Trade only with capital you can afford to lose.
        </p>
      </div>

      <ContentSection title="1. Platform Access & Eligibility">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            AetherNode operates as institutional-grade trading infrastructure connecting users to global
            cryptocurrency markets. By accessing any AetherNode service (web platform, mobile apps, REST API,
            WebSocket feeds, FIX protocol), you agree to these terms in their entirety.
          </p>
          
          <p className="font-medium text-sm text-foreground mt-4">Eligibility Requirements</p>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>Minimum age: 18 years (or age of majority in your jurisdiction)</li>
            <li>Legal capacity to enter binding financial agreements</li>
            <li>Not a resident of restricted jurisdictions (US, North Korea, Iran, Cuba, Syria, Crimea)</li>
            <li>Not subject to economic sanctions by OFAC, UN, EU, or MAS</li>
            <li>Completion of identity verification (KYC) for trading access</li>
            <li>Institutional accounts: Authorized signatory with corporate documentation</li>
          </ul>
        </div>
      </ContentSection>

      <ContentSection title="2. Trading Services & Execution">
        <div className="grid gap-4 sm:grid-cols-2 not-prose mb-4">
          <div className="p-3 rounded-lg border border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Spot Trading</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Direct asset exchange, limit/market/stop orders, 200+ trading pairs, 0.1% base fee</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Perpetual Futures</span>
            </div>
            <p className="text-[10px] text-muted-foreground">USDT-M, Coin-M, USDC-M contracts, up to 150x leverage, funding rate mechanism</p>
          </div>
        </div>

        <p className="font-medium text-sm text-foreground">Execution Policy</p>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 mt-2">
          <li>Orders executed on best-effort basis; no guarantee of fill at specified price</li>
          <li>Market orders subject to slippage during high volatility</li>
          <li>Liquidation engine activates when margin ratio falls below maintenance level</li>
          <li>Insurance fund covers socialized losses; ADL (Auto-Deleveraging) as last resort</li>
          <li>Platform reserves right to cancel erroneous trades within 60 minutes of execution</li>
        </ul>
      </ContentSection>

      <ContentSection title="3. Fee Structure">
        <div className="space-y-2 not-prose mb-4">
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">Spot Trading (Maker/Taker)</span>
            <span className="text-xs text-muted-foreground font-mono">0.10% / 0.10%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">Futures Trading (Maker/Taker)</span>
            <span className="text-xs text-muted-foreground font-mono">0.02% / 0.05%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">Withdrawal (Network dependent)</span>
            <span className="text-xs text-muted-foreground font-mono">Dynamic</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/30">
            <span className="text-xs text-foreground">Funding Rate (Perpetuals)</span>
            <span className="text-xs text-muted-foreground font-mono">±0.01% / 8h</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-xs text-foreground">Liquidation Fee</span>
            <span className="text-xs text-muted-foreground font-mono">0.5% position value</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          VIP tiers reduce fees by up to 80%. Volume calculated on 30-day rolling basis. See /fees for complete schedule.
        </p>
      </ContentSection>

      <ContentSection title="4. Prohibited Activities">
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Violation results in immediate account termination and forfeiture of funds where legally permitted:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
          <li>Market manipulation: wash trading, spoofing, layering, pump-and-dump schemes</li>
          <li>Exploitation of platform bugs, oracle manipulation, or smart contract vulnerabilities</li>
          <li>Money laundering, terrorist financing, or sanctions evasion</li>
          <li>Operating multiple accounts to circumvent limits or abuse promotions</li>
          <li>Unauthorized API access, DDoS attempts, or security circumvention</li>
          <li>Trading on material non-public information (insider trading)</li>
          <li>Providing false KYC documentation or identity fraud</li>
        </ul>
      </ContentSection>

      <ContentSection title="5. Liability & Indemnification">
        <div className="space-y-3">
          <p className="font-medium text-sm text-foreground">Platform Limitations</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AetherNode is provided "AS IS" without warranty. We do not guarantee uninterrupted service,
            error-free execution, or protection against market losses. Maximum liability capped at fees
            paid in the 12 months preceding any claim.
          </p>

          <p className="font-medium text-sm text-foreground mt-4">Exclusions</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            We are not liable for: trading losses, market movements, third-party wallet failures, blockchain
            network congestion, oracle price discrepancies, regulatory actions, force majeure events, or
            losses from unauthorized account access due to user negligence.
          </p>

          <p className="font-medium text-sm text-foreground mt-4">User Indemnification</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You agree to indemnify AetherNode, its officers, directors, employees, and affiliates against
            any claims arising from your use of the platform, violation of these terms, or infringement
            of third-party rights.
          </p>
        </div>
      </ContentSection>

      <ContentSection title="6. Dispute Resolution">
        <div className="grid gap-4 sm:grid-cols-2 not-prose mb-4">
          <div className="p-3 rounded-lg border border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-2">
              <Gavel className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Governing Law</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Laws of Singapore, without regard to conflict of law provisions</p>
          </div>
          <div className="p-3 rounded-lg border border-border/50 bg-card/60">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Arbitration</span>
            </div>
            <p className="text-[10px] text-muted-foreground">SIAC Rules, Singapore seat, English language, single arbitrator</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Disputes under $50,000 USD resolved through binding arbitration. Class action waiver applies.
          Informal resolution required before formal proceedings (30-day negotiation period).
        </p>
      </ContentSection>

      <ContentSection title="7. Platform Modifications & Termination">
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
          <li>AetherNode may modify, suspend, or discontinue services with 30 days notice</li>
          <li>Emergency maintenance may occur without notice for security incidents</li>
          <li>Account termination for terms violation effective immediately</li>
          <li>Upon termination: 30 days to withdraw assets (subject to compliance holds)</li>
          <li>Acquisition or merger may result in terms assignment to successor entity</li>
        </ul>
      </ContentSection>

      <ContentSection title="8. Intellectual Property">
        <p className="text-xs text-muted-foreground leading-relaxed">
          AetherNode, its logos, trading interface, matching engine algorithms, API specifications, and
          documentation are proprietary. Users granted limited, non-exclusive, revocable license for
          platform access only. Reverse engineering, scraping (beyond API rate limits), and unauthorized
          reproduction prohibited. Acquisition inquiries for IP licensing: <span className="font-mono text-foreground">acquisition@aethernode.io</span>
        </p>
      </ContentSection>

      <div className="mt-8 p-4 rounded-lg border border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          By using AetherNode, you acknowledge reading, understanding, and agreeing to these terms.
          Legal inquiries: <span className="font-mono text-foreground">legal@aethernode.io</span>
        </p>
      </div>
    </PageShell>
  )
}
