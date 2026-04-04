import { useState } from "react";

const faqs = [
  { q: "What is SODALIS?", a: "SODALIS is a decentralized P2P lending platform specifically designed for the university ecosystem. It leverages cutting-edge AI technology to evaluate student eligibility based on academic performance and financial history, while utilizing blockchain smart contracts to manage loans transparently and efficiently — all without the need for traditional bank intermediaries." },
  { q: "Who can apply for a loan?", a: "Any active university student with a valid academic record and a demonstrated financial need can apply for a loan through SODALIS. The platform is open to students across all partner universities, regardless of their field of study. As long as you meet the minimum GPA requirement and can provide the necessary documentation, you are eligible to submit a loan application." },
  { q: "Is my personal data safe on the Blockchain?", a: "Yes, the security and privacy of your personal data is our top priority. All sensitive information is encrypted using industry-standard protocols before being stored on the ICP blockchain. Since blockchain data is immutable and decentralized, there is no single point of failure or risk of unauthorized manipulation, giving you full confidence that your data remains protected at all times." },
  { q: "How does AI calculate my 'Eligibility Score'?", a: "Our AI scoring engine performs a comprehensive analysis of multiple factors to determine your creditworthiness. It takes into account your academic performance including GPA and course history, your financial background, the stated purpose of your loan, and your repayment history if you are a returning borrower. The result is a personalized eligibility score that helps match you with the most suitable investors on the platform." },
];

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Question.</h2>
      <div className="faq-content">
        <div className="faq-illustration">
          <div>
            <div className="faq-big-text">FAQ</div>
            <div className="faq-question-mark">?</div>
            <div className="faq-question-mark">?</div>
            <div className="faq-question-mark">?</div>
            <div className="faq-emoji">👩‍🎓</div>
            <div className="faq-emoji">🧑‍💻</div>
          </div>
        </div>
        <div>
          {faqs.map((faq, i) => (
            <div key={i} className="sodalis-faq-item">
              <button className="sodalis-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && faq.a && (
                <div className="sodalis-faq-answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}