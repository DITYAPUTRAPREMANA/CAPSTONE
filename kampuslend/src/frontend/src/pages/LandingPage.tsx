import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
/**
 * Halaman Landing SODALIS - halaman utama untuk pengunjung
 */
import { useRouter } from "@tanstack/react-router";

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

  const goTo = (path: string) => router.navigate({ to: path });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-navy text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="font-bold text-xl tracking-tight">SODALIS</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a
            href="#cara-kerja"
            className="hover:text-white/80 transition-colors"
          >
            Cara Kerja
          </a>
          <a href="#fitur" className="hover:text-white/80 transition-colors">
            Fitur
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-navy text-sm px-4"
            onClick={() => goTo("/login")}
            data-ocid="nav.login_button"
          >
            Login
          </Button>
          <Button
            className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white text-sm px-4"
            onClick={() => goTo("/register")}
            data-ocid="nav.register_button"
          >
            Daftar
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-navy text-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
              <span>⛓️</span>
              <span>Didukung Internet Computer Protocol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Pinjaman Mahasiswa Berbasis{" "}
              <span className="text-green-400">Blockchain & AI</span>
            </h1>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Platform P2P Lending khusus mahasiswa dengan teknologi ICP
              blockchain untuk keamanan transaksi dan AI scoring untuk penilaian
              kelayakan yang adil dan transparan.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white px-8 py-6 text-lg"
                onClick={() => goTo("/register")}
                data-ocid="hero.daftar_button"
              >
                Mulai Sekarang
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-white text-white bg-transparent hover:bg-white hover:text-navy px-8 py-6 text-lg"
                onClick={() => goTo("/login")}
                data-ocid="hero.login_button"
              >
                Sudah Punya Akun
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Pengguna", value: "2.400+", icon: "👨‍🎓" },
              { label: "Dana Tersalur", value: "Rp 4,8M", icon: "💰" },
              { label: "Tingkat Pengembalian", value: "98.2%", icon: "📈" },
              { label: "Universitas Mitra", value: "32", icon: "🏫" },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="bg-white/10 border-white/20 rounded-2xl"
              >
                <CardContent className="p-4 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-white/70 mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja */}
      <section id="cara-kerja" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">
            Cara Kerja
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Proses sederhana untuk peminjam dan investor
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm">
                  P
                </span>
                Sisi Peminjam
              </h3>
              <div className="space-y-4">
                {borrowerSteps.map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {s.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">
                  I
                </span>
                Sisi Investor
              </h3>
              <div className="space-y-4">
                {investorSteps.map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {s.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan */}
      <section id="fitur" className="py-20 px-6 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">
            Fitur Unggulan
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Teknologi terdepan untuk keamanan dan kemudahan Anda
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className="rounded-2xl shadow-card hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">{f.icon}</div>
                  <h3 className="font-bold text-foreground text-lg mb-2">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {f.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-navy text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Siap Bergabung di SODALIS?
          </h2>
          <p className="text-white/80 mb-8">
            Daftar sekarang dan mulai perjalanan finansialmu sebagai mahasiswa.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              className="rounded-full bg-brand-green hover:bg-brand-green/90 text-white px-8 py-6 text-lg"
              onClick={() => goTo("/register")}
              data-ocid="cta.peminjam_button"
            >
              Daftar Sebagai Peminjam
            </Button>
            <Button
              className="rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white px-8 py-6 text-lg"
              onClick={() => goTo("/register")}
              data-ocid="cta.investor_button"
            >
              Daftar Sebagai Investor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy text-white/70 py-8 px-6 text-center text-sm">
        <p className="mb-2 font-bold text-white text-base">🎓 SODALIS</p>
        <p className="mb-4">Platform P2P Lending Khusus Mahasiswa Indonesia</p>
        <p>
          © {new Date().getFullYear()}. Dibuat dengan ❤️ SODALIS.
        </p>
      </footer>
    </div>
  );
}
