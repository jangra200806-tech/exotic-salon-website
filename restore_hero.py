#!/usr/bin/env python3
"""Restore the hero slider section."""
import os

html_path = os.path.join('C:\\\\Users\\\\NCR\\\\Desktop\\\\exotic saloon\\\\exotic-salon', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the position after hero-main-text section
# Look for the closing </section> of hero-main-text
insert_pos = -1
for i, line in enumerate(lines):
    if '</section>' in line and 'hero-main-text' in lines[i-3:i+1]:
        insert_pos = i + 1
        break

if insert_pos != -1:
    # Hero slider HTML (without star characters for now)
    hero_slider_html = [
        '  <!-- ============ 1. HERO SLIDER ============ -->\n',
        '  <section class="hero-slider" id="home" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Salon highlights">\n',
        '    <div class="hs-slides" id="heroSlides"></div>\n',
        '    <div class="hs-dots" id="heroDots" role="tablist" aria-label="Choose slide"></div>\n',
        '  </section>\n',
        '\n',
        '    <div class="hero-strip">\n',
    ]
    
    # Insert the hero slider section after the hero-main-text
    new_lines = lines[:insert_pos] + hero_slider_html + lines[insert_pos:]
    
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(''.join(new_lines))
    print(f"Hero slider restored at line {insert_pos}")
else:
    print("Could not find hero-main-text section end")
"