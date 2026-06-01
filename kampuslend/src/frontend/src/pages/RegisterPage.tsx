import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import CapIcon from "../assets/Cap.svg";
import ShieldIcon from "../assets/Shield.svg";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { actor, isFetching: isActorFetching, isError: isActorError, error: actorError } = useActor();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"Investor" | "Borrower" | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendReady, setIsBackendReady] = useState(false);

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [ktm, setKtm] = useState("");
  const [rekening, setRekening] = useState("");
  const [gpa, setGpa] = useState("");
  const [password, setPassword] = useState("");
  const [ktmFile, setKtmFile] = useState<File | null>(null);

  const handleRoleSelect = (selectedRole: "Investor" | "Borrower") => {
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
      toast.error("Select a role before registering.");
      return;
    }
    setIsLoading(true);
    if (ktmFile && ktmFile.size > 5 * 1024 * 1024) {
      toast.error("Maximum file size is 5MB.");
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }
    try {
      const gpaNum = role === "Borrower" ? Number.parseFloat(gpa) || 0 : 0;
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();
      const userId = await actor.registerUser(nama, trimmedEmail, role, ktm, rekening, gpaNum, trimmedPassword);

      toast.success("Account created! Please verify your email.");

      // Redirect to OTP verification page using router navigation (no full page reload)
      navigate({
        to: "/verify-otp",
        search: {
          userId: String(userId),
          role: role,
          name: nama,
          email: email,
        },
      });
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(
        error instanceof Error
          ? `Registration failed: ${error.message}`
          : "Registration failed. Please try again.",
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
                  onClick={() => handleRoleSelect("Borrower")}
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
            <Card className="rounded-2xl shadow-md" style={{ maxWidth: "520px", margin: "0 auto" }}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <img src={role === "Investor" ? ShieldIcon : CapIcon} width={36} height={36} alt="role icon" />
                  <div>
                    <CardTitle className="text-lg font-bold" style={{ color: "#1a3a5c" }}>
                      {role === "Investor" ? "Investor Data" : "Borrower Data"}
                    </CardTitle>
                    <p className="text-xs" style={{ color: "#4a7a9b" }}>
                      {role === "Investor" ? "Fill Your Investor Profile Data." : "Fill Your Data For AI Trust Score."}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="nama" className="text-sm font-medium" style={{ color: "#1a3a5c" }}>Fullname</Label>
                    <Input
                      id="nama"
                      placeholder="Your Full Name Based on Student ID Card."
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                      className="rounded-lg text-sm"
                      data-ocid="register.nama_input"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-sm font-medium" style={{ color: "#1a3a5c" }}>Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@kampus.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-lg text-sm"
                      data-ocid="register.email_input"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-password" className="text-sm font-medium" style={{ color: "#1a3a5c" }}>Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create your login password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-lg text-sm"
                      data-ocid="register.password_input"
                    />
                  </div>

                  {/* Borrower Only */}
                  {role === "Borrower" && (
                    <div className="space-y-1">
                      <Label htmlFor="ktm" className="text-sm font-medium" style={{ color: "#1a3a5c" }}>Student ID Card Number</Label>
                      <Input
                        id="ktm"
                        placeholder="123456"
                        value={ktm}
                        onChange={(e) => setKtm(e.target.value)}
                        required
                        className="rounded-lg text-sm"
                        data-ocid="register.ktm_input"
                      />
                    </div>
                  )}

                  {/* Bank Account & GPA — GPA Borrower Only */}
                  <div className={`grid gap-3 ${role === "Borrower" ? "grid-cols-2" : "grid-cols-1"}`}>
                    <div className="space-y-1">
                      <Label htmlFor="rekening" className="text-sm font-medium" style={{ color: "#1a3a5c" }}>Bank Account</Label>
                      <Input
                        id="rekening"
                        placeholder="BCA-123456"
                        value={rekening}
                        onChange={(e) => setRekening(e.target.value)}
                        required
                        className="rounded-lg text-sm"
                        data-ocid="register.rekening_input"
                      />
                    </div>
                    {role === "Borrower" && (
                      <div className="space-y-1">
                        <Label htmlFor="gpa" className="text-sm font-medium" style={{ color: "#1a3a5c" }}>GPA</Label>
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
                          className="rounded-lg text-sm"
                          data-ocid="register.gpa_input"
                        />
                      </div>
                    )}
                  </div>

                  {/* Upload KHS */}
                  <div className="space-y-1">
                    <Label className="text-sm font-medium" style={{ color: "#1a3a5c" }}>
                      {role === "Investor" ? "Upload Your ID Card" : "Upload Your KHS"}
                    </Label>
                    <div
                      className="rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-50 transition-all"
                      style={{ borderColor: ktmFile ? "#005596" : "#b0c4d8", padding: "1.5rem" }}
                      onClick={() => document.getElementById("ktm-upload")?.click()}
                    >
                      <input
                        id="ktm-upload"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setKtmFile(e.target.files?.[0] ?? null)}
                      />
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect x="4" y="8" width="32" height="24" rx="4" fill="#b0c4d8" />
                        <circle cx="14" cy="17" r="4" fill="#e8eef3" />
                        <path d="M4 28 L13 20 L20 27 L27 21 L36 28" stroke="#e8eef3" strokeWidth="2" fill="none" />
                        <circle cx="26" cy="26" r="6" fill="#1a3a5c" />
                        <line x1="26" y1="23" x2="26" y2="29" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="23" y1="26" x2="29" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {ktmFile ? (
                        <>
                          <p className="text-xs font-medium" style={{ color: "#005596" }}>✅ {ktmFile.name}</p>
                          <p className="text-xs" style={{ color: "#7a9ab5" }}>{(ktmFile.size / 1024).toFixed(1)} KB</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-medium" style={{ color: "#4a7a9b" }}>Drag Files Or Click To Browse</p>
                          <p className="text-xs" style={{ color: "#7a9ab5" }}>Format: PDF (MAX 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 rounded-full text-sm"
                      style={{ color: "#1a3a5c", borderColor: "#b0c4d8" }}
                      onClick={() => setStep(1)}
                      data-ocid="register.back_button"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !isBackendReady}
                      className="flex-1 rounded-full text-white text-sm"
                      style={{ backgroundColor: "#1a3a5c" }}
                      data-ocid="register.submit_button"
                    >
                      {isLoading ? "Processing..." : "Register Now"}
                    </Button>
                  </div>
                </form>
                <p className="text-center text-xs text-muted-foreground mt-3">
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