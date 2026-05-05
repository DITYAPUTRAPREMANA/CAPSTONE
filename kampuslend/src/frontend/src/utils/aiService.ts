/**
 * AI Scoring Service — KampusLend
 *
 * File ini adalah titik integrasi tunggal untuk model AI penilaian risiko peminjam.
 * Saat model AI eksternal selesai, cukup implementasikan `callExternalAI()` di bawah
 * dan ubah env var VITE_AI_SCORING_URL di file .env / env.json.
 *
 * Flow:
 *   1. Jika VITE_AI_SCORING_URL diset → panggil REST API eksternal (model AI baru)
 *   2. Jika tidak diset → fallback ke on-chain scoreApplicant() di Motoko canister
 */

import type { backendInterface, ScoringInput, ScoringResult } from "../backend";

// ─────────────────────────────────────────────────────────────────────────────
// Konfigurasi — ubah hanya bagian ini saat AI API sudah siap
// ─────────────────────────────────────────────────────────────────────────────

/**
 * URL endpoint AI model eksternal.
 * Set via environment variable: VITE_AI_SCORING_URL
 *
 * Contoh: https://ai.kampuslend.id/api/v1/score
 *
 * Spec request yang diharapkan (POST JSON):
 * {
 *   "gpa": number,           // IPK peminjam (0.0–4.0)
 *   "tenor": number,         // Tenor pinjaman dalam bulan
 *   "cleanHistory": boolean, // Riwayat pembayaran bersih
 *   "amount": number,        // Jumlah pinjaman dalam IDR
 *   "purpose": string        // Tujuan pinjaman
 * }
 *
 * Spec response yang diharapkan (JSON):
 * {
 *   "score": number,           // Skor risiko 0–100
 *   "recommendation": string,  // "Approved" | "Considered" | "Rejected"
 *   "reason": string           // Penjelasan singkat keputusan AI
 * }
 */
const AI_SCORING_URL = import.meta.env.VITE_AI_SCORING_URL as string | undefined;

// ─────────────────────────────────────────────────────────────────────────────
// Internal: panggil REST API AI model eksternal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @TODO Implementasikan saat AI API sudah siap.
 * Sesuaikan body request dan mapping response dengan spec API yang disepakati tim ML.
 */
async function callExternalAI(input: ScoringInput): Promise<ScoringResult> {
  const response = await fetch(AI_SCORING_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // @TODO: Tambahkan API key jika diperlukan:
      // "Authorization": `Bearer ${import.meta.env.VITE_AI_API_KEY}`,
    },
    body: JSON.stringify({
      gpa: input.gpa,
      tenor: Number(input.tenor),
      cleanHistory: input.cleanHistory,
      amount: Number(input.amount),
      purpose: input.purpose,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API returned ${response.status}: ${response.statusText}`);
  }

  // @TODO: Sesuaikan mapping field ini dengan response aktual dari tim ML
  const data = (await response.json()) as {
    score: number;
    recommendation: string;
    reason: string;
  };

  return {
    score: BigInt(Math.round(data.score)),
    recommendation: data.recommendation,
    reason: data.reason,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — digunakan oleh komponen/halaman
// ─────────────────────────────────────────────────────────────────────────────

export interface AIScoringParams {
  /** Backend actor (on-chain fallback) */
  actor: backendInterface;
  /** Data input untuk scoring */
  input: ScoringInput;
}

/**
 * Hitung skor AI untuk seorang peminjam.
 *
 * - Jika VITE_AI_SCORING_URL dikonfigurasi → panggil AI model eksternal
 * - Jika tidak → fallback ke on-chain scoreApplicant() di canister Motoko
 *
 * @returns ScoringResult dengan score (0-100), recommendation, dan reason
 */
export async function getAIScore({
  actor,
  input,
}: AIScoringParams): Promise<ScoringResult> {
  if (AI_SCORING_URL) {
    // Gunakan AI model eksternal
    return callExternalAI(input);
  }

  // Fallback: on-chain Motoko scoreApplicant
  return actor.scoreApplicant(input);
}

/**
 * Hitung skor AI untuk banyak pinjaman sekaligus (paralel).
 * Returns map dari loan ID (string) ke ScoringResult.
 *
 * Error per-pinjaman diabaikan (tidak melempar) agar satu kegagalan
 * tidak membatalkan seluruh batch.
 */
export async function getAIScoresBatch(
  actor: backendInterface,
  loans: Array<{ id: bigint; tenor: bigint; amount: bigint; purpose: string }>,
  defaultGpa = 3.0,
  defaultCleanHistory = true,
): Promise<Record<string, ScoringResult>> {
  const results = await Promise.all(
    loans.map(async (loan) => {
      try {
        const result = await getAIScore({
          actor,
          input: {
            gpa: defaultGpa,
            tenor: loan.tenor,
            cleanHistory: defaultCleanHistory,
            amount: loan.amount,
            purpose: loan.purpose,
          },
        });
        return { id: String(loan.id), result };
      } catch {
        return null;
      }
    }),
  );

  const scoreMap: Record<string, ScoringResult> = {};
  for (const r of results) {
    if (r) scoreMap[r.id] = r.result;
  }
  return scoreMap;
}
