#!/usr/bin/env python3
import os

html_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the hero-main-text section end and insert hero slider after it
for i, line in enumerate(lines):
    if 'hero-main-subtitle' in line:
        # Insert hero slider after the hero-main-text section (after line i)
        # But we need to find the right place - after the col-lg-5 div
        hero_slider = [
            '  <!-- ============ 1. HERO SLIDER ============ -->\n',
            '  <section class="hero-slider" id="home" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Salon highlights">\n',
            '    <div class="hs-slides" id="heroSlides"></div>\n',
            '    <div class="hs-dots" id="heroDots" role="tablist" aria-label="Choose slide"></div>\n',
            '  </section>\n',
            '\n',
            '  <!-- ============ 2. HERO STRIP ============ -->\n',
            '  <section class="hero-strip">\n',
            '    <div class="container hero-strip-inner">\n',
            '      <span class="stars" aria-hidden="true">★★★★★</span>\n',
            '      <span><b class="js-rating-value">4.9</b> Google rating</span>\n',
            '      <span class="hero-strip-dot" aria-hidden="true"></span>\n',
            '      <span><span class="js-rating-count">60+</span> reviews</span>\n',
            '      <span class="hero-strip-dot" aria-hidden="true"></span>\n',
            '      <span class="js-timings-note">Open all 7 days</span>\n',
            '      <span class="hero-strip-dot" aria-hidden="true"></span>\n',
            '      <span class="js-hero-area">Huda Sector 20, Kaithal</span>\n',
            '    </div>\n',
            '  </section>\n',
            '\n',
        ]
        
        # Insert after the current line
        new_lines = lines[:i+1] + hero_slider + lines[i+1:]
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(''.join(new_lines))
        print(f"Hero slider restored after line {i+1}")
        break
else:
    print("Could not find hero-main-subtitle insertion point")