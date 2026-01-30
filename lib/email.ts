import { Resend } from 'resend';
import { escapeHtml } from '@/lib/helpers';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

export async function sendEmail(
  to: string,
  password: string,
  loginUrl: string
): Promise<{ ok: boolean; error?: string }> {
  if (!resendApiKey) {
    return { ok: false, error: 'RESEND_API_KEY is not set' };
  }

  if (!fromEmail) {
    return { ok: false, error: 'RESEND_FROM_EMAIL is not set' };
  }

  const resend = new Resend(resendApiKey);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: 'Logi Track — Access granted',
    html: `
      <h2>You have been granted access to Logi Track</h2>
      <p>Your access request has been approved. Use the credentials below to sign in:</p>
      <p><strong>Email:</strong> ${escapeHtml(to)}</p>
      <p><strong>Password:</strong> <code>${escapeHtml(password)}</code></p>
      <p>Sign in here: <a href="${escapeHtml(loginUrl)}">${escapeHtml(loginUrl)}</a></p>
      <p>We recommend changing your password after first sign-in (use the password recovery form on the site).</p>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
