#!/usr/bin/env python3
import os

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r') as f:
    c = f.read()

# Find the navbar section - from header comment to mobile menu comment
header_start = c.find('<!-- ============ HEADER ========== -->')
mobile_start = c.find('<!-- ============ MOBILE MENU ========== -->')

if header_start != -1 and mobile_start != -1:
    navbar = c[header_start:mobile_start]
    # Extract just the nav part
    nav_start = navbar.find('<nav class="nav-links"')
    if nav_start != -1:
        nav = navbar[nav_start:]
        # Find </nav>
        nav_end = nav.find('</nav>')
        if nav_end != -1:
            nav = nav[:nav_end+6]
        print('=== DESKTOP NAVBAR ===')
        print(nav)
    else:
        print('nav-links not found in header section')
else:
    print('Sections not found')