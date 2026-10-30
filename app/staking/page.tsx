"use client"

import { Coins, Lock, TrendingUp, Shield } from "lucide-react"
import { PageShell, ContentSection, InfoCard } from "@/components/page-shell"

const stakingPools = [
  { title: "BTC Staking", description: "Earn yield on your Bitcoin holdings with institutional-grade custody. Minimum 0.01 BTC.", tag: "4.2% APY" },
  { title: "ETH Staking", description: "Participate in Ethereum proof-of-stake validation. Auto-compounding rewards distributed daily.", tag: "5.8% APY" },
  { title: "SOL Staking", description: "Delegate to high-performance Solana validators with slashing protection and instant unstaking.", tag: "7.1% APY" },
  { title: "USDT Flexible", description: "Earn yield on stablecoins with no lock-up period. Withdraw anytime with no penalties.", tag: "8.5% APY" },
  { title: "ADA Staking", description: "Stake Cardano with automatic delegation to top-performing stake pools.", tag: "4.9% APY" },
  { title: "DOT Staking", description: "Bond your Polkadot tokens and earn rewards through nominated proof-of-stake.", tag: "12.3% APY" },
]

const features = [
  { title: "Auto-Compounding", description: "Rewards are automatically reinvested to maximize your yield over time without any manual intervention." },
  { title: "Flexible & Locked", description: "Choose between flexible staking with instant withdrawals or locked terms with higher APY rates." },
  { title: "Insurance Fund", description: "A dedicated insurance fund protects staked assets against slashing events and validator downtime." },
  { title: "Real-Time Tracking", description: "Monitor your staking positions, accumulated rewards, and projected earnings in real-time." },
]

export default function StakingPage() {
  return (
    <PageShell
      icon={Coins}
      tag="Earn"
      title="Staking"
      description="Put your crypto to work. Earn passive yield through staking with institutional-grade security, flexible terms, and competitive APY rates."
    >
      <ContentSection title="How Staking Works">
        <p>
          Staking allows you to earn rewards by locking your cryptocurrency to support blockchain network
          operations like transaction validation. In return, you receive staking rewards, similar to earning
          interest on a savings account but typically with much higher yields.
        </p>
        <p>
          AetherNode handles the technical complexity of running validator nodes, delegation, and reward
          distribution. Simply deposit your assets, choose a staking pool, and start earning immediately.
        </p>
      </ContentSection>

      <ContentSection title="Available Staking Pools">
        <div className="grid gap-4 sm:grid-cols-2 not-prose">
          {stakingPools.map((pool) => (
            <InfoCard key={pool.title} {...pool} />
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Platform Features">
        <div className="grid gap-4 sm:grid-cols-2 not-prose">
          {features.map((feat) => (
            <InfoCard key={feat.title} title={feat.title} description={feat.description} />
          ))}
        </div>
      </ContentSection>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-8">
        <p className="text-sm font-semibold text-foreground">Staking launching Q2 2026</p>
        <p className="text-xs text-muted-foreground mt-1">
          APY rates are estimates and subject to change based on network conditions and market dynamics.
        </p>
      </div>
    </PageShell>
  )
}
