/* =========================================================
   api/health.js
   ---------------------------------------------------------
   Vercel Serverless Function — health check endpoint.
   GET /api/health returns JSON with status and current time.
   No secrets or internal details exposed.
   ========================================================= */

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET." });
  }

  res.setHeader("Content-Type", "application/json");
  return res.status(200).json({
    status: "ok",
    time: new Date().toISOString()
  });
};
