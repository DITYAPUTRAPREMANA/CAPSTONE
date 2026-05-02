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
import { Separator } from "@/components/ui/separator";
import { useRouter } from "@tanstack/react-router";
/**
 * Halaman Ajukan Pinjaman untuk Peminjam
 */
import { useState } from "react";
import { toast } from "sonner";
import type { ScoringResult } from "../../backend";
import AIScoreCard from "../../components/AIScoreCard";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatRupiah } from "../../utils/format";

const TENORS = [3, 6, 12];
const TUJUAN_OPTIONS = [
  "Tuition Fee",
  "Rent",
  "Daily Needs",
  "Productive Business",
  "Others",
];

export default function BorrowerApply() {
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  const [nominal, setNominal] = useState("");
  const [tenor, setTenor] = useState("6");
  const [tujuan, setTujuan] = useState("");
  const [jurusan, setJurusan] = useState("");
  const [isScoring, setIsScoring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoringResult | null>(null);
  const [step, setStep] = useState<"form" | "score" | "success">("form");

  const nominalNum = Number.parseFloat(nominal.replace(/[^0-9]/g, "")) || 0;
  const tenorNum = Number.parseInt(tenor) || 6;
  const totalBunga = nominalNum * 0.02 * tenorNum;
  const totalBayar = nominalNum + totalBunga;
  const cicilanPerBulan = tenorNum > 0 ? totalBayar / tenorNum : 0;

  const handleHitungSkor = async () => {
    if (!actor || !user) return;
    if (nominalNum <= 0 || !tujuan || !jurusan) {
      toast.error("Fill all data first");
      return;
    }
    setIsScoring(true);
    try {
      const result = await actor.scoreApplicant({
        gpa: 3.0,
        tenor: BigInt(tenorNum),
        cleanHistory: true,
        amount: BigInt(nominalNum),
        purpose: tujuan,
      });
      setScoreResult(result);
      setStep("score");
    } catch {
      toast.error("Failed to calculate score. Try again.");
    } finally {
      setIsScoring(false);
    }
  };

  const handleSubmit = async () => {
    if (!actor || !user || !scoreResult) return;
    setIsSubmitting(true);
    try {
      await actor.createLoan(
        BigInt(user.userId),
        user.name,
        jurusan,
        BigInt(nominalNum),
        BigInt(tenorNum),
        cicilanPerBulan,
        tujuan,
      );
      setStep("success");
      toast.success("Loan successfully applied!");
    } catch {
      toast.error("Failed to apply for a loan. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto" data-ocid="apply.success_state">
        <Card className="rounded-2xl shadow-card text-center">
          <CardContent className="py-16">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Loan Applied!
            </h2>
            <p className="text-muted-foreground mb-6">
              Your loan of {formatRupiah(nominalNum)} is waiting for
              investor approval.
            </p>
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="animate-pulse">⏳</span>
              Waiting for Investor Approval
            </div>
            <br />
            <Button
              className="rounded-full bg-navy hover:bg-navy/90 text-white px-8"
              onClick={() => router.navigate({ to: "/borrower/dashboard" })}
              data-ocid="apply.dashboard_button"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6" data-ocid="apply.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Apply for Loan</h2>
        <p className="text-muted-foreground">
          Fill the loan form and the AI system will assess your eligibility
        </p>
      </div>

      {step === "form" && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Loan Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nominal">Loan Amount (Rp)</Label>
                <Input
                  id="nominal"
                  placeholder="Example: 5000000"
                  value={nominal}
                  onChange={(e) => setNominal(e.target.value)}
                  className="rounded-full"
                  data-ocid="apply.nominal_input"
                />
              </div>
              <div className="space-y-2">
                <Label>Tenor</Label>
                <Select value={tenor} onValueChange={setTenor}>
                  <SelectTrigger
                    className="rounded-full"
                    data-ocid="apply.tenor_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TENORS.map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {t} months
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Loan Purpose</Label>
                <Select value={tujuan} onValueChange={setTujuan}>
                  <SelectTrigger
                    className="rounded-full"
                    data-ocid="apply.tujuan_select"
                  >
                    <SelectValue placeholder="Select purpose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TUJUAN_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jurusan">Major</Label>
                <Input
                  id="jurusan"
                  placeholder="Example: Computer Science"
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  className="rounded-full"
                  data-ocid="apply.jurusan_input"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Installment Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    {formatRupiah(nominalNum)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Interest (2%/mo × tenor)
                  </span>
                  <span className="font-semibold">
                    {formatRupiah(totalBunga)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Payment</span>
                  <span className="font-bold">{formatRupiah(totalBayar)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">
                    Installment / Month
                  </span>
                  <span className="font-bold text-xl text-brand-green">
                    {formatRupiah(cicilanPerBulan)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                onClick={handleHitungSkor}
                disabled={isScoring || nominalNum <= 0 || !tujuan || !jurusan}
                data-ocid="apply.score_button"
              >
                {isScoring
                  ? "Calculating AI Score..."
                  : "🤖 Calculate Eligibility Score"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {step === "score" && scoreResult && (
        <div className="grid md:grid-cols-2 gap-6">
          <AIScoreCard result={scoreResult} />
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {[
                  { label: "Amount", value: formatRupiah(nominalNum) },
                  { label: "Tenor", value: `${tenorNum} months` },
                  {
                    label: "Installment/mo",
                    value: formatRupiah(cicilanPerBulan),
                    green: true,
                  },
                  { label: "Purpose", value: tujuan },
                  { label: "Major", value: jurusan },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span
                      className={`font-semibold ${item.green ? "text-brand-green" : ""}`}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setStep("form")}
                  data-ocid="apply.back_button"
                >
                  Edit Data
                </Button>
                <Button
                  className="flex-1 rounded-full bg-brand-green hover:bg-brand-green/90 text-white"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  data-ocid="apply.submit_button"
                >
                  {isSubmitting ? "Applying..." : "Apply for Loan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
