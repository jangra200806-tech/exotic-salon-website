#!/usr/bin/env python3
import os

html_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'services.html')
with open(html_path, 'r') as f:
    c = f.read()

print('service-card:', 'service-card' in c)
print('services-grid:', 'services-grid' in c)
print('tab/filters:', 'tab' in c.lower() or 'filter' in c.lower())
print('faq-section:', 'faq' in c.lower() or 'FAQ' in c)
print('whatsapp:', 'whatsapp' in c.lower() or 'wa.me' in c.lower())
print('phone:', 'tel:' in c.lower())
print('breadcrumb:', 'breadcrumb' in c.lower())
print('book now:', 'book' in c.lower())
print('Playfair Display:', 'Playfair Display' in c)