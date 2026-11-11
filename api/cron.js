/* =========================================================
   api/cron.js
   ---------------------------------------------------------
   Vercel Serverless Function — cron job endpoint.
   GET/POST /api/cron
   Header: Authorization: Bearer <CRON_SECRET>
   CRON_SECRET comes from process.env (Vercel Environment Variables).
   Placeholder logic: console.log("cron ran") + returns { ok: true }.
   ========================================================= */

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET or POST." });
  }

  const authHeader = req.headers["authorization"] || req.headers["Authorization"] || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const expected = process.env.CRON_SECRET || "";

  if (!expected || bearer !== expected) {
    return res.status(401).json({ ok: false, error: "Unauthorized." });
  }

  try {
    console.log("cron ran");
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("cron error:", String(err && (err.message || err)) || err);
    return res.status(500).json({ ok: false, error: "Internal server error." });
  }
};
