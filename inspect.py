#!/usr/bin/env python3
import os

print("=" * 70)
print("EXOTIC SALON WEBSITE - COMPREHENSIVE CODE INSPECTION")
print("=" * 70)
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
print("--- CSS INFO ---")
css_path = os.path.join('.', 'css', 'style.css')
if os.path.exists(css_path):
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    print(f"CSS: {len(css_content)} characters, approx {len(css_content)//50} rule blocks")

print()
print("--- JAVASCRIPT FILES ---")
js_dir = os.path.join('.', 'js')
if os.path.isdir(js_dir):
    js_files = [f for f in os.listdir(js_dir) if f.endswith('.js')]
    print(f"Total JS files: {len(js_files)}")
    for jf in js_files:
        jpath = os.path.join(js_dir, jf)
        with open(jpath, 'r', encoding='utf-8') as f:
            jlines = len(f.readlines())
        print(f"  {jf}: {jlines} lines")

print()
print("--- IMAGES ---")
img_dir = os.path.join('.', 'images')
if os.path.isdir(img_dir):
    all_imgs = os.listdir(img_dir)
    jpgs = [f for f in all_imgs if f.lower().endswith('.jpg')]
    webps = [f for f in all_imgs if f.lower().endswith('.webp')]
    print(f"Total images: {len(all_imgs)}")
    print(f"  JPGs: {len(jpgs)}")
    print(f"  WebPs: {len(webps)}")
    # Print categorized list
    categories = {}
    for img in all_imgs:
        lower = img.lower()
        if 'hero' in lower or 'bride' in lower:
            cat = 'Hero/Bride'
        elif 'service' in lower or 'service' in lower:
            cat = 'Services'
        elif 'gallery' in lower:
            cat = 'Gallery'
        elif 'about' in lower:
            cat = 'About'
        elif 'contact' in lower:
            cat = 'Contact'
        elif 'bg-' in lower:
            cat = 'Backgrounds'
        else:
            cat = 'Other'
        categories.setdefault(cat, []).append(img)
    
    for cat, imgs in categories.items():
        print(f"  {cat}: {len(imgs)} images")
        for img in imgs[:3]:  # Show first 3 per category
            print(f"    - {img}")
        if len(imgs) > 3:
            print(f"    ... and {len(imgs)-3} more")

print()
print("--- KEY ELEMENTS ACROSS ALL PAGES ---")
for f in html_files:
    path = os.path.join('.', f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as fh:
            content = fh.read()
        print(f"\n{f}:")
        elements = {
            '<header>': '<header' in content,
            'navbar/nav': 'nav' in content,
            'hero section': 'hero' in content.lower(),
            'services': 'services' in content.lower(),
            'gallery': 'gallery' in content.lower(),
            'contact': 'contact' in content.lower(),
            'FAQ/faq': 'faq' in content.lower() or 'FAQ' in content,
            'lightbox/modal': 'lightbox' in content.lower() or 'modal' in content.lower(),
            'booking/book': 'book' in content.lower(),
            'WhatsApp': 'whatsapp' in content.lower() or 'wa.me' in content.lower(),
            'phone/tel': 'tel:' in content.lower(),
            'footer': '<footer' in content,
            'breadcrumb': 'breadcrumb' in content.lower(),
            'schema/ld+json': 'application/ld+json' in content,
            'canonical': 'canonical' in content,
        }
        for k, v in elements.items():
            print(f"  {k}: {'✅' if v else '❌'}")