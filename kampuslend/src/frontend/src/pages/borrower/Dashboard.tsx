import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@tanstack/react-router";
/**
 * Dashboard utama Peminjam
 */
import { useEffect, useState } from "react";
import type { Loan } from "../../backend";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatDate, formatRupiah, toSafeBigInt } from "../../utils/format";

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || !user) return;
    actor
      .getLoansByBorrower(toSafeBigInt(user.userId))
      .then(setLoans)
      .catch(() => setLoans([]))
      .finally(() => setIsLoading(false));
  }, [actor, user]);

  const activeLoan = loans.find((l) => l.status === "Active");
  const pendingLoan = loans.find((l) => l.status === "Pending");

  return (
    <div className="space-y-8" data-ocid="borrower.dashboard.page">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a3a5c" }}>
          Borrower Dashboard
        </h2>
        <p style={{ color: "#7a9ab5" }}>Monitor your loan status</p>
      </div>

      {isLoading ? (
        <Skeleton
          className="h-48 w-full rounded-2xl"
          data-ocid="borrower.dashboard.loading_state"
        />
      ) : activeLoan ? (
        <Card className="rounded-2xl border-l-4" style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", borderLeftColor: "#1d6fbf", border: "none", borderLeft: "4px solid #1d6fbf" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Loan</CardTitle>
              <StatusBadge status={activeLoan.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl p-3" style={{ backgroundColor: "#f3f8ff" }}>
                <p className="text-xs" style={{ color: "#7a9ab5" }}>Amount</p>
                <p className="font-bold" style={{ color: "#1d6fbf" }}>
                  {formatRupiah(activeLoan.amount)}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "#f3f8ff" }}>
                <p className="text-xs" style={{ color: "#7a9ab5" }}>Tenor</p>
                <p className="text-bold">{Number(activeLoan.tenor)} months</p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "#f3f8ff" }}>
                <p className="text-xs" style={{ color: "#7a9ab5" }}>Installment/mo</p>
                <p className="font-bold" style={{ color: "#1a3a5c" }}>
                  {formatRupiah(activeLoan.monthlyInstallment)}
                </p>
              </div>
              <div className="rounded-xl p-3" style={{ backgroundColor: "#f3f8ff" }}>
                <p className="text-xs" style={{ color: "#7a9ab5" }}>Start</p>
                <p className="font-bold">{formatDate(activeLoan.startDate)}</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: "#4a5568" }}>
              Purpose: {activeLoan.purpose}
            </p>
            <Button
              className="rounded-full text-white transition-all hover:brightness-110"
              style={{ backgroundColor: "#1d6fbf" }}
              onClick={() => router.navigate({ to: "/borrower/repayment" })}
              data-ocid="borrower.repayment_button"
            >
              View Installment Schedule
            </Button>
          </CardContent>
        </Card>
      ) : pendingLoan ? (
        <Card className="rounded-2xl" style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", borderLeft: "4px solid #f59e0b", borderTop: "none", borderRight: "none", borderBottom: "none" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Applied Loan</CardTitle>
              <StatusBadge status={pendingLoan.status} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-3">
              Your loan of {formatRupiah(pendingLoan.amount)} is waiting for investor approval.
            </p>
            <div className="flex items-center gap-2 text-amber-600">
              <span className="animate-pulse">⏳</span>
              <span className="text-sm font-medium">Waiting for investor...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="rounded-2xl"
          style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}
          data-ocid="borrower.dashboard.empty_state"
        >
          <CardContent className="py-12 text-center">
            <p className="text-5xl mb-4">📜</p>
            <h3 className="font-bold text-lg mb-2" style={{ color: "#1a3a5c" }}>No Active Loans Yet</h3>
            <p className="mb-6" style={{ color: "#7a9ab5" }}>
              Apply for your first loan and get funds for college needs.
            </p>
            <Button
              className="rounded-full text-white px-8 transition-all hover:brightness-110"
              style={{ backgroundColor: "#1d6fbf" }}
              onClick={() => router.navigate({ to: "/borrower/apply" })}
              data-ocid="borrower.apply_button"
            >
              Apply for Loan
            </Button>
          </CardContent>
        </Card>
      )}

      {loans.length > 0 && (
        <Card className="rounded-2xl" style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}>
          <CardHeader>
            <CardTitle className="text-lg" style={{ color: "#1a3a5c" }}>Loan History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.map((loan, i) => (
                <div
                  key={String(loan.id)}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: "#f3f8ff" }}
                  data-ocid={`borrower.dashboard.item.${i + 1}`}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1a3a5c" }}>
                      {formatRupiah(loan.amount)}
                    </p>
                    <p className="text-xs" style={{ color: "#7a9ab5" }}>
                      {Number(loan.tenor)} months • {loan.purpose}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
