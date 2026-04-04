import vectorSvg from "@/components/icon/vector.svg";

const steps = [
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
];

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="how-it-works-section">
      <h2 className="how-it-works-title">How it Works.</h2>
      <p className="how-it-works-subtitle">
        Our streamlined process gets you the funding you need quickly and efficiently.
      </p>

      <div className="vector-bg">
        <img
          src={vectorSvg}
          alt="How it works vector"
        />
      </div>

      <div className="sodalis-work-grid">
        {steps.map((step) => (
          <div key={step.number} className="sodalis-work-step">
            <div className="sodalis-work-number">{step.number}</div>
            <div className="sodalis-work-title">{step.title}</div>
            <div className="sodalis-work-desc">{step.description}</div>
          </div>
        ))}
      </div>
    </section>
  );
}