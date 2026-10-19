/* =========================================================
   api/contact.js
   ---------------------------------------------------------
   Vercel Serverless Function — contact form ka email bhejta hai
   nodemailer + Brevo SMTP ke through.

   Credentials SIRF environment variables se aate hain:
     BREVO_LOGIN     Brevo SMTP page wala Login (xxxx@smtp-brevo.com)
     BREVO_SMTP_KEY  jo SMTP key generate ki thi
     SENDER_EMAIL    Brevo mein verified sender email
     SALON_EMAIL     jis email par enquiry chahiye

   Is file mein kabhi koi key hardcode na karo.
   ========================================================= */

const nodemailer = require("nodemailer");

/* Brevo SMTP relay — port 587 STARTTLS (secure:false) use karta hai */
const SMTP_HOST = "smtp-relay.brevo.com";
const SMTP_PORT = 587;

/* Input ko trim karo aur lambai seemit karo (spam / abuse se bachne ke liye) */
function clean(value, max) {
  return String(value === undefined || value === null ? "" : value)
    .trim()
    .slice(0, max || 2000);
}

/* Email HTML mein user ka text daalne se pehle escape karo */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Body ko object banao — Vercel JSON/form-urlencoded dono bhej sakta hai */
function readBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = Object.fromEntries(new URLSearchParams(body));
    }
  }
  return body && typeof body === "object" ? body : {};
}

module.exports = async function handler(req, res) {
  /* ---------- 1. Sirf POST allowed ---------- */
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
  }

  /* ---------- 2. Fields nikalo ---------- */
  const body = readBody(req);
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 40);
  const service = clean(body.service, 160);
  const date = clean(body.date, 40);
  const message = clean(body.message, 3000);

  /* ---------- 3. Validation — name aur phone khaali nahi ---------- */
  const fields = [];
  if (!name) fields.push("name");
  if (!phone) fields.push("phone");

  if (fields.length) {
    return res.status(400).json({
      ok: false,
      error: "Name and phone are required.",
      fields: fields
    });
  }

  /* ---------- 4. Env vars check (kabhi hardcode nahi) ---------- */
  const BREVO_LOGIN = process.env.BREVO_LOGIN;
  const BREVO_SMTP_KEY = process.env.BREVO_SMTP_KEY;
  const SENDER_EMAIL = process.env.SENDER_EMAIL;
  const SALON_EMAIL = process.env.SALON_EMAIL;

  const missing = [
    ["BREVO_LOGIN", BREVO_LOGIN],
    ["BREVO_SMTP_KEY", BREVO_SMTP_KEY],
    ["SENDER_EMAIL", SENDER_EMAIL],
    ["SALON_EMAIL", SALON_EMAIL]
  ]
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    console.error("Missing environment variables: " + missing.join(", "));
    return res
      .status(500)
      .json({ ok: false, error: "Server is not configured yet. Please call or WhatsApp us." });
  }

  /* ---------- 5. Email bhejo ---------- */
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // 587 -> STARTTLS
    auth: {
      user: BREVO_LOGIN,
      pass: BREVO_SMTP_KEY
    }
  });

  const subject = "New enquiry" + (service ? " — " + service : "") + " | " + name;

  const text = [
    "New contact form enquiry — Exotic Hair & Beauty Unisex Salon",
    "",
    "Name:           " + name,
    "Phone:          " + phone,
    "Service:        " + (service || "-"),
    "Preferred date: " + (date || "-"),
    "",
    "Message:",
    message || "-",
    "",
    "— Sent from the website contact form"
  ].join("\n");

  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#3a2230;line-height:1.6">' +
    '<h2 style="font-family:Georgia,serif;color:#a2557a;margin:0 0 16px">New enquiry — Exotic Salon</h2>' +
    '<table style="border-collapse:collapse">' +
    row("Name", esc(name)) +
    row("Phone", esc(phone)) +
    row("Service", esc(service || "-")) +
    row("Preferred date", esc(date || "-")) +
    "</table>" +
    '<p style="margin:18px 0 6px"><strong>Message</strong></p>' +
    '<p style="margin:0;white-space:pre-wrap">' + (message ? esc(message) : "-") + "</p>" +
    '<hr style="border:0;border-top:1px solid #e6cf94;margin:22px 0">' +
    '<p style="font-size:13px;color:#7a6670">Sent from the website contact form.</p>' +
    "</div>";

  try {
    await transporter.sendMail({
      from: '"Exotic Salon Website" <' + SENDER_EMAIL + ">",
      to: SALON_EMAIL,
      subject: subject,
      text: text,
      html: html
    });
    return res.status(200).json({ ok: true, message: "Enquiry sent." });
  } catch (err) {
    /* Asli error sirf server log mein — user ko generic message */
    console.error("Brevo SMTP error:", (err && err.message) || err);
    return res.status(500).json({
      ok: false,
      error: "Could not send the email right now. Please call or WhatsApp us."
    });
  }
};

/* Email table ki ek row */
function row(label, value) {
  return (
    '<tr>' +
    '<td style="padding:6px 16px 6px 0;color:#7a6670;font-size:13px;vertical-align:top">' + label + "</td>" +
    '<td style="padding:6px 0;font-weight:600">' + value + "</td>" +
    "</tr>"
  );
}
