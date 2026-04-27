/**
 * lib/tempmail.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Core API Service: TempMail Bridge (Cloudflare Worker ↔ Nexvora)
 *
 * Menghubungkan ke API Worker di https://tempmail.oasuuu01.workers.dev
 * untuk membaca inbox email @booplink.xyz dan mengekstrak kode OTP.
 *
 * Contoh penggunaan:
 *   const result = await fetchTempMailOTP("akun01@booplink.xyz");
 *   // → { success: true, otp: "492011", rawMessage: "...", subject: "..." }
 * ─────────────────────────────────────────────────────────────────────────────
 */

const TEMPMAIL_API_BASE = "https://tempmail.oasuuu01.workers.dev";
const OTP_DOMAIN        = "@booplink.xyz";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TempMailMessage {
  id?:      string;
  from?:    string;
  subject?: string;
  body?:    string;   // Bisa HTML atau teks biasa
  date?:    string;
}

export interface OTPResult {
  success:    boolean;
  otp:        string | null;    // Kode OTP 4–6 digit jika ditemukan
  subject:    string | null;    // Subject email
  rawMessage: string | null;    // Body email (teks bersih)
  from:       string | null;    // Pengirim email
  error?:     string;           // Pesan error jika gagal
}

// ─── Helper: Bersihkan HTML ke Teks ──────────────────────────────────────────
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Helper: Ekstrak Kode OTP ─────────────────────────────────────────────────
function extractOTP(text: string): string | null {
  // Cari kode 4–6 digit angka dalam teks
  // Prioritas: digit yang berdiri sendiri (dikelilingi spasi/newline/tanda baca)
  const patterns = [
    /\b(\d{6})\b/g,  // 6 digit (paling umum untuk OTP)
    /\b(\d{4})\b/g,  // 4 digit
    /\b(\d{5})\b/g,  // 5 digit
  ];

  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern)];
    if (matches.length > 0) {
      // Ambil match pertama yang bukan tahun (1900–2099)
      for (const match of matches) {
        const num = match[1];
        if (!/^(19|20)\d{2}$/.test(num)) {
          return num;
        }
      }
    }
  }

  return null;
}

// ─── Main Function: fetchTempMailOTP ─────────────────────────────────────────
/**
 * Ambil pesan terbaru dari inbox email @booplink.xyz dan ekstrak kode OTP.
 *
 * @param emailAddress - Alamat email lengkap, contoh: "akun01@booplink.xyz"
 * @returns OTPResult - Objek hasil berisi OTP, subject, dan body email
 */
export async function fetchTempMailOTP(emailAddress: string): Promise<OTPResult> {
  // Validasi: hanya email @booplink.xyz yang didukung
  if (!emailAddress.endsWith(OTP_DOMAIN)) {
    return {
      success:    false,
      otp:        null,
      subject:    null,
      rawMessage: null,
      from:       null,
      error:      `Hanya email ${OTP_DOMAIN} yang didukung. Email ini: ${emailAddress}`,
    };
  }

  try {
    // Ekstrak username dari email (bagian sebelum @)
    const username = emailAddress.split("@")[0];

    // Panggil Cloudflare Worker API
    // Endpoint: GET https://tempmail.oasuuu01.workers.dev/?email=akun01@booplink.xyz
    const apiUrl = `${TEMPMAIL_API_BASE}/?email=${encodeURIComponent(emailAddress)}`;

    console.log(`[TempMail] Fetching inbox untuk: ${username}@booplink.xyz`);

    const response = await fetch(apiUrl, {
      method:  "GET",
      headers: { "Accept": "application/json" },
      signal:  AbortSignal.timeout(15_000), // Timeout 15 detik
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      console.error(`[TempMail] API error ${response.status}: ${errText}`);
      return {
        success:    false,
        otp:        null,
        subject:    null,
        rawMessage: null,
        from:       null,
        error:      `API error: ${response.status} — ${errText}`,
      };
    }

    const data = await response.json();

    // Handle berbagai format response dari Worker
    // Worker mungkin return: array of messages, atau object { messages: [] }, atau single message
    let messages: TempMailMessage[] = [];

    if (Array.isArray(data)) {
      messages = data;
    } else if (data && Array.isArray(data.messages)) {
      messages = data.messages;
    } else if (data && Array.isArray(data.data)) {
      messages = data.data;
    } else if (data && (data.body || data.subject)) {
      // Single message response
      messages = [data];
    }

    // Cek apakah inbox kosong
    if (messages.length === 0) {
      console.log(`[TempMail] Inbox kosong untuk: ${emailAddress}`);
      return {
        success:    false,
        otp:        null,
        subject:    null,
        rawMessage: null,
        from:       null,
        error:      "Belum ada pesan masuk. Silakan tunggu dan coba lagi.",
      };
    }

    // Ambil pesan TERBARU (index 0 atau sort by date)
    const latestMessage = messages[0];
    const rawBody       = latestMessage.body ?? "";
    const cleanText     = rawBody.includes("<") ? stripHtml(rawBody) : rawBody;
    const otpCode       = extractOTP(cleanText);

    console.log(
      `[TempMail] ✅ Pesan ditemukan — Subject: "${latestMessage.subject}" | OTP: ${otpCode ?? "tidak ditemukan"}`
    );

    return {
      success:    true,
      otp:        otpCode,
      subject:    latestMessage.subject ?? null,
      rawMessage: cleanText,
      from:       latestMessage.from ?? null,
    };

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[TempMail] ❌ Gagal fetch inbox:`, error);

    return {
      success:    false,
      otp:        null,
      subject:    null,
      rawMessage: null,
      from:       null,
      error:      `Koneksi ke server email gagal: ${errMsg}`,
    };
  }
}

// ─── Helper: Cek apakah email mendukung OTP ──────────────────────────────────
export function isOtpSupportedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.endsWith(OTP_DOMAIN);
}
