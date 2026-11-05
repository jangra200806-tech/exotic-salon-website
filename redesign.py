#!/usr/bin/env python3
"""Main redesign script - updates CSS tokens first."""
import os

css_path = os.path.join('C:\\\\Users\\\\NCR\\\\Desktop\\\\exotic saloon\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the entire tokens section
old_tokens = """/* ---------------------------------------------------------
   1. TOKENS
   --------------------------------------------------------- */
:root {
  --bg: #070b14;
  --bg-alt: #0c1322;
  --card: #101a2e;
  --line: rgba(255,255,255,0.08);
  --line-strong: rgba(255,255,255,0.16);
  --text: #eef3ff;
  --muted: #9aa8c7;
  --blue: var(--blue);
  --blue-light: var(--blue);
  --cyan: var(--blue);
  --coral: var(--blue);
  
  --container: 1160px;
  --sec-y: 88px;
  --radius: 16px;
  --pad: 24px;
  --header-h: 72px;

  --font-head: "Syne", sans-serif;
  --font-body: "DM Sans", sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  --mb-bar-h: 0px;
  --sec-y-mobile: 60px;
  color-scheme: dark;
}"""

new_tokens = """/* ---------------------------------------------------------
   1. TOKENS — Luxury Beauty Salon
   ---------------------------------------------------------
   Colours (ONLY these):
     Cream/ivory backgrounds · charcoal text · champagne gold accents · soft beige sections
   ========================================================= */
:root {
  --bg: #f7f4f0;
  --bg-alt: #f4f1ec;
  --card: #ffffff;
  --line: rgba(0,0,0,0.08);
  --line-strong: rgba(0,0,0,0.12);
  --text: #2a2a2a;
  --muted: #6b6b6b;
  --gold: #d4a853;
  --gold-light: #f0c27a;
  --charcoal: #1c1c1c;
  --charcoal-light: #333333;
  
  --container: 1200px;
  --sec-y: 100px;
  --radius: 20px;
  --pad: 32px;
  --header-h: 80px;

  --font-head: "Playfair Display", serif;
  --font-body: "Inter", sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);

  --mb-bar-h: 0px;
  --sec-y-mobile: 80px;
  color-scheme: light;
}"""

if old_tokens in content:
    content = content.replace(old_tokens, new_tokens)
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("CSS tokens updated successfully")
else:
    print("Old tokens pattern not found - checking for partial matches")
    # Check what the :root section looks like
    idx = content.find(':root {')
    if idx != -1:
        print("Found :root at index", idx)
        print(content[idx:idx+200])
    else:
        print(":root not found")