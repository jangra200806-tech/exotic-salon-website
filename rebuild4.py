#!/usr/bin/env python3
"""Rewrite the navbar section in index.html."""
import os

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the header section - look for the comment or the header tag
header_start = -1
for i, line in enumerate(lines):
    if '<header class="header" id="siteHeader">' in line:
        header_start = i
        break

if header_start != -1:
    # Find where the mobile menu starts
    mobile_menu_start = -1
    for i in range(header_start, len(lines)):
        if '<!-- ============ MOBILE MENU ============' in lines[i]:
            mobile_menu_start = i
            break
    
    if mobile_menu_start != -1:
        # New navbar HTML lines
        new_navbar_lines = [
            '  <!-- ============ HEADER ========== -->\n',
            '  <header class="header" id="siteHeader">\n',
            '    <div class="container nav">\n',
            '      <a class="brand" href="index.html" aria-label="Exotic Salon home">\n',
            '        <span class="brand-mark" aria-hidden="true">E</span>\n',
            '        <span class="brand-text">\n',
            '          <strong class="js-short-name">Exotic Salon</strong>\n',
            '          <small>Hair & Beauty · Kaithal</small>\n',
            '        </span>\n',
            '      </a>\n',
            '\n',
            '      <nav class="nav-links" aria-label="Primary">\n',
            '        <a class="nav-link active" href="index.html" aria-current="page">Home</a>\n',
            '\n',
            '        <div class="nav-item has-dropdown">\n',
    '          <button class="nav-link nav-drop-toggle" type="button" aria-expanded="false">\n',
    '            Services <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>\n',
    '          </button>\n',
    '          <div class="nav-dropdown">\n',
    '            <a href="services.html">All Services</a>\n',
    '            <a href="services.html#men">Men</a>\n',
    '            <a href="services.html#women">Women</a>\n',
    '            <a href="services.html#bridal">Bridal</a>\n',
    '            <a href="services.html#photos">Photos</a>\n',
    '            <a href="services.html#videos">Videos</a>\n',
    '          </div>\n',
    '        </div>\n',
    '\n',
    '        <div class="nav-item has-dropdown">\n',
    '          <button class="nav-link nav-drop-toggle" type="button" aria-expanded="false">\n',
    '            Gallery <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>\n',
    '          </button>\n',
    '          <div class="nav-dropdown">\n',
    '            <a href="gallery.html">Photos</a>\n',
    '            <a href="gallery.html#videos">Videos</a>\n',
    '          </div>\n',
    '        </div>\n',
    '\n',
    '        <a class="nav-link" href="contact.html">Contact</a>\n',
    '\n',
    '        <a class="btn btn-primary nav-book" href="contact.html#book">\n',
    '          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>\n',
    '          Book Now\n',
    '        </a>\n',
    '      </nav>\n',
    '\n',
    '  <!-- ============ MOBILE MENU ============ -->\n',
]
    
    if mobile_menu_start != -1:
        # Replace from header_start to mobile_menu_start
        new_content = ''.join(new_navbar_lines + lines[mobile_menu_start:])
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Navbar rebuilt successfully (replaced lines {header_start} to {mobile_menu_start})")
    else:
        print("Mobile menu marker not found")
else:
    print("Header tag not found")