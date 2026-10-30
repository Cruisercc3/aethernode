import { Metadata } from "next"
import { teamMembers } from "@/lib/data"
import { Shield, Globe, Cpu, Users } from "lucide-react"
import { TemplateNotice } from "@/components/template-notice"

export const metadata: Metadata = {
  title: "Company | AetherNode",
  description:
    "Learn about AetherNode, our mission, team, and the technology behind enterprise-grade crypto trading infrastructure.",
}

const values = [
  {
    icon: Shield,
    title: "Security First",
    description:
      "Enterprise-grade security with multi-layer protection, cold storage, and real-time threat monitoring.",
  },
  {
    icon: Cpu,
    title: "Cutting-Edge Tech",
    description:
      "Built on a proprietary matching engine capable of processing millions of orders per second with sub-millisecond latency.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Available in 150+ countries with localized support, multi-currency deposits, and 24/7 customer service.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Shaped by feedback from 245K+ active traders. We build what our community needs, not what looks good on paper.",
  },
]

export default function CompanyPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <div className="max-w-3xl">
        <TemplateNotice>
          The team, values and numbers on this page are placeholder copy for whoever runs the platform. AetherNode has no
          users, custody or matching engine of its own.
        </TemplateNotice>
      </div>

      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Company
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
          Building the future of
          <br />
          <span className="bg-gradient-to-r from-primary to-[hsl(var(--accent))] bg-clip-text text-transparent">
            crypto infrastructure
          </span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          AetherNode was founded with a vision: to provide enterprise-grade
          trading infrastructure that empowers both institutions and individual
          traders. We combine cutting-edge technology with uncompromising
          reliability to deliver a platform that scales with your ambitions.
        </p>
      </div>

      {/* Values */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Our values
        </h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-xl border border-border/50 bg-card p-6"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <value.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Leadership team
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground leading-relaxed">
          A team of industry veterans from top-tier financial institutions and
          technology companies, united by a passion for building exceptional
          trading infrastructure.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="rounded-xl border border-border/50 bg-card p-6"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {member.avatar}
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {member.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-primary">
                {member.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-20 mb-10 rounded-2xl border border-border/50 bg-card p-10 text-center lg:p-16">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Ready to start trading?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground leading-relaxed">
          Join thousands of traders who trust AetherNode for enterprise-grade
          crypto trading infrastructure.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/platform"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] transition-shadow hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)]"
          >
            Open Trading Platform
          </a>
          <a
            href="/analytics"
            className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-transparent px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Explore Analytics
          </a>
        </div>
      </section>
    </div>
  )
}
