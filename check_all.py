#!/usr/bin/env python3
import os
import re

for html_file in ['services.html', 'gallery.html', 'contact.html']:
    path = os.path.join('.', html_file)
    if not os.path.exists(path):
        continue
    with open(path, 'r') as f:
        c = f.read()
    
    has_lazy = 'loading="lazy"' in c
    imgs = re.findall(r'<img[^>]+>', c)
    
    print(f"{html_file}: lazy={has_lazy}, img_tags={len(imgs)}")
    for i, img in enumerate(imgs[:3]):
        has_lazy_i = 'lazy' in img.lower()
        print(f'  img {i}: lazy={has_lazy_i}')
EOF