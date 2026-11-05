#!/usr/bin/env python3
"""Simple image optimization: add loading and dimensions to img tags."""
import os
import re

html_files = ['index.html', 'services.html', 'gallery.html', 'contact.html']

for html_file in html_files:
    path = os.path.join('.', html_file)
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    changes = 0
    
    for line in lines:
        new_line = line
        
        # Add width and height to img tags missing them
        if '<img' in new_line and 'width=' not in new_line.lower() and 'height=' not in new_line.lower():
            # Add width and height before closing >
            # Determine reasonable defaults
            # Hero images: 16:9, others: 4:3
            if 'hero' in new_line.lower() or 'hs-slide' in new_line.lower():
                w, h = '1200', '680'  # 16:9 approx
            else:
                w, h = '800', '600'  # 4:3 approx
            
            # Only add if no width/height attribute exists
            if 'width="' not in new_line and 'height="' not in new_line:
                new_line = new_line.rstrip('>\n') + ' width="' + w + '" height="' + h + '" >'
                changes += 1
        
        # Add loading="lazy" to below-the-fold images (not hero)
        if '<img' in new_line and 'loading="lazy"' not in new_line and 'loading=lazy' not in new_line.lower():
            # Skip hero section images
            hero_terms = ['hero-slider', 'hs-slide', '.hs-', 'home']
            is_hero = any(t in new_line.lower() for t in hero_terms)
            if not is_hero:
                new_line = new_line.rstrip('>\n') + ' loading="lazy" >'
                changes += 1
        
        new_lines.append(new_line)
    
    new_content = ''.join(new_lines)
    if new_content != ''.join(lines):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"{html_file}: {changes} img tags updated")
    else:
        print(f"{html_file}: No changes needed")