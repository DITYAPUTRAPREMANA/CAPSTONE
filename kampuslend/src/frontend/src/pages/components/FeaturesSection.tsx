import { Card, CardContent } from "@/components/ui/card";
import aiIconSvg from "@/assets/Ai Idea.svg";
import shieldSvg from "@/assets/Shield.svg";
import capSvg from "@/assets/Cap.svg";

const features = [
  {
    icon: aiIconSvg,
    title: "AI Trust Scoring",
    desc: "Our AI system assesses borrower eligibility based on GPA, loan history, and loan objectives in real-time..",
  },
  {
    icon: shieldSvg,
    title: "Blockchain ICP",
    desc: "Every transaction is recorded on the Internet Computer Protocol (ICP) blockchain — transparent, secure, and unmanipulated.",
  },
  {
    icon: capSvg,
    title: "Virtual Account IDR",
    desc: "Transfer funds directly via virtual accounts at BCA, Mandiri, BRI, BNI, and BSI. Easy and reliable.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="fitur" className="features-section">
      <h2 className="features-title">Features.</h2>
      <p className="features-subtitle">
        Teknologi terdepan untuk keamanan dan kemudahan Anda.
      </p>
      <div className="features-container">
        <div className="features-header">
          <h3>University-Grade Infrastructure</h3>
          <p>
            Built on a secure multi-tenant architecture with deep integration into academic data systems and scalable, automated compliance management.
          </p>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <Card key={f.title} className="feature-card">
              <CardContent className="feature-content">
                <img src={f.icon} alt={f.title} className="feature-icon" />
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}