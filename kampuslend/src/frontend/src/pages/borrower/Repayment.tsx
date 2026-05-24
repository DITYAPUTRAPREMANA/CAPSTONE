import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@tanstack/react-router";
/**
 * Halaman Cicilan Peminjam
 */
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Loan, Payment } from "../../backend";
import RepaymentTimeline from "../../components/RepaymentTimeline";
import StatusBadge from "../../components/StatusBadge";
import VirtualAccountModal from "../../components/VirtualAccountModal";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatDate, formatRupiah, toSafeBigInt } from "../../utils/format";

export default function BorrowerRepayment() {
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cicilanSisa, setCicilanSisa] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showVA, setShowVA] = useState(false);
  const [vaNumber, setVaNumber] = useState("");
  const [isCreatingVA, setIsCreatingVA] = useState(false);

  useEffect(() => {
    if (!actor || !user) return;
    actor
      .getLoansByBorrower(toSafeBigInt(user.userId))
      .then(async (loans) => {
        const active = loans.find((l) => l.status === "Active");
        if (!active) {
          setIsLoading(false);
          return;
        }
        setLoan(active);
        const [pmts, sisa] = await Promise.all([
          actor.getPaymentsByLoan(active.id),
          actor.getCicilanSisa(active.id),
        ]);
        setPayments(pmts);
        setCicilanSisa(sisa);
      })
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, [actor, user]);

  const handleBayarCicilan = async () => {
    if (!actor || !loan) return;
    setIsCreatingVA(true);
    try {
      const va = await actor.createVirtualAccount(loan.id);
      setVaNumber(va);
      setShowVA(true);
    } catch {
      toast.error("Failed to create Virtual Account. Try again.");
    } finally {
      setIsCreatingVA(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4" data-ocid="repayment.loading_state">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-16" data-ocid="repayment.empty_state">
        <p className="text-5xl mb-4">💳</p>
        <h3 className="font-bold text-xl mb-2">No Active Loan</h3>
        <p className="text-muted-foreground mb-6">
          Apply for a loan first to view the installment schedule.
        </p>
        <Button
          className="rounded-full bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => router.navigate({ to: "/borrower/apply" })}
          data-ocid="repayment.apply_button"
        >
          Apply for Loan
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-ocid="repayment.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Installment Schedule</h2>
        <p className="text-muted-foreground">
          Monitor and pay your monthly installments
        </p>
      </div>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Loan Info</CardTitle>
            <StatusBadge status={loan.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-muted rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="font-bold text-brand-green">
                {formatRupiah(loan.amount)}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Installment/mo</p>
              <p className="font-bold text-amber-600">
                {formatRupiah(loan.monthlyInstallment)}
              </p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Remaining Installment</p>
              <p className="font-bold text-brand-blue">{cicilanSisa} months</p>
            </div>
            <div className="bg-muted rounded-xl p-3">
              <p className="text-xs text-muted-foreground">Total Tenor</p>
              <p className="font-bold">{Number(loan.tenor)} months</p>
            </div>
          </div>
          <Button
            className="rounded-full bg-amber-500 hover:bg-amber-600 text-white w-full md:w-auto"
            onClick={handleBayarCicilan}
            disabled={isCreatingVA || cicilanSisa === 0}
            data-ocid="repayment.pay_button"
          >
            {isCreatingVA
              ? "Creating VA..."
              : cicilanSisa === 0
                ? "✅ Paid Off"
                : "💳 Pay Installment via VA"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Installment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <RepaymentTimeline payments={payments} tenor={Number(loan.tenor)} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div
              className="text-center py-8"
              data-ocid="repayment.history.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                No payment history yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p, i) => (
                <div
                  key={String(p.id)}
                  className="flex items-center justify-between p-3 bg-muted rounded-xl"
                  data-ocid={`repayment.history.item.${i + 1}`}
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {formatRupiah(p.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(p.paymentDate)} • VA: {p.virtualAccount}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === "Paid" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {p.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining: {p.remainingInstallment} mo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showVA && (
        <VirtualAccountModal
          isOpen={showVA}
          vaNumber={vaNumber}
          amount={loan.monthlyInstallment}
          onClose={() => setShowVA(false)}
        />
      )}
    </div>
  );
}
