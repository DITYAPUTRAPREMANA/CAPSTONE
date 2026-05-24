import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@tanstack/react-router";
/**
 * Dashboard utama Investor - ringkasan portofolio + daftar peminjam baru dengan analisis AI
 */
import { useEffect, useState } from "react";
import type { Loan, ScoringResult } from "../../backend";
import BorrowerCard from "../../components/BorrowerCard";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatRupiah, toSafeBigInt } from "../../utils/format";


export default function InvestorDashboard() {
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  // Pinjaman yang sudah diinvestasikan oleh investor ini
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [isLoadingMy, setIsLoadingMy] = useState(true);

  // Pinjaman peminjam baru yang belum ada investor (status Pending)
  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
  const [pendingScores, setPendingScores] = useState<Record<string, ScoringResult>>({});
  const [isLoadingPending, setIsLoadingPending] = useState(true);

  // Fetch pinjaman investor sendiri
  useEffect(() => {
    if (!actor || !user) return;
    actor
      .getLoansByInvestor(toSafeBigInt(user.userId))
      .then(setMyLoans)
      .catch(() => setMyLoans([]))
      .finally(() => setIsLoadingMy(false));
  }, [actor, user]);

  // Fetch semua pinjaman, filter Pending, baca AI score dari on-chain data
  useEffect(() => {
    if (!actor) return;
    actor
      .getAllLoans()
      .then((allLoans) => {
        const pending = allLoans.filter((l) => l.status === "Pending");
        setPendingLoans(pending);
        // Baca AI score langsung dari on-chain untuk semua loan
        const scoreMap: Record<string, ScoringResult> = {};
        for (const loan of pending) {
          scoreMap[String(loan.id)] = {
            score: loan.aiScore,
            recommendation: loan.aiRecommendation || "Pending",
            reason: loan.aiReason || "-",
          };
        }
        setPendingScores(scoreMap);
      })
      .catch(() => setPendingLoans([]))
      .finally(() => setIsLoadingPending(false));
  }, [actor]);

  const activeLoans = myLoans.filter((l) => l.status === "Active");
  const totalDanaAktif = activeLoans.reduce((sum, l) => sum + Number(l.amount), 0);
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="rounded-2xl"
            style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm" style={{ color: "#7a9ab5" }}>
                    {s.label}
                  </p>
                  {isLoadingMy ? (
                    <Skeleton className="h-7 w-32 mt-1" />
                  ) : (
                    <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  )}
                </div>
                <span className="text-3xl">{s.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card
        className="rounded-2xl"
        style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#1a3a5c" }}>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            className="w-full sm:w-auto rounded-xl text-white transition-all hover:brightness-110 h-11 sm:h-10"
            style={{ backgroundColor: "#1d6fbf" }}
            onClick={() => router.navigate({ to: "/investor/browse" })}
            data-ocid="investor.browse_button"
          >
            Browse Borrowers
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto rounded-xl transition-all h-11 sm:h-10"
            style={{ color: "#1d6fbf", borderColor: "#1d6fbf", backgroundColor: "transparent" }}
            onClick={() => router.navigate({ to: "/investor/portfolio" })}
            data-ocid="investor.portfolio_button"
          >
            View Portfolio
          </Button>
        </CardContent>
      </Card>

      {/* ===== NEW LOAN APPLICATIONS (Pending) ===== */}
      <Card
        className="rounded-2xl"
        style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold" style={{ color: "#1a3a5c" }}>
                🔔 New Loan Applications
              </CardTitle>
              <p className="text-sm mt-1" style={{ color: "#7a9ab5" }}>
                Borrowers waiting for funding — includes AI risk analysis
              </p>
            </div>
            {!isLoadingPending && pendingLoans.length > 0 && (
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: "#1d6fbf" }}
              >
                {pendingLoans.length} pending
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPending ? (
            <div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-ocid="investor.dashboard.pending.loading_state"
            >
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-2xl">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pendingLoans.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="investor.dashboard.pending.empty_state"
            >
              <p className="text-4xl mb-3">✅</p>
              <p style={{ color: "#7a9ab5" }}>No pending loan applications right now.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingLoans.map((loan, i) => (
                <BorrowerCard
                  key={String(loan.id)}
                  loan={loan}
                  aiScore={pendingScores[String(loan.id)] ?? null}
                  index={i + 1}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== ACTIVE LOANS (yang sudah diinvestasikan) ===== */}
      <Card
        className="rounded-2xl"
        style={{ boxShadow: "0 4px 12px rgba(15, 52, 116, 0.08)", border: "none" }}
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold" style={{ color: "#1a3a5c" }}>
            📊 My Funded Loans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMy ? (
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
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl cursor-pointer hover:brightness-95 transition-all gap-3 sm:gap-0"
                  style={{ backgroundColor: "#f3f8ff" }}
                  data-ocid={`investor.dashboard.item.${i + 1}`}
                  onClick={() =>
                    router.navigate({ to: `/investor/loan/${Number(loan.id)}` })
                  }
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#1a3a5c" }}>
                      {loan.borrowerName}
                    </p>
                    <p className="text-xs" style={{ color: "#7a9ab5" }}>
                      {loan.major} • {Number(loan.tenor)} months
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:gap-6">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-sm" style={{ color: "#1d6fbf" }}>
                        {formatRupiah(loan.amount)}
                      </p>
                      <p className="text-[10px] sm:text-xs" style={{ color: "#7a9ab5" }}>
                        {formatRupiah(loan.monthlyInstallment)}/mo
                      </p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                </div>
              ))}
              {activeLoans.length > 5 && (
                <button
                  type="button"
                  className="w-full text-center text-sm py-2 rounded-xl transition-all hover:brightness-95"
                  style={{ color: "#1d6fbf", backgroundColor: "#e8f0fb" }}
                  onClick={() => router.navigate({ to: "/investor/portfolio" })}
                >
                  View all {activeLoans.length} loans →
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
