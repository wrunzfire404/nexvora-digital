/**
 * lib/email.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Modul pengiriman email otomatis menggunakan Resend.
 *
 * Setup:
 * 1. Daftar di https://resend.com (gratis 3000 email/bulan)
 * 2. Buat API Key di dashboard Resend
 * 3. Tambahkan ke .env: RESEND_API_KEY=re_xxxxxxxxx
 * 4. (Opsional) Verifikasi domain di Resend untuk domain custom.
 *    Jika belum verifikasi domain, gunakan: onboarding@resend.dev (testing)
 *    Untuk production, verifikasi nexvoradigital.store di Resend DNS settings.
 *
 * Environment variables:
 *   RESEND_API_KEY      — API Key dari Resend
 *   RESEND_FROM_EMAIL   — Pengirim email, default: "Nexvora Digital <noreply@nexvoradigital.store>"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Resend } from "resend";

// ─── Init Resend Client ───────────────────────────────────────────────────────
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY tidak dikonfigurasi, skip email");
    return null;
  }
  return new Resend(apiKey);
}

// ─── Format Rupiah ────────────────────────────────────────────────────────────
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Format Tanggal ───────────────────────────────────────────────────────────
function formatDate(date?: Date | null): string {
  const d = date ?? new Date();
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "long",
    timeStyle: "short",
  }) + " WIB";
}

// ─── HTML Template: Invoice + Akun Digital ───────────────────────────────────
function buildDeliveryEmailHtml({
  customerName,
  productTitle,
  productCategory,
  merchantRef,
  tripayRef,
  amount,
  paymentMethod,
  accountData,
  paidAt,
}: {
  customerName: string;
  productTitle: string;
  productCategory: string;
  merchantRef: string;
  tripayRef: string;
  amount: number;
  paymentMethod: string;
  accountData: string;
  paidAt?: Date | null;
}): string {
  const accountLines = accountData.split("\n").filter((l) => l.trim());

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pesanan Berhasil — Nexvora Digital</title>
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#111111;border:1px solid #222222;border-radius:20px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:40px 40px 32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:20px;">
                <div style="width:40px;height:40px;background:linear-gradient(135deg,#4f8ef7,#7c3aed);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                  <span style="color:#fff;font-size:20px;font-weight:900;line-height:1;">N</span>
                </div>
                <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">Nexvora Digital</span>
              </div>
              <div style="width:64px;height:64px;background:rgba(16,185,129,0.15);border:2px solid rgba(16,185,129,0.4);border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:28px;">✅</span>
              </div>
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.5px;">Pembayaran Berhasil!</h1>
              <p style="color:#9ca3af;font-size:14px;margin:0;">Terima kasih telah berbelanja di Nexvora Digital</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">

              <!-- Greeting -->
              <p style="color:#e5e7eb;font-size:15px;margin:0 0 24px;">
                Halo <strong style="color:#ffffff;">${customerName}</strong>, pesanan Anda telah dikonfirmasi dan akun digital sudah siap! 🎉
              </p>

              <!-- Order Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;margin-bottom:24px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 22px;border-bottom:1px solid #2a2a2a;">
                    <p style="color:#6b7280;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 4px;">Produk</p>
                    <p style="color:#ffffff;font-size:15px;font-weight:600;margin:0;">${productTitle}</p>
                    <p style="color:#4b5563;font-size:12px;margin:4px 0 0;">${productCategory}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 22px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#6b7280;font-size:13px;">Merchant Ref</span>
                        </td>
                        <td align="right" style="padding:5px 0;">
                          <span style="color:#d1d5db;font-size:13px;font-family:'Courier New',monospace;background:#0f0f0f;padding:2px 8px;border-radius:6px;">${merchantRef}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#6b7280;font-size:13px;">Tripay Ref</span>
                        </td>
                        <td align="right" style="padding:5px 0;">
                          <span style="color:#d1d5db;font-size:13px;font-family:'Courier New',monospace;background:#0f0f0f;padding:2px 8px;border-radius:6px;">${tripayRef}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#6b7280;font-size:13px;">Metode</span>
                        </td>
                        <td align="right" style="padding:5px 0;">
                          <span style="color:#d1d5db;font-size:13px;">${paymentMethod}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:5px 0;">
                          <span style="color:#6b7280;font-size:13px;">Waktu Bayar</span>
                        </td>
                        <td align="right" style="padding:5px 0;">
                          <span style="color:#d1d5db;font-size:13px;">${formatDate(paidAt)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0 5px;border-top:1px solid #2a2a2a;">
                          <span style="color:#9ca3af;font-size:14px;font-weight:600;">Total</span>
                        </td>
                        <td align="right" style="padding:10px 0 5px;border-top:1px solid #2a2a2a;">
                          <span style="color:#10b981;font-size:18px;font-weight:700;">${formatRupiah(amount)}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Account Data Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(79,142,247,0.08),rgba(124,58,237,0.08));border:1px solid rgba(79,142,247,0.25);border-radius:14px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="color:#93c5fd;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 12px;display:flex;align-items:center;gap:6px;">
                      🔑 &nbsp;Detail Akun Digital Anda
                    </p>
                    ${accountLines.map((line) => `
                    <div style="background:#0a0a0a;border:1px solid #1e3a5f;border-radius:10px;padding:12px 16px;margin-bottom:8px;">
                      <code style="color:#93c5fd;font-family:'Courier New',monospace;font-size:13px;word-break:break-all;line-height:1.6;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>
                    </div>`).join("")}
                    <p style="color:#4b5563;font-size:11px;margin:12px 0 0;line-height:1.6;">
                      ⚠️ Jangan bagikan detail akun ini kepada siapapun. Segera ganti password setelah login.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Help Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border:1px solid #2a2a2a;border-radius:14px;margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="color:#9ca3af;font-size:13px;margin:0 0 8px;font-weight:600;">Butuh Bantuan?</p>
                    <p style="color:#6b7280;font-size:12px;margin:0;line-height:1.7;">
                      Hubungi kami melalui Telegram: <a href="https://t.me/wrunzfire" style="color:#60a5fa;text-decoration:none;font-weight:600;">@wrunzfire</a><br/>
                      Sertakan nomor resi <code style="background:#0f0f0f;padding:1px 6px;border-radius:4px;color:#93c5fd;">${merchantRef}</code> saat menghubungi.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Invoice Persistent Link Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.04));border:1px solid rgba(16,185,129,0.25);border-radius:14px;margin-bottom:20px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="color:#10b981;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">
                      🔗 &nbsp;Link Pesanan Permanenmu
                    </p>
                    <p style="color:#9ca3af;font-size:12px;margin:0 0 12px;line-height:1.6;">
                      Simpan link ini untuk melihat detail akun &amp; akses Kode OTP kapan saja:
                    </p>
                    <a href="https://nexvoradigital.store/orders/${merchantRef}"
                       style="display:block;background:#0f1f1a;border:1px solid rgba(16,185,129,0.3);border-radius:10px;padding:10px 16px;color:#34d399;font-family:'Courier New',monospace;font-size:12px;text-decoration:none;word-break:break-all;line-height:1.5;">
                      nexvoradigital.store/orders/${merchantRef}
                    </a>
                    <p style="color:#374151;font-size:11px;margin:10px 0 0;">
                      ⏰ Akses OTP mandiri tersedia selama 48 jam setelah pembelian.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:8px;">
                <a href="https://nexvoradigital.store/products" style="display:inline-block;background:linear-gradient(135deg,#4f8ef7,#7c3aed);color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.3px;">
                  Belanja Lagi di Nexvora →
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #1f1f1f;padding:24px 36px;text-align:center;">
              <p style="color:#374151;font-size:11px;margin:0 0 6px;">
                Email ini dikirim otomatis oleh sistem Nexvora Digital.
              </p>
              <p style="color:#374151;font-size:11px;margin:0;">
                © 2025 Nexvora Digital · <a href="https://nexvoradigital.store" style="color:#4b5563;text-decoration:none;">nexvoradigital.store</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

// ─── Kirim Email Invoice + Akun ke Customer ───────────────────────────────────
export async function sendDeliveryEmail({
  customerName,
  customerEmail,
  productTitle,
  productCategory,
  merchantRef,
  tripayRef,
  amount,
  paymentMethod,
  accountData,
  paidAt,
}: {
  customerName: string;
  customerEmail: string;
  productTitle: string;
  productCategory: string;
  merchantRef: string;
  tripayRef: string;
  amount: number;
  paymentMethod: string;
  accountData: string;
  paidAt?: Date | null;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) return false;

  // Jika email pembeli adalah email internal Telegram bot, skip
  if (customerEmail.startsWith("tg_") && customerEmail.endsWith("@nexvora.digital")) {
    console.log("[Email] Skip email untuk customer Telegram bot:", customerEmail);
    return false;
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "Nexvora Digital <noreply@nexvoradigital.store>";

  try {
    const { data, error } = await resend.emails.send({
      from:    fromEmail,
      to:      [customerEmail],
      subject: `✅ Pesanan Berhasil — ${productTitle} | Nexvora Digital`,
      html:    buildDeliveryEmailHtml({
        customerName,
        productTitle,
        productCategory,
        merchantRef,
        tripayRef,
        amount,
        paymentMethod,
        accountData,
        paidAt,
      }),
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return false;
    }

    console.log(`[Email] ✅ Invoice terkirim ke ${customerEmail} — ID: ${data?.id}`);
    return true;

  } catch (err) {
    console.error("[Email] Unexpected error:", err);
    return false;
  }
}
