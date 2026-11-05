#!/usr/bin/env python3
import os

js_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'js', 'script.js')
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the initHeader function selectors to use vanilla JS
content = content.replace(
    'const header = "$"+"$"("siteHeader")',
    'const header = document.getElementById("siteHeader")'
)
content = content.replace(
    'const burger = "$"+"$"("hamburger")',
    'const burger = document.getElementById("hamburger")'
)
content = content.replace(
    'const menu = "$"+"$"("mobileMenu")',
    'const menu = document.getElementById("mobileMenu")'
)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Script.js selectors fixed")