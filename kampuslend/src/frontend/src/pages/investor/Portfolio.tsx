import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
/**
 * Halaman Portofolio Investor
 * Daftar semua pinjaman yang telah didanai investor
 */
import { useEffect, useState } from "react";
import type { Loan, Payment } from "../../backend";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatRupiah, toSafeBigInt } from "../../utils/format";

export default function InvestorPortfolio() {
  const { user } = useAuth();
  const { actor } = useActor();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [cicilanSisa, setCicilanSisa] = useState<Record<string, number>>({});
  const [paymentsMap, setPaymentsMap] = useState<Record<string, Payment[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || !user) return;
    setIsLoading(true);
    actor
      .getLoansByInvestor(toSafeBigInt(user.userId))
      .then(async (data) => {
        setLoans(data);

        // Ambil sisa cicilan dan payments semua pinjaman secara paralel
        const sisaMap: Record<string, number> = {};
        const pmtsMap: Record<string, Payment[]> = {};

        await Promise.all(
          data.map(async (l) => {
            try {
              const [sisa, pmts] = await Promise.all([
                l.status === "Paid" ? Promise.resolve(0) : actor.getCicilanSisa(l.id),
                actor.getPaymentsByLoan(l.id),
              ]);
              sisaMap[String(l.id)] = Number(sisa);
              pmtsMap[String(l.id)] = pmts;
            } catch {
              sisaMap[String(l.id)] = l.status === "Paid" ? 0 : Number(l.tenor);
              pmtsMap[String(l.id)] = [];
            }
          })
        );

        setCicilanSisa(sisaMap);
        setPaymentsMap(pmtsMap);
      })
      .catch(() => {
        setLoans([]);
        setPaymentsMap({});
      })
      .finally(() => setIsLoading(false));
  }, [actor, user]);

  const totalInvested = loans.reduce((sum, l) => sum + Number(l.amount), 0);
  const totalReturnReceived = Object.values(paymentsMap).reduce((sum, pmts) => {
    return sum + pmts.reduce((s, p) => s + Number(p.amount), 0);
  }, 0);
  const paidLoansCount = loans.filter((l) => l.status === "Paid").length;

  return (
    <div className="space-y-6" data-ocid="investor.portfolio.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Portfolio</h2>
        <p className="text-muted-foreground">
          All loans you have funded
        </p>
      </div>

      {/* Portfolio Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-none shadow-sm" style={{ backgroundColor: "rgba(0, 85, 150, 0.05)" }}>
          <CardContent className="p-6">
            <p className="text-sm font-semibold" style={{ color: "#7a9ab5" }}>Total Invested</p>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1 text-[#1d6fbf]">
                {formatRupiah(totalInvested)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm" style={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}>
          <CardContent className="p-6">
            <p className="text-sm font-semibold" style={{ color: "#7a9ab5" }}>Total Return Received</p>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1 text-emerald-600">
                {formatRupiah(totalReturnReceived)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm" style={{ backgroundColor: "rgba(245, 158, 11, 0.05)" }}>
          <CardContent className="p-6">
            <p className="text-sm font-semibold" style={{ color: "#7a9ab5" }}>Paid Off Loans</p>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <p className="text-2xl font-bold mt-1 text-amber-600">
                {paidLoansCount} / {loans.length} Loans
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Loan List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4" data-ocid="portfolio.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : loans.length === 0 ? (
            <div
              className="text-center py-12"
              data-ocid="portfolio.empty_state"
            >
              <p className="text-4xl mb-3">📂</p>
              <p className="text-muted-foreground">
                No loans in your portfolio yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {loans.map((loan, i) => {
                const sisa = loan.status === "Paid" ? 0 : (cicilanSisa[String(loan.id)] ?? Number(loan.tenor));
                const progress = ((Number(loan.tenor) - sisa) / Number(loan.tenor)) * 100;

                return (
                  <div
                    key={String(loan.id)}
                    className="border border-border rounded-xl p-4"
                    data-ocid={`portfolio.item.${i + 1}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{loan.borrowerName}</h3>
                        <p className="text-xs text-muted-foreground">
                          {loan.major}
                        </p>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm mb-3">
                      <div className="bg-muted/30 p-2 rounded-lg sm:bg-transparent sm:p-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Amount</p>
                        <p className="font-bold text-[#1d6fbf]">
                          {formatRupiah(loan.amount)}
                        </p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg sm:bg-transparent sm:p-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Installment/mo
                        </p>
                        <p className="font-bold">
                          {formatRupiah(loan.monthlyInstallment)}
                        </p>
                      </div>
                      <div className="bg-muted/30 p-2 rounded-lg sm:bg-transparent sm:p-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          Remaining
                        </p>
                        <p className="font-bold text-amber-600">
                          {sisa} months
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Payment Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
