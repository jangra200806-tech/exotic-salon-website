#!/usr/bin/env node
/* =========================================================
   tests/enquiry-test.js
   ---------------------------------------------------------
   Tests for POST /api/enquiry.

   All external channels (CallMeBot, Telegram, SMTP) are
   MOCKED — no real messages are sent, no real .env is read.

   Run:  node tests/enquiry-test.js

   Optional env:
     ENQUIRY_TEST_BASE_URL=http://localhost:5500
   ========================================================= */

const http = require("http");

const BASE = String(process.env.ENQUIRY_TEST_BASE_URL || "http://localhost:5500")
  .replace(/\/+$/, "");
const ENDPOINT = BASE + "/api/enquiry";

let passes = 0;
let fails = 0;

function test(name, fn) {
  return new Promise(function (resolve) {
    fn().then(
      function () {
        console.log("PASS: " + name);
        passes++;
        resolve();
      },
      function (err) {
        console.log("FAIL: " + name + " — " + (err && err.message ? err.message : String(err)));
        fails++;
        resolve();
      }
    );
  });
}

function post(path, body, headers) {
  return new Promise(function (resolve, reject) {
    const url = new URL(path, BASE);
    const opts = {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: BASE },
      timeout: 8000
    };
    if (headers) Object.assign(opts.headers, headers);
    const req = http.request(url, opts, function (res) {
      let data = "";
      res.on("data", function (c) { data += c; });
      res.on("end", function () {
        resolve({ status: res.statusCode, body: data, headers: res.headers });
      });
    });
    req.on("error", reject);
    req.on("timeout", function () { req.destroy(new Error("timeout")); });
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

/* ---------- Mock http module for CallMeBot/Telegram/SMTP ---------- */
const realHttp = http;
let mockHandlers = [];
function installMock() {
  const orig = http.request;
  http.request = function (opts, cb) {
    const parsed = typeof opts === "string" ? new URL(opts) : opts;
    const hostname = parsed.hostname || (opts.hostname || "");
    const pathname = parsed.pathname || "/";
    const handler = mockHandlers.find(function (h) {
      return h.hostname === hostname && h.pathname === pathname;
    });
    if (handler) {
      return handler(opts, cb);
    }
    return orig.call(http, opts, cb);
  };
}
function uninstallMock() {
  http.request = realHttp;
}
function mockHandler(hostname, pathname, status, bodyText, delayMs) {
  return {
    hostname: hostname,
    pathname: pathname,
    handle: function (opts, cb) {
      setTimeout(function () {
        const res = {
          statusCode: status,
          headers: { "content-type": "application/json" },
          on: function (ev, fn) {
            if (ev === "data") setTimeout(function () { fn(Buffer.from(bodyText || "")); }, 10);
            if (ev === "end") setTimeout(fn, 20);
            return res;
          }
        };
        cb(res);
      }, delayMs || 0);
    }
  };
}

/* ---------- Test cases ---------- */

async function run() {
  installMock();

  /* ---- Test 1: valid enquiry succeeds ---- */
  await test("valid enquiry returns ok:true", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    const res = await post(ENDPOINT, {
      name: "Priya Sharma",
      phone: "9876543210",
      service: "Men's Haircut",
      date: "2026-12-01",
      time: "10:00",
      message: "Haircut please"
    });
    if (res.status !== 200) throw new Error("expected 200, got " + res.status);
    const data = JSON.parse(res.body);
    if (!data.ok) throw new Error("expected ok:true, got " + res.body);
  });

  /* ---- Test 2: CallMeBot URL contains phone, encoded text, apikey ---- */
  await test("CallMeBot URL contains phone, text, apikey", async function () {
    let capturedUrl = "";
    mockHandlers = [
      {
        hostname: "api.callmebot.com",
        pathname: "/whatsapp.php",
        handle: function (opts, cb) {
          capturedUrl = opts.path || "/";
          const res = {
            statusCode: 200,
            headers: { "content-type": "text/plain" },
            on: function (ev, fn) {
              if (ev === "data") setTimeout(function () { fn(Buffer.from("OK")); }, 10);
              if (ev === "end") setTimeout(fn, 20);
              return res;
            }
          };
          cb(res);
        }
      }
    ];
    await post(ENDPOINT, {
      name: "Rahul Verma",
      phone: "9876543210",
      service: "Bridal Makeup",
      date: "2026-12-15",
      time: "11:00",
      message: "Bridal booking"
    });
    if (!capturedUrl.includes("phone=")) throw new Error("URL missing phone param");
    if (!capturedUrl.includes("text=")) throw new Error("URL missing text param");
    if (!capturedUrl.includes("apikey=")) throw new Error("URL missing apikey param");
    const decoded = decodeURIComponent(capturedUrl);
    if (!decoded.includes("Nayi enquiry - Exotic Salon")) throw new Error("text missing Nayi enquiry");
    if (!decoded.includes("Naam: Rahul Verma")) throw new Error("text missing Naam");
    if (!decoded.includes("https://wa.me/919876543210")) throw new Error("text missing wa.me link");
  });

  /* ---- Test 3: apikey never in response ---- */
  await test("apikey never in response body", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    const res = await post(ENDPOINT, {
      name: "Test User",
      phone: "9123456789",
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: "Hello"
    });
    const body = res.body;
    if (body.includes("CALLMEBOT_APIKEY")) throw new Error("apikey leaked in response");
    if (body.includes("apikey=")) throw new Error("apikey param leaked in response");
    if (body.includes("CALLMEBOT_PHONE")) throw new Error("CALLMEBOT_PHONE leaked in response");
  });

  /* ---- Test 4: invalid phone ---- */
  await test("invalid phone rejected", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    const res = await post(ENDPOINT, {
      name: "Test User",
      phone: "123", // too short
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: "Hello"
    });
    if (res.status !== 400) throw new Error("expected 400, got " + res.status);
    const data = JSON.parse(res.body);
    if (data.ok) throw new Error("expected ok:false");
  });

  /* ---- Test 5: empty name ---- */
  await test("empty name rejected", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    const res = await post(ENDPOINT, {
      name: "",
      phone: "9876543210",
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: "Hello"
    });
    if (res.status !== 400) throw new Error("expected 400, got " + res.status);
    const data = JSON.parse(res.body);
    if (data.ok) throw new Error("expected ok:false");
  });

  /* ---- Test 6: past date ---- */
  await test("past date rejected", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    const res = await post(ENDPOINT, {
      name: "Test User",
      phone: "9876543210",
      service: "Facial",
      date: "2020-01-01",
      time: "14:00",
      message: "Hello"
    });
    if (res.status !== 400) throw new Error("expected 400, got " + res.status);
    const data = JSON.parse(res.body);
    if (data.ok) throw new Error("expected ok:false");
  });

  /* ---- Test 7: huge message ---- */
  await test("huge message rejected", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    const bigMsg = "x".repeat(501);
    const res = await post(ENDPOINT, {
      name: "Test User",
      phone: "9876543210",
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: bigMsg
    });
    if (res.status !== 400) throw new Error("expected 400, got " + res.status);
    const data = JSON.parse(res.body);
    if (data.ok) throw new Error("expected ok:false");
  });

  /* ---- Test 8: honeypot filled ---- */
  await test("honeypot filled returns ok:true and sends nothing", async function () {
    let callmebotHit = false;
    mockHandlers = [
      {
        hostname: "api.callmebot.com",
        pathname: "/whatsapp.php",
        handle: function (opts, cb) {
          callmebotHit = true;
          const res = {
            statusCode: 200,
            headers: { "content-type": "text/plain" },
            on: function (ev, fn) {
              if (ev === "data") setTimeout(function () { fn(Buffer.from("OK")); }, 10);
              if (ev === "end") setTimeout(fn, 20);
              return res;
            }
          };
          cb(res);
        }
      }
    ];
    const res = await post(ENDPOINT, {
      name: "Bot User",
      phone: "9876543210",
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: "spam",
      website: "filled by bot"
    });
    if (res.status !== 200) throw new Error("expected 200, got " + res.status);
    const data = JSON.parse(res.body);
    if (!data.ok) throw new Error("expected ok:true for honeypot");
    if (callmebotHit) throw new Error("CallMeBot should NOT be called for honeypot");
  });

  /* ---- Test 9: wrong method ---- */
  await test("wrong method rejected", async function () {
    mockHandlers = [];
    return new Promise(function (resolve, reject) {
      const url = new URL(ENDPOINT, BASE);
      const opts = { method: "GET", headers: { Origin: BASE }, timeout: 8000 };
      const req = http.request(url, opts, function (res) {
        let data = "";
        res.on("data", function (c) { data += c; });
        res.on("end", function () {
          try {
            if (res.status !== 405) throw new Error("expected 405, got " + res.status);
            const d = JSON.parse(data);
            if (d.ok) throw new Error("expected ok:false");
            resolve();
          } catch (e) { reject(e); }
        });
      });
      req.on("error", reject);
      req.end();
    });
  });

  /* ---- Test 10: rate-limit overflow ---- */
  await test("rate-limit overflow returns 429", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    /* Send 3 valid enquiries fast (IP limit is 3 per 10 min) */
    for (let i = 0; i < 3; i++) {
      const r = await post(ENDPOINT, {
        name: "Rate Test " + i,
        phone: "9" + String(i).padStart(9, "0"),
        service: "Facial",
        date: "2026-12-20",
        time: "14:00",
        message: "test " + i
      });
      if (r.status !== 200) throw new Error("enquiry " + i + " should succeed, got " + r.status);
    }
    /* 4th should be rate-limited */
    const r4 = await post(ENDPOINT, {
      name: "Rate Test 4",
      phone: "9" + String(4).padStart(9, "0"),
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: "test 4"
    });
    if (r4.status !== 429) throw new Error("expected 429, got " + r4.status);
    const d4 = JSON.parse(r4.body);
    if (d4.ok) throw new Error("expected ok:false");
  });

  /* ---- Test 11: one channel failing still succeeds when another works ---- */
  await test("one channel failing still succeeds when another works", async function () {
    let callmebotFailed = false;
    mockHandlers = [
      {
        hostname: "api.callmebot.com",
        pathname: "/whatsapp.php",
        handle: function (opts, cb) {
          callmebotFailed = true;
          const res = {
            statusCode: 500,
            headers: { "content-type": "text/plain" },
            on: function (ev, fn) {
              if (ev === "data") setTimeout(function () { fn(Buffer.from("Error")); }, 10);
              if (ev === "end") setTimeout(fn, 20);
              return res;
            }
          };
          cb(res);
        }
      }
    ];
    const res = await post(ENDPOINT, {
      name: "Mixed Test",
      phone: "9876543210",
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: "Hello"
    });
    if (res.status !== 200) throw new Error("expected 200 when one channel works, got " + res.status);
    const data = JSON.parse(res.body);
    if (!data.ok) throw new Error("expected ok:true when at least one channel works");
  });

  /* ---- Test 12: no secret in response or log ---- */
  await test("no secret appears in response", async function () {
    mockHandlers = [
      mockHandler("api.callmebot.com", "/whatsapp.php", 200, "OK", 20)
    ];
    const res = await post(ENDPOINT, {
      name: "Secret Test",
      phone: "9876543210",
      service: "Facial",
      date: "2026-12-20",
      time: "14:00",
      message: "Hello"
    });
    const body = res.body;
    if (body.includes("CALLMEBOT_APIKEY")) throw new Error("API key in response");
    if (body.includes("CALLMEBOT_PHONE")) throw new Error("CALLMEBOT_PHONE in response");
    if (body.includes("TELEGRAM_BOT_TOKEN")) throw new Error("Telegram token in response");
    if (body.includes("TELEGRAM_CHAT_ID")) throw new Error("Telegram chat ID in response");
    if (body.includes("SMTP_USER")) throw new Error("SMTP_USER in response");
    if (body.includes("SMTP_PASS")) throw new Error("SMTP_PASS in response");
  });

  uninstallMock();

  console.log("\n========================================");
  console.log("Results: " + passes + " passed, " + fails + " failed");
  console.log("========================================");
  process.exit(fails > 0 ? 1 : 0);
}

run().catch(function (err) {
  console.error("Test runner error:", err);
  process.exit(1);
});
