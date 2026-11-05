#!/usr/bin/env python3
"""Fix images: add loading='lazy' and width/height attributes to all <img> tags in HTML files."""
import os
import re

html_files = ['index.html', 'services.html', 'gallery.html', 'contact.html']

for html_file in html_files:
    path = os.path.join('.', html_file)
    if not os.path.exists(path):
        continue
    
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Add width and height attributes to all <img> tags that don't have them
    # This prevents CLS (Cumulative Layout Shift)
    def add_dimensions(match):
        img_tag = match.group(0)
        # Check if width or height already present
        has_width = re.search(r'\bwidth\s*=\s*"\d+"', img_tag) or re.search(r"\bwidth\s*=\s*'\d+'", img_tag)
        has_height = re.search(r'\bheight\s*="\d+"', img_tag) or re.search(r"\bheight\s*=\s*'\d+'", img_tag)
        
        if not has_width or not has_height:
            # Add width and height before the closing >
            # Use sensible defaults based on typical salon images
            w = '800'  # typical width
            h = '600'  # typical height for 4:3 ratio
            
            # Check if img already has a style with aspect-ratio
            has_style = 'style=' in img_tag
            
            if has_style:
                # Add width/height to existing style
                if 'width' not in img_tag.lower():
                    img_tag = re.sub(r'(style="[^"]*)"', r'\1 width="' + w + '" height="' + h + '"', img_tag)
                if 'height' not in img_tag.lower():
                    img_tag = re.sub(r'(style="[^"]*)"', r'\1 width="' + w + '" height="' + h + '"', img_tag)
            else:
                # Add standalone width and height attributes
                img_tag = img_tag.rstrip('>') + ' width="' + w + '" height="' + h + '" >'
            
            return img_tag
        return img_tag
    
    # Find all <img> tags and add dimensions
    content = re.sub(r'<img[^>]*>', add_dimensions, content)
    
    # Add loading="lazy" to images that don't have it and are not hero images
    def add_lazy(match):
        img_tag = match.group(0)
        # Skip hero section images (they're above-the-fold for LCP)
        hero_markers = ['hero-slider', 'hs-slide', 'hs-bg-img', 'heroSlides', 'home']
        is_hero = any(marker in img_tag.lower() for marker in hero_markers)
        
        if not is_hero and 'loading="lazy"' not in img_tag and 'loading=lazy' not in img_tag.lower():
            # Add loading="lazy" before the closing >
            if ' loading=' not in img_tag.lower():
                img_tag = img_tag.rstrip('>') + ' loading="lazy" >'
            return img_tag
        return img_tag
    
    # Apply transformations
    content = re.sub(r'<img[^>]*>', add_dimensions, content)
    content = re.sub(r'<img[^>]*>', add_lazy, content)
    
    # Only write if changes were made
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        added_dims = len(re.findall(r'width="\d+"', content)) - len(re.findall(r'width="\d+"', original)) if original else 0
        added_lazy = content.count('loading="lazy"') - original.count('loading="lazy"') if original else 0
        print(f"{html_file}: Added dimensions to {added_dims} images, lazy-loaded {added_lazy} images")
    else:
        print(f"{html_file}: No changes needed")