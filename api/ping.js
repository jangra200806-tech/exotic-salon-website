/* =========================================================
   api/ping.js
   ---------------------------------------------------------
   Vercel Serverless Function — ping/health check endpoint.
   GET /api/ping returns JSON with status and current time.
   No secrets, APIs, or databases used.
   ========================================================= */

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ ok: false, error: "Method not allowed. Use GET or HEAD." });
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    status: "ok",
    site: "exotic-salon",
    time: new Date().toISOString()
  });
};
