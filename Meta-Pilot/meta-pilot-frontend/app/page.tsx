import CTASection from "@/components/Landing/CTASection";
import FeatureSection from "@/components/Landing/FeatureSection";
import MetaPilotHero from "@/components/Landing/Hero/Hero";
import HowItWorksSection from "@/components/Landing/HowItWorks/HowItWorksSection";
import Footer from "@/components/Layout/Footer";
import Navbar from "@/components/Layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <MetaPilotHero />
        <FeatureSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
