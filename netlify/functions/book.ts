import type { Handler, HandlerEvent } from "@netlify/functions";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

/* ------------------------------------------------------------------ */
/*  Environment variables (set in Netlify dashboard → Site settings)   */
/* ------------------------------------------------------------------ */
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL ?? "";
const RESEND_FROM = process.env.RESEND_FROM ?? "Pearls of Peace <bookings@pearlsofpeace.com.au>";
const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? "";

/* ------------------------------------------------------------------ */
/*  Simple in-memory rate limiter (per cold-start instance)            */
/* ------------------------------------------------------------------ */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

/* ------------------------------------------------------------------ */
/*  Input helpers                                                      */
/* ------------------------------------------------------------------ */
function sanitize(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .slice(0, 2000) // hard length cap
    .replace(/[<>]/g, ""); // strip angle brackets
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */
const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // CORS headers for the frontend
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Rate limiting
  const clientIp = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({ error: "Too many requests. Please try again later." }),
    };
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body." }) };
  }

  /* ---------- Bot detection ---------- */
  // Honeypot: if the hidden field has a value, it's a bot
  if (body._hp && String(body._hp).trim().length > 0) {
    // Return 200 so the bot thinks it succeeded
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  // Time-based: form must have been open for at least 3 seconds
  const formLoadedAt = Number(body._t) || 0;
  if (formLoadedAt > 0 && Date.now() - formLoadedAt < 3000) {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  /* ---------- Validate & sanitise ---------- */
  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const phone = sanitize(body.phone);
  const service = sanitize(body.service);
  const contactMethod = sanitize(body.contactMethod);
  const message = sanitize(body.message);
  const consent = Boolean(body.consent);

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) errors.email = "Please provide a valid email.";
  if (!message) errors.message = "Message is required.";
  if (!consent) errors.consent = "Consent is required.";

  if (Object.keys(errors).length > 0) {
    return { statusCode: 422, headers, body: JSON.stringify({ errors }) };
  }

  /* ---------- Save to Supabase ---------- */
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const { error: dbError } = await supabase.from("booking_requests").insert({
        name,
        email,
        phone: phone || null,
        service,
        contact_method: contactMethod,
        message,
        consent,
        ip_address: clientIp,
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.error("Supabase insert error:", dbError);
        // Don't fail the request — still send email
      }
    } catch (err) {
      console.error("Supabase connection error:", err);
    }
  }

  /* ---------- Send email via Resend ---------- */
  if (RESEND_API_KEY && NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: RESEND_FROM,
        to: NOTIFICATION_EMAIL,
        subject: `New Booking Request — ${name}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #fffbf3; border-radius: 8px;">
            <h2 style="color: #173f43; margin-top: 0;">New Booking Request</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #355b5e; font-weight: 600;">Name</td><td style="padding: 8px 0;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #355b5e; font-weight: 600;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; color: #355b5e; font-weight: 600;">Phone</td><td style="padding: 8px 0;">${phone || "Not provided"}</td></tr>
              <tr><td style="padding: 8px 0; color: #355b5e; font-weight: 600;">Service</td><td style="padding: 8px 0;">${service}</td></tr>
              <tr><td style="padding: 8px 0; color: #355b5e; font-weight: 600;">Contact method</td><td style="padding: 8px 0;">${contactMethod}</td></tr>
            </table>
            <h3 style="color: #173f43; margin-top: 24px;">Message</h3>
            <p style="background: rgba(255,255,255,0.7); padding: 16px; border-radius: 6px; line-height: 1.6;">${message}</p>
            <p style="margin-top: 24px; font-size: 0.85rem; color: #9b682d;">Consent to contact: ✓ Yes</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Resend email error:", err);
      // Don't fail — data is already in Supabase
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, message: "Booking request received." }),
  };
};

export { handler };
