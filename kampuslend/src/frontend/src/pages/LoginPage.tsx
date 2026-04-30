import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import Logosvg from "../assets/logo.svg";

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { actor } = useActor();
  const { identity, login, isInitializing, isLoggingIn } = useInternetIdentity();
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

  const handleContinue = async () => {
    if (!identity) {
      login();
      return;
    }
    if (!actor) return;
    setIsLoading(true);
    try {
      const currentUser = await actor.getCurrentUser();
      if (!currentUser) {
        router.navigate({ to: "/register" });
        return;
      }
      await refreshUser();
      toast.success(`Selamat datang, ${currentUser.name}!`);
      router.navigate({ to: currentUser.role === "Investor" ? "/investor/dashboard" : "/borrower/dashboard" });
    } catch {
      toast.error("Gagal memuat akun. Coba lagi.");
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
                Masuk
              </h2>
              <div className="space-y-4">
                <p className="text-sm" style={{ color: "#4a7a9b" }}>
                  Autentikasi sekarang menggunakan Internet Identity.
                </p>
                <Button
                  type="button"
                  onClick={handleContinue}
                  disabled={isLoading || isInitializing || isLoggingIn}
                  className="w-full rounded-lg text-white font-semibold py-5 mt-1"
                  style={{ backgroundColor: "#1a3a5c" }}
                  data-ocid="login.submit_button"
                >
                  {isLoading ? "Memproses..." : identity ? "Lanjutkan" : "Masuk dengan Internet Identity"}
                </Button>
              </div>

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