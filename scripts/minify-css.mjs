/* =========================================================
   scripts/minify-css.mjs
   ---------------------------------------------------------
   Simple CSS minifier for production.
   Removes comments and unnecessary whitespace.
   Run: npm run build:css
   ========================================================= */

import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const CSS_DIR = path.join(ROOT, "css");
const OUT_FILE = path.join(ROOT, "css", "style.min.css");

function minify(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")       /* remove block comments */
    .replace(/[ \t]+/g, " ")                 /* collapse whitespace */
    .replace(/\s*([{}:;,>+~])\s*/g, "$1")   /* space around operators */
    .replace(/;\s*}/g, "}")                  /* trailing semicolon before } */
    .replace(/\s+/g, " ")                    /* collapse all whitespace */
    .replace(/;\s*/g, ";")                   /* space after semicolon */
    .replace(/,\s*/g, ",")                   /* space after comma */
    .trim();
}

const cssFile = path.join(CSS_DIR, "style.css");
if (!fs.existsSync(cssFile)) {
  console.error("❌ css/style.css not found");
  process.exit(1);
}

const css = fs.readFileSync(cssFile, "utf8");
const minified = minify(css);
fs.writeFileSync(OUT_FILE, minified);

console.log("✅ CSS minified: " + OUT_FILE);
console.log("   Original: " + (css.length / 1024).toFixed(1) + " KB");
console.log("   Minified: " + (minified.length / 1024).toFixed(1) + " KB");
