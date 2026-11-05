#!/usr/bin/env python3
import os

css_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix .nav-links - make it properly center the links
old_nav_links = ".nav-links {\n  display: flex;\n  align-items: center;\n  gap: 40px;\n  margin: 0 auto;\n  flex: none;\n}"
new_nav_links = ".nav-links {\n  display: flex;\n  align-items: center;\n  gap: 32px;\n  margin-left: auto;\n  flex: 1;\n}"
if old_nav_links in content:
    content = content.replace(old_nav_links, new_nav_links)
    print("Fixed .nav-links")
else:
    print(".nav-links pattern not found")

# 2. Fix .nav-link - remove underlines, proper styling
old_nav_link = ".nav-link {"
new_nav_link = ".nav-link {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  color: var(--charcoal);\n  font-family: var(--font-body);\n  font-size: 0.9rem;\n  font-weight: 500;\n  text-decoration: none;\n  white-space: nowrap;\n}"
if old_nav_link in content:
    content = content.replace(old_nav_link, new_nav_link)
    print("Fixed .nav-link")
else:
    print(".nav-link pattern not found")

# 3. Fix .nav-dropdown show on hover
old_dropdown_show = ".nav-item.has-dropdown:hover .nav-dropdown {\n  display: flex;\n  opacity: 1;\n  visibility: visible;\n}"
new_dropdown_show = ".nav-item.has-dropdown:hover .nav-dropdown {\n  display: flex;\n  opacity: 1;\n  visibility: visible;\n}"
# This is already correct, but let's ensure the dropdown links are vertical
# Fix .nav-dropdown a to be block display with vertical list
old_dropdown_a = ".nav-dropdown a {\n  padding: 8px 20px;\n  color: var(--muted);\n  font-family: var(--font-body);\n  font-size: 0.8rem;\n  font-weight: 500;\n  text-decoration: none;\n  display: block;\n  transition: color 0.2s ease;\n}"
new_dropdown_a = ".nav-dropdown a {\n  padding: 10px 20px;\n  color: var(--charcoal);\n  font-family: var(--font-body);\n  font-size: 0.875rem;\n  font-weight: 500;\n  text-decoration: none;\n  display: block;\n  width: 100%;\n  padding: 8px 12px;\n  margin: 4px 0;\n  transition: all 0.2s ease;\n  white-space: normal;\n}"
if old_dropdown_a in content:
    content = content.replace(old_dropdown_a, new_dropdown_a)
    print("Fixed .nav-dropdown a (vertical list)")
else:
    print(".nav-dropdown a pattern not found, applying partial fix")
    # Partial fix - just make them block display
    content = content.replace("display: block;", "display: block; width: 100%; margin: 4px 0;")
    print("Applied partial fix to dropdown links")

# 4. Fix .nav-book styling
old_nav_book = ".nav-book {\n  padding: 10px 24px;\n  background: var(--gold);\n  color: var(--bg);\n  font-family: var(--font-head);\n  font-size: 0.875rem;\n  font-weight: 600;\n  border: none;\n  border-radius: var(--radius);\n  cursor: pointer;\n  transition: background 0.2s ease, transform 0.2s ease;\n  white-space: nowrap;\n  flex-shrink: 0;\n}"
new_nav_book = ".nav-book {\n  padding: 10px 24px;\n  background: var(--gold);\n  color: var(--bg);\n  font-family: var(--font-head);\n  font-size: 0.875rem;\n  font-weight: 600;\n  border: none;\n  border-radius: var(--radius);\n  cursor: pointer;\n  transition: background 0.2s ease, transform 0.2s ease;\n  white-space: nowrap;\n  flex-shrink: 0;\n  margin-left: 32px;\n}"
if old_nav_book in content:
    content = content.replace(old_nav_book, new_nav_book)
    print("Fixed .nav-book (added margin-left)")
else:
    print(".nav-book pattern not found")

# 5. Remove any text-decorationunderline
old_underline = "text-decoration: underline;"
if old_underline in content:
    content = content.replace(old_underline, "")
    print("Removed text-decoration underline")

# 6. Ensure no link has underline
old_underline2 = "text-decoration: none;\\n"
# This might not match exactly, skip

# 7. Fix the .nav-item.has-dropdown positioning
old_nav_item = ".nav-item {\n  position: relative;\n  display: inline-block;\n}"
new_nav_item = ".nav-item {\n  position: relative;\n  display: inline-block;\n  margin-right: 24px;\n}"
if old_nav_item in content:
    content = content.replace(old_nav_item, new_nav_item)
    print("Fixed .nav-item (added margin-right)")
else:
    print(".nav-item pattern not found")

# 8. Ensure dropdown has proper positioning
old_dropdown_pos = ".nav-dropdown {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 90;\n  display: none;\n  opacity: 0;\n  visibility: hidden;\n  min-width: 180px;\n  padding: 12px 0;\n  background: var(--white, #ffffff);\n  border-radius: 8px;\n  box-shadow: 0 4px 12px rgba(0,0,0,0.15);\n  border: 1px solid var(--line, #e0e0e0);\n  gap: 0;\n  flex-direction: column;\n  align-items: flex-start;\n  margin-left: -28px; /* align with navbar gap */\n}"
new_dropdown_pos = ".nav-dropdown {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  opacity: 0;\n  visibility: hidden;\n  min-width: 200px;\n  padding: 12px 0;\n  background: var(--bg-alt);\n  border-radius: var(--radius);\n  box-shadow: 0 8px 32px rgba(0,0,0,0.15);\n  border: none;\n  gap: 0;\n  flex-direction: column;\n  align-items: flex-start;\n}"
if old_dropdown_pos in content:
    content = content.replace(old_dropdown_pos, new_dropdown_pos)
    print("Fixed .nav-dropdown positioning")
else:
    print(".nav-dropdown positioning pattern not found")

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("\\nAll navbar CSS fixes applied")