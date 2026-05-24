/**
 * Kartu tampilan skor AI untuk kelayakan peminjam
 * Menampilkan skor FICO langsung dari model (300–850)
 */
import { Card, CardContent } from "@/components/ui/card";
import type { ScoringResult } from "../backend";

interface AIScoreCardProps {
  result: ScoringResult;
}

export default function AIScoreCard({ result }: AIScoreCardProps) {
  const score = Number(result.score); // FICO score: 300–850
  const isLayak = result.recommendation === "Approved" || result.recommendation === "Considered";

  // Warna berdasarkan skor FICO
  let scoreColor = "text-red-600";
  let bgColor = "bg-red-50";
  if (score >= 650) {
    scoreColor = "text-green-600";
    bgColor = "bg-green-50";
  } else if (score >= 500) {
    scoreColor = "text-amber-600";
    bgColor = "bg-amber-50";
  }

  // Konversi FICO ke persentase untuk gauge (300=0%, 850=100%)
  const scorePercent = Math.min(100, Math.max(0, ((score - 300) / 550) * 100));

  // Parameter gauge lingkaran
  const dashArray = 2 * Math.PI * 40;
  const dashOffset = dashArray * (1 - scorePercent / 100);
  const strokeColor = isLayak ? "#16a34a" : score >= 500 ? "#d97706" : "#dc2626";

  return (
    <Card className="rounded-2xl shadow-card">
      <CardContent className="p-6">
        <h3 className="font-semibold text-foreground mb-4">AI Assessment</h3>

        {/* Gauge lingkaran */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative w-32 h-32">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full -rotate-90"
              role="img"
              aria-label={`AI Score: ${score} (FICO)`}
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
              <span className={`text-2xl font-bold ${scoreColor}`}>
                {score}
              </span>
              <span className="text-xs text-muted-foreground">FICO</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Range: 300 – 850</p>
        </div>

        {/* Rekomendasi */}
        <div className={`rounded-xl p-3 text-center mb-3 font-semibold text-sm ${bgColor}`}>
          {isLayak ? `✅ ${result.recommendation}` : `❌ ${result.recommendation}`}
        </div>

        {/* Alasan */}
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          {result.reason}
        </p>
      </CardContent>
    </Card>
  );
}
