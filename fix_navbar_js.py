#!/usr/bin/env python3
import os

js_path = os.path.join('C:\\\\\\\\Users\\\\\\\\NCR\\\\\\\\Desktop\\\\\\\\exotic saloon\\\\\\\\exotic-salon', 'js', 'script.js')
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Rewrite the initHeader function to use vanilla JS
old_init = '''function initHeader() {
    const header = "$"+"$"("siteHeader");
    const burger = "$"+"$"("hamburger");
    const menu = "$"+"$"("mobileMenu");

    function onScroll() {
      if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!burger || !menu) return;

    function setOpen(open) {
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("open", open);
    }

    burger.addEventListener("click", function () {
      setOpen(!menu.classList.contains("open"));
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        setOpen(false);
        burger.focus();
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (!menu.classList.contains("open")) return;
      if (menu.contains(event.target) || burger.contains(event.target)) return;
      setOpen(false);
    });
  }'''

new_init = '''function initHeader() {
    const header = document.getElementById("siteHeader");
    const burger = document.getElementById("hamburger");
    const menu = document.getElementById("mobileMenu");

    function onScroll() {
      if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (!burger || !menu) return;

    function setOpen(open) {
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("open", open);
    }

    burger.addEventListener("click", function () {
      setOpen(!menu.classList.contains("open"));
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        setOpen(false);
        burger.focus();
      }
    });

    document.addEventListener("pointerdown", function (event) {
      if (!menu.classList.contains("open")) return;
      if (menu.contains(event.target) || burger.contains(event.target)) return;
      setOpen(false);
    });
  }'''

if old_init in content:
    content = content.replace(old_init, new_init)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("initHeader function fixed - using vanilla JS")
else:
    print("Old initHeader not found, attempting partial fix")
    # Try partial replacements
    content = content.replace('const header = "$"+"$"("siteHeader")', 'const header = document.getElementById("siteHeader")')
    content = content.replace('const burger = "$"+"$"("hamburger")', 'const burger = document.getElementById("hamburger")')
    content = content.replace('const menu = "$"+"$"("mobileMenu")', 'const menu = document.getElementById("mobileMenu")')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Partial fix applied")