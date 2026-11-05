/* =========================================================
   api/enquiry.js
   ---------------------------------------------------------
   Vercel Serverless Function — salon enquiry form ka server side.

   POST /api/enquiry
   Body: { name, phone, service, date, time, message, website }

   SECURITY:
   - Channel keys/tokens sirf process.env se aate hain. Kabhi hardcode nahi.
   - Keys front-end, logs ya error responses mein nahi jaati.
   - Same-origin check.
   - Honeypot field "website" — agar bhara ho to silent ok bhej do.
   - Rate limit: 3 enquiries/IP/10 min, 1 enquiry/phone/2 min (in-memory,
     serverless par best-effort).

   CHANNELS (har ek optional — koi bhi configure na ho to 502):
   1. CallMeBot WhatsApp: GET https://api.callmebot.com/whatsapp.php
   2. Telegram sendMessage
   3. SMTP email (nodemailer)
   ========================================================= */

const MAX_BODY_BYTES = 4 * 1024; // 4 KB
const RATE_WINDOW_IP_MS = 10 * 60 * 1000;   // 10 minutes
const RATE_MAX_IP = 3;                       // 3 per IP per window
const RATE_WINDOW_PHONE_MS = 2 * 60 * 1000; // 2 minutes
const RATE_MAX_PHONE = 1;                    // 1 per phone per window
const REQUEST_TIMEOUT_MS = 10000;

/* Best-effort in-memory rate limits.
   Serverless har instance ka apna memory hota hai — ye sirf casual
   abuse rokta hai, poora guarantee nahi deta. */
const ipBuckets = new Map();
const phoneBuckets = new Map();

function now() {
  return Date.now();
}

function cleanWindow(bucket, msLimit) {
  const t = now();
  while (bucket.length && bucket[0] < t - msLimit) bucket.shift();
}

function checkRate(bucket, msLimit, max) {
  cleanWindow(bucket, msLimit);
  if (bucket.length >= max) return false;
  bucket.push(now());
  return true;
}

function normalisePhone(raw) {
  if (!raw) return "";
  let d = String(raw).replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return d;
}

function stripControlChars(s) {
  if (!s) return s;
  return String(s).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, "");
}

function isValidDate(d) {
  if (!d) return true;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d));
  if (!m) return false;
  const y = Number(m[1]), mo = Number(m[2]), dd = Number(m[3]);
  const date = new Date(y, mo - 1, dd);
  return date.getFullYear() === y && date.getMonth() === mo - 1 && date.getDate() === dd;
}

function dateNotPast(d) {
  if (!d) return true;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d));
  if (!m) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const input = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return input >= today;
}

function readBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      try {
        body = Object.fromEntries(new URLSearchParams(body));
      } catch (e2) {
        body = {};
      }
    }
  }
  return body && typeof body === "object" ? body : {};
}

function sameOrigin(req) {
  const site = req.headers["sec-fetch-site"];
  return !site || site === "same-origin" || site === "none";
}

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return String(fwd).split(",")[0].trim();
  const real = req.headers["x-real-ip"];
  if (real) return String(real);
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "unknown";
}

function shortError(e) {
  if (!e) return "unknown error";
  return String(e.message || e).slice(0, 120);
}

function kolkataTime() {
  const d = new Date();
  const kol = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const pad = (n) => String(n).padStart(2, "0");
  return pad(kol.getDate()) + "/" + pad(kol.getMonth() + 1) + "/" + kol.getFullYear() +
    " " + pad(kol.getHours()) + ":" + pad(kol.getMinutes()) + " IST";
}

/* ---------- Channel 1: CallMeBot WhatsApp ---------- */
async function sendCallMeBot(fields) {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return { ok: false, skipped: true, reason: "CallMeBot not configured" };

  const text =
    "Nayi enquiry - Exotic Salon\n" +
    "Naam: " + stripControlChars(fields.name) + "\n" +
    "Phone: " + stripControlChars(fields.phone) + "\n" +
    "Service: " + stripControlChars(fields.service) + "\n" +
    "Date: " + stripControlChars(fields.date) + "\n" +
    "Time: " + stripControlChars(fields.time) + "\n" +
    "Message: " + stripControlChars(fields.message) + "\n" +
    "Time (IST): " + kolkataTime() + "\n" +
    "Reply: https://wa.me/91" + normalisePhone(fields.phone);

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const resp = await fetch("https://api.callmebot.com/whatsapp.php?" +
      new URLSearchParams({
        phone: phone,
        text: text,
        apikey: apikey
      }).toString(), { signal: controller.signal });
    clearTimeout(timer);

    if (resp.ok) return { ok: true, channel: "CallMeBot" };
    return { ok: false, channel: "CallMeBot", reason: "HTTP " + resp.status };
  } catch (err) {
    return { ok: false, channel: "CallMeBot", reason: shortError(err) };
  }
}

/* ---------- Channel 2: Telegram ---------- */
async function sendTelegram(fields) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, skipped: true, reason: "Telegram not configured" };

  const text =
    "Nayi enquiry - Exotic Salon\n" +
    "Naam: " + stripControlChars(fields.name) + "\n" +
    "Phone: " + stripControlChars(fields.phone) + "\n" +
    "Service: " + stripControlChars(fields.service) + "\n" +
    "Date: " + stripControlChars(fields.date) + "\n" +
    "Time: " + stripControlChars(fields.time) + "\n" +
    "Message: " + stripControlChars(fields.message) + "\n" +
    "Time (IST): " + kolkataTime();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const resp = await fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text }),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (resp.ok) return { ok: true, channel: "Telegram" };
    return { ok: false, channel: "Telegram", reason: "HTTP " + resp.status };
  } catch (err) {
    return { ok: false, channel: "Telegram", reason: shortError(err) };
  }
}

