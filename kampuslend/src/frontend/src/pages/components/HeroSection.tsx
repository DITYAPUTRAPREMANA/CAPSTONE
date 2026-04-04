import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  goTo: (path: string) => void;
}

export default function HeroSection({ goTo }: HeroSectionProps) {

  return (
    <div className="hero-bg">
      <section className="hero-content hero-section">
        <div className="hero-text">
          <h1>
            Empowering Your Academic Journey through{" "}
            <span>Community Trust.</span>
          </h1>
          <p>
            Sodalis is a decentralized student loan ecosystem specifically for University, powered by AI-driven credit scoring and secure ICP smart contracts.
          </p>
          <div className="hero-buttons">
            <Button
              className="sodalis-btn"
              style={{ background: "#1d6fbf", color: "white" }}
              onClick={() => goTo("/register")}
              data-ocid="hero.daftar_button"
            >
              Start Now
            </Button>
            <Button
              className="sodalis-btn"
              variant="outline"
              style={{ border: "1.5px solid #1a3a5c", color: "#1a3a5c", background: "transparent" }}
              onClick={() => goTo("/login")}
              data-ocid="hero.login_button"
            >
              Already Have an Account
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}