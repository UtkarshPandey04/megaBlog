import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST?.trim();
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER?.trim();
// Gmail app passwords are often pasted with spaces; normalize before auth.
const pass = process.env.SMTP_PASS?.replace(/\s+/g, "").trim();
const fromEmail = process.env.SMTP_FROM_EMAIL?.trim();

const isConfigured = Boolean(host && user && pass && fromEmail);

const transporter = isConfigured
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    })
  : null;

export async function sendEmailVerification({ to, name, token, origin }) {
  if (!transporter) {
    console.warn("SMTP not configured. Skipping email verification send.");
    return;
  }

  const verifyUrl = `${origin}/verify-email?token=${token}`;
  const msg = {
    from: fromEmail,
    to,
    subject: "Verify your MegaBlog email",
    text: `Hi ${name || "there"}, verify your email: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Verify your MegaBlog email</h2>
        <p>Hi ${name || "there"}, click the button below to verify your email.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;background:#111827;color:#fff;padding:10px 16px;border-radius:999px;text-decoration:none;">
            Verify Email
          </a>
        </p>
        <p>If you did not create an account, you can ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(msg);
  } catch (error) {
    console.error("Failed to send verification email:", error?.message || error);
    throw error;
  }
}
