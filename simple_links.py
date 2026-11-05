#!/usr/bin/env python3
import os, re

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r') as f:
    html = f.read()

nav_start = html.find('<nav class="nav-links"')
nav_end = html.find('</nav>', nav_start)
navbar = html[nav_start:nav_end+6]

print('=== NAVBAR STRUCTURE ===')
print(navbar)
print()

# Extract all links
links = re.findall(r'<a href="[^"]*">([^<]+)</a>', navbar)
print('=== LINKS IN NAVBAR ===')
for link in links:
    print('  ' + link)