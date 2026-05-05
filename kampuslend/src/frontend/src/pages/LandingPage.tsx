import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import landingSvg from "@/components/icon/landing.svg";
import logoSvg from "@/components/icon/logo.svg";
import vectorSvg from "@/components/icon/vector.svg";
import bintikSVG from "@/components/icon/bintik.svg";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";

const features = [
  {
    icon: "🤖",
    title: "AI Scoring Canggih",
    desc: "Our AI system assesses borrower eligibility based on GPA, loan history, and loan objectives in real-time..",
  },
  {
    icon: "⛓️",
    title: "Blockchain ICP",
    desc: "Every transaction is recorded on the Internet Computer Protocol (ICP) blockchain — transparent, secure, and unmanipulated.",
  },
  {
    icon: "🏦",
    title: "Virtual Account IDR",
    desc: "Transfer funds directly via virtual accounts at BCA, Mandiri, BRI, BNI, and BSI. Easy and reliable.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
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

  const goTo = (path: string) => router.navigate({ to: path });

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif", backgroundColor: "#f0f2f5" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .sodalis-faq-item { border-bottom: 1px solid #e2e8f0; }
        .sodalis-faq-btn {
          width: 100%; background: none; border: none; text-align: left;
          padding: 20px 0; font-size: 1rem; font-weight: 600; color: #1d6fbf;
          cursor: pointer; display: flex; justify-content: space-between; align-items: center;
          font-family: inherit;
        }
        .sodalis-faq-answer { padding: 0 0 16px 0; color: #4a5568; font-size: 0.92rem; line-height: 1.7; }

        .sodalis-btn {
          transition: transform 0.23s cubic-bezier(0.22,1,0.36,1),
            box-shadow 0.23s cubic-bezier(0.22,1,0.36,1),
            filter 0.23s ease;
        }
        .sodalis-btn:hover,
        .sodalis-btn:focus-visible {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 10px 20px rgba(29, 111, 191, 0.24);
          filter: brightness(1.04);
        }
        .sodalis-btn:active {
          transform: scale(0.99);
        }

        .sodalis-nav-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .sodalis-nav-btn:hover,
        .sodalis-nav-btn:focus-visible {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          background-color: rgba(29, 111, 191, 0.18);
        }
        .sodalis-nav-btn:active {
          transform: translateY(0) scale(0.99);
          box-shadow: 0 4px 8px rgba(0,0,0,0.18);
        }

        .sodalis-nav-link {
          transition: color 0.2s ease, transform 0.2s ease;
          display: inline-block;
        }
        .sodalis-nav-link:hover {
          color: #1d6fbf !important;
          transform: translateY(-1px);
        }
        .sodalis-nav-link::after {
          content: '';
          display: block;
          width: 0;
          height: 2px;
          background: #1d6fbf;
          transition: width 0.25s ease;
          border-radius: 1px;
        }
        .sodalis-nav-link:hover::after {
          width: 100%;
        }

        .sodalis-step-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease;
          border-radius: 12px;
          background: #fff;
          padding: 14px;
        }
        .sodalis-step-card:hover,
        .sodalis-step-card:focus-visible {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(15, 52, 116, 0.16);
          background: #f3f8ff;
        }
        .sodalis-work-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          position: relative;
          z-index: 1;
          margin-top: 48px;
          align-items: center;
          justify-items: center;
        }
        .sodalis-work-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1px;
          padding: 12px 10px;
          z-index: 2;
        }
        .sodalis-work-number {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(145deg, #1c65bf, #0b3d8f);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
          font-weight: 800;
          box-shadow: 0 5px 12px rgba(13, 78, 153, 0.35);
        }
        .sodalis-work-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0d4e99;
          max-width: 170px;
          line-height: 1.3;
        }
        .sodalis-work-desc {
          font-size: 0.92rem;
          color: #485d7b;
          line-height: 1.5;
          max-width: 225px;
        }
        @media (max-width: 1024px) {
          .sodalis-work-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .sodalis-work-grid {
            grid-template-columns: repeat(1, 1fr);
          }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: scrolled ? "rgba(255,255,255,0.72)" : "white",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        padding: "14px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e8ecf0",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.08)" : "0 1px 8px rgba(0,0,0,0.06)",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s ease, box-shadow 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={logoSvg} alt="Sodalis logo" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a3a5c" }}>Sodalis.</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#cara-kerja" className="sodalis-nav-link" style={{ color: "#1a3a5c", fontWeight: 500, textDecoration: "none", fontSize: "0.9rem" }}>
            How it Works
          </a>
          <a href="#fitur" className="sodalis-nav-link" style={{ color: "#1a3a5c", fontWeight: 500, textDecoration: "none", fontSize: "0.9rem" }}>
            Features
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="sodalis-nav-btn"
            variant="outline"
            style={{ borderRadius: "999px", color: "#1d6fbf", borderColor: "#1d6fbf", fontSize: "0.88rem" }}
            onClick={() => goTo("/login")}
          >
            Sign In
          </Button>
          <Button
            className="sodalis-nav-btn"
            style={{ borderRadius: "999px", background: "#1d6fbf", color: "white", fontSize: "0.88rem" }}
            onClick={() => goTo("/register")}
            data-ocid="nav.register_button"
          >
            Register
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        backgroundImage: `url(${bintikSVG})`,
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
      }}>
        <section style={{
          padding: "80px 48px 64px",
          backgroundImage: `url(${landingSvg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          backgroundSize: "50% auto",
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          <div style={{ maxWidth: "560px" }}>
            <h1 style={{ fontSize: "2.9rem", fontWeight: 800, color: "#1a3a5c", lineHeight: 1.18, marginBottom: "20px" }}>
              Empowering Your Academic Journey through{" "}
              <span style={{ color: "#1d6fbf" }}>Community Trust.</span>
            </h1>
            <p style={{ color: "#4a5568", fontSize: "0.97rem", lineHeight: 1.75, marginBottom: "32px" }}>
              Sodalis is a decentralized student loan ecosystem specifically for University, powered by AI-driven credit scoring and secure ICP smart contracts.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                className="sodalis-btn"
                style={{ borderRadius: "999px", background: "#1d6fbf", color: "white", padding: "14px 32px", fontSize: "0.97rem", fontWeight: 600 }}
                onClick={() => goTo("/register")}
                data-ocid="hero.daftar_button"
              >
                Get Started
              </Button>
              <Button
                className="sodalis-btn"
                variant="outline"
                style={{ borderRadius: "999px", color: "#1d6fbf", borderColor: "#1d6fbf", padding: "14px 32px", fontSize: "0.97rem", fontWeight: 600, background: "white" }}
                onClick={() => goTo("/login")}
              >
                Already have an account
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ padding: "0 48px 64px", maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {[
              { label: "Total Users", value: "2.400+", icon: "👨‍🎓" },
              { label: "Funds Disbursed", value: "Rp 4,8M", icon: "💰" },
              { label: "Repayment Rate", value: "98.2%", icon: "📈" },
              { label: "Partner Universities", value: "32", icon: "🏫" },
            ].map((stat) => (
              <Card key={stat.label} style={{ borderRadius: "16px", background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "none" }}>
                <CardContent style={{ padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{stat.icon}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#1a3a5c" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.78rem", color: "#718096", marginTop: "4px" }}>{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <section id="fitur" style={{ padding: "60px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, color: "#1a3a5c", marginBottom: "8px" }}>Features.</h2>
        <p style={{ textAlign: "center", color: "#718096", fontSize: "0.95rem", marginBottom: "36px" }}>
          Cutting-edge technology for your security and convenience
        </p>
        <div style={{ background: "#1a3a5c", borderRadius: "24px", padding: "44px 40px" }}>
          <h3 style={{ color: "white", textAlign: "center", fontSize: "1.35rem", fontWeight: 700, marginBottom: "10px" }}>
            University-Grade Infrastructure
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", textAlign: "center", fontSize: "0.88rem", lineHeight: 1.65, maxWidth: "520px", margin: "0 auto 36px" }}>
            Built on a secure multi-tenant architecture with deep integration into academic data systems and scalable, automated compliance management.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {features.map((f) => (
              <Card key={f.title} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "16px" }}>
                <CardContent style={{ padding: "28px 20px", textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "14px" }}>{f.icon}</div>
                  <h3 style={{ color: "white", fontWeight: 700, fontSize: "1rem", marginBottom: "10px" }}>{f.title}</h3>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.82rem", lineHeight: 1.65 }}>{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" style={{ padding: "80px 48px", maxWidth: "1200px", margin: "0 auto", position: "relative", minHeight: "420px" }}>
        <h2 style={{ textAlign: "center", fontSize: "2.05rem", fontWeight: 800, color: "#0d4e99", marginBottom: "10px" }}>How it Works.</h2>
        <p style={{ textAlign: "center", color: "#3d557a", fontSize: "1rem", marginBottom: "80px" }}>
          Our streamlined process gets you the funding you need quickly and efficiently.
        </p>

        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0, transform: "translateY(80px) translateX(6px)" }}>
          <img
            src={vectorSvg}
            alt="How it works vector"
            style={{ width: "100%", maxWidth: "1090px", opacity: 1 }}
          />
        </div>

        <div className="sodalis-work-grid">
          {[
            {
              number: 1,
              title: "Intelligent Verification",
              description: "The student connects their academic and financial data, including GPA and bank info.",
            },
            {
              number: 2,
              title: "AI-Driven Risk Assessment",
              description: "Sodalis AI evaluates your profile and provides fast individualized credit scoring.",
            },
            {
              number: 3,
              title: "Community-Powered Funding",
              description: "Investors choose borrowers with matching risk appetite and fund the loan.",
            },
            {
              number: 4,
              title: "Transparency and Speed",
              description: "Smart contract settlement on ICP ensures secure, efficient disbursement and repayment.",
            },
          ].map((step) => (
            <div key={step.number} className="sodalis-work-step">
              <div className="sodalis-work-number">{step.number}</div>
              <div className="sodalis-work-title">{step.title}</div>
              <div className="sodalis-work-desc">{step.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: "60px 48px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, color: "#1a3a5c", marginBottom: "48px" }}>
          Frequently Asked Question.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "64px", alignItems: "flex-start" }}>
          <div style={{ display: "flex", justifyContent: "center", paddingTop: "20px" }}>
            <div style={{ position: "relative", textAlign: "center" }}>
              <div style={{ fontSize: "6.5rem", fontWeight: 900, color: "#1d6fbf", lineHeight: 1, userSelect: "none" }}>FAQ</div>
              <div style={{ position: "absolute", top: "-16px", left: "-8px", fontSize: "1.8rem", color: "#1d6fbf", opacity: 0.4 }}>?</div>
              <div style={{ position: "absolute", top: "-8px", right: "16px", fontSize: "1.3rem", color: "#1d6fbf", opacity: 0.3 }}>?</div>
              <div style={{ position: "absolute", bottom: "10px", right: "-12px", fontSize: "1.6rem", color: "#1d6fbf", opacity: 0.35 }}>?</div>
              <div style={{ position: "absolute", bottom: "-8px", right: "-28px", fontSize: "3rem" }}>👩‍🎓</div>
              <div style={{ position: "absolute", bottom: "-8px", left: "-18px", fontSize: "2.6rem" }}>🧑‍💻</div>
            </div>
          </div>
          <div>
            {[
              { q: "What is SODALIS?", a: "SODALIS is a decentralized P2P lending platform specifically designed for the university ecosystem. It leverages cutting-edge AI technology to evaluate student eligibility based on academic performance and financial history, while utilizing blockchain smart contracts to manage loans transparently and efficiently — all without the need for traditional bank intermediaries." },
              { q: "Who can apply for a loan?", a: "Any active university student with a valid academic record and a demonstrated financial need can apply for a loan through SODALIS. The platform is open to students across all partner universities, regardless of their field of study. As long as you meet the minimum GPA requirement and can provide the necessary documentation, you are eligible to submit a loan application." },
              { q: "Is my personal data safe on the Blockchain?", a: "Yes, the security and privacy of your personal data is our top priority. All sensitive information is encrypted using industry-standard protocols before being stored on the ICP blockchain. Since blockchain data is immutable and decentralized, there is no single point of failure or risk of unauthorized manipulation, giving you full confidence that your data remains protected at all times." },
              { q: "How does AI calculate my 'Eligibility Score'?", a: "Our AI scoring engine performs a comprehensive analysis of multiple factors to determine your creditworthiness. It takes into account your academic performance including GPA and course history, your financial background, the stated purpose of your loan, and your repayment history if you are a returning borrower. The result is a personalized eligibility score that helps match you with the most suitable investors on the platform." },
            ].map((faq, i) => (
              <div key={i} className="sodalis-faq-item">
                <button className="sodalis-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span style={{ fontSize: "1.3rem", marginLeft: "12px", flexShrink: 0 }}>{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && faq.a && (
                  <div className="sodalis-faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 48px", background: "#1a3a5c", textAlign: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.88rem", margin: 0 }}>
          Copyright 2026 © Sodalis.
        </p>
      </footer>
    </div>
  );
}