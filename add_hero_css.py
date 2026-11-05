#!/usr/bin/env python3
"""Add hero section CSS styles."""
import os

css_path = os.path.join('C:\\\\Users\\\\NCR\\\\Desktop\\\\exotic saloon\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add hero main text styles after the .nav-links section
# Find .nav-links and add after it
new_styles = '''

/* ============ 34. HERO MAIN TEXT ============ */
.hero-main-text {
  padding: 80px 0;
}
.hero-main-text .container {
  max-width: 1200px;
}
.hero-main-heading {
  font-family: "Playfair Display", serif;
  font-size: clamp(3rem, 8vw, 4.5rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--white, #ffffff);
  margin-bottom: 24px;
}
.hero-main-heading .gradient-text {
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
}
.hero-main-subtitle {
  font-size: clamp(1.2rem, 3vw, 1.4rem);
  color: var(--muted, #e8e8e8);
  font-style: italic;
}
@media (max-width: 900px) {
  .hero-main-text {
    padding: 40px 0;
  }
  .hero-main-heading {
    font-size: clamp(2.2rem, 6vw, 3rem);
  }
}'''

# Insert after .nav-links closing brace
nav_links_end = content.find('.nav-actions {')
if nav_links_end != -1:
    # Find the closing brace of .nav-actions
    # Actually, let me find a better location - after .nav-links
    nav_links_closure = content.find('}', content.find('.nav-links {'))
    if nav_links_closure != -1:
        new_content = content[:nav_links_closure+1] + new_styles + content[nav_links_closure+1:]
        with open(css_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Hero text CSS added")
    else:
        print("nav-links closure not found")
else:
    print("nav-links not found")
"