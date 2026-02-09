import * as nodemailer from 'nodemailer';
import { escapeHtml } from '@/lib/helpers';

const zohoEmail = process.env.ZOHO_EMAIL;
const zohoAppPassword = process.env.ZOHO_APP_PASSWORD;

function getTransporter() {
  if (!zohoEmail || !zohoAppPassword) {
    return null;
  }

  console.log('Email configuration:', {
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    user: zohoEmail,
    hasPassword: !!zohoAppPassword,
  });

  return nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    auth: {
      user: zohoEmail,
      pass: zohoAppPassword,
    },
  });
}

export async function sendAccessGrantedEmail(
  to: string,
  magicLink: string
): Promise<{ ok: boolean; error?: string }> {
  const transporter = getTransporter();
  if (!transporter) {
    return {
      ok: false,
      error:
        'SMTP not configured. Set ZOHO_EMAIL and ZOHO_APP_PASSWORD in .env.local',
    };
  }

  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Logi Track" <${zohoEmail}>`,
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { ok: true };
  } catch (err: unknown) {
    const error = err as any;
    console.error('Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    const message =
      error.message || 'Failed to send email. Check SMTP configuration.';
    return { ok: false, error: message };
  }
}
