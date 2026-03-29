import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@tanstack/react-router";
/**
 * Halaman Registrasi KampusLend - 2 langkah: pilih role lalu isi data
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { actor } = useActor();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"Investor" | "Peminjam" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [ktm, setKtm] = useState("");
  const [rekening, setRekening] = useState("");
  const [gpa, setGpa] = useState("");

  const handleRoleSelect = (selectedRole: "Investor" | "Peminjam") => {
    setRole(selectedRole);
    setStep(2);
  };

  useEffect(() => {
    setIsBackendReady(Boolean(actor));
  }, [actor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      // backend masih loading, seharusnya submit tidak aktif jika belum siap
      return;
    }
    if (!role) {
      toast.error("Pilih role terlebih dahulu sebelum mendaftar.");
      return;
    }
    setIsLoading(true);
    try {
      const gpaNum = role === "Peminjam" ? Number.parseFloat(gpa) || 0 : 0;
      const userId = await actor.registerUser(
        nama,
        email,
        role,
        ktm,
        rekening,
        gpaNum,
      );
      // Backend already stores profile in registerUser; skip saveCallerUserProfile to avoid permission mismatch on anonymous login
      login({ userId: String(userId), role, name: nama });
      toast.success("Akun berhasil dibuat! Selamat datang di KampusLend 🎓");
      router.navigate({
        to: role === "Investor" ? "/investor/dashboard" : "/borrower/dashboard",
      });
    } catch (error) {
      console.error("Registrasi gagal:", error);
      toast.error(
        error instanceof Error
          ? `Gagal mendaftar: ${error.message}`
          : "Gagal mendaftar. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="bg-navy text-white px-6 py-4">
        {!isBackendReady && (
          <div className="text-white text-sm text-center py-2 bg-red-600">
            Koneksi backend sedang disiapkan, tunggu sebentar sebelum mendaftar.
          </div>
        )}
        <Link to="/" className="flex items-center gap-2 w-fit">
          <span className="text-2xl">🎓</span>
          <span className="font-bold text-xl">KampusLend</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-navy text-white" : "bg-gray-200 text-gray-500"}`}
              >
                1
              </div>
              <span className="text-sm font-medium">Pilih Role</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-navy text-white" : "bg-gray-200 text-gray-500"}`}
              >
                2
              </div>
              <span className="text-sm font-medium">Data Diri</span>
            </div>
          </div>

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-center text-foreground mb-2">
                Daftar Sebagai Apa?
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                Pilih peran Anda di KampusLend
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Card
                  className="rounded-2xl shadow-card hover:shadow-lg transition-all cursor-pointer border-2 hover:border-amber-500"
                  onClick={() => handleRoleSelect("Peminjam")}
                  data-ocid="register.peminjam_card"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">📚</div>
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      Peminjam
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Ajukan pinjaman untuk kebutuhan kuliah Anda
                    </p>
                    <Button
                      className="mt-4 w-full rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm"
                      tabIndex={-1}
                    >
                      Pilih Peminjam
                    </Button>
                  </CardContent>
                </Card>
                <Card
                  className="rounded-2xl shadow-card hover:shadow-lg transition-all cursor-pointer border-2 hover:border-brand-green"
                  onClick={() => handleRoleSelect("Investor")}
                  data-ocid="register.investor_card"
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">💰</div>
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      Investor
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Danai pinjaman mahasiswa dan dapatkan return
                    </p>
                    <Button
                      className="mt-4 w-full rounded-full bg-brand-green hover:bg-brand-green/90 text-white text-sm"
                      tabIndex={-1}
                    >
                      Pilih Investor
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {step === 2 && (
            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-navy">
                  Data {role} {role === "Investor" ? "💰" : "📚"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input
                      id="nama"
                      placeholder="Nama sesuai KTM"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                      className="rounded-full"
                      data-ocid="register.nama_input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@kampus.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-full"
                      data-ocid="register.email_input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ktm">Nomor KTM</Label>
                    <Input
                      id="ktm"
                      placeholder="Nomor Kartu Tanda Mahasiswa"
                      value={ktm}
                      onChange={(e) => setKtm(e.target.value)}
                      required
                      className="rounded-full"
                      data-ocid="register.ktm_input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rekening">Rekening Bank</Label>
                    <Input
                      id="rekening"
                      placeholder="BCA-1234567890"
                      value={rekening}
                      onChange={(e) => setRekening(e.target.value)}
                      required
                      className="rounded-full"
                      data-ocid="register.rekening_input"
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: NamaBank-NomorRekening
                    </p>
                  </div>
                  {role === "Peminjam" && (
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA / IPK (0.00 - 4.00)</Label>
                      <Input
                        id="gpa"
                        type="number"
                        min="0"
                        max="4"
                        step="0.01"
                        placeholder="3.50"
                        value={gpa}
                        onChange={(e) => setGpa(e.target.value)}
                        required
                        className="rounded-full"
                        data-ocid="register.gpa_input"
                      />
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-full"
                      onClick={() => setStep(1)}
                      data-ocid="register.back_button"
                    >
                      Kembali
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !isBackendReady}
                      className="flex-1 rounded-full bg-navy hover:bg-navy/90 text-white"
                      data-ocid="register.submit_button"
                    >
                      {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </Button>
                  </div>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Sudah punya akun?{" "}
                  <Link
                    to="/login"
                    className="text-brand-blue font-semibold hover:underline"
                  >
                    Masuk
                  </Link>
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
