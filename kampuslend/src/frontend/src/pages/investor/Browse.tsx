import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
/**
 * Halaman Browse Peminjam untuk Investor
 * Menampilkan daftar peminjam dengan skor AI
 */
import { useEffect, useState } from "react";
import type { Loan, ScoringResult } from "../../backend";
import BorrowerCard from "../../components/BorrowerCard";
import { useActor } from "../../hooks/useActor";

export default function InvestorBrowse() {
  const { actor } = useActor();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [scores, setScores] = useState<Record<string, ScoringResult>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("Menunggu");

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllLoans()
      .then(async (allLoans) => {
        setLoans(allLoans);
        // Hitung skor AI untuk semua pinjaman secara paralel
        const scorePromises = allLoans.map(async (loan) => {
          try {
            const result = await actor.scoreApplicant({
              gpa: 3.0,
              tenor: loan.tenor,
              cleanHistory: true,
              amount: loan.amount,
              purpose: loan.purpose,
            });
            return { id: String(loan.id), result };
          } catch {
            return null;
          }
        });
        const results = await Promise.all(scorePromises);
        const scoreMap: Record<string, ScoringResult> = {};
        for (const r of results) {
          if (r) scoreMap[r.id] = r.result;
        }
        setScores(scoreMap);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [actor]);

  const filtered =
    filter === "Semua" ? loans : loans.filter((l) => l.status === filter);

  return (
    <div className="space-y-6" data-ocid="investor.browse.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Browse Peminjam</h2>
        <p className="text-muted-foreground">
          Pilih peminjam yang ingin Anda danai
        </p>
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="rounded-full bg-muted p-1">
          <TabsTrigger
            value="Menunggu"
            className="rounded-full text-sm"
            data-ocid="browse.filter.menunggu_tab"
          >
            Menunggu Pendanaan
          </TabsTrigger>
          <TabsTrigger
            value="Aktif"
            className="rounded-full text-sm"
            data-ocid="browse.filter.aktif_tab"
          >
            Aktif
          </TabsTrigger>
          <TabsTrigger
            value="Semua"
            className="rounded-full text-sm"
            data-ocid="browse.filter.semua_tab"
          >
            Semua
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grid kartu peminjam */}
      {isLoading ? (
        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-ocid="browse.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" data-ocid="browse.empty_state">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-muted-foreground text-lg">
            Tidak ada peminjam dengan status "{filter}"
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((loan, i) => (
            <BorrowerCard
              key={String(loan.id)}
              loan={loan}
              aiScore={scores[String(loan.id)] ?? null}
              index={i + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
