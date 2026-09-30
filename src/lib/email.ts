import { BOOKING_URL } from "@/content/site";
import { siteUrl } from "@/lib/env";

export type SendResult = { ok: true } | { ok: false; error: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function waitlistConfirmationEmail({ name, unsubscribeUrl }: { name: string; unsubscribeUrl: string }) {
  const site = siteUrl();
  const safeName = escapeHtml(name);
  const safeUnsubscribe = escapeHtml(unsubscribeUrl);
  const subject = "You're on the list for Oak and Whiskey Beard Balm";

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#faf6ef;font-family:Arial,Helvetica,sans-serif;color:#1c1917">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#57504a">by Edgar Salazar</p>
      <h1 style="margin:0 0 20px;font-size:24px;color:#b3261e">Oak and Whiskey Beard Balm</h1>
      <p>Hi ${safeName},</p>
      <p>Thanks for joining the waitlist. You'll get an email from us as soon as the next batch of Oak and Whiskey Beard Balm is available.</p>
      <p>In the meantime, you can <a href="${escapeHtml(BOOKING_URL)}" style="color:#b3261e">book a cut with Edgar</a> at Quality Cuts in Forest Hill, TX.</p>
      <p style="margin-top:28px">— Edgar</p>
      <hr style="border:none;border-top:1px solid #e5dccd;margin:28px 0 16px">
      <p style="font-size:12px;color:#57504a">
        You're receiving this because you joined the waitlist at <a href="${escapeHtml(site)}" style="color:#57504a">${escapeHtml(site.replace(/^https?:\/\//, ""))}</a>.
        <a href="${safeUnsubscribe}" style="color:#57504a">Unsubscribe</a>.
      </p>
    </div>
  </body>
</html>`;

  const text = [
    `Hi ${name},`,
    "",
    "Thanks for joining the waitlist. You'll get an email from us as soon as the next batch of Oak and Whiskey Beard Balm is available.",
    "",
    `Book a cut with Edgar at Quality Cuts: ${BOOKING_URL}`,
    "",
    "— Edgar",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, html, text };
}

/** Sends the waitlist confirmation through Resend. Never throws. */
export async function sendWaitlistConfirmation({
  name,
  email,
  unsubscribeUrl,
}: {
  name: string;
  email: string;
  unsubscribeUrl: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, error: "Email is not configured" };

  const { subject, html, text } = waitlistConfirmationEmail({ name, unsubscribeUrl });
  const oneClickUrl = unsubscribeUrl.replace("/unsubscribe?", "/api/unsubscribe?");
  try {
    const { Resend } = await import("resend");
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: email,
      subject,
      html,
      text,
      headers: {
        "List-Unsubscribe": `<${oneClickUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
