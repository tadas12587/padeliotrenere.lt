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
            <h1 style="color: #FF5733; margin: 0; font-size: 28px;">🎾 Padelio Treneris</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Sveiki, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">Jūsų treniruotė sėkmingai užregistruota:</p>
            <div style="background: #f5f5f5; border-left: 4px solid #FF5733; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📅 Data:</strong> ${date}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>⏰ Laikas:</strong> ${startTime} – ${endTime}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>🆔 Rezervacijos nr.:</strong> ${bookingId.slice(-8).toUpperCase()}</p>
            </div>
            <p style="color: #555;">Jeigu turite klausimų, susisiekite su mumis.</p>
            <a href="${APP_URL}/client/bookings"
               style="display: inline-block; background: #FF5733; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
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
            <h1 style="color: #FF5733; margin: 0; font-size: 28px;">🎾 Padelio Treneris</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Sveiki, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">Primename, kad rytoj turite treniruotę:</p>
            <div style="background: #f5f5f5; border-left: 4px solid #FF5733; padding: 20px; margin: 20px 0; border-radius: 4px;">
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

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  try {
    const r = getResend(); if (!r) return; await r.emails.send({
      from: FROM,
      to,
      subject: "🔑 Slaptažodžio atstatymas – padeliotrenere.lt",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0B5C71; padding: 30px; text-align: center;">
            <h1 style="color: #FF5733; margin: 0; font-size: 24px;">padeliotrenere.lt</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #0B5C71;">Slaptažodžio atstatymas</h2>
            <p style="color: #555; font-size: 16px;">Gavome užklausą atstatyti jūsų paskyros slaptažodį.</p>
            <p style="color: #555;">Spustelkite žemiau esantį mygtuką, kad nustatytumėte naują slaptažodį. Nuoroda galioja <strong>1 valandą</strong>.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; background: #FF5733; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Atstatyti slaptažodį
              </a>
            </div>
            <p style="color: #999; font-size: 14px;">Jei neprašėte atstatyti slaptažodžio, tiesiog ignoruokite šį laišką.</p>
            <p style="color: #ccc; font-size: 12px; word-break: break-all;">Arba atidarykite šią nuorodą naršyklėje: ${resetUrl}</p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 14px;">
            <p>© 2025 padeliotrenere.lt. Visos teisės saugomos.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
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
            <h1 style="color: #FF5733; margin: 0; font-size: 28px;">🎾 Padelio Treneris</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1a1a2e;">Sveiki, ${name}!</h2>
            <p style="color: #555; font-size: 16px;">Deja, Jūsų treniruotė buvo atšaukta:</p>
            <div style="background: #fff5f5; border-left: 4px solid #FF5733; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📅 Data:</strong> ${date}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>⏰ Laikas:</strong> ${startTime}</p>
            </div>
            <p style="color: #555;">Galite rezervuoti naują laiką mūsų svetainėje.</p>
            <a href="${APP_URL}/booking"
               style="display: inline-block; background: #FF5733; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
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

export async function sendBookingConfirmationNew({
  to,
  clientName,
  trainerName,
  arenaName,
  startTime,
  endTime,
  bookingId,
  isGroup,
}: {
  to: string;
  clientName: string;
  trainerName: string;
  arenaName: string;
  startTime: Date;
  endTime: Date;
  bookingId: string;
  isGroup: boolean;
}) {
  try {
    const r = getResend(); if (!r) return;
    const dateStr = startTime.toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = `${startTime.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })} – ${endTime.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })}`;
    const typeLabel = isGroup ? "Grupinė treniruotė" : "Individuali treniruotė";

    await r.emails.send({
      from: FROM,
      to,
      subject: `✅ ${typeLabel} patvirtinta – padeliotrenere.lt`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0B5C71; padding: 30px; text-align: center;">
            <h1 style="color: #FF5733; margin: 0; font-size: 28px;">🎾 padeliotrenere.lt</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #0B5C71;">Sveiki, ${clientName}!</h2>
            <p style="color: #555; font-size: 16px;">Jūsų ${isGroup ? "grupinė treniruotė" : "treniruotė"} sėkmingai užregistruota:</p>
            <div style="background: #f5f5f5; border-left: 4px solid #FF5733; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>🏋️ Treneris:</strong> ${trainerName}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📍 Arena:</strong> ${arenaName}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📅 Data:</strong> ${dateStr}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>⏰ Laikas:</strong> ${timeStr}</p>
              ${isGroup ? '<p style="margin: 5px 0; color: #FF5733;"><strong>👥 Grupinė treniruotė</strong></p>' : ""}
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>🆔 Rezervacijos nr.:</strong> ${bookingId.slice(-8).toUpperCase()}</p>
            </div>
            <p style="color: #555;">Jeigu turite klausimų, susisiekite su mumis.</p>
            <a href="${APP_URL}/client/bookings"
               style="display: inline-block; background: #FF5733; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Peržiūrėti rezervaciją
            </a>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 14px;">
            <p>© 2025 padeliotrenere.lt. Visi teisės saugomos.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
  }
}

export async function sendTrainerBookingNotification({
  to,
  trainerName,
  clientName,
  clientEmail,
  arenaName,
  startTime,
  endTime,
  isGroup,
  currentCount,
  maxParticipants,
}: {
  to: string;
  trainerName: string;
  clientName: string;
  clientEmail: string;
  arenaName: string;
  startTime: Date;
  endTime: Date;
  isGroup: boolean;
  currentCount?: number;
  maxParticipants?: number | null;
}) {
  try {
    const r = getResend(); if (!r) return;
    const dateStr = startTime.toLocaleDateString("lt-LT", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = `${startTime.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })} – ${endTime.toLocaleTimeString("lt-LT", { hour: "2-digit", minute: "2-digit" })}`;
    const occupancy = isGroup && maxParticipants ? `${currentCount}/${maxParticipants}` : null;

    await r.emails.send({
      from: FROM,
      to,
      subject: `📅 Nauja rezervacija – ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #0B5C71; padding: 30px; text-align: center;">
            <h1 style="color: #FF5733; margin: 0; font-size: 28px;">🎾 padeliotrenere.lt</h1>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #0B5C71;">Sveiki, ${trainerName}!</h2>
            <p style="color: #555; font-size: 16px;">Gautas naujas${isGroup ? " grupinės treniruotės" : ""} užsiregistravimas:</p>
            <div style="background: #f5f5f5; border-left: 4px solid #0B5C71; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>👤 Klientas:</strong> ${clientName}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📧 El. paštas:</strong> ${clientEmail}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📍 Arena:</strong> ${arenaName}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>📅 Data:</strong> ${dateStr}</p>
              <p style="margin: 5px 0; color: #1a1a2e;"><strong>⏰ Laikas:</strong> ${timeStr}</p>
              ${isGroup && occupancy ? `<p style="margin: 5px 0; color: #FF5733;"><strong>👥 Užimtumas:</strong> ${occupancy} dalyvių</p>` : ""}
            </div>
            <a href="${APP_URL}/trainer/calendar"
               style="display: inline-block; background: #0B5C71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
              Peržiūrėti kalendorių
            </a>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 14px;">
            <p>© 2025 padeliotrenere.lt. Visi teisės saugomos.</p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send trainer booking notification email:", error);
  }
}

export async function sendCancellationNew({
  clientEmail,
  clientName,
  trainerEmail,
  trainerName,
  arenaName,
  startTime,
  endTime,
  cancelledBy,
}: {
  clientEmail: string;
  clientName: string;
  trainerEmail: string;
  trainerName: string;
  arenaName: string;
  startTime: Date;
  endTime: Date;
  cancelledBy: "client" | "trainer" | "admin";
}) {
  const r = getResend();
  if (!r) return;

  const dateStr = startTime.toLocaleDateString("lt-LT", { timeZone: "Europe/Vilnius", year: "numeric", month: "long", day: "numeric" });
  const timeStr = `${startTime.toLocaleTimeString("lt-LT", { timeZone: "Europe/Vilnius", hour: "2-digit", minute: "2-digit" })} – ${endTime.toLocaleTimeString("lt-LT", { timeZone: "Europe/Vilnius", hour: "2-digit", minute: "2-digit" })}`;

  const footer = `<div style="background:#f5f5f5;padding:20px;text-align:center;color:#999;font-size:14px;"><p>© 2025 ManoTreniruote.lt</p></div>`;
  const header = `<div style="background:#0B5C71;padding:24px;text-align:center;"><span style="color:#FF5733;font-size:22px;font-weight:bold;">ManoTreniruote.lt</span></div>`;
  const block = `<div style="background:#fff5f5;border-left:4px solid #FF5733;padding:16px;margin:16px 0;border-radius:4px;">
    <p style="margin:4px 0;color:#1a1a2e;"><strong>🏋️ Treneris:</strong> ${trainerName}</p>
    <p style="margin:4px 0;color:#1a1a2e;"><strong>📍 Arena:</strong> ${arenaName}</p>
    <p style="margin:4px 0;color:#1a1a2e;"><strong>📅 Data:</strong> ${dateStr}</p>
    <p style="margin:4px 0;color:#1a1a2e;"><strong>⏰ Laikas:</strong> ${timeStr}</p>
  </div>`;

  const cancellerLabel = cancelledBy === "client" ? "klientas" : cancelledBy === "trainer" ? "treneris" : "administracija";

  // Email to client
  r.emails.send({
    from: FROM,
    to: clientEmail,
    subject: "❌ Treniruotė atšaukta",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">${header}<div style="padding:24px;background:#fff;"><h2 style="color:#0B5C71;">Sveiki, ${clientName}!</h2><p style="color:#555;">Jūsų treniruotė buvo atšaukta (${cancellerLabel}).</p>${block}<a href="${APP_URL}/booking" style="display:inline-block;background:#FF5733;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:8px;">Rezervuoti naują laiką</a></div>${footer}</div>`,
  }).catch(console.error);

  // Email to trainer
  r.emails.send({
    from: FROM,
    to: trainerEmail,
    subject: `❌ Rezervacija atšaukta – ${clientName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">${header}<div style="padding:24px;background:#fff;"><h2 style="color:#0B5C71;">Sveiki, ${trainerName}!</h2><p style="color:#555;">Kliento <strong>${clientName}</strong> rezervacija buvo atšaukta (${cancellerLabel}).</p>${block}<a href="${APP_URL}/trainer/calendar" style="display:inline-block;background:#0B5C71;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;margin-top:8px;">Peržiūrėti kalendorių</a></div>${footer}</div>`,
  }).catch(console.error);
}
