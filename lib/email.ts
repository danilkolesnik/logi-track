import { Resend } from 'resend';
import { escapeHtml } from '@/lib/helpers';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL;

export async function sendEmail(
  to: string,
  magicLink: string,
  redirectTo: string
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
      <p>Your access request has been approved. Click the link below to sign in:</p>
      <p><a href="${escapeHtml(magicLink)}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign In to Logi Track</a></p>
      <p style="margin-top: 20px; color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666; font-size: 12px;">${escapeHtml(magicLink)}</p>
      <p style="margin-top: 20px; color: #666; font-size: 14px;">This link will expire in 24 hours. After signing in, you can set a password using the password recovery form.</p>
    `,
  });

  if (error) {
    console.error('Resend error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
