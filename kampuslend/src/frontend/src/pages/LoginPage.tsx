import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link, useRouter } from "@tanstack/react-router";
/**
 * Halaman Login SODALIS
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "../backend";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { actor } = useActor();

  const [email, setEmail] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("");
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect jika sudah login
  useEffect(() => {
    if (user) {
      router.navigate({
        to:
          user.role === "Investor"
            ? "/investor/dashboard"
            : "/borrower/dashboard",
      });
    }
  }, [user, router]);

  // Muat daftar user demo
  useEffect(() => {
    if (!actor) return;
    Promise.all([
      actor.getUsersByRole("Investor"),
      actor.getUsersByRole("Peminjam"),
    ])
      .then(([investors, borrowers]) => {
        setDemoUsers([...investors, ...borrowers]);
      })
      .catch(() => {});
  }, [actor]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) {
      toast.error("Koneksi ke backend belum siap, coba lagi sebentar");
      return;
    }

    setIsLoading(true);
    try {
      let foundUser: User | undefined;

      if (selectedDemo) {
        foundUser = demoUsers.find((u) => String(u.id) === selectedDemo);
      } else {
        foundUser = demoUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase(),
        );
      }

      if (!foundUser) {
        toast.error("Pengguna tidak ditemukan. Gunakan akun demo di bawah.");
        return;
      }

      login({
        userId: String(foundUser.id),
        role: foundUser.role,
        name: foundUser.name,
      });
      toast.success(`Selamat datang, ${foundUser.name}!`);
      router.navigate({
        to:
          foundUser.role === "Investor"
            ? "/investor/dashboard"
            : "/borrower/dashboard",
      });
    } catch {
      toast.error("Gagal login. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md rounded-2xl shadow-card">
          <CardHeader className="text-center pb-4">
            <div className="text-4xl mb-2">🎓</div>
            <CardTitle className="text-2xl font-bold text-navy">
              Masuk ke SODALIS
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Gunakan akun demo untuk mencoba aplikasi
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@kampus.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-full"
                  data-ocid="login.input"
                />
              </div>

              {demoUsers.length > 0 && (
                <div className="space-y-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-xs font-semibold text-amber-700">
                    💡 Mode Demo: Pilih akun yang tersedia
                  </p>
                  <Select value={selectedDemo} onValueChange={setSelectedDemo}>
                    <SelectTrigger
                      className="rounded-full"
                      data-ocid="login.select"
                    >
                      <SelectValue placeholder="Pilih akun demo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {demoUsers.map((u) => (
                        <SelectItem key={String(u.id)} value={String(u.id)}>
                          {u.name} ({u.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || (!email && !selectedDemo)}
                className="w-full rounded-full bg-navy hover:bg-navy/90 text-white py-6"
                data-ocid="login.submit_button"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-brand-blue font-semibold hover:underline"
                data-ocid="login.register_link"
              >
                Daftar Sekarang
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}