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
import { useAuth } from "../../contexts/AuthContext";

import { useActor } from "../../hooks/useActor";
import { type ExternalModelInput, getAIScore } from "../../utils/aiService";
import { formatRupiah, toSafeBigInt } from "../../utils/format";

const TENORS = [3, 6, 12];
const TUJUAN_OPTIONS = [
  "Tuition Fee",
  "Rent",
  "Daily Needs",
  "Productive Business",
  "Others",
];
const HOME_OWNERSHIP_OPTIONS = ["RENT", "OWN", "OTHER"];
const PARENT_JOB_OPTIONS = ["EMPLOYEE", "ENTREPRENEUR", "CIVIL_SERVANT", "FREELANCE", "UNEMPLOYED"];
const RESIDENCE_TYPE_OPTIONS = ["URBAN", "SUBURBAN", "RURAL"];

export default function BorrowerApply() {
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  // Data pinjaman utama
  const [nominal, setNominal] = useState("");
  const [tenor, setTenor] = useState("6");
  const [tujuan, setTujuan] = useState("");
  const [jurusan, setJurusan] = useState("");

  // Data profil tambahan untuk model AI
  const [homeOwnership, setHomeOwnership] = useState("");
  const [previousLoan, setPreviousLoan] = useState("NO");
  const [parentalIncome, setParentalIncome] = useState("");
  const [workingStudent, setWorkingStudent] = useState("NO");
  const [courseCredits, setCourseCredits] = useState("");
  const [liability, setLiability] = useState("0");
  const [attendance, setAttendance] = useState("");
  const [parentJob, setParentJob] = useState("");
  const [residenceType, setResidenceType] = useState("");

  const [isScoring, setIsScoring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoringResult | null>(null);
  const [step, setStep] = useState<"form" | "score" | "success">("form");

  const nominalNum = Number.parseFloat(nominal.replace(/[^0-9]/g, "")) || 0;
  const tenorNum = Number.parseInt(tenor) || 6;
  const totalBunga = nominalNum * 0.02 * tenorNum;
  const totalBayar = nominalNum + totalBunga;
  const cicilanPerBulan = tenorNum > 0 ? totalBayar / tenorNum : 0;

  const isFormValid =
    nominalNum > 0 &&
    tujuan &&
    jurusan &&
    homeOwnership &&
    parentalIncome &&
    courseCredits &&
    attendance &&
    parentJob &&
    residenceType;

  const handleHitungSkor = async () => {
    if (!actor || !user) return;
    if (!isFormValid) {
      toast.error("Fill all data first");
      return;
    }
    setIsScoring(true);
    try {
      const extInput: ExternalModelInput = {
        Home_Ownership: homeOwnership,
        Loan_Purpose: tujuan,
        Payment_History: previousLoan === "YES" ? 1 : 0,
        Previous_Loan: previousLoan,
        Parental_Income_IDR_Monthly: Number.parseFloat(parentalIncome) || 0,
        Loan_Amount_IDR: nominalNum,
        Working_Student: workingStudent,
        Course_Credits: Number.parseInt(courseCredits) || 0,
        Liability: Number.parseInt(liability) || 0,
        Attendance: Number.parseFloat(attendance) || 0,
        Grade_Average: 3.0,
        Parent_Job: parentJob,
        Residence_Type: residenceType,
      };

      const result = await getAIScore({
        actor,
        input: {
          gpa: 3.0,
          tenor: BigInt(tenorNum),
          cleanHistory: previousLoan === "NO",
          amount: BigInt(nominalNum),
          purpose: tujuan,
        },
        externalInput: extInput,
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
        toSafeBigInt(user.userId),
        user.name,
        jurusan,
        BigInt(nominalNum),
        BigInt(tenorNum),
        cicilanPerBulan,
        tujuan,
        scoreResult.score,
        scoreResult.recommendation,
        scoreResult.reason,
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
              Your loan of {formatRupiah(nominalNum)} is waiting for investor approval.
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
    <div className="max-w-4xl mx-auto space-y-6" data-ocid="apply.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Apply for Loan</h2>
        <p className="text-muted-foreground">
          Fill the form — the AI system will assess your eligibility
        </p>
      </div>

      {step === "form" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Kartu Kiri: Semua Input ── */}
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Loan Application Form</CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill all fields for AI eligibility assessment
              </p>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Nominal */}
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

              {/* Tenor */}
              <div className="space-y-2">
                <Label>Tenor</Label>
                <Select value={tenor} onValueChange={setTenor}>
                  <SelectTrigger className="rounded-full" data-ocid="apply.tenor_select">
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

              {/* Loan Purpose */}
              <div className="space-y-2">
                <Label>Loan Purpose</Label>
                <Select value={tujuan} onValueChange={setTujuan}>
                  <SelectTrigger className="rounded-full" data-ocid="apply.tujuan_select">
                    <SelectValue placeholder="Select purpose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TUJUAN_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Major */}
              <div className="space-y-2">
                <Label htmlFor="jurusan">Major / Faculty</Label>
                <Input
                  id="jurusan"
                  placeholder="Example: Computer Science"
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  className="rounded-full"
                  data-ocid="apply.jurusan_input"
                />
              </div>

              <Separator />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                🤖 AI Assessment Data
              </p>

              {/* Home Ownership */}
              <div className="space-y-2">
                <Label>Home Ownership</Label>
                <Select value={homeOwnership} onValueChange={setHomeOwnership}>
                  <SelectTrigger className="rounded-full" data-ocid="apply.home_ownership_select">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {HOME_OWNERSHIP_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Parent Job */}
              <div className="space-y-2">
                <Label>Parent Job</Label>
                <Select value={parentJob} onValueChange={setParentJob}>
                  <SelectTrigger className="rounded-full" data-ocid="apply.parent_job_select">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PARENT_JOB_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Residence Type */}
              <div className="space-y-2">
                <Label>Residence Type</Label>
                <Select value={residenceType} onValueChange={setResidenceType}>
                  <SelectTrigger className="rounded-full" data-ocid="apply.residence_type_select">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {RESIDENCE_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Previous Loan & Working Student */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Previous Loan</Label>
                  <Select value={previousLoan} onValueChange={setPreviousLoan}>
                    <SelectTrigger className="rounded-full" data-ocid="apply.previous_loan_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">YES</SelectItem>
                      <SelectItem value="NO">NO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Working Student</Label>
                  <Select value={workingStudent} onValueChange={setWorkingStudent}>
                    <SelectTrigger className="rounded-full" data-ocid="apply.working_student_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES">YES</SelectItem>
                      <SelectItem value="NO">NO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Parental Income */}
              <div className="space-y-2">
                <Label htmlFor="parental_income">Parental Income / Month (Rp)</Label>
                <Input
                  id="parental_income"
                  placeholder="Example: 5000000"
                  value={parentalIncome}
                  onChange={(e) => setParentalIncome(e.target.value)}
                  className="rounded-full"
                  data-ocid="apply.parental_income_input"
                />
              </div>

              {/* SKS, Attendance, Dependents */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="course_credits">SKS</Label>
                  <Input
                    id="course_credits"
                    placeholder="24"
                    type="number"
                    min={0}
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(e.target.value)}
                    className="rounded-full"
                    data-ocid="apply.course_credits_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="attendance">Attendance %</Label>
                  <Input
                    id="attendance"
                    placeholder="85"
                    type="number"
                    min={0}
                    max={100}
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                    className="rounded-full"
                    data-ocid="apply.attendance_input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="liability">Dependents</Label>
                  <Input
                    id="liability"
                    placeholder="0"
                    type="number"
                    min={0}
                    value={liability}
                    onChange={(e) => setLiability(e.target.value)}
                    className="rounded-full"
                    data-ocid="apply.liability_input"
                  />
                </div>
              </div>

            </CardContent>
          </Card>

          {/* ── Kartu Kanan: Kalkulasi & Tombol ── */}
          <div className="space-y-4">
            <Card className="rounded-2xl shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Installment Calculation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">{formatRupiah(nominalNum)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest (2%/mo × tenor)</span>
                    <span className="font-semibold">{formatRupiah(totalBunga)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Payment</span>
                    <span className="font-bold">{formatRupiah(totalBayar)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Installment / Month</span>
                    <span className="font-bold text-xl text-brand-green">
                      {formatRupiah(cicilanPerBulan)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white py-6 text-base"
              onClick={handleHitungSkor}
              disabled={isScoring || !isFormValid}
              data-ocid="apply.score_button"
            >
              {isScoring ? "Calculating AI Score..." : "🤖 Calculate Eligibility Score"}
            </Button>
          </div>
        </div>
      )}

      {step === "score" && scoreResult && (
        <div className="max-w-lg mx-auto" data-ocid="apply.confirm_state">
          <Card className="rounded-2xl shadow-card">
            <CardContent className="py-10 space-y-6">
              {/* Status analisis — tanpa detail skor */}
              <div className="text-center space-y-2">
                <div className="text-5xl">📋</div>
                <h3 className="text-xl font-bold text-foreground">
                  Analysis Complete
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your application has been reviewed. Confirm the details below
                  and submit to proceed.
                </p>
              </div>

              {/* Ringkasan pinjaman — tanpa skor AI */}
              <div className="bg-muted rounded-xl p-4 space-y-3 text-sm">
                {[
                  { label: "Loan Amount", value: formatRupiah(nominalNum) },
                  { label: "Tenor", value: `${tenorNum} months` },
                  { label: "Installment / Month", value: formatRupiah(cicilanPerBulan), green: true },
                  { label: "Purpose", value: tujuan },
                  { label: "Major", value: jurusan },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className={`font-semibold ${item.green ? "text-brand-green" : ""}`}>
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
                  {isSubmitting ? "Applying..." : "Submit Application"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
