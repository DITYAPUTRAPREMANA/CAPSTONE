import { Button } from "@/components/ui/button";

interface CTASectionProps {
  goTo: (path: string) => void;
}

export default function CTASection({ goTo }: CTASectionProps) {

  return (
    <section className="cta-section">
      <div className="cta-content">
        <h2 className="cta-title">Siap Bergabung di SODALIS?</h2>
        <p className="cta-subtitle">
          Daftar sekarang dan mulai perjalanan finansialmu sebagai mahasiswa.
        </p>
        <div className="cta-buttons">
          <Button
            style={{ background: "#22c55e", color: "white" }}
            onClick={() => goTo("/register")}
            data-ocid="cta.peminjam_button"
          >
            Daftar Sebagai Peminjam
          </Button>
          <Button
            style={{ background: "#1d6fbf", color: "white" }}
            onClick={() => goTo("/register")}
            data-ocid="cta.investor_button"
          >
            Daftar Sebagai Investor
          </Button>
        </div>
      </div>
    </section>
  );
}