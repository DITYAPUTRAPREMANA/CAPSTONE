import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams, useRouter } from "@tanstack/react-router";
/**
 * Halaman Detail Pinjaman untuk Investor
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Loan, ScoringResult } from "../../backend";
import AIScoreCard from "../../components/AIScoreCard";
import AkadModal from "../../components/AkadModal";
import StatusBadge from "../../components/StatusBadge";
import VirtualAccountModal from "../../components/VirtualAccountModal";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatRupiah, toSafeBigInt } from "../../utils/format";

export default function InvestorLoanDetail() {
  // Ambil parameter id dari URL
  const params = useParams({ strict: false }) as { id?: string };
  const id = params.id;
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [score, setScore] = useState<ScoringResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAkad, setShowAkad] = useState(false);
  const [showVA, setShowVA] = useState(false);
  const [vaNumber, setVaNumber] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    if (!actor || !id) return;
    const loanId = toSafeBigInt(id);
    actor
      .getLoan(loanId)
      .then((loanData) => {
        setLoan(loanData);
        // Baca hasil AI dari data on-chain (sudah disimpan saat peminjam apply)
        if (loanData.aiRecommendation) {
          setScore({
            score: loanData.aiScore,
            recommendation: loanData.aiRecommendation,
            reason: loanData.aiReason,
          });
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [actor, id]);

  const handleConfirmAkad = async () => {
    if (!actor || !loan || !user) return;
    setIsApproving(true);
    try {
      await actor.approveLoan(loan.id, toSafeBigInt(user.userId));
      const va = await actor.createVirtualAccount(loan.id);
      setVaNumber(va);
      setShowAkad(false);
      setShowVA(true);
      toast.success("Loan successfully approved!");
      const updated = await actor.getLoan(loan.id);
      setLoan(updated);
    } catch {
      toast.error("Failed to process approval. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="loan.detail.loading_state">
        <Skeleton className="h-8 w-48" />
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loan not found.</p>
        <Button
          className="mt-4 rounded-full"
          onClick={() => router.navigate({ to: "/investor/browse" })}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="loan.detail.page">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          onClick={() => router.navigate({ to: "/investor/browse" })}
          className="hover:text-foreground"
        >
          Browse Borrowers
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{loan.borrowerName}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">
                    {loan.borrowerName}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    {loan.major}
                  </p>
                </div>
                <StatusBadge status={loan.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: "Loan Amount",
                    value: formatRupiah(loan.amount),
                    highlight: true,
                  },
                  { label: "Tenor", value: `${Number(loan.tenor)} months` },
                  {
                    label: "Installment / Month",
                    value: formatRupiah(loan.monthlyInstallment),
                    highlight: true,
                  },
                  {
                    label: "Total Payment",
                    value: formatRupiah(
                      loan.monthlyInstallment * Number(loan.tenor),
                    ),
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-muted rounded-xl p-3">
                    <p className="text-xs text-muted-foreground">
                      {item.label}
                    </p>
                    <p
                      className={`font-bold mt-1 ${item.highlight ? "text-brand-green" : "text-foreground"}`}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Loan Purpose
                </p>
                <p className="text-sm font-medium">{loan.purpose}</p>
              </div>
            </CardContent>
          </Card>

          {loan.status === "Pending" && (
            <Button
              className="w-full rounded-full bg-brand-green hover:bg-brand-green/90 text-white py-6 text-lg"
              onClick={() => setShowAkad(true)}
              data-ocid="loan.danai_button"
            >
              💰 Fund Now
            </Button>
          )}

          {loan.status !== "Pending" && (
            <div className="bg-blue-50 rounded-2xl p-4 text-center">
              <p className="text-blue-700 font-semibold">
                This loan is already {loan.status}
              </p>
            </div>
          )}
        </div>

        <div>
          {score ? (
            <AIScoreCard result={score} />
          ) : (
            <Card className="rounded-2xl shadow-card">
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showAkad && (
        <AkadModal
          isOpen={showAkad}
          loan={loan}
          onConfirm={handleConfirmAkad}
          onClose={() => setShowAkad(false)}
          isLoading={isApproving}
        />
      )}

      {showVA && (
        <VirtualAccountModal
          isOpen={showVA}
          vaNumber={vaNumber}
          amount={Number(loan.amount)}
          onClose={() => setShowVA(false)}
        />
      )}
    </div>
  );
}
