#!/usr/bin/env python3
import os

css_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the entire navbar section
old_navbar = """.nav {
  display: flex;
  align-items: center;
  gap: 28px;
  height: var(--header-h);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  flex: 0 0 auto;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--blue);
  color: #fff;
  font-family: var(--font-head);
  font-size: 1.1rem;
  font-weight: 800;
}

.brand-text strong {
  display: block;
  font-family: var(--font-head);
  font-size: 0.98rem;
  font-weight: 700;
  line-height: 1.2;
}

.brand-text small {
  display: block;
  color: var(--muted);
  font-size: 0.7rem;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 26px;
  margin-left: auto;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--gold);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: var(--gold);
}

.nav-link:hover::after {
  width: 100%;
}

.has-dropdown:hover .nav-dropdown {
  display: flex;
  opacity: 1;
  visibility: visible;
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 90;
  display: none;
  opacity: 0;
  visibility: hidden;
  min-width: 180px;
  padding: 12px 0;
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  border: 1px solid var(--line);
  flex-direction: column;
  backdrop-filter: blur(10px);
}

.nav-dropdown a {
  padding: 8px 20px;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
  display: block;
}

.nav-dropdown a:hover {
  color: var(--gold);
}

.nav-item {
  position: relative;
  display: inline-block;
}

.nav-item.has-dropdown {
  padding-right: 24px;
}

.nav-item.has-dropdown:hover .nav-dropdown {
  display: flex;
  opacity: 1;
  visibility: visible;
}

.nav-book {
  padding: 10px 24px;
  background: var(--gold);
  color: var(--bg);
  font-family: var(--font-head);
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
}

.nav-book:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
}

.nav-book:active {
  transform: translateY(0);
}

/* Mobile hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 100;
}

.hamburger span {
  width: 24px;
  height: 2px;
  background: var(--muted);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 900px) {
  .nav-links {
    position: fixed;
    top: var(--header-h);
    left: -100%;
    width: 70%;
    height: calc(100vh - var(--header-h));
    flex-direction: column;
    gap: 0;
    background: var(--bg);
    margin: 0;
    padding-top: 40px;
    transition: left 0.3s ease;
  }
  .nav-links.active {
    left: 0;
  }
  .nav-link {
    width: 100%;
    padding: 12px 20px;
    border-bottom: 1px solid var(--line);
    color: var(--charcoal);
    font-size: 1rem;
  }
  .nav-dropdown {
    position: static;
    display: none;
    width: 100%;
    box-shadow: none;
    opacity: 1;
    visibility: visible;
    background: var(--bg-alt);
    flex-direction: column;
  }
  .nav-dropdown a {
    padding: 10px 20px;
    border-bottom: 1px solid var(--line);
    width: 100%;
    text-align: left;
  }
  .nav-item.has-dropdown:hover .nav-dropdown {
    display: block;
  }
  .hamburger {
    display: flex;
  }
  .nav-actions {
    display: none;
  }
}"""

new_navbar = """.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  background: var(--bg-alt);
  padding: 0 var(--pad);
  border-bottom: 1px solid var(--line);
  transition: background 0.3s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 56px;
  flex: 0 0 auto;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: var(--gold);
  color: var(--bg);
  font-family: var(--font-head);
  font-size: 1.25rem;
  font-weight: 700;
}

.brand-text strong {
  display: block;
  font-family: var(--font-head);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--charcoal);
  line-height: 1.2;
}

.brand-text small {
  display: block;
  color: var(--muted);
  font-size: 0.65rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Navigation links - center aligned */
.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
  margin: 0 auto;
  flex: none;
}

.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  color: var(--charcoal);
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link::after {
  content: none;
}

.nav-link:hover {
  color: var(--gold);
}

.has-dropdown:hover .nav-dropdown {
  display: flex;
  opacity: 1;
  visibility: visible;
}

.nav-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 90;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  padding: 12px 0;
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid var(--line);
  backdrop-filter: blur(10px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.nav-dropdown a {
  padding: 8px 20px;
  color: var(--charcoal);
  font-family: var(--font-body);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  display: block;
  transition: color 0.2s ease;
}

.nav-dropdown a:hover {
  color: var(--gold);
}

.nav-item {
  position: relative;
  display: inline-block;
}

.nav-item.has-dropdown {
  padding-right: 24px;
}

.nav-item.has-dropdown:hover .nav-dropdown {
  display: flex;
  opacity: 1;
  visibility: visible;
}

.nav-book {
  padding: 10px 24px;
  background: var(--gold);
  color: var(--bg);
  font-family: var(--font-head);
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-book:hover {
  background: var(--gold-light);
  transform: translateY(-2px);
}

.nav-book:active {
  transform: translateY(0);
}

/* Mobile hamburger menu */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 100;
}

.hamburger span {
  width: 24px;
  height: 2px;
  background: var(--charcoal);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 900px) {
  .nav-links {
    position: fixed;
    top: var(--header-h);
    left: -100%;
    width: 70%;
    height: calc(100vh - var(--header-h));
    flex-direction: column;
    gap: 0;
    background: var(--bg);
    margin: 0;
    padding-top: 40px;
    transition: left 0.3s ease;
  }
  .nav-links.active {
    left: 0;
  }
  .nav-link {
    width: 100%;
    padding: 12px 20px;
    border-bottom: 1px solid var(--line);
    color: var(--charcoal);
    font-size: 1rem;
  }
  .nav-dropdown {
    position: static;
    display: none;
    width: 100%;
    box-shadow: none;
    opacity: 1;
    visibility: visible;
    background: var(--bg-alt);
    flex-direction: column;
  }
  .nav-dropdown a {
    padding: 10px 20px;
    border-bottom: 1px solid var(--line);
    width: 100%;
    text-align: left;
  }
  .nav-item.has-dropdown:hover .nav-dropdown {
    display: block;
  }
  .hamburger {
    display: flex;
  }
  .nav-actions {
    display: none;
  }
}"""

if old_navbar in content:
    content = content.replace(old_navbar, new_navbar)
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Navbar CSS updated successfully - luxury sticky design")
else:
    print("Old navbar CSS not found - checking for partial matches")
    # Try finding just the nav section
    if '.nav {' in content:
        print("Found .nav section")