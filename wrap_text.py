#!/usr/bin/env python3
"""Wrap Exotic Salon in gradient span."""
import os

html_path = os.path.join('C:\\\\Users\\\\NCR\\\\Desktop\\\\exotic saloon\\\\exotic-salon', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Wrap "Exotic Salon" in a span with gradient class
old_text = 'Welcome to\nExotic Salon</h2>'
new_text = 'Welcome to\n< h2 class="hero-main-heading"><span class="gradient-text">Exotic Salon</span></h2>'

# Actually, let me be more careful with the HTML structure
# The h2 contains "Welcome to\nExotic Salon</h2>"
# I need to change it to "Welcome to\n<h2 class="hero-main-heading"><span class="gradient-text">Exotic Salon</span></h2>"

# Let me find the exact pattern and replace
pattern = 'Welcome to\\nExotic Salon</h2>'
replacement = 'Welcome to\\n<h2 class="hero-main-heading"><span class="gradient-text">Exotic Salon</span></h2>'

if pattern in content:
    new_content = content.replace(pattern, replacement)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("HTML updated successfully")
else:
    print("Pattern not found")
"