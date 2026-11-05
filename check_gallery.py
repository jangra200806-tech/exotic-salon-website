#!/usr/bin/env python3
import os

html_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'gallery.html')
with open(html_path, 'r') as f:
    c = f.read()

print('gallery-grid:', 'gallery-grid' in c)
print('filter chips:', 'filter' in c.lower() or 'filter-btn' in c)
print('lightbox:', 'lightbox' in c.lower())
print('section-header:', 'section-header' in c)
print('Playfair Display:', 'Playfair Display' in c)
print('WhastApp:', 'whatsapp' in c.lower() or 'wa.me' in c.lower())
print('phone:', 'tel:' in c.lower())
print('book now:', 'book' in c.lower())