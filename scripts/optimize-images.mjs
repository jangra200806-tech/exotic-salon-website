/* =========================================================
   scripts/optimize-images.mjs
   ---------------------------------------------------------
   Image optimization for Exotic Salon website.
   
   Reads every JPG/PNG in images/ and images/services/,
   copies originals to originals/ (without overwriting),
   writes WebP versions at widths 480/720/800/1200/1600
   (never upscale, quality 78), plus a source-width WebP for
   images narrower than 480px, and a JPG fallback at 1200px
   (quality 80).
   
   Skips: images/og-image.jpg, favicon files, logos, SVGs.
   
   Run: npm run images
   ========================================================= */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const IMAGES_DIR = path.join(ROOT, "images");
const SERVICES_DIR = path.join(ROOT, "images", "services");
const ORIGINALS_DIR = path.join(ROOT, "originals");

const WEBP_QUALITY = 78;
const JPG_QUALITY = 80;
const WIDTHS = [480, 720, 800, 1200, 1600];
const JPG_FALLBACK_WIDTH = 1200;

/* Files to skip entirely */
const SKIP_NAMES = ["og-image.jpg", "og-image.webp", "favicon.svg", "robot.svg"];
const SKIP_EXTENSIONS = [".svg", ".webp"];

function shouldSkip(filePath) {
  const name = path.basename(filePath);
  const ext = path.extname(name).toLowerCase();
  if (SKIP_EXTENSIONS.includes(ext)) return true;
  if (SKIP_NAMES.includes(name)) return true;
  /* Do not treat already-generated width variants as source images. */
  if (/-\d{3,4}\.(jpe?g|png)$/i.test(name)) return true;
  return false;
}

function getOutputName(stem, width, format) {
  return `${stem}-${width}.${format}`;
}

function getJpgFallbackName(stem) {
  return `${stem}-${JPG_FALLBACK_WIDTH}.jpg`;
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function getImageMeta(filePath) {
  const metadata = await sharp(filePath).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format,
    size: fs.statSync(filePath).size
  };
}

async function copyOriginal(src, destDir) {
  const name = path.basename(src);
  const dest = path.join(destDir, name);
  if (fs.existsSync(dest)) return; // don't overwrite
  fs.copyFileSync(src, dest);
}

async function processImage(filePath, relativeFromImages) {
  const name = path.basename(filePath, path.extname(filePath));
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".jpg" && ext !== ".png" && ext !== ".jpeg") return null;

  const stem = relativeFromImages
    ? relativeFromImages.replace(/\.(jpg|jpeg|png)$/i, "")
    : name;

  const meta = await getImageMeta(filePath);
  const results = [];

  /* Copy original to originals/ */
  await copyOriginal(filePath, ORIGINALS_DIR);

  /* Determine max width to generate (never upscale). Narrow sources get
     one WebP at their own width so every photo can use WebP. */
  const maxSourceWidth = meta.width;
  const standardWidths = WIDTHS.filter((w) => w <= maxSourceWidth);
  const targetWidths = standardWidths.length ? standardWidths : [maxSourceWidth];

  /* Generate WebP versions */
  for (const w of targetWidths) {
    const outName = getOutputName(stem, w, "webp");
    const outPath = path.join(IMAGES_DIR, outName);
    await sharp(filePath)
      .resize(w, null, { withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outPath);
    const outSize = fs.statSync(outPath).size;
    results.push({ name: outName, before: meta.size, after: outSize });
  }

  /* Generate JPG fallback at 1200px */
  if (maxSourceWidth >= JPG_FALLBACK_WIDTH) {
    const jpgName = getJpgFallbackName(stem);
    const jpgPath = path.join(IMAGES_DIR, jpgName);
    await sharp(filePath)
      .resize(JPG_FALLBACK_WIDTH, null, { withoutEnlargement: true })
      .jpeg({ quality: JPG_QUALITY })
      .toFile(jpgPath);
    const jpgSize = fs.statSync(jpgPath).size;
    results.push({ name: jpgName, before: meta.size, after: jpgSize });
  }

  return results;
}

async function main() {
  await ensureDir(ORIGINALS_DIR);

  const imageFiles = [];

  /* Collect images from images/ */
  if (fs.existsSync(IMAGES_DIR)) {
    for (const entry of fs.readdirSync(IMAGES_DIR, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const fullPath = path.join(IMAGES_DIR, entry.name);
      if (shouldSkip(fullPath)) continue;
      imageFiles.push({ fullPath, relative: entry.name });
    }
  }

  /* Collect images from images/services/ */
  if (fs.existsSync(SERVICES_DIR)) {
    for (const entry of fs.readdirSync(SERVICES_DIR, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const fullPath = path.join(SERVICES_DIR, entry.name);
      if (shouldSkip(fullPath)) continue;
      imageFiles.push({ fullPath, relative: "services/" + entry.name });
    }
  }

  console.log("📷 Processing " + imageFiles.length + " images...\n");

  const allResults = [];

  for (const { fullPath, relative } of imageFiles) {
    const results = await processImage(fullPath, relative);
    if (results) {
      allResults.push({ relative, results });
    }
  }

  /* Print table */
  console.log("┌─────────────────────────────────────┬──────────┬──────────┬─────────┐");
  console.log("│ File                                │ Before   │ After    │ Saved   │");
  console.log("├─────────────────────────────────────┼──────────┼──────────┼─────────┤");
  let totalBefore = 0;
  let totalAfter = 0;
  for (const item of allResults) {
    for (const r of item.results) {
      const saved = r.before - r.after;
      totalBefore += r.before;
      totalAfter += r.after;
      const name = r.name.padEnd(35).slice(0, 35);
      const before = (r.before / 1024).toFixed(1) + " KB";
      const after = (r.after / 1024).toFixed(1) + " KB";
      const savedStr = (saved / 1024).toFixed(1) + " KB";
      console.log("│ " + name + " │ " + before.padEnd(8) + " │ " + after.padEnd(8) + " │ " + savedStr.padEnd(7) + " │");
    }
  }
  console.log("└─────────────────────────────────────┴──────────┴──────────┴─────────┘");
  console.log("\n✅ Total before: " + (totalBefore / 1024 / 1024).toFixed(2) + " MB");
  console.log("✅ Total after:  " + (totalAfter / 1024 / 1024).toFixed(2) + " MB");
  console.log("✅ Saved:        " + ((totalBefore - totalAfter) / 1024 / 1024).toFixed(2) + " MB");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
