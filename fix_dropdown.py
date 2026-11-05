#!/usr/bin/env python3
import os

css_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. REMOVE ALL EXISTING .nav-dropdown RULES and replace with clean ones
# Find and replace all .nav-dropdown blocks
old_nav_dropdown_blocks = """/* ---------------------------------------------------------
   33. NAV DROPDOWN
   --------------------------------------------------------- */
.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 90;
  display: none;
  opacity: 0;
  visibility: hidden;
  min-width: 200px;
  padding: 12px 0;
  background: var(--bg-alt);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  border: none;
  gap: 0;
  flex-direction: column;
  align-items: flex-start;
  margin-left: -28px; /* align with navbar gap */
}

.nav-dropdown a {
  padding: 10px 12px;
  color: var(--charcoal);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  display: block;
  width: 100%;
  margin: 4px 0;
  transition: all 0.2s ease;
  background: transparent;
  white-space: normal;
}

/* Dropdown show on hover */
.nav-item.has-dropdown:hover .nav-dropdown {
  display: flex;
  opacity: 1;
  visibility: visible;
}"""

new_nav_dropdown_blocks = """/* ---------------------------------------------------------
   33. NAV DROPDOWN
   --------------------------------------------------------- */
.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  opacity: 0;
  visibility: hidden;
  min-width: 200px;
  padding: 12px 0;
  background: var(--bg-alt);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  border: none;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.nav-dropdown a {
  padding: 10px 12px;
  color: var(--charcoal);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  display: block;
  width: 100%;
  margin: 4px 0;
  transition: all 0.2s ease;
  background: transparent;
  white-space: normal;
}

/* Dropdown show on hover */
.nav-item.has-dropdown:hover .nav-dropdown {
  display: block;
  opacity: 1;
  visibility: visible;
}"""

if '/* ---------------------------------------------------------' in content:
    # Find the first .nav-dropdown and replace through to the has-dropdown hover
    # Try to find and replace the blocks
    if old_nav_dropdown_blocks in content:
        content = content.replace(old_nav_dropdown_blocks, new_nav_dropdown_blocks)
        print("Replaced .nav-dropdown blocks successfully")
    else:
        # Try partial - just ensure the CSS has the right rules
        print("Could not find exact block, applying targeted fixes")
else:
    print("Could not find dropdown section markers")

# 2. Ensure .nav-item.has-dropdown has position: relative
old_has_dropdown = ".has-dropdown {"
new_has_dropdown = ".has-dropdown {\n  position: relative;\n  display: inline-block;\n}"
if old_has_dropdown in content:
    content = content.replace(old_has_dropdown, new_has_dropdown)
    print("Fixed .has-dropdown positioning")
else:
    print(".has-dropdown pattern not found")

# 3. Remove blue line under Home/links - ensure text-decoration: none
# The CSS already has a.text-decoration: none; and .nav-link::after { display: none !important; }
# But let's ensure no underline appears
if "text-decoration: underline" in content:
    content = content.replace("text-decoration: underline", "")
    print("Removed text-decoration underline")

# 4. Ensure no nav-link has underline
if ".nav-link::after" in content:
    # Make sure ::after display is none
    if "display: none !important" not in content.split(".nav-link::after")[1] if ".nav-link::after" in content else "":
        if "display: none !important" not in content:
            # Add it
            content = content.replace(".nav-link::after {", ".nav-link::after {\n  display: none !important;\n}")
            print("Added display: none !important for ::after")

# 5. Ensure no underline on links in general
if "text-decoration: underline" in content:
    content = content.replace("text-decoration: underline", "text-decoration: none")
    print("Replaced underline with none")

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Dropdown CSS fixes applied")