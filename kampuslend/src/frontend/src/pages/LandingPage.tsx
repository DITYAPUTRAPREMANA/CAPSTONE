import { useState, useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FAQSection from "./components/FAQSection";
import CTASection from "./components/CTASection";
import "./styles/LandingPage.css";

export default function LandingPage() {
  const router = useRouter();
  const goTo = (path: string) => router.navigate({ to: path });
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      setVisible(currentY < lastScrollY.current || currentY < 50);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      <Navbar
        scrolled={scrolled}
        visible={visible}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        goTo={goTo}
      />
      <HeroSection goTo={goTo} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <CTASection goTo={goTo} />
    </div>
  );
}