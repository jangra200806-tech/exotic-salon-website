#!/usr/bin/env python3
import os
import re

html_file = 'index.html'
path = os.path.join('.', html_file)
with open(path, 'r') as f:
    c = f.read()

print(f"Checking {html_file}...")
print(f"'Critical CSS' in content: {'Critical CSS' in c}")

if 'loading="lazy"' in c:
    print('loading="lazy" found')
else:
    print('loading="lazy" NOT found')

imgs = re.findall(r'<img[^>]+>', c)
print(f'Total img tags: {len(imgs)}')
for i, img in enumerate(imgs[:5]):
    has_width = 'width=' in img.lower()
    has_height = 'height=' in img.lower()
    has_lazy = 'lazy' in img.lower()
    print(f'  img {i}: width={has_width}, height={has_height}, lazy={has_lazy}')
EOF