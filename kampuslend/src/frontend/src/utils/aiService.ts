/**
 * AI Scoring Service — KampusLend
 *
 * File ini adalah titik integrasi tunggal untuk model AI penilaian risiko peminjam.
 *
 * Flow:
 *   1. Jika VITE_AI_SCORING_URL diset → panggil REST API eksternal (POST /predict)
 *   2. Jika tidak diset → fallback ke on-chain scoreApplicant() di Motoko canister
 *
 * Spec response API aktual (POST /predict):
 * {
 *   "Status Kelayakan": "Layak" | "Tidak Layak",
 *   "Credit Score": number,   // Skala FICO: 300–850
 *   "Keterangan": string      // Penjelasan analisis kelayakan
 * }
 *
 * Pemetaan ke ScoringResult internal:
 *   score          = ((Credit Score - 300) / 550) * 100  → dinormalisasi ke 0–100
 *   recommendation = "Approved" | "Considered" | "Reconsider"
 *   reason         = "Keterangan"
 */

import type { backendInterface, ScoringInput, ScoringResult } from "../backend";

// ─────────────────────────────────────────────────────────────────────────────
// Konfigurasi
// ─────────────────────────────────────────────────────────────────────────────

/**
 * URL endpoint AI model eksternal.
 * Set via environment variable: VITE_AI_SCORING_URL
 * Contoh: https://headstone-silo-overlying.ngrok-free.dev/predict
 */
const AI_SCORING_URL = import.meta.env.VITE_AI_SCORING_URL as string | undefined;

// ─────────────────────────────────────────────────────────────────────────────
// Tipe data model AI eksternal
// ─────────────────────────────────────────────────────────────────────────────

/** Data lengkap yang dikirim ke endpoint POST /predict */
export interface ExternalModelInput {
  // ── Categorical Features ──
  Home_Ownership: string;   // Kepemilikan rumah: Rent | Own | Mortgage
  Loan_Purpose: string;     // Tujuan pinjaman: Education | Venture | Personal | Medical
  Previous_Loan: string;    // Pernah memiliki pinjaman sebelumnya: No | Yes
  Working_Student: string;  // Status bekerja: Bekerja Karena Butuh | Bekerja Optional | Tidak Bekerja
  Parent_Job: string;       // Pekerjaan orang tua
  Residence_Type: string;   // Tipe tempat tinggal: Urban | Rural
  // -- Numerical Features --
  Payment_History: number;             // Riwayat pembayaran dalam bulan
  Parental_Income_IDR_Monthly: number; // Pendapatan bulanan orang tua (IDR)
  Loan_Amount_IDR: number;             // Jumlah nominal pinjaman (IDR)
  Loan_Int_Rate: number;               // Suku bunga pinjaman (fixed: 3%)
  Course_Credits: number;              // Jumlah SKS (18–24)
  Liability: number;                   // Jumlah tanggungan finansial
  Attendance: number;                  // Persentase kehadiran kuliah (0–100)
  Grade_Average: number;               // IPK (0.0–4.0)
}

/** Struktur respons JSON dari API model */
interface ExternalModelResponse {
  "Status Kelayakan": string;
  "Credit Score": number;
  "Keterangan": string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: gunakan Credit Score FICO langsung dari model (300–850)
// ─────────────────────────────────────────────────────────────────────────────

function roundCreditScore(ficoScore: number): number {
  return Math.round(ficoScore);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: petakan status kelayakan ke rekomendasi berdasarkan skor FICO
// ─────────────────────────────────────────────────────────────────────────────

function mapRecommendation(statusKelayakan: string, ficoScore: number): string {
  if (statusKelayakan === "Layak") {
    return ficoScore >= 650 ? "Approved" : "Considered";
  }
  return "Reconsider";
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: panggil REST API AI model eksternal
// ─────────────────────────────────────────────────────────────────────────────

async function callExternalAI(extInput: ExternalModelInput): Promise<ScoringResult> {
  // Debug: log payload sebelum dikirim ke API
  console.log("[AI] Payload yang dikirim:", JSON.stringify(extInput, null, 2));

  const response = await fetch(AI_SCORING_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Header wajib untuk bypass ngrok browser warning
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify(extInput),
  });

  if (!response.ok) {
    // Log detail error dari API (Pydantic validation errors)
    const errorBody = await response.text().catch(() => "(no body)");
    console.error(`[AI] HTTP ${response.status} error. Response body:`, errorBody);
    throw new Error(`AI API returned ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as ExternalModelResponse;

  // Gunakan Credit Score FICO langsung dari model (300–850), bukan di-normalisasi
  const ficoScore = roundCreditScore(data["Credit Score"]);
  const recommendation = mapRecommendation(data["Status Kelayakan"], ficoScore);

  return {
    score: BigInt(ficoScore),
    recommendation,
    reason: data["Keterangan"],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — digunakan oleh komponen/halaman
// ─────────────────────────────────────────────────────────────────────────────

export interface AIScoringParams {
  /** Backend actor (on-chain fallback) */
  actor: backendInterface;
  /** Data input untuk on-chain fallback */
  input: ScoringInput;
  /** Data input lengkap untuk model AI eksternal */
  externalInput?: ExternalModelInput;
}

/**
 * Hitung skor AI untuk seorang peminjam.
 *
 * - Jika VITE_AI_SCORING_URL dikonfigurasi DAN externalInput tersedia → panggil AI model eksternal
 * - Jika tidak → fallback ke on-chain scoreApplicant() di canister Motoko
 *
 * @returns ScoringResult dengan score (0–100), recommendation, dan reason
 */
export async function getAIScore({
  actor,
  input,
  externalInput,
}: AIScoringParams): Promise<ScoringResult> {
  if (AI_SCORING_URL && externalInput) {
    return callExternalAI(externalInput);
  }

  // Fallback: on-chain Motoko scoreApplicant
  return actor.scoreApplicant(input);
}

/**
 * Hitung skor AI untuk banyak pinjaman sekaligus (paralel).
 * Digunakan saat investor membuka Dashboard / Browse (legacy fallback).
 * Returns map dari loan ID (string) ke ScoringResult.
 *
 * Catatan: Setelah integrasi AI on-chain, fungsi ini hanya sebagai fallback
 * apabila aiRecommendation di loan kosong/belum tersedia.
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
