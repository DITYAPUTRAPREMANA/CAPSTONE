import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
/**
 * Halaman Portofolio Investor
 * Daftar semua pinjaman yang telah didanai investor
 */
import { useEffect, useState } from "react";
import type { Loan } from "../../backend";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../contexts/AuthContext";
import { useActor } from "../../hooks/useActor";
import { formatRupiah, toSafeBigInt } from "../../utils/format";

export default function InvestorPortfolio() {
  const { user } = useAuth();
  const { actor } = useActor();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [cicilanSisa, setCicilanSisa] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!actor || !user) return;
    actor
      .getLoansByInvestor(toSafeBigInt(user.userId))
      .then(async (data) => {
        setLoans(data);
        // Ambil sisa cicilan semua pinjaman aktif secara paralel
        const sisaPromises = data
          .filter((l) => l.status === "Active")
          .map(async (l) => {
            const sisa = await actor.getCicilanSisa(l.id);
            return { id: String(l.id), sisa };
          });
        const results = await Promise.all(sisaPromises);
        const sisaMap: Record<string, number> = {};
        for (const r of results) {
          sisaMap[r.id] = r.sisa;
        }
        setCicilanSisa(sisaMap);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [actor, user]);

  return (
    <div className="space-y-6" data-ocid="investor.portfolio.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Portfolio</h2>
        <p className="text-muted-foreground">
          All loans you have funded
        </p>
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
                const sisa = cicilanSisa[String(loan.id)] ?? Number(loan.tenor);
                const progress =
                  ((Number(loan.tenor) - sisa) / Number(loan.tenor)) * 100;

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

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-semibold">
                          {formatRupiah(loan.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Installment/mo
                        </p>
                        <p className="font-semibold">
                          {formatRupiah(loan.monthlyInstallment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Remaining Installment
                        </p>
                        <p className="font-semibold text-amber-600">
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
