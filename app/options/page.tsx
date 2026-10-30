"use client"

import { BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { PageShell, ContentSection, InfoCard } from "@/components/page-shell"

const optionTypes = [
  {
    title: "Call Options",
    description: "A call option gives you the right to buy a cryptocurrency at a specific price (strike price) before the expiration date. Profitable when you expect the price to rise above the strike.",
    tag: "Bullish",
  },
  {
    title: "Put Options",
    description: "A put option gives you the right to sell a cryptocurrency at a specific price before the expiration date. Profitable when you expect the price to fall below the strike.",
    tag: "Bearish",
  },
  {
    title: "European-Style",
    description: "Can only be exercised at the expiration date, not before. Typically used for crypto options due to simpler pricing models and lower premiums.",
    tag: "Settlement",
  },
  {
    title: "American-Style",
    description: "Can be exercised at any time up to and including the expiration date. Provides more flexibility but typically commands higher premiums.",
    tag: "Settlement",
  },
]

const greeks = [
  { title: "Delta", description: "Measures the rate of change of the option price per $1 change in the underlying asset price." },
  { title: "Gamma", description: "Measures the rate of change in Delta per $1 change in the underlying asset." },
  { title: "Theta", description: "Measures time decay - how much value an option loses each day as it approaches expiration." },
  { title: "Vega", description: "Measures sensitivity to volatility changes in the underlying asset." },
]

export default function OptionsPage() {
  return (
    <PageShell
      icon={BarChart3}
      tag="Derivatives"
      title="Options Trading"
      description="Trade cryptocurrency options with advanced strategies. Hedge your positions, generate yield, or speculate on volatility with calls and puts."
    >
      <ContentSection title="What Are Crypto Options?">
        <p>
          Cryptocurrency options are financial derivatives that give the holder the right, but not the obligation,
          to buy or sell a specific amount of cryptocurrency at a predetermined price within a set timeframe.
          Options are powerful tools for hedging risk, generating income, and leveraging market movements.
        </p>
        <p>
          At AetherNode, our options platform offers competitive spreads, deep liquidity, and advanced risk
          management tools to help traders of all experience levels navigate the options market.
        </p>
      </ContentSection>

      <ContentSection title="Option Types">
        <div className="grid gap-4 sm:grid-cols-2 not-prose">
          {optionTypes.map((opt) => (
            <InfoCard key={opt.title} {...opt} />
          ))}
        </div>
      </ContentSection>

      <ContentSection title="The Greeks">
        <p className="mb-4">Understanding the Greeks is essential for successful options trading. They measure different dimensions of risk in an options position.</p>
        <div className="grid gap-3 sm:grid-cols-2 not-prose">
          {greeks.map((g) => (
            <InfoCard key={g.title} title={g.title} description={g.description} />
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Strategies">
        <p>
          Popular strategies include covered calls for income generation, protective puts for downside protection,
          straddles and strangles for volatility plays, and spreads for defined-risk directional bets. Our platform
          supports multi-leg orders so you can execute complex strategies in a single transaction.
        </p>
      </ContentSection>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mt-8">
        <p className="text-sm font-semibold text-foreground">Coming Soon</p>
        <p className="text-xs text-muted-foreground mt-1">
          Options trading is currently in development. Join the waitlist to get early access when we launch.
        </p>
      </div>
    </PageShell>
  )
}
