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
  Home_Ownership: string;             // Kepemilikan rumah (RENT / OWN / OTHER)
  Loan_Purpose: string;               // Tujuan pinjaman
  Payment_History: number;            // Riwayat pembayaran (0 = tidak ada / buruk, 1 = baik)
  Previous_Loan: string;              // Riwayat pinjaman sebelumnya (YES / NO)
  Parental_Income_IDR_Monthly: number; // Pendapatan bulanan orang tua (IDR)
  Loan_Amount_IDR: number;            // Jumlah nominal pinjaman (IDR)
  Working_Student: string;            // Mahasiswa bekerja (YES / NO)
  Course_Credits: number;             // Jumlah SKS
  Liability: number;                  // Jumlah tanggungan keluarga
  Attendance: number;                 // Persentase kehadiran kuliah (0–100)
  Grade_Average: number;              // Rata-rata nilai / IPK (0.0–4.0)
  Parent_Job: string;                 // Pekerjaan orang tua
  Residence_Type: string;             // Tipe tempat tinggal (URBAN / RURAL)
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
