// ==============================================================================
// ADITHYA MECHNEXUS V18.2 — CONTACT EMAIL EDGE FUNCTION
// Deno runtime (Supabase Edge Functions). Handles:
//   1. Validates and sanitizes contact form payload
//   2. Enforces payload size limit, honeypot, and database-backed rate limiting
//   3. Deduplicates rapid duplicate submissions
//   4. Inserts into contact_messages (server-side, service_role)
//   5. Sends email notification via Resend API (HTML-escaped & header-sanitized)
// Secrets are injected as environment variables — NEVER exposed to browser.
// ==============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

// CORS headers for browser requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Maximum payload size (32 KB safety threshold)
const MAX_PAYLOAD_BYTES = 32 * 1024;

interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
  honeypot?: string;
  website?: string;
  hp?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitize(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeSingleLine(str: string): string {
  return str.replace(/[\r\n\t]+/g, ' ').trim();
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed.' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  // Check request payload size limit (protection against large payload attacks)
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return new Response(
      JSON.stringify({ success: false, error: 'Payload size exceeds maximum allowed.' }),
      { status: 413, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // ── 1. Parse & Validate Payload ──────────────────────────────────────
    let body: ContactPayload;
    try {
      body = await req.json();
    } catch (_parseErr) {
      return new Response(
        JSON.stringify({ success: false, error: 'Malformed JSON payload.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Bot honeypot spam protection: silent accept if honeypot trap is filled
    if (body.honeypot || body.website || body.hp) {
      return new Response(
        JSON.stringify({ success: true, email_sent: false, message: 'Message logged.' }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const name = sanitize(body.name || '');
    const email = sanitize(body.email || '');
    const subject = sanitize(body.subject || 'Engineering Consultation Inquiry');
    const message = sanitize(body.message || '');

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name, email, and message are required fields.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address format.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit: basic field length checks (prevent abuse)
    if (name.length > 200 || email.length > 320 || subject.length > 500 || message.length > 5000) {
      return new Response(
        JSON.stringify({ success: false, error: 'Field length exceeds maximum allowed.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ── 2. Initialize Supabase Admin Client ─────────────────────────────
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[EDGE FUNCTION CONFIG ERROR] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing.');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 3. Abuse Protection: Rate Limiting & Deduplication ──────────────
    // 3A. Real Database-Backed Rate Limit: max 5 messages per 10 minutes per email
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count: recentCount, error: countError } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', tenMinutesAgo);

    if (!countError && recentCount !== null && recentCount >= 5) {
      console.warn('[RATE LIMIT EXCEEDED] Email:', email, 'Count in 10m:', recentCount);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded: maximum 5 inquiries per 10 minutes. Please try again later.',
        }),
        { status: 429, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // 3B. Deduplication: detect duplicate transmission within last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentDupes } = await supabase
      .from('contact_messages')
      .select('id')
      .eq('email', email)
      .eq('message', message)
      .gte('created_at', oneMinuteAgo)
      .limit(1);

    if (recentDupes && recentDupes.length > 0) {
      console.log('[DUPLICATE TRANSMISSION DETECTED] Reusing logged record:', recentDupes[0].id);
      return new Response(
        JSON.stringify({
          success: true,
          saved_to_db: true,
          email_sent: false,
          message: 'Transmission confirmed: duplicate message already logged.',
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ── 4. Insert into contact_messages (server-side with service_role) ──
    const { error: dbError } = await supabase.from('contact_messages').insert([{
      name,
      email,
      subject,
      message,
    }]);

    if (dbError) {
      console.error('[DB INSERT ERROR]', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save message. Please try again.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // ── 5. Send Email Notification via Resend API ────────────────────────
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const notificationEmail = Deno.env.get('NOTIFICATION_EMAIL')?.trim() || 'adithya.g1441@gmail.com';
    const fromEmail = Deno.env.get('FROM_EMAIL')?.trim() || 'MECHNEXUS Contact <onboarding@resend.dev>';

    let emailSent = false;
    let emailError: string | null = null;

    if (!resendApiKey) {
      console.warn('[RESEND API KEY NOT SET] Server secret RESEND_API_KEY is not configured. Email notification skipped.');
      emailError = 'RESEND_API_KEY secret is not configured on the server.';
    } else {
      try {
        const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        // Escape HTML to prevent injection into recipient email client
        const safeName = escapeHtml(name);
        const safeEmail = escapeHtml(email);
        const safeSubject = escapeHtml(subject);
        const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

        const emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1c; color: #e2e8f0; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%); padding: 24px 32px;">
              <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #0a0f1c; letter-spacing: 2px;">
                ⚙ MECHNEXUS CONTACT LABORATORY
              </h1>
              <p style="margin: 4px 0 0; font-size: 12px; color: #0a0f1c; opacity: 0.8; letter-spacing: 1px;">
                NEW INCOMING TRANSMISSION
              </p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; color: #06b6d4; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; width: 120px; vertical-align: top;">
                    SENDER
                  </td>
                  <td style="padding: 8px 0; color: #f1f5f9; font-size: 14px;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #06b6d4; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; vertical-align: top;">
                    EMAIL
                  </td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${safeEmail}" style="color: #22d3ee; text-decoration: none; font-size: 14px;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #06b6d4; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; vertical-align: top;">
                    SUBJECT
                  </td>
                  <td style="padding: 8px 0; color: #f1f5f9; font-size: 14px;">
                    ${safeSubject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #06b6d4; font-size: 11px; font-weight: 600; letter-spacing: 1.5px; vertical-align: top;">
                    TIMESTAMP
                  </td>
                  <td style="padding: 8px 0; color: #94a3b8; font-size: 12px; font-family: monospace;">
                    ${timestamp}
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <div style="background: #0f172a; border: 1px solid #1e293b; border-left: 3px solid #06b6d4; border-radius: 6px; padding: 20px; margin-top: 8px;">
                <p style="margin: 0 0 8px; color: #06b6d4; font-size: 10px; font-weight: 600; letter-spacing: 2px;">
                  MESSAGE CONTENT
                </p>
                <p style="margin: 0; color: #e2e8f0; font-size: 14px; line-height: 1.7; word-break: break-word;">
                  ${safeMessage}
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 16px 32px; background: #060a14; border-top: 1px solid #1e293b;">
              <p style="margin: 0; color: #475569; font-size: 10px; letter-spacing: 1px; text-align: center;">
                ADITHYA MECHNEXUS V18 — AUTOMATED CONTACT NOTIFICATION
              </p>
            </div>
          </div>
        `;

        const emailText = [
          'ADITHYA MECHNEXUS — INCOMING CONTACT TRANSMISSION',
          '==================================================',
          `Sender:    ${sanitizeSingleLine(name)}`,
          `Email:     ${sanitizeSingleLine(email)}`,
          `Subject:   ${sanitizeSingleLine(subject)}`,
          `Timestamp: ${timestamp}`,
          '--------------------------------------------------',
          'Message Content:',
          message,
          '==================================================',
        ].join('\n');

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [notificationEmail],
            subject: `[MECHNEXUS] New Contact: ${sanitizeSingleLine(subject)} — from ${sanitizeSingleLine(name)}`,
            html: emailHtml,
            text: emailText,
            replyTo: sanitizeSingleLine(email),
            reply_to: sanitizeSingleLine(email),
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          console.log('[EMAIL SENT] Notification dispatched successfully to', notificationEmail);
        } else {
          const errBody = await resendResponse.text();
          console.error('[RESEND API ERROR]', resendResponse.status, errBody);
          emailError = `Resend delivery failed (HTTP ${resendResponse.status}): ${errBody}`;
        }
      } catch (emailErr: any) {
        console.error('[EMAIL DISPATCH ERROR]', emailErr);
        emailError = emailErr?.message || 'Email dispatch exception occurred.';
      }
    }

    // ── 6. Return Truthful Status Response ──────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        saved_to_db: true,
        email_sent: emailSent,
        ...(emailError ? { email_error: emailError } : {}),
        message: emailSent
          ? 'Contact message received, logged to database, and email notification sent.'
          : 'Contact message received and logged to database, but email notification could not be delivered.',
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('[EDGE FUNCTION ERROR]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
