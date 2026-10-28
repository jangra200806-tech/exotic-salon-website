/* =========================================================
   serve.js — Exotic Salon local server
   ---------------------------------------------------------
   Zero dependency. Run:  node serve.js  (or double-click start-server.bat)
   Site opens at: http://localhost:5500

   Static files + Vercel-style API routes:
     POST /api/chat     -> api/chat.js
     POST /api/contact  -> api/contact.js
   ========================================================= */

const http = require("http");
const fs = require("fs");
const path = require("path");

/* Local .env loader. This is only for `node serve.js` / start-server.bat.
   It never logs values. Vercel supplies env vars itself.
   It handles UTF-8/UTF-16 (Notepad) and empty duplicate key lines. */
function decodeEnvFile(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return buffer.toString("utf8", 3).replace(/^\uFEFF/, "");
  }

  if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return buffer.toString("utf16le", 2).replace(/^\uFEFF/, "");
  }

  if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
    const swapped = Buffer.alloc(buffer.length - 2);
    for (let index = 2; index + 1 < buffer.length; index += 2) {
      swapped[index - 2] = buffer[index + 1];
      swapped[index - 1] = buffer[index];
    }
    return swapped.toString("utf16le").replace(/^\uFEFF/, "");
  }

  /* Some Windows editors save UTF-16LE without a BOM. */
  let nulCount = 0;
  const sampleSize = Math.min(buffer.length, 200);
  for (let index = 0; index < sampleSize; index++) {
    if (buffer[index] === 0) nulCount += 1;
  }
  if (nulCount > 4) return buffer.toString("utf16le").replace(/^\uFEFF/, "");

  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;

  let text;
  try {
    text = decodeEnvFile(fs.readFileSync(envPath));
  } catch (error) {
    return;
  }

  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.charAt(0) === "#") continue;
    if (line.indexOf("export ") === 0) line = line.slice(7).trim();

    /* Also accept the common paste mistake where the key is on the
       next line by itself, e.g. "GROQ_API_KEY=" then the key below. */
    const rawGroqKey = line.match(
      /^(?:GROQ_API_KEY\s*[:=]\s*)?["']?(gsk\x5f[A-Za-z0-9_-]+)["']?(?:\s+#.*)?$/i
    );
    if (rawGroqKey) {
      const existingGroq = process.env.GROQ_API_KEY;
      if (existingGroq == null || String(existingGroq).trim() === "") {
        process.env.GROQ_API_KEY = rawGroqKey[1];
      }
      continue;
    }

    let separator = line.indexOf("=");
    if (separator < 1) {
      const colon = line.indexOf(":");
      if (colon > 0) separator = colon;
    }
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;

    /* Do not override a real shell/--env-file value, but do replace
       an empty value. This fixes the common empty-template-line case. */
    const existing = process.env[key];
    if (existing != null && String(existing).trim() !== "") continue;

    let value = line.slice(separator + 1).trim();
    if (value.length >= 2) {
      const first = value.charAt(0);
      const last = value.charAt(value.length - 1);
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        value = value.slice(1, -1);
      }
    }
    value = value.replace(/\s+#.*$/, "").trim();
    process.env[key] = value;
  }
}

function normalizeLocalEnv(name) {
  const value = process.env[name];
  if (typeof value !== "string") return;

  let normalized = value.trim();
  if (normalized.length >= 2) {
    const first = normalized.charAt(0);
    const last = normalized.charAt(normalized.length - 1);
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      normalized = normalized.slice(1, -1);
    }
  }
  process.env[name] = normalized;
}

loadLocalEnv();
normalizeLocalEnv("GROQ_API_KEY");
normalizeLocalEnv("GROQ_MODEL");

const ROOT = __dirname;
const PORT = Number(process.argv[2] || 5500);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

/* Vercel handlers ko Node http ke res par ye chhote helpers chahiye */
function makeVercelRes(res) {
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (obj) {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
    }
    res.end(JSON.stringify(obj));
    return res;
  };
  res.send = function (body) {
    res.end(body);
    return res;
  };
  return res;
}

/* JSON / form-urlencoded body (Vercel jaisa req.body) */
function readBody(req) {
  return new Promise(function (resolve) {
    let raw = "";
    let tooBig = false;

    req.on("data", function (chunk) {
      if (tooBig) return;
      raw += chunk;
      if (raw.length > 1000000) {
        tooBig = true;
        raw = "";
      }
    });

    req.on("end", function () {
      if (tooBig || !raw) return resolve({});

      const type = String(req.headers["content-type"] || "");
      if (type.indexOf("application/json") !== -1) {
        try {
          const parsed = JSON.parse(raw);
          return resolve(parsed && typeof parsed === "object" ? parsed : {});
        } catch (e) {
          return resolve({});
        }
      }

      if (type.indexOf("application/x-www-form-urlencoded") !== -1) {
        try {
          return resolve(Object.fromEntries(new URLSearchParams(raw)));
        } catch (e) {
          return resolve({});
        }
      }

      return resolve({ raw: raw });
    });

    req.on("error", function () {
      resolve({});
    });
  });
}

function loadApi(pathname) {
  try {
    if (pathname === "/api/chat") return require("./api/chat.js");
    if (pathname === "/api/contact") return require("./api/contact.js");
  } catch (e) {
    /* Neeche generic 500 milega — raw error client ko nahi. */
    console.error("Could not load API route: " + pathname);
    return null;
  }
  return null;
}

const server = http.createServer(async function (req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split("?")[0]);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Bad request");
  }

  /* ---------- API routes (Vercel serverless style) ---------- */
  if (urlPath === "/api/chat" || urlPath === "/api/contact") {
    const handler = loadApi(urlPath);

    if (!handler) {
      return makeVercelRes(res)
        .status(500)
        .json({ error: "API is not available." });
    }

    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        req.body = await readBody(req);
      }
      await handler(req, makeVercelRes(res));
    } catch (e) {
      console.error("API route failed: " + urlPath);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: "Server error." }));
      } else {
        res.end();
      }
    }
    return;
  }

  /* ---------- Static files ---------- */
  if (urlPath === "/") urlPath = "/index.html";

  /* API source files static se serve na karo (sirf route handlers). */
  if (urlPath.indexOf("/api/") === 0) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }

  const filePath = path.join(ROOT, urlPath);
  const rel = path.relative(ROOT, filePath);
  const segments = rel.split(path.sep);

  /* Prevent folder traversal */
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  /* Dotfiles (khaas kar .env / .git) kabhi serve na karo. */
  if (
    segments.some(function (part) {
      return part.charAt(0) === ".";
    })
  ) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not found");
  }

  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      return res.end("<h1>404 - Not Found</h1><p>" + urlPath + "</p>");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, function () {
  const groqKey = process.env.GROQ_API_KEY || "";
  const model = String(process.env.GROQ_MODEL || "").trim() || "llama-3.3-70b-versatile";

  console.log("");
  console.log("  Exotic Salon is live at:  http://localhost:" + PORT);
  console.log("  Serving: " + ROOT);
  console.log("  API:     /api/chat  /api/contact");
  console.log("  Groq:    " + (groqKey ? "key loaded (length " + groqKey.length + ")" : "GROQ_API_KEY missing - local salon answers active; add key to " + path.join(ROOT, ".env")));
  console.log("  Model:   " + model);
  console.log("  Health:  /api/chat?health=1 (local/debug only)");
  console.log("  Band karne ke liye: Ctrl + C");
  console.log("");
});