/* ---------- Channel 3: SMTP email (nodemailer) ---------- */
async function sendSmtp(fields) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const emailTo = process.env.EMAIL_TO;
  if (!smtpUser || !smtpPass || !emailTo) return { ok: false, skipped: true, reason: "SMTP not configured" };

  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: { user: smtpUser, pass: smtpPass }
  });

  try {
    await transporter.sendMail({
      from: '"Enquiry" <' + smtpUser + ">",
      to: emailTo,
      subject: "New enquiry — Exotic Salon (" + stripControlChars(fields.name) + ")",
      text:
        "New enquiry — Exotic Salon\n" +
        "Name:           " + stripControlChars(fields.name) + "\n" +
        "Phone:          " + stripControlChars(fields.phone) + "\n" +
        "Service:        " + stripControlChars(fields.service) + "\n" +
        "Date:           " + stripControlChars(fields.date) + "\n" +
        "Time:           " + stripControlChars(fields.time) + "\n" +
        "Message:\n" + stripControlChars(fields.message) + "\n" +
        "Time (IST):     " + kolkataTime() + "\n" +
        "WhatsApp:       https://wa.me/91" + normalisePhone(fields.phone)
    });
    return { ok: true, channel: "SMTP" };
  } catch (err) {
    return { ok: false, channel: "SMTP", reason: shortError(err) };
  }
}

module.exports = async function handler(req, res) {
  /* ---------- 1. POST only ---------- */
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  /* ---------- 2. Same-origin check ---------- */
  if (!sameOrigin(req)) {
    console.warn("enquiry: cross-origin rejected");
    return res.status(403).json({ ok: false, error: "Forbidden." });
  }

  /* ---------- 3. Read raw body ---------- */
  let rawBody = "";
  if (req.body) {
    if (Buffer.isBuffer(req.body)) {
      rawBody = req.body.toString();
    } else if (typeof req.body === "object") {
      rawBody = JSON.stringify(req.body);
    } else if (typeof req.body === "string") {
      rawBody = req.body;
    } else {
      await new Promise(function (resolve) {
        req.on("data", function (chunk) {
          rawBody += chunk;
          if (rawBody.length > MAX_BODY_BYTES) {
            req.destroy();
          }
        });
        req.on("end", resolve);
        req.on("error", resolve);
      });
    }
  } else {
    await new Promise(function (resolve) {
      req.on("data", function (chunk) {
        rawBody += chunk;
        if (rawBody.length > MAX_BODY_BYTES) {
          req.destroy();
        }
      });
      req.on("end", resolve);
      req.on("error", resolve);
    });
  }

  /* ---------- 4. Parse body ---------- */
  let parsed = {};
  try {
    parsed = JSON.parse(rawBody || "{}");
  } catch (e) {
    return res.status(400).json({ ok: false, error: "Invalid JSON body." });
  }

  /* ---------- 5. Honeypot ---------- */
  if (parsed.website && String(parsed.website).trim() !== "") {
    return res.status(200).json({ ok: true });
  }

  /* ---------- 6. Extract & clean fields ---------- */
  const name = stripControlChars(String(parsed.name || "").trim());
  const rawPhone = String(parsed.phone || "");
  const phone = normalisePhone(rawPhone);
  const service = stripControlChars(String(parsed.service || "").trim());
  const date = String(parsed.date || "").trim();
  const time = String(parsed.time || "").trim();
  const message = stripControlChars(String(parsed.message || "").trim());

  /* ---------- 7. Validation ---------- */
  if (!name || name.length < 2 || name.length > 60) {
    return res.status(400).json({ ok: false, error: "Name must be 2 to 60 characters." });
  }
  if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ ok: false, error: "Phone must be a 10-digit number." });
  }
  if (!service || service.length < 1 || service.length > 80) {
    return res.status(400).json({ ok: false, error: "Service must be 1 to 80 characters." });
  }
  if (date && !isValidDate(date)) {
    return res.status(400).json({ ok: false, error: "Invalid date." });
  }
  if (date && !dateNotPast(date)) {
    return res.status(400).json({ ok: false, error: "Date cannot be in the past." });
  }
  if (message.length > 500) {
    return res.status(400).json({ ok: false, error: "Message must be 500 characters or less." });
  }

  /* ---------- 8. Rate limit ---------- */
  const ip = clientIp(req);
  if (!checkRate(ipBuckets, RATE_WINDOW_IP_MS, RATE_MAX_IP)) {
    return res.status(429).json({ ok: false, error: "Too many enquiries. Try later." });
  }
  if (!checkRate(phoneBuckets, RATE_WINDOW_PHONE_MS, RATE_MAX_PHONE)) {
    return res.status(429).json({ ok: false, error: "One enquiry per phone every 2 minutes." });
  }

  /* ---------- 9. Send via all configured channels ---------- */
  const fields = { name, phone, service, date, time, message };
  const results = await Promise.all([
    sendCallMeBot(fields),
    sendTelegram(fields),
    sendSmtp(fields)
  ]);
  const succeeded = results.filter(function (r) { return r.ok; });
  if (succeeded.length > 0) {
    return res.status(200).json({ ok: true });
  }

  const reasons = results
    .filter(function (r) { return !r.skipped; })
    .map(function (r) { return (r.channel || "channel") + ": " + (r.reason || "failed"); });
  const shortReason = reasons.length ? reasons.join("; ") : "no channel configured";
  console.error("enquiry: all channels failed — " + shortReason);
  return res.status(502).json({ ok: false, error: "Enquiry could not be sent. Please call or WhatsApp us." });
};