#!/usr/bin/env python3
import os

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r') as f:
    c = f.read()

nav_start = c.find('<nav class="nav-links"')
nav_end = c.find('</nav>', nav_start)
navbar = c[nav_start:nav_end+6]

print('=== NAVBAR ===')
print(navbar[:600])
print('...')

# Count href=
href_count = navbar.count('href=')
print(f'Total href in navbar: {href_count}')

# Check for specific items
for item in ['All Services', 'Men', 'Women', 'Bridal', 'Photos', 'Videos', 'Contact', 'Book Now']:
    if item in navbar:
        print(f'  Contains: {item}')