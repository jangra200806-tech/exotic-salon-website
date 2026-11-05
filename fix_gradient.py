#!/usr/bin/env python3
"""Fix the gradient text approach."""
import os

html_path = os.path.join('C:\\\\Users\\\\NCR\\\\Desktop\\\\exotic saloon\\\\exotic-salon', 'index.html')
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update the CSS for .hero-main-heading .gradient-text
old_css = '''.hero-main-heading .gradient-text {
  position: relative;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
.hero-main-heading .gradient-text::after {
  content: var(--gradient-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #ffc0cb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: #fff;
}'''

new_css = '''.hero-main-heading .gradient-text {
  position: relative;
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-image: linear-gradient(135deg, #ffffff 0%, #ffc0cb 100%);
  -webkit-background-clip: text;
}'''

if old_css in content:
    content = content.replace(old_css, new_css)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Gradient CSS updated")
else:
    print("Old CSS not found, trying alternative")
    # Try to find and replace just the gradient text section
    if '.hero-main-heading .gradient-text' in content:
        print("Found .hero-main-heading .gradient-text section")
    else:
        print("Section not found")
"