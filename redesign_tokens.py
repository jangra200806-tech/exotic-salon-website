#!/usr/bin/env python3
import os, re

css_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the :root section using regex
# Look for :root { ... } block
root_pattern = r':root \{[^}]+\}'
match = re.search(root_pattern, content)
if match:
    # Replace the entire :root block
    old_root = match.group(0)
    new_root = """:root {
  --bg: #f7f4f0;
  --bg-alt: #f4f1ec;
  --card: #ffffff;
  --line: rgba(0,0,0,0.08);
  --line-strong: rgba(0,0,0,0.12);
  --text: #2a2a2a;
  --muted: #6b6b6b;
  --gold: #d4a853;
  --gold-light: #f0c27a;
  --charcoal: #1c1c1c;
  --charcoal-light: #333333;
  --container: 1200px;
  --sec-y: 100px;
  --radius: 20px;
  --pad: 32px;
  --header-h: 80px;
  --font-head: "Playfair Display", serif;
  --font-body: "Inter", sans-serif;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --mb-bar-h: 0px;
  --sec-y-mobile: 80px;
  color-scheme: light;
}"""
    
    if old_root in content:
        content = content.replace(old_root, new_root)
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("CSS :root tokens updated successfully - luxury palette applied")
    else:
        print("Could not replace :root block - attempting direct edit")
else:
    print(":root pattern not found in CSS")