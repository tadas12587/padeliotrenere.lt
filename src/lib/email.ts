import { Resend } from "resend";

// Lazy initialization – avoids throwing at build time when key is absent
let _resend: Resend | null = null;
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = process.env.EMAIL_FROM || "noreply@padeliotrenere.lt";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendBookingConfirmation({
  to,
  name,
  date,
  startTime,
  endTime,
  bookingId,
}: {
  to: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingId: string;
}) {
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM,
      to,
      subject: "✅ Treniruotė patvirtinta – padeliotrenere.lt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; padding: 30px; text-align: center;">
            <h1 style="color: #e94560; margin: 0; font-size: 28px;">🎾 Padelio Treneris</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Sveiki, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">Jūsų treniruotė sėkmingai užregistruota:</p>
            <div style="background: #f5f5f5; border-left: 4px solid #e94560; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📅 Data:</strong> ${date}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>⏰ Laikas:</strong> ${startTime} – ${endTime}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>🆔 Rezervacijos nr.:</strong> ${bookingId.slice(-8).toUpperCase()}</p>
            </div>
            <p style="color: #555;">Jeigu turite klausimų, susisiekite su mumis.</p>
            <a href="${APP_URL}/client/bookings"
               style="display: inline-block; background: #e94560; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Peržiūrėti rezervaciją
            </a>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 14px;">
            <p>© 2025 Padelio Treneris. Visi teisės saugomos.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
  }
}

export async function sendBookingReminder({
  to,
  name,
  date,
  startTime,
  endTime,
}: {
  to: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}) {
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM,
      to,
      subject: "⏰ Priminimas – treniruotė rytoj!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; padding: 30px; text-align: center;">
            <h1 style="color: #e94560; margin: 0; font-size: 28px;">🎾 Padelio Treneris</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Sveiki, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">Primename, kad rytoj turite treniruotę:</p>
            <div style="background: #f5f5f5; border-left: 4px solid #e94560; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📅 Data:</strong> ${date}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>⏰ Laikas:</strong> ${startTime} – ${endTime}</p>
            </div>
            <p style="color: #555;">Iki pasimatymo korte! 🎾</p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 14px;">
            <p>© 2025 Padelio Treneris. Visi teisės saugomos.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reminder email:", error);
  }
}

export async function sendBookingCancellation({
  to,
  name,
  date,
  startTime,
}: {
  to: string;
  name: string;
  date: string;
  startTime: string;
}) {
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM,
      to,
      subject: "❌ Treniruotė atšaukta",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1a2e; padding: 30px; text-align: center;">
            <h1 style="color: #e94560; margin: 0; font-size: 28px;">🎾 Padelio Treneris</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Sveiki, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">Deja, Jūsų treniruotė buvo atšaukta:</p>
            <div style="background: #fff5f5; border-left: 4px solid #e94560; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📅 Data:</strong> ${date}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>⏰ Laikas:</strong> ${startTime}</p>
            </div>
            <p style="color: #555;">Galite rezervuoti naują laiką mūsų svetainėje.</p>
            <a href="${APP_URL}/booking"
               style="display: inline-block; background: #e94560; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Rezervuoti naują laiką
            </a>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 14px;">
            <p>© 2025 Padelio Treneris. Visi teisės saugomos.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
  }
}
