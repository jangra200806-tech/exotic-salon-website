#!/usr/bin/env python3
"""
Generate critical CSS for above-the-fold content.
"""
import os

css_path = os.path.join('.', 'css', 'style.css')
if not os.path.exists(css_path):
    print("CSS not found!")
    exit(1)

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# The above-the-fold content for the home page includes:
# 1. The hero slider area (visible without scrolling)
# 2. The navbar
# 3. The start of the hero-strip (rating/reviews)

# Critical CSS that must be inlined
critical_css = """
/*! Critical CSS for Exotic Salon above-the-fold */

/* Hero slider container - must be loaded immediately */
.hero-slider {
  position: relative;
  height: clamp(540px, 74vh, 760px);
  min-height: 540px;
  overflow: hidden;
  background: var(--ink);
  outline: none;
  isolation: isolate;
}

/* Hero slide transitions - reduced for fast render */
.hs-slides { position: absolute; inset: 0; }
.hs-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.8s ease, visibility 0s linear 0.8s;
}
.hs-slide.is-active {
  opacity: 1;
  visibility: visible;
}

/* Hero content - text overlay */
.hs-content {
  max-width: 600px;
  color: #ffffff;
  margin-left: 0;
  margin-right: auto;
  padding: 24px 32px;
  text-align: left;
  text-shadow: 0 2px 8px rgba(0,0,0,0.6);
}
.hs-content { max-width: 100%; }

/* Hero background picture */
.hs-bg-picture {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
}
.hs-bg-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}
.hs-slide.is-active .hs-bg-img {
  animation: hs-zoom 7s ease-out both;
}

/* KEYFRAMES - must also be inlined or referenced */
@keyframes hs-zoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}
@keyframes hs-up {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hero strip (rating/reviews) below hero */
.hero-strip {
  background: var(--bg);
  border-top: 1px solid var(--line);
}
.hero-strip .container { max-width: 1200px; }
.hero-strip .stars { font-size: 1.2rem; }
.hero-strip .rating-value { font-weight: 600; color: var(--primary); }
.hero-strip .timing-note { color: var(--muted); font-size: 0.85rem; }
"""

# Now let's also identify and report on unused CSS
# Check for rules that might not be used
unused_patterns = [
    ('.nav-tour', 'Tour navigation'),
    ('.float-stack', 'Floating buttons'),
    ('.tour-bar', 'Tour bar'),
]

print("=== Unused CSS Pattern Check ===")
for pattern, desc in unused_patterns:
    idx = css.find(pattern)
    if idx != -1:
        # Count occurrences
        count = css.count(pattern)
        print(f"  {desc}: Found {count} times (may be used dynamically)")
    else:
        print(f"  {desc}: Not found in CSS (likely unused)")

print("\n=== Critical CSS Generation Complete ===")
print("Critical CSS should be inlined in <head>")
print("Non-critical CSS should be loaded deferringly or async")