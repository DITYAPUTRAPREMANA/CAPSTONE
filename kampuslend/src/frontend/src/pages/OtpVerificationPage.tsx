import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import Logosvg from "../assets/logo.svg";

export default function OtpVerificationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { actor } = useActor();

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [userData, setUserData] = useState<{
    userId: string;
    role: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    // Parse URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const name = searchParams.get("name");

    if (!userId || !role || !name) {
      toast.error("Invalid verification request.");
      router.navigate({ to: "/register" });
      return;
    }

    setUserData({ userId, role, name });
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !userData) return;
    if (otp.length < 6) {
      toast.error("Please enter a valid 6-digit OTP code.");
      return;
    }

    setIsLoading(true);
    try {
      // Parse userId safely — URL params come as strings, strip any non-digit chars
      const userIdNum = parseInt(userData.userId.replace(/\D/g, ""), 10);
      if (isNaN(userIdNum)) {
        toast.error("Invalid user session. Please register again.");
        return;
      }
      const isVerified = await actor.verifyEmail(BigInt(userIdNum), otp);

      if (isVerified) {
        toast.success("Email successfully verified! Welcome to SODALIS 🎓");
        login({
          userId: userData.userId,
          role: userData.role,
          name: userData.name,
        });
        router.navigate({
          to: userData.role === "Investor" ? "/investor/dashboard" : "/borrower/dashboard",
        });
      } else {
        toast.error("Invalid OTP code. Please try again. (Hint: use 123456)");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      toast.error(
        error instanceof Error
          ? `Verification failed: ${error.message}`
          : "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#e8eef3", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="flex-1 flex items-center justify-center p-8">
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
          <Card className="w-full rounded-2xl shadow-md" style={{ maxWidth: "420px", border: "none" }}>
            <CardContent className="pt-8 pb-6 px-8">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img src={Logosvg} width={60} height={60} alt="SODALIS logo" />
              </div>

              <h2 className="text-xl font-bold mb-2 text-center" style={{ color: "#1a3a5c" }}>
                Verify Your Email
              </h2>
              <p className="text-sm text-center mb-6" style={{ color: "#7a9ab5" }}>
                We've sent a 6-digit OTP code to your email. Please enter it below to verify your account.
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="otp" className="text-sm font-semibold" style={{ color: "#1a3a5c" }}>
                    OTP Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="rounded-lg text-center text-lg tracking-widest font-bold"
                    style={{ height: "50px", color: "#1d6fbf" }}
                    data-ocid="verify.otp_input"
                    required
                  />
                  <p className="text-xs text-right mt-1" style={{ color: "#4a7a9b" }}>
                    Hint: use 123456 for demo
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.length < 6}
                  className="w-full rounded-lg text-white font-semibold py-5 transition-all hover:brightness-110"
                  style={{ backgroundColor: "#1d6fbf" }}
                  data-ocid="verify.submit_button"
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
