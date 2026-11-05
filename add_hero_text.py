#!/usr/bin/env python3
"""Add hero section text to index.html."""
import os

html_path = os.path.join('C:\\\\Users\\\\NCR\\\\Desktop\\\\exotic saloon\\\\exotic-salon', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the hero-slider section start
hero_start = -1
for i, line in enumerate(lines):
    if '`<section class="hero-slider"' in line or 'class="hero-slider"' in line:
        hero_start = i
        break

if hero_start != -1:
    # New hero main text section HTML
    hero_text_html = [
        '  <!-- ============ 0. HERO MAIN TEXT ============ -->\n',
        '  <section class="hero-main-text">\n',
        '    <div class="container">\n',
        '      <div class="row gy-4 align-items-center">\n',
        '        <div class="col-lg-7">\n',
        '          <h2 class="hero-main-heading">Welcome to\nExotic Salon</h2>\n',
        '          <p class="hero-main-subtitle">Look Beautiful • Feel Confident • Be You</p>\n',
        '        </div>\n',
        '        <!-- Preserve the hero image area -->\n',
    '        <div class="col-lg-5">\n',
    '          <!-- Hero image placeholder -->\n',
    '        </div>\n',
    '      </div>\n',
    '    </div>\n',
    '  </section>\n',
    '\n',
]
    
    if hero_start != -1:
        # Insert the hero text section before the hero-slider
        # First find the hero-slider line
        hero_slider_line = -1
        for i, line in enumerate(lines):
            if '`<section class="hero-slider"' in line or 'class="hero-slider"' in line:
                hero_slider_line = i
                break
        
        if hero_slider_line != -1:
            # Insert the new section before the hero slider
            new_lines = hero_text_html + lines[:hero_slider_line]
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(''.join(new_lines))
            print(f"Hero text section added before hero slider at line {hero_slider_line}")
        else:
            print("Hero slider not found")
    else:
        print("Hero start not found")
else:
    print("Hero section not found")