/**
 * Utilitas format untuk SODALIS
 */

/** Format angka ke format Rupiah Indonesia */
export function formatRupiah(amount: number | bigint): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/** Format timestamp bigint ke tanggal DD/MM/YYYY */
export function formatDate(timestamp: bigint): string {
  // Timestamp dari ICP dalam nanodetik, konversi ke milidetik
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms > 0 ? ms : Date.now());
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Konversi bigint ke number */
export function formatBigInt(n: bigint): number {
  return Number(n);
}

/** Format angka besar dengan singkatan (1jt, 1M, dll) */
export function formatShort(amount: number | bigint): string {
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}Jt`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(0)}rb`;
  return formatRupiah(num);
}

/**
 * Safely convert a userId string (potentially from localStorage/URL params)
 * to BigInt. Strips any non-digit characters and quotes before conversion.
 * Prevents "Cannot convert X to a BigInt" runtime errors.
 */
export function toSafeBigInt(value: string | number | bigint): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(Math.floor(value));
  // Strip quotes, whitespace, and any non-digit characters
  const cleaned = String(value).replace(/[^\d]/g, "");
  if (!cleaned) throw new Error(`Cannot convert "${value}" to a safe BigInt`);
  return BigInt(cleaned);
}
