import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import landingSvg from "@/components/icon/landing.svg";
import logoSvg from "@/components/icon/logo.svg";
import vectorSvg from "@/components/icon/vector.svg";
/**
 * Halaman Landing SODALIS - halaman utama untuk pengunjung
 */
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";

const features = [
  {
    icon: "🤖",
    title: "AI Scoring Canggih",
    desc: "Sistem AI kami menilai kelayakan peminjam berdasarkan GPA, riwayat pinjaman, dan tujuan pinjaman secara real-time.",
  },
  {
    icon: "⛓️",
    title: "Blockchain ICP",
    desc: "Setiap transaksi dicatat di blockchain Internet Computer Protocol (ICP) — transparan, aman, dan tidak bisa dimanipulasi.",
  },
  {
    icon: "🏦",
    title: "Virtual Account IDR",
    desc: "Transfer dana langsung via Virtual Account BCA, Mandiri, BRI, BNI, dan BSI. Mudah dan terpercaya.",
  },
];

const borrowerSteps = [
  {
    step: 1,
    title: "Daftar & Verifikasi",
    desc: "Upload KTM, isi data akademik dan rekening bank",
  },
  {
    step: 2,
    title: "Ajukan Pinjaman",
    desc: "Tentukan nominal, tenor, dan tujuan pinjaman",
  },
  {
    step: 3,
    title: "Terima Dana",
    desc: "Dana masuk ke rekening setelah investor menyetujui",
  },
];

const investorSteps = [
  {
    step: 1,
    title: "Daftar & Verifikasi",
    desc: "Upload KTM dan data rekening bank Anda",
  },
  {
    step: 2,
    title: "Pilih Peminjam",
    desc: "Lihat profil lengkap + skor AI kelayakan peminjam",
  },
  {
    step: 3,
    title: "Terima Cicilan",
    desc: "Cicilan bulanan masuk otomatis ke rekening Anda",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0 }}>
            <img
              src={vectorSvg}
              alt="How it works vector"
              style={{
                width: "100%",
                maxWidth: "980px",
                opacity: 0.22,
              }}
            />
          </div>          z-index: 1;
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
        background: "white", padding: "14px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #e8ecf0", position: "sticky", top: 0, zIndex: 50,
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img src={logoSvg} alt="Sodalis logo" style={{ width: 34, height: 34, objectFit: "contain" }} />
          <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1a3a5c" }}>Sodalis.</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#cara-kerja" style={{ color: "#1a3a5c", fontWeight: 500, textDecoration: "none", fontSize: "0.9rem" }}>
            Cara Kerja
          </a>
          <a href="#fitur" style={{ color: "#1a3a5c", fontWeight: 500, textDecoration: "none", fontSize: "0.9rem" }}>
            Fitur
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="sodalis-nav-btn"
            variant="outline"
            style={{ borderRadius: "999px", border: "1.5px solid #1a3a5c", color: "#1a3a5c", background: "transparent", fontSize: "0.88rem" }}
            onClick={() => goTo("/login")}
            data-ocid="nav.login_button"
          >
            Login
          </Button>
          <Button
            className="sodalis-nav-btn"
            style={{ borderRadius: "999px", background: "#1d6fbf", color: "white", fontSize: "0.88rem" }}
            onClick={() => goTo("/register")}
            data-ocid="nav.register_button"
          >
            Daftar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
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
              Mulai Sekarang
            </Button>
            <Button
              className="sodalis-btn"
              variant="outline"
              style={{ borderRadius: "999px", border: "1.5px solid #1a3a5c", color: "#1a3a5c", background: "transparent", padding: "14px 32px", fontSize: "0.97rem", fontWeight: 600 }}
              onClick={() => goTo("/login")}
              data-ocid="hero.login_button"
            >
              Sudah Punya Akun
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "0 48px 64px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { label: "Total Pengguna", value: "2.400+", icon: "👨‍🎓" },
            { label: "Dana Tersalur", value: "Rp 4,8M", icon: "💰" },
            { label: "Tingkat Pengembalian", value: "98.2%", icon: "📈" },
            { label: "Universitas Mitra", value: "32", icon: "🏫" },
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

      {/* Fitur Unggulan */}
      <section id="fitur" style={{ padding: "60px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: "1.8rem", fontWeight: 800, color: "#1a3a5c", marginBottom: "8px" }}>Features.</h2>
        <p style={{ textAlign: "center", color: "#718096", fontSize: "0.95rem", marginBottom: "36px" }}>
          Teknologi terdepan untuk keamanan dan kemudahan Anda
        </p>
        <div style={{ background: "#1a3a5c", borderRadius: "24px", padding: "44px 40px" }}>
          <h3 style={{ color: "white", textAlign: "center", fontSize: "1.35rem", fontWeight: 700, marginBottom: "10px" }}>
            University-Grade Infrastructure
          </h3>
          <p style={{ color: "rgba(255,255,255,0.65)", textAlign: "center", fontSize: "0.88rem", lineHeight: 1.65, maxWidth: "520px", margin: "0 auto 36px" }}>
            Dibangun di atas arsitektur multi-tenant yang aman dengan integrasi mendalam ke sistem data akademik dan manajemen kepatuhan otomatis yang skalabel.
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
        <p style={{ textAlign: "center", color: "#3d557a", fontSize: "1rem", marginBottom: "48px" }}>
          Our streamlined process gets you the funding you need quickly and efficiently.
        </p>

        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0, transform: "translateY(80px)" }}>
          <img
            src={vectorSvg}
            alt="How it works vector"
            style={{ width: "100%", maxWidth: "1000px", opacity: 1 }}
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
              { q: "Apa itu SODALIS?", a: "SODALIS adalah platform P2P Lending terdesentralisasi khusus untuk ekosistem universitas. Platform ini menggunakan AI untuk mengevaluasi kelayakan mahasiswa dan Blockchain untuk mengelola pinjaman tanpa perantara bank tradisional." },
              { q: "Siapa yang bisa mengajukan pinjaman?", a: "" },
              { q: "Apakah data pribadi saya aman di Blockchain?", a: "" },
              { q: "Bagaimana AI menghitung 'Skor Kelayakan' saya?", a: "" },
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

      {/* CTA */}
      <section style={{ padding: "64px 48px", background: "#1a3a5c", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ color: "white", fontSize: "1.9rem", fontWeight: 800, marginBottom: "14px" }}>
            Siap Bergabung di SODALIS?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: "32px", fontSize: "0.97rem" }}>
            Daftar sekarang dan mulai perjalanan finansialmu sebagai mahasiswa.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              style={{ borderRadius: "999px", background: "#22c55e", color: "white", padding: "14px 32px", fontSize: "0.97rem", fontWeight: 600 }}
              onClick={() => goTo("/register")}
              data-ocid="cta.peminjam_button"
            >
              Daftar Sebagai Peminjam
            </Button>
            <Button
              style={{ borderRadius: "999px", background: "#1d6fbf", color: "white", padding: "14px 32px", fontSize: "0.97rem", fontWeight: 600 }}
              onClick={() => goTo("/register")}
              data-ocid="cta.investor_button"
            >
              Daftar Sebagai Investor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#1a3a5c", borderTop: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "28px 48px", textAlign: "center", fontSize: "0.85rem" }}>
        <p style={{ fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "4px" }}>🎓 SODALIS</p>
        <p style={{ marginBottom: "8px" }}>Platform P2P Lending Khusus Mahasiswa Indonesia</p>
        <p>© {new Date().getFullYear()}. Dibuat dengan ❤️ SODALIS.</p>
      </footer>
    </div>
  );
}