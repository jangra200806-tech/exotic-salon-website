#!/usr/bin/env python3
import os

print("=== EXOTIC SALON WEBSITE - COMPREHENSIVE ANALYSIS ===")
print()

# HTML files analysis
html_files = ['index.html', 'services.html', 'gallery.html', 'contact.html']
print("--- HTML PAGES ---")
for f in html_files:
    path = os.path.join('.', f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as fh:
            lines = fh.readlines()
        print(f"{f}: {len(lines)} lines, {os.path.getsize(path)} bytes")

print()

# CSS analysis
css_path = os.path.join('.', 'css', 'style.css')
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    print(f"CSS: {len(css_content)} characters")
    # Count CSS rules
    import re
    rules = re.findall(r'[.#][a-zA-Z-]+\s*\{', css_content)
    print(f"CSS rules (approx): {len(rules)}")

print()

# JS files analysis
js_dir = os.path.join('.', 'js')
if os.path.isdir(js_dir):
    js_files = [f for f in os.listdir(js_dir) if f.endswith('.js')]
    print(f"JS files: {len(js_files)}")
    for jf in js_files:
        jpath = os.path.join(js_dir, jf)
        with open(jpath, 'r', encoding='utf-8') as f:
            jlines = len(f.readlines())
        print(f"  {jf}: {jlines} lines")

print()

# Images analysis
img_dir = os.path.join('.', 'images')
if os.path.isdir(img_dir):
    all_imgs = os.listdir(img_dir)
    jpgs = [f for f in all_imgs if f.lower().endswith('.jpg')]
    webps = [f for f in all_imgs if f.lower().endswith('.webp')]
    print(f"Total images: {len(all_imgs)}")
    print(f"JPGs: {len(jpgs)}")
    print(f"WebPs: {len(webps)}")
    # Print some image names
    print(f"Sample images: {all_imgs[:10]}")

print()

# Check for key elements across all HTML files
print("--- KEY ELEMENTS ACROSS PAGES ---")
for f in html_files:
    path = os.path.join('.', f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as fh:
            content = fh.read()
        print(f"\n{f}:")
        print(f"  <header>/navbar: {'<header' in content and 'nav' in content}")
        print(f"  <footer>: {'<footer' in content}")
        print(f"  hero section: {'hero' in content.lower()}")
        print(f"  services: {'services' in content.lower()}")
        print(f"  gallery: {'gallery' in content.lower()}")
        print(f"  contact: {'contact' in content.lower()}")
        print(f"  FAQ: {'faq' in content.lower() or 'FAQ' in content}")
        print(f"  modal/lightbox: {'lightbox' in content.lower() or 'modal' in content.lower()}")
        print(f"  booking/contact button: {'book' in content.lower() or 'contact' in content.lower()}")
        print(f"  WhatsApp: {'whatsapp' in content.lower() or 'wa.me' in content.lower()}")
        print(f"  phone link: {'tel:' in content.lower()}")