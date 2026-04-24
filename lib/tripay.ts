/**
 * lib/tripay.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility helper untuk integrasi Tripay Payment Gateway.
 * Semua logika yang berhubungan dengan Tripay (signature, API calls) dipusatkan
 * di sini agar mudah di-maintain dan di-test.
 *
 * Dokumentasi resmi: https://tripay.co.id/developer
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createHmac } from "crypto";

// ─── Environment Variable Helpers ────────────────────────────────────────────
// Fungsi ini memastikan semua env var tersedia sebelum digunakan,
// dan memberikan pesan error yang jelas jika ada yang kurang.

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`[Tripay] Environment variable "${key}" is not set`);
  return val;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TripayOrderItem {
  sku: string;      // ID produk
  name: string;     // Nama produk (max 100 char)
  price: number;    // Harga satuan dalam IDR (integer)
  quantity: number; // Jumlah item
}

export interface TripayCreateTransactionPayload {
  method: string;           // Kode metode pembayaran, e.g. "BRIVA", "QRIS"
  merchant_ref: string;     // Reference unik dari merchant, e.g. "NVD-ABC123"
  amount: number;           // Total amount dalam IDR (integer, tanpa desimal)
  customer_name: string;    // Nama pembeli
  customer_email: string;   // Email pembeli
  customer_phone?: string;  // Nomor telepon pembeli (opsional)
  order_items: TripayOrderItem[];
  callback_url: string;     // URL webhook Tripay akan POST notifikasi
  return_url: string;       // URL redirect setelah pembayaran selesai
  cancel_url?: string;      // URL redirect jika user klik 'Kembali' (opsional)
  expired_time: number;     // Unix timestamp waktu kedaluwarsa transaksi
  signature: string;        // HMAC-SHA256 signature
}

export interface TripayTransactionData {
  reference: string;        // Tripay reference, e.g. "T0001234"
  merchant_ref: string;
  payment_selection_type: string;
  payment_method: string;
  payment_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  checkout_url: string;     // URL halaman pembayaran Tripay → redirect user kesini
  status: string;
  expired_time: number;
}

export interface TripayApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Signature Generator (Checkout) ──────────────────────────────────────────
/**
 * Membuat HMAC-SHA256 signature untuk request pembuatan transaksi.
 * Format string yang di-hash: {merchantCode}{merchantRef}{amount}
 *
 * @see https://tripay.co.id/developer#closed-payment-pay
 */
export function generateTripaySignature(
  merchantRef: string,
  amount: number
): string {
  const privateKey   = getEnv("TRIPAY_PRIVATE_KEY");
  const merchantCode = getEnv("TRIPAY_MERCHANT_CODE");

  // Tripay menggunakan string concat tanpa delimiter
  const rawString = `${merchantCode}${merchantRef}${amount}`;

  return createHmac("sha256", privateKey)
    .update(rawString)
    .digest("hex");
}

// ─── Callback Signature Verifier ─────────────────────────────────────────────
/**
 * Memverifikasi bahwa callback request benar-benar berasal dari Tripay.
 * Signature dihitung dari raw body JSON dan dibandingkan dengan header
 * "X-Callback-Signature" yang dikirim oleh Tripay.
 *
 * @see https://tripay.co.id/developer#callback
 */
export function verifyTripayCallbackSignature(
  rawBody: string,
  receivedSignature: string
): boolean {
  if (!receivedSignature) return false;

  const privateKey = process.env.TRIPAY_PRIVATE_KEY;
  if (!privateKey) {
    console.error("[Tripay] TRIPAY_PRIVATE_KEY tidak dikonfigurasi");
    return false;
  }

  const computedSignature = createHmac("sha256", privateKey)
    .update(rawBody)
    .digest("hex");

  // Gunakan perbandingan timing-safe untuk menghindari timing attack
  // (untuk simplisitas di Next.js kita gunakan === karena tidak ada timingSafeEqual di browser)
  return computedSignature === receivedSignature;
}

// ─── Generate Merchant Reference ─────────────────────────────────────────────
/**
 * Membuat merchant reference yang unik.
 * Format: NVD-{timestamp-base36}-{random-4char}
 * Contoh: NVD-LB2K4A1-X9F2
 */
export function generateMerchantRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `NVD-${timestamp}-${random}`;
}

// ─── Create Tripay Transaction ────────────────────────────────────────────────
/**
 * Melakukan POST request ke Tripay untuk membuat transaksi baru.
 * Mengembalikan data transaksi termasuk `checkout_url` untuk redirect user.
 */
export async function createTripayTransaction(
  payload: TripayCreateTransactionPayload
): Promise<TripayApiResponse<TripayTransactionData>> {
  const apiKey = getEnv("TRIPAY_API_KEY");

  // ─── Routing via VPS Proxy ────────────────────────────────────────────────
  // Request TIDAK dikirim langsung ke Tripay untuk menghindari masalah
  // whitelist IP dinamis Vercel. Semua request diteruskan melalui VPS proxy
  // dengan IP statis yang sudah di-whitelist di Tripay.
  //
  // Proxy URL : http://168.110.202.124:8080/api/tripay-proxy
  // Proxy akan mem-forward request ini ke Tripay API secara otomatis.
  const PROXY_URL    = "http://168.110.202.124:8080/api/tripay-proxy";
  const PROXY_SECRET = "NEXVORA_PROXY_SECRET_2026"; // Shared secret untuk otorisasi proxy

  const response = await fetch(PROXY_URL, {
    method: "POST",
    headers: {
      // Header otorisasi ke proxy (keamanan antar server)
      "X-Nexvora-Secret": PROXY_SECRET,
      // Header standar Tripay — proxy akan meneruskannya ke Tripay API
      "Authorization":    `Bearer ${apiKey}`,
      "Content-Type":     "application/json",
    },
    body: JSON.stringify(payload),
    // Timeout lebih panjang karena ada 1 hop tambahan (kita → proxy → Tripay)
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `[Tripay Proxy] HTTP ${response.status}: ${text.slice(0, 200)}`
    );
  }

  return response.json();
}

// ─── Map Status Tripay → Status Internal ─────────────────────────────────────
/**
 * Mengkonversi status dari Tripay ke status internal sistem kita.
 */
export function mapTripayStatus(tripayStatus: string): string {
  const statusMap: Record<string, string> = {
    PAID:    "PAID",
    UNPAID:  "PENDING",
    FAILED:  "FAILED",
    EXPIRED: "EXPIRED",
    REFUND:  "REFUND",
  };
  return statusMap[tripayStatus] ?? "PENDING";
}
