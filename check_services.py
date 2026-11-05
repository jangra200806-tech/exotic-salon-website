#!/usr/bin/env python3
import os

html_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'services.html')
with open(html_path, 'r') as f:
    c = f.read()

print('service-card:', 'service-card' in c)
print('services-grid:', 'services-grid' in c)
print('tab:', 'tab' in c.lower())
print('Hair:', 'Hair' in c)
print('Beauty:', 'Beauty' in c)
print('Bridal:', 'Bridal' in c)
print('Men:', 'Men' in c)
print('Women:', 'Women' in c)
print('popular-badge:', 'popular-badge' in c)