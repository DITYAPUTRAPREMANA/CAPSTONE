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

  const activeLoans = loans.filter((l) => l.status === "Aktif");
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
      label: "Total Dana Aktif",
      value: formatRupiah(totalDanaAktif),
      icon: "💰",
      color: "text-brand-green",
    },
    {
      label: "Pinjaman Aktif",
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
        <h2 className="text-2xl font-bold text-foreground">
          Dashboard Investor
        </h2>
        <p className="text-muted-foreground">Pantau portofolio pinjaman Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s) => (
          <Card key={s.label} className="rounded-2xl shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
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

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Aksi Cepat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button
            className="rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white"
            onClick={() => router.navigate({ to: "/investor/browse" })}
            data-ocid="investor.browse_button"
          >
            Browse Peminjam
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-navy text-navy hover:bg-navy hover:text-white"
            onClick={() => router.navigate({ to: "/investor/portfolio" })}
            data-ocid="investor.portfolio_button"
          >
            Lihat Portofolio
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">
            Pinjaman Aktif
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
              <p className="text-muted-foreground">Belum ada pinjaman aktif.</p>
              <Button
                className="mt-4 rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white"
                onClick={() => router.navigate({ to: "/investor/browse" })}
              >
                Mulai Mendanai
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLoans.slice(0, 5).map((loan, i) => (
                <div
                  key={String(loan.id)}
                  className="flex items-center justify-between p-4 bg-muted rounded-xl"
                  data-ocid={`investor.dashboard.item.${i + 1}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{loan.borrowerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {loan.major} • {Number(loan.tenor)} bulan
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-sm">
                      {formatRupiah(loan.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Cicilan: {formatRupiah(loan.monthlyInstallment)}
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
