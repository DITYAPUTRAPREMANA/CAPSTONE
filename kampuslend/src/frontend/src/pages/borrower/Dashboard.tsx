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
import { formatDate, formatRupiah } from "../../utils/format";

export default function BorrowerDashboard() {
  const { user } = useAuth();
  const { actor } = useActor();
  const router = useRouter();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || !user) return;
    actor
      .getLoansByBorrower(BigInt(user.userId))
      .then(setLoans)
      .catch(() => setLoans([]))
      .finally(() => setIsLoading(false));
  }, [actor, user]);

  const activeLoan = loans.find((l) => l.status === "Aktif");
  const pendingLoan = loans.find((l) => l.status === "Menunggu");

  return (
    <div className="space-y-8" data-ocid="borrower.dashboard.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Dashboard Peminjam
        </h2>
        <p className="text-muted-foreground">Pantau status pinjaman Anda</p>
      </div>

      {isLoading ? (
        <Skeleton
          className="h-48 w-full rounded-2xl"
          data-ocid="borrower.dashboard.loading_state"
        />
      ) : activeLoan ? (
        <Card className="rounded-2xl shadow-card border-l-4 border-l-brand-green">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pinjaman Aktif</CardTitle>
              <StatusBadge status={activeLoan.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Nominal</p>
                <p className="font-bold text-brand-green">
                  {formatRupiah(activeLoan.amount)}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Tenor</p>
                <p className="font-bold">{Number(activeLoan.tenor)} bulan</p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Cicilan/bln</p>
                <p className="font-bold text-amber-600">
                  {formatRupiah(activeLoan.monthlyInstallment)}
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Mulai</p>
                <p className="font-bold">{formatDate(activeLoan.startDate)}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Tujuan: {activeLoan.purpose}
            </p>
            <Button
              className="rounded-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => router.navigate({ to: "/borrower/repayment" })}
              data-ocid="borrower.repayment_button"
            >
              Lihat Jadwal Cicilan
            </Button>
          </CardContent>
        </Card>
      ) : pendingLoan ? (
        <Card className="rounded-2xl shadow-card border-l-4 border-l-amber-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Pinjaman Diajukan</CardTitle>
              <StatusBadge status={pendingLoan.status} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-3">
              Pinjaman Anda sebesar {formatRupiah(pendingLoan.amount)} sedang
              menunggu persetujuan investor.
            </p>
            <div className="flex items-center gap-2 text-amber-600">
              <span className="animate-pulse">⏳</span>
              <span className="text-sm font-medium">Menunggu investor...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className="rounded-2xl shadow-card"
          data-ocid="borrower.dashboard.empty_state"
        >
          <CardContent className="py-12 text-center">
            <p className="text-5xl mb-4">📜</p>
            <h3 className="font-bold text-lg mb-2">Belum Ada Pinjaman Aktif</h3>
            <p className="text-muted-foreground mb-6">
              Ajukan pinjaman pertama Anda dan dapatkan dana untuk kebutuhan
              kuliah.
            </p>
            <Button
              className="rounded-full bg-amber-500 hover:bg-amber-600 text-white px-8"
              onClick={() => router.navigate({ to: "/borrower/apply" })}
              data-ocid="borrower.apply_button"
            >
              Ajukan Pinjaman
            </Button>
          </CardContent>
        </Card>
      )}

      {loans.length > 0 && (
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Pinjaman</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loans.map((loan, i) => (
                <div
                  key={String(loan.id)}
                  className="flex items-center justify-between p-3 bg-muted rounded-xl"
                  data-ocid={`borrower.dashboard.item.${i + 1}`}
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {formatRupiah(loan.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(loan.tenor)} bulan • {loan.purpose}
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
