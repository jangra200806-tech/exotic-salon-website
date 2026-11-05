#!/usr/bin/env python3
import os

html_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'contact.html')
with open(html_path, 'r') as f:
    c = f.read()

print('form-card:', 'form-card' in c)
print('contact-grid:', 'contact-grid' in c)
print('js-wa:', 'js-wa' in c)
print('js-map-link:', 'js-map-link' in c)
print('confirm-card:', 'confirm-card' in c)
print('faq-section:', 'faq' in c.lower() or 'FAQ' in c)
print('Playfair Display:', 'Playfair Display' in c)
print('WhatsApp button:', 'WhatsApp us' in c or 'whatsapp us' in c.lower())
print('Phone link:', 'tel:' in c.lower())
print('Map embed:', 'map-embed' in c or 'find-map' in c)