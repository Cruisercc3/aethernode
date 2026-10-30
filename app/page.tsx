import { HeroSection } from "@/components/home/hero-section"
import { StatsSection } from "@/components/home/stats-section"
import { FeaturesSection } from "@/components/home/features-section"
import { DevelopmentValueSection } from "@/components/home/ai-insights-section"
import { WhiteLabelSection } from "@/components/home/white-label-section"
import { PlatformShowcase } from "@/components/home/platform-showcase"
import { TechStackSection } from "@/components/home/tech-stack-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <DevelopmentValueSection />
      <WhiteLabelSection />
      <PlatformShowcase />
      <TechStackSection />
    </>
  )
}
