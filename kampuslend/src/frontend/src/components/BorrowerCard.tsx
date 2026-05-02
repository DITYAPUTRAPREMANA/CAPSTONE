import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
/**
 * Kartu peminjam untuk halaman Browse Investor
 */
import { useRouter } from "@tanstack/react-router";
import type { Loan, ScoringResult } from "../backend";
import { formatRupiah } from "../utils/format";
import StatusBadge from "./StatusBadge";

interface BorrowerCardProps {
  loan: Loan;
  aiScore: ScoringResult | null;
  index: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function BorrowerCard({
  loan,
  aiScore,
  index,
}: BorrowerCardProps) {
  const router = useRouter();
  const score = aiScore ? Number(aiScore.score) : 0;
  const isLayak = aiScore?.recommendation === "Approved" || aiScore?.recommendation === "Considered";

  return (
    <Card
      className="rounded-2xl shadow-card hover:shadow-lg transition-shadow cursor-pointer"
      data-ocid={`borrower.item.${index}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {getInitials(loan.borrowerName)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {loan.borrowerName}
            </h3>
            <p className="text-sm text-muted-foreground">{loan.major}</p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Amount</p>
            <p className="font-semibold text-foreground">
              {formatRupiah(loan.amount)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Tenor</p>
            <p className="font-semibold text-foreground">
              {Number(loan.tenor)} months
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Installment/mo</p>
            <p className="font-semibold text-foreground">
              {formatRupiah(loan.monthlyInstallment)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Purpose</p>
            <p className="font-medium text-foreground text-xs truncate">
              {loan.purpose}
            </p>
          </div>
        </div>

        {aiScore ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">AI Score</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{score}/100</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isLayak ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                >
                  {aiScore.recommendation}
                </span>
              </div>
            </div>
            <Progress value={score} className="h-2" />
          </div>
        ) : (
          <div className="mb-4 h-8 flex items-center">
            <span className="text-xs text-muted-foreground">
              Calculating score...
            </span>
          </div>
        )}

        <Button
          className="w-full rounded-full bg-brand-blue hover:bg-brand-blue/90 text-white"
          onClick={() =>
            router.navigate({ to: `/investor/loan/${Number(loan.id)}` })
          }
          data-ocid={`borrower.detail_button.${index}`}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
