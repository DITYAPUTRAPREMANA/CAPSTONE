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
  const [filter, setFilter] = useState("Pending");

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllLoans()
      .then((allLoans) => {
        setLoans(allLoans);
        // Baca AI score langsung dari on-chain untuk semua loan
        const scoreMap: Record<string, ScoringResult> = {};
        for (const loan of allLoans) {
          scoreMap[String(loan.id)] = {
            score: loan.aiScore,
            recommendation: loan.aiRecommendation || "Pending",
            reason: loan.aiReason || "-",
          };
        }
        setScores(scoreMap);
      })
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, [actor]);

  const filtered =
    filter === "All" ? loans : loans.filter((l) => l.status === filter);

  return (
    <div className="space-y-6" data-ocid="investor.browse.page">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Browse Borrowers</h2>
        <p className="text-muted-foreground">
          Choose a borrower you want to fund
        </p>
      </div>

      {/* Filter tabs */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="rounded-full bg-muted p-1 w-max sm:w-auto">
            <TabsTrigger
              value="Pending"
              className="rounded-full text-sm px-4"
              data-ocid="browse.filter.menunggu_tab"
            >
              Pending Funding
            </TabsTrigger>
            <TabsTrigger
              value="Active"
              className="rounded-full text-sm px-4"
              data-ocid="browse.filter.aktif_tab"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="All"
              className="rounded-full text-sm px-4"
              data-ocid="browse.filter.semua_tab"
            >
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
            No borrowers with status "{filter}"
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
