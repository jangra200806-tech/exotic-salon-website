#!/usr/bin/env python3
import os

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find navbar section
idx = content.find('<nav class="nav-links"')
if idx != -1:
    idx2 = content.find('<!-- ============ MOBILE MENU ========== -->')
    if idx2 != -1:
        navbar = content[idx:idx2]
    else:
        navbar = content[idx:idx+1000]
    
    print("=== DESKTOP NAVBAR ===")
    print(navbar)
    print()
    
    # Mobile menu
    idx3 = content.find('<!-- ============ MOBILE MENU ========== -->')
    if idx3 != -1:
        idx4 = content.find('</nav>', idx3)
        if idx4 != -1:
            mobile = content[idx3:idx4+6]
        else:
            mobile = content[idx3:idx3+800]
        print("=== MOBILE MENU ===")
        print(mobile)