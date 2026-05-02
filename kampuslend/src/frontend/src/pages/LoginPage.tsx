import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { User } from "../backend";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import Logosvg from "../assets/logo.svg";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const { actor } = useActor();

  const [email, setEmail] = useState("");
  const [selectedDemo, setSelectedDemo] = useState("");
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#e8eef3" }}>
      <div className="flex-1 flex items-center justify-center p-8">
        {/* Panel biru muda */}
        <div
          style={{
            backgroundColor: "rgba(0, 85, 150, 0.1)",
            backdropFilter: "blur(2px)",
            borderRadius: "2rem",
            padding: "3rem 4rem",
            width: "100%",
            maxWidth: "900px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "500px",
          }}
        >
          <Card className="w-full rounded-2xl shadow-md" style={{ maxWidth: "420px" }}>
            <CardContent className="pt-8 pb-6 px-8">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img src={Logosvg} width={60} height={60} alt="SODALIS logo" />
              </div>

              <h2 className="text-xl font-bold mb-4" style={{ color: "#1a3a5c" }}>
                Login
              </h2>

              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm" style={{ color: "#1a3a5c" }}>
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg text-sm"
                    data-ocid="login.input"
                  />
                </div>

                {demoUsers.length > 0 && (
                  <div className="space-y-1 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-semibold text-amber-700">
                      💡 Mode Demo: Pilih akun yang tersedia
                    </p>
                    <Select value={selectedDemo} onValueChange={setSelectedDemo}>
                      <SelectTrigger className="rounded-lg" data-ocid="login.select">
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

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm" style={{ color: "#1a3a5c" }}>
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    className="rounded-lg text-sm"
                  />
                </div>

                <p className="text-xs" style={{ color: "#4a7a9b" }}>
                  Forgot Password?
                </p>

                <Button
                  type="submit"
                  disabled={isLoading || (!email && !selectedDemo)}
                  className="w-full rounded-lg text-white font-semibold py-5 mt-1"
                  style={{ backgroundColor: "#1a3a5c" }}
                  data-ocid="login.submit_button"
                >
                  {isLoading ? "Memproses..." : "Sign In"}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                Don't have an account yet?{" "}
                <Link
                  to="/register"
                  className="font-semibold hover:underline"
                  style={{ color: "#1a6bbf" }}
                  data-ocid="login.register_link"
                >
                  Register for free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
