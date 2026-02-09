import * as nodemailer from 'nodemailer';
import { escapeHtml } from '@/lib/helpers';

const zohoEmail = process.env.ZOHO_EMAIL;
const zohoAppPassword = process.env.ZOHO_APP_PASSWORD;

function getTransporter(usePort587 = false) {
  if (!zohoEmail || !zohoAppPassword) {
    return null;
  }

  const email = zohoEmail.trim();
  const password = zohoAppPassword.trim();

  const port = usePort587 ? 587 : 465;
  const secure = !usePort587;

  console.log('Email configuration:', {
    host: 'smtp.zoho.eu',
    port,
    secure,
    user: email,
    hasPassword: !!password,
    passwordLength: password.length,
  });

  return nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port,
    secure,
    auth: {
      user: email,
      pass: password,
    },
    tls: {
      rejectUnauthorized: false,
    },
    requireTLS: usePort587,
  });
}

async function getVerifiedTransporter() {
  let transporter = getTransporter(false);
  if (!transporter) {
    return null;
  }
  try {
    await transporter.verify();
    console.log('SMTP connection verified successfully (port 465)');
    return transporter;
  } catch (verifyError: any) {
    if (verifyError.responseCode === 535 || verifyError.code === 'EAUTH') {
      console.log('Port 465 failed, trying port 587...');
      transporter = getTransporter(true);
      if (!transporter) return null;
      await transporter.verify();
      console.log('SMTP connection verified successfully (port 587)');
      return transporter;
    }
    throw verifyError;
  }
}

export async function sendAccessGrantedEmail(
  to: string,
  password: string,
  loginUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const transporter = await getVerifiedTransporter();
  if (!transporter) {
    return {
      ok: false,
      error:
        'SMTP not configured. Set ZOHO_EMAIL and ZOHO_APP_PASSWORD in .env.local',
    };
  }

  try {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Logi Track" <${zohoEmail}>`,
      to,
      subject: 'Logi Track — Access granted',
      html: `
        <h2>You have been granted access to Logi Track</h2>
        <p>Your access request has been approved. Use the credentials below to sign in:</p>
        <p style="margin: 16px 0; padding: 12px; background: #f3f4f6; border-radius: 8px; font-family: monospace;">
          <strong>Email:</strong> ${escapeHtml(to)}<br/>
          <strong>Password:</strong> ${escapeHtml(password)}
        </p>
        <p><a href="${escapeHtml(loginUrl)}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign In to Logi Track</a></p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { ok: true };
  } catch (err: unknown) {
    const error = err as any;
    console.error('Error sending email:', error);
    let message = error.message || 'Failed to send email.';
    if (error.responseCode === 535 || error.code === 'EAUTH') {
      message = 'Authentication failed. Check ZOHO_EMAIL and ZOHO_APP_PASSWORD in .env.local.';
    }
    return { ok: false, error: message };
  }
}
