/**
 * Kartu tampilan skor AI untuk kelayakan peminjam
 */
import { Card, CardContent } from "@/components/ui/card";
import type { ScoringResult } from "../backend";

interface AIScoreCardProps {
  result: ScoringResult;
}

export default function AIScoreCard({ result }: AIScoreCardProps) {
  const score = Number(result.score);
  const isLayak = result.recommendation === "Layak";

  // Warna berdasarkan skor
  let scoreColor = "text-red-600";
  let bgColor = "bg-red-50";
  if (score >= 70) {
    scoreColor = "text-green-600";
    bgColor = "bg-green-50";
  } else if (score >= 50) {
    scoreColor = "text-amber-600";
    bgColor = "bg-amber-50";
  }

  // Parameter gauge lingkaran
  const dashArray = 2 * Math.PI * 40;
  const dashOffset = dashArray * (1 - score / 100);
  const strokeColor = isLayak ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";

  return (
    <Card className="rounded-2xl shadow-card">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Penilaian AI</h3>

        {/* Gauge lingkaran */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-32 h-32">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full -rotate-90"
              role="img"
              aria-label={`Skor AI: ${score} dari 100`}
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.6s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${scoreColor}`}>
                {score}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>
        </div>

        {/* Rekomendasi */}
        <div className={`rounded-xl p-3 text-center mb-3 ${bgColor}`}>
          <p className={`text-lg font-bold ${scoreColor}`}>
            {isLayak ? "✅ Layak" : "❌ Tidak Layak"}
          </p>
        </div>

        {/* Alasan */}
        <p className="text-sm text-muted-foreground text-center">
          {result.reason}
        </p>
      </CardContent>
    </Card>
  );
}
