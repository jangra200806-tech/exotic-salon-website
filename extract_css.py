#!/usr/bin/env python3
"""
Extract critical CSS (above-the-fold) and identify unused CSS.
"""
import os

css_path = os.path.join('.', 'css', 'style.css')
if not os.path.exists(css_path):
    print("CSS not found!")
    exit(1)

with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# The hero section is key for LCP
# Look for hero-slider related CSS
hero_keywords = ['.hero-slider', '.hs-slide', '.hs-content', '.hs-bg-picture', '.hs-bg-img']

print("=== Hero/Critical CSS Section ===")
for kw in hero_keywords:
    idx = css.find(kw)
    if idx != -1:
        # Print 200 chars starting from the keyword
        end = min(idx + 200, len(css))
        print(f"\n--- {kw} ---")
        print(css[idx:end])
    else:
        print(f"\n--- {kw}: NOT FOUND ---")

print("\n\n=== Critical CSS Extraction Complete ===")