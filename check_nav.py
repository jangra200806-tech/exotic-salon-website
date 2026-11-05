#!/usr/bin/env python3
import os, re

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r') as f:
    c = f.read()

# Find nav-links
nav_start = c.find('<nav class="nav-links"')
print('nav-links at:', nav_start)

# Find </nav>
nav_end = c.find('</nav>')
print('</nav> at:', nav_end)

# Print the navbar section
if nav_start != -1 and nav_end != -1:
    navbar = c[nav_start:nav_end+6]
    print('=== NAVBAR ===')
    print(navbar)
else:
    print('Not found')