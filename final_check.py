#!/usr/bin/env python3
import os, re

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r') as f:
    c = f.read()

nav_start = c.find('<nav class="nav-links"')
nav_end = c.find('</nav>', nav_start)
navbar = c[nav_start:nav_end+6]

print('=== NAVBAR ===')
print(navbar)
print()

# Find dropdown links
dropdown_links = re.findall(r'<a href="[^"]*">([^<]+)</a>', navbar)
print('=== LINKS ===')
for link in dropdown_links:
    print(f'  {link}')
"