"use client"

import { Cookie } from "lucide-react"
import { PageShell, ContentSection, InfoCard } from "@/components/page-shell"

const cookieTypes = [
  { title: "Essential Cookies", description: "Required for the platform to function. Includes session management, authentication tokens, and security cookies. Cannot be disabled.", tag: "Required" },
  { title: "Performance Cookies", description: "Help us understand how you use the platform by collecting anonymous usage statistics. Used to improve performance and user experience.", tag: "Optional" },
  { title: "Functional Cookies", description: "Remember your preferences such as language, theme, chart layout, and trading view settings for a personalized experience.", tag: "Optional" },
  { title: "Analytics Cookies", description: "Used to track visitor behavior and generate aggregated reports. We use these to understand traffic patterns and improve our services.", tag: "Optional" },
]

export default function CookiesPage() {
  return (
    <PageShell
      icon={Cookie}
      tag="Legal"
      title="Cookie Policy"
      description="Last updated: February 1, 2026. This policy explains how AetherNode uses cookies and similar tracking technologies."
    >
      <ContentSection title="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device when you visit our platform. They help us provide
          essential functionality, remember your preferences, and analyze how the platform is used. We also use
          similar technologies like local storage and session storage for similar purposes.
        </p>
      </ContentSection>

      <ContentSection title="Types of Cookies We Use">
        <div className="grid gap-4 sm:grid-cols-2 not-prose">
          {cookieTypes.map((cookie) => (
            <InfoCard key={cookie.title} {...cookie} />
          ))}
        </div>
      </ContentSection>

      <ContentSection title="Managing Cookies">
        <p>
          You can manage your cookie preferences through your browser settings. Most browsers allow you to block
          or delete cookies. However, blocking essential cookies may affect the functionality of the platform,
          including login, trading, and security features.
        </p>
        <p>
          To opt out of analytics and performance cookies, you can adjust your preferences in the cookie
          consent banner or contact us at privacy@aethernode.io.
        </p>
      </ContentSection>

      <ContentSection title="Third-Party Cookies">
        <p>
          Some cookies are placed by third-party services we use, including analytics providers and security
          services. These third parties have their own privacy policies governing how they use collected data.
          We do not control third-party cookies but ensure all partners meet our privacy standards.
        </p>
      </ContentSection>

      <ContentSection title="Updates">
        <p>
          We may update this Cookie Policy as we adopt new technologies or practices. Changes will be posted
          on this page with an updated revision date.
        </p>
      </ContentSection>
    </PageShell>
  )
}
