#!/usr/bin/env python3
"""Rebuild the navbar for Exotic Salon website."""
import os

html_path = os.path.join('.', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the header section start
header_start = content.find('<!-- ============ HEADER ========== -->')
if header_start == -1:
    header_start = content.find('<!-- ============ HEADER ============ -->')
    
# Build the new navbar HTML
new_html = '''  <!-- ============ HEADER ============ -->
  <header class="header" id="siteHeader">
    <div class="container nav">
      <a class="brand" href="index.html" aria-label="Exotic Salon home">
        <span class="brand-mark" aria-hidden="true">E</span>
        <span class="brand-text">
          <strong class="js-short-name">Exotic Salon</strong>
          <small>Hair & Beauty · Kaithal</small>
        </span>
      </a>

      <nav class="nav-links" aria-label="Primary">
        <a class="nav-link active" href="index.html" aria-current="page">Home</a>

        <div class="nav-item has-dropdown">
          <button class="nav-link nav-drop-toggle" type="button" aria-expanded="false">
            Services <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="nav-dropdown">
            <a href="services.html">All Services</a>
            <a href="services.html#men">Men</a>
            <a href="services.html#women">Women</a>
            <a href="services.html#bridal">Bridal</a>
            <a href="services.html#photos">Photos</a>
            <a href="services.html#videos">Videos</a>
          </div>
        </div>

        <div class="nav-item has-dropdown">
          <button class="nav-link nav-drop-toggle" type="button" aria-expanded="false">
            Gallery <svg class="nav-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <div class="nav-dropdown">
            <a href="gallery.html">Photos</a>
            <a href="gallery.html#videos">Videos</a>
          </div>
        </div>

        <a class="nav-link" href="contact.html">Contact</a>

        <a class="btn btn-primary nav-book" href="contact.html#book">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>
          Book Now
        </a>
      </nav>
'''

# Insert the new navbar after the header comment
insert_pos = content.find('<!-- ============ HEADER ========== -->')
if insert_pos != -1:
    new_content = content[:insert_pos] + new_html + content[insert_pos + len('<!-- ============ HEADER ========== -->'):]
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Navbar rebuilt successfully")
else:
    print("Header marker not found")