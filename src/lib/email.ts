import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendLaunchEmail(
  to: string,
  productName: string,
  message: string,
  dropDate?: string | null
) {
  if (!resend) {
    console.log(`[EMAIL MOCK] Would send to ${to}: ${message}`);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "inter-cative <onboarding@resend.dev>",
      to: [to],
      subject: `${productName} is launching!`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
          <h1 style="font-size: 24px; margin-bottom: 8px;">${productName} is here</h1>
          <p style="color: #555; line-height: 1.6;">${message}</p>
          ${dropDate ? `<p style="color: #888; font-size: 14px;">Drop date: ${new Date(dropDate).toLocaleString()}</p>` : ""}
          <p style="margin-top: 24px;">
            <a href="https://inter-cative.vercel.app" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; display: inline-block;">
              Open inter-cative
            </a>
          </p>
          <p style="margin-top: 32px; font-size: 12px; color: #999;">You're receiving this because you joined the waitlist.</p>
        </div>
      `,
    });
    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Email send failed:", err);
    return { success: false, error: err };
  }
}
