import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import CapIcon from "../assets/Cap.svg";
import ShieldIcon from "../assets/Shield.svg";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { actor, isFetching: isActorFetching, isError: isActorError, error: actorError } = useActor();

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

  useEffect(() => {
    if (isActorError) {
      console.error("Actor creation error", actorError);
    }
  }, [isActorError, actorError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    if (!role) {
      toast.error("Pilih role terlebih dahulu sebelum mendaftar.");
      return;
    }
    setIsLoading(true);
    try {
      const gpaNum = role === "Peminjam" ? Number.parseFloat(gpa) || 0 : 0;
      const userId = await actor.registerUser(nama, email, role, ktm, rekening, gpaNum);
      login({ userId: String(userId), role, name: nama });
      toast.success("Akun berhasil dibuat! Selamat datang di SODALIS 🎓");
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#e8eef3" }}>
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          style={{
            backgroundColor: "rgba(0, 85, 150, 0.1)",
            backdropFilter: "blur(2px)",
            borderRadius: "2rem",
            padding: "3rem 4rem",
            width: "100%",
            maxWidth: "900px",
          }}
        >
          {/* Stepper */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: step >= 1 ? "#005596" : "#b0c4d8",
                  color: "white",
                }}
              >
                1
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: step >= 1 ? "#005596" : "#7a9ab5" }}
              >
                Choose Your Role
              </span>
            </div>
            <div className="w-16 h-0.5" style={{ backgroundColor: "#b0c4d8" }} />
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  backgroundColor: step >= 2 ? "#005596" : "#b0c4d8",
                  color: "white",
                }}
              >
                2
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: step >= 2 ? "#005596" : "#7a9ab5" }}
              >
                Personal Data
              </span>
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <h2
                className="text-2xl font-bold text-center mb-1"
                style={{ color: "#005596" }}
              >
                What Do You Want To Register As?
              </h2>
              <p className="text-center mb-8" style={{ color: "#005596" }}>
                Choose Your Role!
              </p>

              <div className="grid grid-cols-2 gap-6">
                {/* Borrower Card */}
                <div
                  className="bg-white rounded-2xl p-8 flex flex-col items-center cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-300"
                  onClick={() => handleRoleSelect("Peminjam")}
                  data-ocid="register.peminjam_card"
                >
                  <div className="mb-5">
                     <img src={CapIcon} width={100} height={100} alt="cap icon" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#005596" }}>
                    Borrower
                  </h3>
                  <p className="text-sm text-center mb-5" style={{ color: "#005596" }}>
                    Unlock your academic potential. Get access to fair, AI-calculated loans based on your achievements and dedication.
                  </p>
                  <button
                    className="w-full py-2.5 rounded-full font-semibold text-white text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: "#005596" }}
                    tabIndex={-1}
                  >
                    Continue
                  </button>
                </div>

                {/* Investor Card */}
                <div
                  className="bg-white rounded-2xl p-8 flex flex-col items-center cursor-pointer transition-all hover:shadow-lg border-2 border-transparent hover:border-blue-300"
                  onClick={() => handleRoleSelect("Investor")}
                  data-ocid="register.investor_card"
                >
                  <div className="mb-5">
                    <img src={ShieldIcon} width={100} height={100} alt="shield icon" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#005596" }}>
                    Investor
                  </h3>
                  <p className="text-sm text-center mb-5" style={{ color: "#005596" }}>
                    Invest for the future of students. Support scholars through secure blockchain contracts and earn community-backed returns.
                  </p>
                  <button
                    className="w-full py-2.5 rounded-full font-semibold text-white text-sm transition-all hover:opacity-90"
                    style={{ backgroundColor: "#005596" }}
                    tabIndex={-1}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Data Form */}
          {step === 2 && (
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle className="text-xl font-bold" style={{ color: "#1a3a5c" }}>
                  {role === "Investor" ? "Investor Data 💰" : "Borrower Data 📚"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Full Name</Label>
                    <Input
                      id="nama"
                      placeholder="Name as on Student ID"
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
                      placeholder="email@campus.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-full"
                      data-ocid="register.email_input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ktm">Student ID Number</Label>
                    <Input
                      id="ktm"
                      placeholder="Student Card Number"
                      value={ktm}
                      onChange={(e) => setKtm(e.target.value)}
                      required
                      className="rounded-full"
                      data-ocid="register.ktm_input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rekening">Bank Account</Label>
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
                      Format: BankName-AccountNumber
                    </p>
                  </div>
                  {role === "Peminjam" && (
                    <div className="space-y-2">
                      <Label htmlFor="gpa">GPA (0.00 - 4.00)</Label>
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
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !isBackendReady}
                      className="flex-1 rounded-full text-white"
                      style={{ backgroundColor: "#1a3a5c" }}
                      data-ocid="register.submit_button"
                    >
                      {isLoading ? "Processing..." : "Register Now"}
                    </Button>
                  </div>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold hover:underline"
                    style={{ color: "#1a6bbf" }}
                  >
                    Sign In
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