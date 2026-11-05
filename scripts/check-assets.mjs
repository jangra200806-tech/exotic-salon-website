/* =========================================================
   scripts/check-assets.mjs
   ---------------------------------------------------------
   Checks every image, video and font referenced in the 4 HTML
   pages, data/info.js and CSS. Prints PASS/FAIL for each.
   Run: node scripts/check-assets.mjs
   ========================================================= */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const results = [];

function gitTracked(filePath) {
  try {
    execSync(`git -C "${ROOT}" ls-files --error-unmatch "${filePath}"`, {
      stdio: "pipe",
    });
    return true;
  } catch (e) {
    return false;
  }
}

function gitIgnored(filePath) {
  try {
    execSync(`git -C "${ROOT}" check-ignore -v "${filePath}"`, {
      stdio: "pipe",
    });
    return true;
  } catch (e) {
    return false;
  }
}

function check(label, filePath, maxSizeKB = 400) {
  const fullPath = path.join(ROOT, filePath);
  let status = "PASS";
  let notes = [];

  if (!fs.existsSync(fullPath)) {
    status = "FAIL";
    notes.push("FILE NOT FOUND ON DISK");
  } else {
    const stat = fs.statSync(fullPath);
    const sizeKB = (stat.size / 1024).toFixed(1);
    notes.push(`${sizeKB} KB`);

    if (sizeKB > maxSizeKB && (filePath.endsWith(".jpg") || filePath.endsWith(".webp") || filePath.endsWith(".png"))) {
      status = "FAIL";
      notes.push(`SIZE EXCEEDS ${maxSizeKB} KB LIMIT`);
    }

    if (!gitTracked(filePath)) {
      notes.push("NOT TRACKED BY GIT");
    }

    const ignored = gitIgnored(filePath);
    if (ignored) {
      status = "FAIL";
      notes.push("IGNORED BY .gitignore");
    }
  }

  results.push({ label, filePath, status, notes });
}

function addRefsFromHtml(htmlFile) {
  const html = fs.readFileSync(path.join(ROOT, htmlFile), "utf8");

  const srcRegex = /(?:src|href|poster|imagesrcset)=\s*["']([^"'\s]+)["']/gi;
  let m;
  while ((m = srcRegex.exec(html)) !== null) {
    let url = m[1];
    if (url.startsWith("http") || url.startsWith("#") || url.startsWith("data:")) continue;
    if (url.includes("fonts.googleapis") || url.includes("fonts.gstatic")) continue;
    check(htmlFile + " → " + url, url);
  }

  const urlRegex = /url\(\s*["']?([^"'\s)]+)["']?\)/gi;
  while ((m = urlRegex.exec(html)) !== null) {
    let url = m[1];
    if (url.startsWith("http") || url.startsWith("#") || url.startsWith("data:")) continue;
    check(htmlFile + " → url() " + url, url);
  }
}

function addRefsFromInfoJs() {
  const infoJs = fs.readFileSync(path.join(ROOT, "data/info.js"), "utf8");
  const srcRegex = /["']([^"']*\.(?:jpg|webp|png|mp4|svg))["']/gi;
  let m;
  while ((m = srcRegex.exec(infoJs)) !== null) {
    check("data/info.js → " + m[1], m[1]);
  }
}

function addRefsFromCss(cssFile) {
  const css = fs.readFileSync(path.join(ROOT, cssFile), "utf8");
  const urlRegex = /url\(\s*["']?([^"'\s)]+)["']?\)/gi;
  let m;
  while ((m = urlRegex.exec(css)) !== null) {
    let url = m[1];
    if (url.startsWith("http") || url.startsWith("#") || url.startsWith("data:")) continue;
    check(cssFile + " → url() " + url, url);
  }
}

// Check all 4 HTML pages
["index.html", "services.html", "gallery.html", "contact.html"].forEach(addRefsFromHtml);

// Check data/info.js
addRefsFromInfoJs();

// Check CSS
addRefsFromCss("css/style.css");

// Print results
console.log("\n========================================");
console.log("ASSET CHECK RESULTS");
console.log("========================================\n");

let passCount = 0;
let failCount = 0;

for (const r of results) {
  const icon = r.status === "PASS" ? "✅" : "❌";
  console.log(`${icon} ${r.status} | ${r.label}`);
  for (const n of r.notes) console.log(`      ${n}`);
  if (r.status === "PASS") passCount++;
  else failCount++;
}

console.log("\n========================================");
console.log(`PASS: ${passCount} | FAIL: ${failCount} | TOTAL: ${results.length}`);
console.log("========================================\n");

process.exit(failCount > 0 ? 1 : 0);
