#!/usr/bin/env python3
import os

css_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update .brand-mark
old_brand_mark = ".brand-mark {"
new_brand_mark = ".brand-mark {\n  display: grid;\n  place-items: center;\n  width: 40px;\n  height: 40px;\n  border-radius: var(--radius);\n  background: var(--gold);\n  color: var(--bg);\n  font-family: var(--font-head);\n  font-size: 1.25rem;\n  font-weight: 700;\n}"

if old_brand_mark in content:
    content = content.replace(old_brand_mark, new_brand_mark)
    print("Updated .brand-mark")
else:
    print(".brand-mark pattern not found")

# Update .nav-links
old_nav_links = ".nav-links {"
new_nav_links = ".nav-links {\n  display: flex;\n  align-items: center;\n  gap: 40px;\n  margin: 0 auto;\n  flex: none;\n}"

if old_nav_links in content:
    content = content.replace(old_nav_links, new_nav_links)
    print("Updated .nav-links")
else:
    print(".nav-links pattern not found")

# Update .nav-link
old_nav_link = ".nav-link {"
new_nav_link = ".nav-link {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  color: var(--charcoal);\n  font-family: var(--font-body);\n  font-size: 0.9rem;\n  font-weight: 500;\n  text-decoration: none;\n  white-space: nowrap;\n}"

if old_nav_link in content:
    content = content.replace(old_nav_link, new_nav_link)
    print("Updated .nav-link")
else:
    print(".nav-link pattern not found")

# Update .nav-book
old_nav_book = ".nav-book {"
new_nav_book = ".nav-book {\n  padding: 10px 24px;\n  background: var(--gold);\n  color: var(--bg);\n  font-family: var(--font-head);\n  font-size: 0.875rem;\n  font-weight: 600;\n  border: none;\n  border-radius: var(--radius);\n  cursor: pointer;\n  transition: background 0.2s ease, transform 0.2s ease;\n  white-space: nowrap;\n  flex-shrink: 0;\n}"

if old_nav_book in content:
    content = content.replace(old_nav_book, new_nav_book)
    print("Updated .nav-book")
else:
    print(".nav-book pattern not found")

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("All navbar parts updated")