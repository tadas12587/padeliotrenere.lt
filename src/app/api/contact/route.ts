import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { rateLimit } from "@/lib/rateLimit";

let _resend: Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "noreply@padeliotrenere.lt";
const TRAINER_EMAIL =
  process.env.TRAINER_EMAIL || process.env.ADMIN_EMAIL || "info@padeliotrenere.lt";

const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(5).max(2000),
});

export async function POST(req: NextRequest) {
  // Rate limit: max 5 žinutės per valandą iš vieno IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const rl = rateLimit({ key: `contact:${ip}`, limit: 5, windowMs: 60 * 60 * 1000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Per daug užklausų. Pabandykite vėliau." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neteisingi duomenys", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parsed.data;

  const r = getResend();
  if (!r) {
    // Resend not configured – log and return success so the form doesn't break
    console.log("[contact] Email not sent (no RESEND_API_KEY):", { name, email, subject });
    return NextResponse.json({ success: true });
  }

  try {
    // Notify trainer
    await r.emails.send({
      from: FROM,
      to: TRAINER_EMAIL,
      replyTo: email,
      subject: `📬 Nauja žinutė: ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0;">
            <h2 style="color:#e94560;margin:0;font-size:20px;">📬 Nauja kontaktinė žinutė</h2>
          </div>
          <div style="padding:24px;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;width:100px;">Vardas</td><td style="padding:8px 0;font-weight:600;color:#111827;">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">El. paštas</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#e94560;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;font-size:13px;">Tema</td><td style="padding:8px 0;font-weight:600;color:#111827;">${subject}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
            <p style="color:#374151;line-height:1.6;white-space:pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    });

    // Auto-reply to sender
    await r.emails.send({
      from: FROM,
      to: email,
      subject: "✅ Gavome jūsų žinutę – padeliotrenere.lt",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#1a1a2e;padding:24px;text-align:center;">
            <h1 style="color:#e94560;margin:0;font-size:24px;">🎾 Padelio Treneris</h1>
          </div>
          <div style="padding:28px;background:#fff;">
            <h2 style="color:#1a1a2e;margin-top:0;">Sveiki, ${name}!</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;">
              Gavome jūsų žinutę tema <strong>${subject}</strong>.<br/>
              Atsakysime kuo greičiau — paprastai per 24 val. darbo dienomis.
            </p>
            <div style="background:#f5f5f5;border-left:4px solid #e94560;padding:16px;margin:20px 0;border-radius:4px;">
              <p style="margin:0;color:#555;font-size:14px;white-space:pre-wrap;">${message}</p>
            </div>
            <p style="color:#999;font-size:13px;">Iki pasimatymo korte! 🎾</p>
          </div>
          <div style="background:#f5f5f5;padding:16px;text-align:center;color:#999;font-size:13px;">
            © ${new Date().getFullYear()} Padelio Treneris
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[contact] Email send failed:", err);
    // Don't expose email errors to the client
  }

  return NextResponse.json({ success: true });
}
