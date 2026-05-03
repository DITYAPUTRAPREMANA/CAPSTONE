import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@tanstack/react-router";
/**
 * Dashboard utama Investor - ringkasan portofolio
 */
import { useEffect, useState } from "react";
import type { Loan } from "../../backend";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatRupiah } from "../../utils/format";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || !user) return;
    actor
      .getLoansByInvestor(BigInt(user.userId))
      .then(setLoans)
      .catch(() => setLoans([]))
      .finally(() => setIsLoading(false));
  }, [actor, user]);

  const activeLoans = loans.filter((l) => l.status === "Active");
  const totalDanaAktif = activeLoans.reduce(
    (sum, l) => sum + Number(l.amount),
    0,
  );
  const totalReturn = activeLoans.reduce(
    (sum, l) => sum + l.monthlyInstallment * Number(l.tenor),
    0,
  );

  const stats = [
    {
      label: "Total Active Funds",
      value: formatRupiah(totalDanaAktif),
      icon: "💰",
      color: "text-brand-green",
    },
    {
      label: "Active Loans",
      value: String(activeLoans.length),
      icon: "📁",
      color: "text-brand-blue",
    },
    {
      label: "Total Return",
      value: formatRupiah(totalReturn),
      icon: "📈",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-8" data-ocid="investor.dashboard.page">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a3a5c" }}>
          Investor Dashboard
        </h2>
        <p style={{ color: "#7a9ab5" }}>Monitor your loan portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl" style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm" style={{ color: "#7a9ab5" }}>{s.label}</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-32 mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold mt-1 ${s.color}`}>
                      {s.value}
                    </p>
                  )}
                </div>
                <span className="text-3xl">{s.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl" style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}>
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#1a3a5c" }}>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            className="rounded-full text-white transition-all hover:brightness-110"
            style={{ backgroundColor: "#1d6fbf" }}
            onClick={() => router.navigate({ to: "/investor/browse" })}
            data-ocid="investor.browse_button"
          >
            Browse Borrowers
          </Button>
          <Button
            variant="outline"
            className="rounded-full transition-all"
            style={{ color: "#1d6fbf", borderColor: "#1d6fbf", backgroundColor: "transparent" }}
            onClick={() => router.navigate({ to: "/investor/portfolio" })}
            data-ocid="investor.portfolio_button"
          >
            View Portfolio
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl" style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}>
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#1a3a5c" }}>
            Active Loans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div
              className="space-y-3"
              data-ocid="investor.dashboard.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : activeLoans.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="investor.dashboard.empty_state"
            >
              <p className="text-4xl mb-3">📊</p>
              <p style={{ color: "#7a9ab5" }}>No active loans yet.</p>
              <Button
                className="mt-4 rounded-full text-white transition-all hover:brightness-110"
                style={{ backgroundColor: "#1d6fbf" }}
                onClick={() => router.navigate({ to: "/investor/browse" })}
              >
                Start Funding
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLoans.slice(0, 5).map((loan, i) => (
                <div
                  key={String(loan.id)}
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: "#f3f8ff" }}
                  data-ocid={`investor.dashboard.item.${i + 1}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#1a3a5c" }}>{loan.borrowerName}</p>
                    <p className="text-xs" style={{ color: "#7a9ab5" }}>
                      {loan.major} • {Number(loan.tenor)} months
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-sm" style={{ color: "#1d6fbf" }}>
                      {formatRupiah(loan.amount)}
                    </p>
                    <p className="text-xs" style={{ color: "#7a9ab5" }}>
                      Installment: {formatRupiah(loan.monthlyInstallment)}
                    </p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
