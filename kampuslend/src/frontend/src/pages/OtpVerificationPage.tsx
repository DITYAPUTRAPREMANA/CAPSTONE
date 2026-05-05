import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import Logosvg from "../assets/logo.svg";

interface OtpSession {
  otp: string;
  expiry: number;
  userId: string;
}

export default function OtpVerificationPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { actor } = useActor();

  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [userData, setUserData] = useState<{
    userId: string;
    role: string;
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    if (!userId || !role || !name) {
      toast.error("Invalid verification request.");
      router.navigate({ to: "/register" });
      return;
    }
    setUserData({ userId, role, name, email: email || "" });

    // Check if OTP was already sent (e.g. page refresh)
    const existingSession = sessionStorage.getItem("sodalis_otp_session");
    if (existingSession) {
      try {
        const session = JSON.parse(existingSession) as OtpSession;
        if (session.userId === userId && Date.now() < session.expiry) {
          setOtpSent(true);
          setTimeLeft(Math.max(0, Math.floor((session.expiry - Date.now()) / 1000)));
        }
      } catch {
        // Invalid session, ignore
      }
    }
  }, [router]);

  // Countdown timer
  useEffect(() => {
    if (!otpSent || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newInputs = [...otpInputs];
    newInputs[index] = digit;
    setOtpInputs(newInputs);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newInputs = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtpInputs(newInputs);
    const lastFilledIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const enteredOtp = otpInputs.join("");

  /** Generate OTP, save to session, and send email */
  const sendOtp = async () => {
    if (!userData) return;
    setIsSendingOtp(true);
    try {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const newExpiry = Date.now() + 10 * 60 * 1000;

      sessionStorage.setItem(
        "sodalis_otp_session",
        JSON.stringify({ otp: newOtp, expiry: newExpiry, userId: userData.userId }),
      );
      setTimeLeft(600);
      setOtpInputs(["", "", "", "", "", ""]);

      const gatewayUrl = import.meta.env.VITE_OTP_GATEWAY_URL;
      if (gatewayUrl && !gatewayUrl.includes("YOUR_SCRIPT_ID")) {
        await fetch(gatewayUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ to: userData.email, name: userData.name, otp: newOtp }),
        });
        toast.success("OTP sent! Check your email.");
      } else {
        toast.warning("Email gateway not configured. OTP generated locally.");
      }

      setOtpSent(true);

      // Auto-focus first input after OTP is sent
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResend = async () => {
    if (!userData) return;
    setIsResending(true);
    try {
      await sendOtp();
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !userData) return;
    if (enteredOtp.length < 6) {
      toast.error("Please enter all 6 digits.");
      return;
    }

    const sessionRaw = sessionStorage.getItem("sodalis_otp_session");
    if (!sessionRaw) {
      toast.error("OTP session expired. Please send a new OTP.");
      setOtpSent(false);
      return;
    }

    const session = JSON.parse(sessionRaw) as OtpSession;

    if (Date.now() > session.expiry) {
      toast.error("OTP has expired. Click 'Resend OTP' to get a new one.");
      sessionStorage.removeItem("sodalis_otp_session");
      setTimeLeft(0);
      return;
    }

    if (enteredOtp !== session.otp) {
      toast.error("Incorrect OTP code. Please check your email and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const userIdNum = parseInt(userData.userId.replace(/\D/g, ""), 10);
      if (isNaN(userIdNum)) {
        toast.error("Invalid user session. Please register again.");
        return;
      }

      await actor.verifyEmail(BigInt(userIdNum), "FRONTEND_VERIFIED");

      sessionStorage.removeItem("sodalis_otp_session");

      toast.success("Email verified successfully! Welcome to SODALIS 🎓");
      login({
        userId: userData.userId,
        role: userData.role,
        name: userData.name,
      });
      router.navigate({
        to: userData.role === "Investor" ? "/investor/dashboard" : "/borrower/dashboard",
      });
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

  const maskedEmail = userData?.email
    ? userData.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + "*".repeat(Math.max(1, b.length)) + c)
    : "";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#e8eef3", fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      <div className="flex-1 flex items-center justify-center p-8">
        <div
          style={{
            backgroundColor: "rgba(0, 85, 150, 0.1)",
            backdropFilter: "blur(2px)",
            borderRadius: "2rem",
            padding: "3rem 4rem",
            width: "100%",
            maxWidth: "960px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "520px",
          }}
        >
          <Card className="w-full rounded-2xl shadow-md" style={{ maxWidth: "440px", border: "none" }}>
            <CardContent className="pt-8 pb-6 px-8">
              {/* Logo */}
              <div className="flex justify-center mb-5">
                <img src={Logosvg} width={56} height={56} alt="SODALIS logo" />
              </div>

              <h2 className="text-xl font-bold mb-1 text-center" style={{ color: "#1a3a5c" }}>
                Verify Your Email
              </h2>

              {!otpSent ? (
                /* ===== STEP 1: Send OTP Button ===== */
                <div className="space-y-5 mt-3">
                  <p className="text-sm text-center" style={{ color: "#7a9ab5" }}>
                    We'll send a 6-digit verification code to
                  </p>
                  {maskedEmail && (
                    <p className="text-sm text-center font-semibold" style={{ color: "#1d6fbf" }}>
                      {maskedEmail}
                    </p>
                  )}

                  <div
                    className="rounded-xl p-4 text-center"
                    style={{ backgroundColor: "#f0f6fc" }}
                  >
                    <p className="text-xs" style={{ color: "#7a9ab5" }}>
                      📧 Click the button below to receive your OTP code via email.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={sendOtp}
                    disabled={isSendingOtp || !userData?.email}
                    className="w-full rounded-xl text-white font-semibold py-5 transition-all hover:brightness-110"
                    style={{ backgroundColor: "#1d6fbf" }}
                    data-ocid="verify.send_otp_button"
                  >
                    {isSendingOtp ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Sending OTP...
                      </span>
                    ) : (
                      "📤 Send OTP Code"
                    )}
                  </Button>

                  <p className="text-xs text-center" style={{ color: "#7a9ab5" }}>
                    Make sure to check your spam folder if you don't see the email.
                  </p>
                </div>
              ) : (
                /* ===== STEP 2: Enter OTP Code ===== */
                <>
                  <p className="text-sm text-center mb-1" style={{ color: "#7a9ab5" }}>
                    We've sent a 6-digit OTP to
                  </p>
                  {maskedEmail && (
                    <p className="text-sm text-center font-semibold mb-5" style={{ color: "#1d6fbf" }}>
                      {maskedEmail}
                    </p>
                  )}

                  <form onSubmit={handleVerify} className="space-y-5">
                    {/* OTP Input Boxes */}
                    <div>
                      <Label className="text-sm font-semibold block mb-3 text-center" style={{ color: "#1a3a5c" }}>
                        Enter OTP Code
                      </Label>
                      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                        {otpInputs.map((digit, idx) => (
                          <Input
                            key={idx}
                            ref={(el) => { inputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="text-center text-xl font-bold rounded-xl p-0"
                            style={{
                              width: "48px",
                              height: "56px",
                              color: "#1d6fbf",
                              borderColor: digit ? "#1d6fbf" : "#d1dce6",
                              borderWidth: "2px",
                              boxShadow: digit ? "0 0 0 3px rgba(29,111,191,0.12)" : "none",
                              transition: "all 0.15s ease",
                            }}
                            data-ocid={`verify.otp_input_${idx}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="text-center">
                      {timeLeft > 0 ? (
                        <p className="text-xs" style={{ color: "#7a9ab5" }}>
                          Code expires in{" "}
                          <span className="font-bold" style={{ color: timeLeft < 60 ? "#ef4444" : "#1d6fbf" }}>
                            {formatTime(timeLeft)}
                          </span>
                        </p>
                      ) : (
                        <p className="text-xs font-semibold" style={{ color: "#ef4444" }}>
                          OTP has expired
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || enteredOtp.length < 6 || timeLeft === 0}
                      className="w-full rounded-xl text-white font-semibold py-5 transition-all hover:brightness-110"
                      style={{ backgroundColor: "#1d6fbf" }}
                      data-ocid="verify.submit_button"
                    >
                      {isLoading ? "Verifying..." : "Verify & Continue →"}
                    </Button>

                    {/* Resend */}
                    <div className="text-center">
                      <p className="text-xs" style={{ color: "#7a9ab5" }}>
                        Didn't receive the email?{" "}
                        <button
                          type="button"
                          onClick={handleResend}
                          disabled={isResending || timeLeft > 540}
                          className="font-semibold underline disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ color: "#1d6fbf" }}
                        >
                          {isResending ? "Sending..." : "Resend OTP"}
                        </button>
                      </p>
                      {timeLeft > 540 && (
                        <p className="text-xs mt-1" style={{ color: "#7a9ab5" }}>
                          Resend available after {formatTime(timeLeft - 540)}
                        </p>
                      )}
                    </div>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
