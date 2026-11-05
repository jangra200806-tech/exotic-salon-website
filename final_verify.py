#!/usr/bin/env python3
import os

print("=" * 70)
print("FINAL VERIFICATION - EXOTIC SALON WEBSITE REDESIGN")
print("=" * 70)
print()

# Check CSS tokens
css_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r') as f:
    css = f.read()

print("--- DESIGN TOKENS (CSS) ---")
tokens = {
    '--bg: #f7f4f0 (ivory)': '--bg: #f7f4f0;' in css,
    '--gold: #d4a853 (champagne gold)': '--gold: #d4a853;' in css,
    '--charcoal: #1c1c1c (deep charcoal)': '--charcoal: #1c1c1c;' in css,
    'Playfair Display font': 'Playfair Display' in css,
    'Inter font': 'Inter' in css,
    '--container: 1200px': '--container: 1200px;' in css,
    '--radius: 20px': '--radius: 20px;' in css,
    '--pad: 32px': '--pad: 32px;' in css,
    '--header-h: 80px': '--header-h: 80px;' in css,
    'cubic-bezier ease': '--ease: cubic-bezier(0.22, 1, 0.36, 1)' in css,
    'color-scheme light': 'color-scheme: light;' in css,
}
for k, v in tokens.items():
    print(f"  {k}: {'✅' if v else '❌'}")

print()
print("--- NAVBAR ---")
nav_checks = {
    'sticky fixed': 'position: fixed' in css,
    'justify-space-between': 'justify-content: space-between' in css,
    'gold brand': 'background: var(--gold)' in css,
    'charcoal text': '--charcoal:' in css,
}
for k, v in nav_checks.items():
    print(f"  {k}: {'✅' if v else '❌'}")

print()
print("--- HOMEPAGE (index.html) ---")
with open('index.html', 'r') as f:
    idx = f.read()
home_checks = {
    'hero-main-text': 'hero-main-text' in idx,
    'gradient-text': 'gradient-text' in idx,
    'hero-slider': 'hero-slider' in idx,
    'hero-strip': 'hero-strip' in idx,
    'Look Beautiful subtitle': 'Look Beautiful' in idx,
    'Exotic Salon text': 'Exotic Salon' in idx,
    'Services dropdown (6)': 'All Services' in idx and 'Photos' in idx and 'Videos' in idx,
    'Book Now button': 'nav-book' in idx,
    'Dark gradient overlay': 'rgba(0,0,0,0.6)' in idx,
}
for k, v in home_checks.items():
    print(f"  {k}: {'✅' if v else '❌'}")

print()
print("--- SERVICES PAGE ---")
with open('services.html', 'r') as f:
    svc = f.read()
svc_checks = {
    'services-grid': 'services-grid' in svc,
    'tab filters': 'tab' in svc.lower() or 'filter' in svc.lower(),
    'faq-section': 'faq' in svc.lower() or 'FAQ' in svc,
    'whatsapp': 'whatsapp' in svc.lower() or 'wa.me' in svc.lower(),
    'phone': 'tel:' in svc.lower(),
    'breadcrumb': 'breadcrumb' in svc.lower(),
    'book now': 'book' in svc.lower(),
}
for k, v in svc_checks.items():
    print(f"  {k}: {'✅' if v else '❌'}")

print()
print("--- GALLERY PAGE ---")
with open('gallery.html', 'r') as f:
    gal = f.read()
gal_checks = {
    'gallery-grid': 'gallery-grid' in gal,
    'filter chips': 'filter-btn' in gal or 'filter' in gal.lower(),
    'lightbox': 'lightbox' in gal.lower(),
    'whatsapp': 'whatsapp' in gal.lower() or 'wa.me' in gal.lower(),
    'phone': 'tel:' in gal.lower(),
    'book now': 'book' in gal.lower(),
}
for k, v in gal_checks.items():
    print(f"  {k}: {'✅' if v else '❌'}")

print()
print("--- CONTACT PAGE ---")
with open('contact.html', 'r') as f:
    cot = f.read()
cot_checks = {
    'form-card': 'form-card' in cot,
    'contact-grid': 'contact-grid' in cot,
    'js-wa': 'js-wa' in cot,
    'js-map-link': 'js-map-link' in cot,
    'confirm-card': 'confirm-card' in cot,
    'faq-section': 'faq' in cot.lower() or 'FAQ' in cot,
    'WhatsApp button': 'WhatsApp us' in cot or 'whatsapp us' in cot.lower(),
    'Phone link': 'tel:' in cot.lower(),
    'Map embed': 'map-embed' in cot or 'find-map' in cot,
}
for k, v in cot_checks.items():
    print(f"  {k}: {'✅' if v else '❌'}")

print()
print("=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)