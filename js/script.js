/* =========================================================
   Exotic Hair & Beauty Unisex Salon — js/script.js
   ---------------------------------------------------------
   Sab content data/info.js ke SALON_INFO se aata hai.
   Har renderer apne element ko dhoondta hai; element na ho
   to chup-chaap skip ho jata hai (isliye ek hi file sab
   pages par kaam karti hai).
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* info.js load na ho to page ka static content hi dikhe */
  if (typeof SALON_INFO === "undefined") {
    console.warn("SALON_INFO not found — data/info.js load karo.");
    return;
  }
  const D = SALON_INFO;

  /* reveal sirf tab chhupayein jab JS chal raha ho */
  document.documentElement.classList.add("js");

  /* ---------------------------------------------------------
     Helpers
     --------------------------------------------------------- */
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  /* Real photo sizes — layout shift rokne ke liye */
  const DIMS = {
    "images/gallery1.jpg": [720, 900],
    "images/gallery2.jpg": [778, 900],
    "images/gallery3.jpg": [678, 900],
    "images/gallery4.jpg": [637, 900],
    "images/gallery5.jpg": [322, 900],
    "images/gallery6.jpg": [475, 900],
    "images/hero.jpg": [1600, 900],
    "images/about.jpg": [675, 900]
  };

  function dimAttrs(src) {
    const d = DIMS[src];
    return d ? 'width="' + d[0] + '" height="' + d[1] + '"' : "";
  }

  const ICONS = {
    unisex:
      '<circle cx="9" cy="7" r="3"/><path d="M9 10v10M6 14h6"/><circle cx="16.5" cy="14.5" r="3"/><path d="m18.6 12.4 2.4-2.4M21 10h-2.6M21 10v2.6"/>',
    award:
      '<circle cx="12" cy="9" r="5"/><path d="m8.5 13.4-1.5 7.1 5-3 5 3-1.5-7.1"/>',
    droplet:
      '<path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z"/><path d="M12 8.5v8.5"/>',
    shield:
      '<path d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Z"/><path d="m9 11.6 2 2 4-4.1"/>',
    home:
      '<path d="m4 10 8-6 8 6"/><path d="M6.5 9.4V20h11V9.4"/><path d="M10 20v-5h4v5"/>'
  };

  const ICON_KEYS = {
    "bi-gender-ambiguous": "unisex",
    "bi-award": "award",
    "bi-droplet-half": "droplet",
    "bi-shield-check": "shield"
  };

  function icon(name, cls) {
    const key = ICON_KEYS[name] || (ICONS[name] ? name : "unisex");
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (cls ? ' class="' + cls + '"' : "") +
      ">" + ICONS[key] + "</svg>"
    );
  }

  /* ---------------------------------------------------------
     1. Common text / links
     --------------------------------------------------------- */
  function fillCommon() {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    $$(".js-phone").forEach(function (a) {
      a.setAttribute("href", "tel:" + D.phone.tel);
    });
    $$(".js-phone-text").forEach(function (el) {
      el.textContent = D.phone.display;
    });

    $$(".js-wa").forEach(function (a) {
      a.setAttribute("href", D.whatsapp.link);
    });

    $$(".js-insta").forEach(function (a) {
      a.setAttribute("href", D.instagram.url);
    });
    $$(".js-insta-handle").forEach(function (el) {
      el.textContent = D.instagram.handle;
    });

    $$(".js-address").forEach(function (el) {
      el.textContent = D.address.full;
    });
    $$(".js-landmark").forEach(function (el) {
      el.textContent = D.address.landmark;
    });
    $$(".js-map-link").forEach(function (a) {
      a.setAttribute("href", D.mapDirectionsUrl || D.address.mapLink);
    });
    $$(".js-map-embed").forEach(function (f) {
      f.setAttribute("src", D.mapEmbedUrl || D.address.mapEmbed);
    });
    $$(".js-review-link").forEach(function (a) {
      a.setAttribute("href", D.reviewUrl || D.address.googleListing);
    });

    $$(".js-timings").forEach(function (el) {
      el.textContent = D.timings.days + ", " + D.timings.open + " – " + D.timings.close;
    });
    $$(".js-timings-note").forEach(function (el) {
      el.textContent = D.timings.note;
    });

    $$(".js-rating-value").forEach(function (el) {
      el.textContent = Number(D.rating.value).toFixed(1);
    });
    $$(".js-rating-count").forEach(function (el) {
      el.textContent = D.rating.count + "+";
    });

    $$(".js-short-name").forEach(function (el) {
      el.textContent = D.shortName;
    });
    $$(".js-salon-name").forEach(function (el) {
      el.textContent = D.name;
    });
  }

  function injectSeo() {
    const meta = document.querySelector('meta[name="keywords"]');
    if (meta && D.seoKeywords && D.seoKeywords.length) {
      meta.setAttribute("content", D.seoKeywords.join(", "));
    }
  }

  /* ---------------------------------------------------------
     2. Header + mobile menu
     --------------------------------------------------------- */
  function initHeader() {
    const header = $("#siteHeader");
    const burger = $("#hamburger");
    const menu = $("#mobileMenu");

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
  }

  /* ---------------------------------------------------------
     3. Reveal on scroll (fade + 12px)
     --------------------------------------------------------- */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    const pending = new Set(items);
    let io = null;

    function reveal(el) {
      if (!pending.has(el)) return;
      el.classList.add("visible");
      pending.delete(el);
      if (io) io.unobserve(el);
    }

    function check() {
      const vh = window.innerHeight || 800;
      pending.forEach(function (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < vh + 100 && rect.bottom > -100) reveal(el);
      });
    }

    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) reveal(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px" }
      );
      items.forEach(function (el) { io.observe(el); });
    }

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    window.addEventListener("load", check);
    check();

    /* Safety net — content kabhi invisible na rahe */
    window.setTimeout(function () { pending.forEach(reveal); }, 6000);
  }

  /* ---------------------------------------------------------
     4. Announcement strip (optional)
     --------------------------------------------------------- */
  function renderAnnouncement() {
    const a = D.announcement;
    if (!a || !a.enabled || !a.text) return;

    if (a.endDate) {
      const end = new Date(a.endDate + "T23:59:59");
      if (!isNaN(end.getTime()) && Date.now() > end.getTime()) return;
    }

    const strip = document.createElement("div");
    strip.className = "ann-strip";
    strip.innerHTML =
      '<div class="container ann-inner">' +
      '<p class="ann-text">' + esc(a.text) + "</p>" +
      (a.link
        ? '<a class="ann-link" href="' + esc(a.link) + '">' + esc(a.linkText || "View") + "</a>"
        : "") +
      '<button class="ann-close" type="button" aria-label="Close announcement">×</button>' +
      "</div>";

    document.body.insertBefore(strip, document.body.firstChild);

    const close = $(".ann-close", strip);
    if (close) {
      close.addEventListener("click", function () { strip.remove(); });
    }
  }

  /* ---------------------------------------------------------
     5. Mobile sticky bar (call + WhatsApp)
     --------------------------------------------------------- */
  function renderMobileBar() {
    if ($(".mobile-bar")) return;

    const bar = document.createElement("div");
    bar.className = "mobile-bar";
    bar.innerHTML =
      '<div class="mb-inner">' +
      '<a class="btn btn-outline js-phone" href="tel:' + esc(D.phone.tel) + '">Call</a>' +
      '<a class="btn btn-primary js-wa" href="' + esc(D.whatsapp.link) + '" target="_blank" rel="noopener">WhatsApp</a>' +
      "</div>";
    document.body.appendChild(bar);

    function setHeight() {
      document.documentElement.style.setProperty("--mb-bar-h", bar.offsetHeight + "px");
    }
    setHeight();
    window.addEventListener("resize", setHeight);
    if ("ResizeObserver" in window) new ResizeObserver(setHeight).observe(bar);
  }

  /* ---------------------------------------------------------
     6. Service cards
     --------------------------------------------------------- */
  function serviceCard(s, withReveal) {
    const price = s.price
      ? '<span class="price">' + esc(s.price) + "</span>"
      : '<span class="price is-ask">Ask for price</span>';

    const book =
      "contact.html?service=" + encodeURIComponent(s.name) + "#book";

    return (
      '<article class="card service-card' + (withReveal ? " reveal" : "") + '"' +
      ' data-categories="' + esc((s.categories || []).join(" ")) + '">' +
      '<div class="service-top"><h3>' + esc(s.name) + "</h3>" + price + "</div>" +
      "<p>" + esc(s.desc) + "</p>" +
      '<div class="service-meta"><span>' + esc(s.duration) + "</span>" +
      (s.popular ? '<span class="badge-popular">Popular</span>' : "") +
      "</div>" +
      '<a class="service-link" href="' + esc(book) + '">Book this' +
      '<span aria-hidden="true">→</span></a>' +
      "</article>"
    );
  }

  function renderFeaturedServices() {
    const box = $("#featuredServices");
    if (!box) return;

    let list = D.services.filter(function (s) { return s.popular; });
    if (list.length < 6) {
      D.services.forEach(function (s) {
        if (list.length < 6 && list.indexOf(s) === -1) list.push(s);
      });
    }
    list = list.slice(0, 6);

    box.innerHTML = list
      .map(function (s) { return serviceCard(s, true); })
      .join("");
  }

  /* ---------------------------------------------------------
     7. Why choose us
     --------------------------------------------------------- */
  function renderFeatures() {
    const box = $("#features");
    if (!box) return;

    box.innerHTML = D.features
      .map(function (f) {
        return (
          '<div class="feature reveal">' +
          '<span class="ic">' + icon(f.icon) + "</span>" +
          "<h3>" + esc(f.title) + "</h3>" +
          "<p>" + esc(f.text) + "</p>" +
          "</div>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------
     8. Gallery preview (home)
     --------------------------------------------------------- */
  function renderGalleryPreview() {
    const box = $("#galleryPreview");
    if (!box) return;

    box.innerHTML = D.gallery
      .slice(0, 6)
      .map(function (g) {
        return (
          '<a class="photo-tile reveal" href="gallery.html" aria-label="' +
          esc(g.caption) + " — open gallery" + '">' +
          '<img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" ' +
          dimAttrs(g.src) + ' loading="lazy" decoding="async">' +
          '<span class="cap">' + esc(g.caption) + "</span>" +
          "</a>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------
     9. Testimonials — one review at a time
     --------------------------------------------------------- */
  function renderTestimonials() {
    const track = $("#testiTrack");
    if (!track) return;

    const list = D.testimonials || [];
    if (!list.length) {
      const section = track.closest("section");
      if (section) section.remove();
      return;
    }

    const dots = $("#testiDots");
    const prev = $("#testiPrev");
    const next = $("#testiNext");

    track.innerHTML = list
      .map(function (t, i) {
        const stars = "★".repeat(t.stars) + "☆".repeat(Math.max(0, 5 - t.stars));
        return (
          '<div class="testi-slide" role="group" aria-roledescription="slide" ' +
          'aria-label="Review ' + (i + 1) + " of " + list.length + '">' +
          '<figure class="card testimonial">' +
          '<div class="stars" aria-label="' + t.stars + ' out of 5 stars">' + stars + "</div>" +
          "<blockquote>“" + esc(t.text) + "”</blockquote>" +
          '<figcaption class="who">' +
          '<span class="avatar" aria-hidden="true">' + esc(t.name.charAt(0)) + "</span>" +
          "<div><b>" + esc(t.name) + "</b><span>Google review</span></div>" +
          "</figcaption></figure></div>"
        );
      })
      .join("");

    if (dots) {
      dots.innerHTML = list
        .map(function (t, i) {
          return (
            '<button class="dot' + (i === 0 ? " active" : "") + '" type="button" ' +
            'data-i="' + i + '" aria-label="Show review ' + (i + 1) + '"' +
            (i === 0 ? ' aria-current="true"' : "") + "></button>"
          );
        })
        .join("");
    }

    let index = 0;

    function goTo(i) {
      index = (i + list.length) % list.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";

      if (dots) {
        $$(".dot", dots).forEach(function (d, di) {
          const on = di === index;
          d.classList.toggle("active", on);
          if (on) d.setAttribute("aria-current", "true");
          else d.removeAttribute("aria-current");
        });
      }
    }

    if (prev) prev.addEventListener("click", function () { goTo(index - 1); });
    if (next) next.addEventListener("click", function () { goTo(index + 1); });

    if (dots) {
      dots.addEventListener("click", function (event) {
        const dot = event.target.closest(".dot");
        if (dot) goTo(Number(dot.dataset.i));
      });
    }

    const wrap = track.closest(".testi");
    if (wrap) {
      wrap.addEventListener("keydown", function (event) {
        if (event.key === "ArrowLeft") { goTo(index - 1); }
        if (event.key === "ArrowRight") { goTo(index + 1); }
      });
    }

    goTo(0);
  }

  /* ---------------------------------------------------------
     10. Team + offers (home)
     --------------------------------------------------------- */
  function renderTeam() {
    const box = $("#team");
    if (!box) return;

    box.innerHTML = D.team
      .map(function (t) {
        return (
          '<div class="team-member reveal">' +
          "<h3>" + esc(t.name) + "</h3>" +
          '<div class="role">' + esc(t.role) + "</div>" +
          '<div class="spec">' + esc(t.speciality) + "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderOffers() {
    const box = $("#offers");
    if (!box) return;

    box.innerHTML = D.offers
      .map(function (o) {
        return (
          '<article class="card offer-card reveal">' +
          '<span class="tag">' + esc(o.tag) + "</span>" +
          "<h3>" + esc(o.title) + "</h3>" +
          "<p>" + esc(o.desc) + "</p>" +
          '<span class="highlight">' + esc(o.highlight) + "</span>" +
          "</article>"
        );
      })
      .join("");
  }

  /* ---------------------------------------------------------
     11. Services page — grouped cards + tabs
     --------------------------------------------------------- */
  function renderServicesPage() {
    const grid = $("#servicesGrid");
    if (!grid) return;

    const groups = D.serviceGroups && D.serviceGroups.length
      ? D.serviceGroups
      : D.services.map(function (s) { return s.group; }).filter(function (g, i, arr) {
          return arr.indexOf(g) === i;
        });

    let html = "";
    groups.forEach(function (group) {
      const list = D.services.filter(function (s) { return s.group === group; });
      if (!list.length) return;
      html += '<h2 class="group-head">' + esc(group) + "</h2>";
      html += list
        .map(function (s) { return serviceCard(s, false); })
        .join("");
    });
    grid.innerHTML = html;

    initTabs(grid);
  }

  function initTabs(grid) {
    const tabs = $$(".tab");
    if (!tabs.length) return;

    const cards = $$(".service-card", grid);
    const heads = $$(".group-head", grid);

    function apply(filter) {
      tabs.forEach(function (tab) {
        const on = tab.dataset.filter === filter;
        tab.classList.toggle("active", on);
        tab.setAttribute("aria-pressed", on ? "true" : "false");
      });

      cards.forEach(function (card) {
        const cats = (card.dataset.categories || "").split(/\s+/);
        card.hidden = !(filter === "all" || cats.indexOf(filter) !== -1);
      });

      heads.forEach(function (head) {
        let node = head.nextElementSibling;
        let count = 0;
        while (node && !node.classList.contains("group-head")) {
          if (node.classList.contains("service-card") && !node.hidden) count += 1;
          node = node.nextElementSibling;
        }
        head.hidden = count === 0;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        apply(tab.dataset.filter || "all");
      });
    });

    const active = tabs.filter(function (t) { return t.classList.contains("active"); })[0];
    apply(active ? active.dataset.filter : "all");
  }

  /* ---------------------------------------------------------
     12. Gallery page — grid, lightbox, videos, before/after
     --------------------------------------------------------- */
  function renderGalleryPage() {
    const grid = $("#galleryGrid");
    if (!grid) return;

    grid.innerHTML = D.gallery
      .map(function (g, i) {
        return (
          '<button class="photo-tile reveal" type="button" data-i="' + i + '" ' +
          'aria-label="View ' + esc(g.caption) + ' photo">' +
          '<img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" ' +
          dimAttrs(g.src) + ' loading="lazy" decoding="async">' +
          '<span class="cap">' + esc(g.caption) + "</span>" +
          "</button>"
        );
      })
      .join("");

    initLightbox();
  }

  function initLightbox() {
    const lb = $("#lightbox");
    const img = $("#lbImg");
    const cap = $("#lbCap");
    const closeBtn = $("#lbClose");
    if (!lb || !img || !closeBtn) return;

    const items = D.gallery;
    let index = 0;
    let lastFocus = null;

    function show(i) {
      index = (i + items.length) % items.length;
      const g = items[index];
      img.src = g.src;
      img.alt = g.alt;
      if (cap) cap.textContent = g.caption;
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
      closeBtn.focus();
    }

    function close() {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    document.addEventListener("click", function (event) {
      const tile = event.target.closest("#galleryGrid .photo-tile");
      if (tile) open(Number(tile.dataset.i));
    });

    closeBtn.addEventListener("click", close);
    const prev = $("#lbPrev");
    const next = $("#lbNext");
    if (prev) prev.addEventListener("click", function () { show(index - 1); });
    if (next) next.addEventListener("click", function () { show(index + 1); });

    lb.addEventListener("click", function (event) {
      if (event.target === lb) close();
    });

    /* Focus trap — Tab lightbox ke andar hi rahe */
    lb.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;
      const focusables = $$("button", lb).filter(function (b) {
        return !b.disabled && b.offsetParent !== null;
      });
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!lb.classList.contains("open")) return;
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") show(index - 1);
      else if (event.key === "ArrowRight") show(index + 1);
    });
  }

  function renderVideos() {
    const grid = $("#videoGrid");
    if (!grid) return;

    const list = D.videos || [];
    if (!list.length) {
      const section = grid.closest("section");
      if (section) section.remove();
      return;
    }

    grid.innerHTML = list
      .map(function (v) {
        return (
          '<figure class="video-card reveal">' +
          '<video controls playsinline preload="none" width="480" height="854" ' +
          'poster="' + esc(v.poster) + '" aria-label="' + esc(v.alt || v.caption) + '">' +
          '<source src="' + esc(v.src) + '" type="video/mp4">' +
          "Aapka browser video support nahi karta." +
          "</video>" +
          '<figcaption class="video-cap">' + esc(v.caption) + "</figcaption>" +
          "</figure>"
        );
      })
      .join("");
  }

  function initBeforeAfter() {
    const section = $("#baSection");
    const wrap = $("#baWrap");
    if (!section || !wrap) return;

    const ba = D.beforeAfter;
    if (!ba || !ba.before || !ba.after) {
      section.remove();
      return;
    }

    const before = $(".js-ba-before", wrap);
    const after = $(".js-ba-after", wrap);
    const range = $(".ba-range", wrap);
    const handle = $(".ba-handle", wrap);

    if (before) { before.src = ba.before.src; before.alt = ba.before.alt || "Before"; }
    if (after) { after.src = ba.after.src; after.alt = ba.after.alt || "After"; }

    section.hidden = false;

    if (!range || !after || !handle) return;

    function set(value) {
      const v = Math.max(0, Math.min(100, Number(value) || 0));
      after.style.clipPath = "inset(0 0 0 " + v + "%)";
      handle.style.left = v + "%";
    }

    range.addEventListener("input", function () { set(range.value); });
    set(range.value);
  }

  /* ---------------------------------------------------------
     13. Contact page
     --------------------------------------------------------- */
  function renderFaq() {
    const box = $("#faqList");
    if (!box) return;

    const list = D.faqs || [];
    if (!list.length) {
      const section = box.closest("section");
      if (section) section.remove();
      return;
    }

    box.innerHTML = list
      .map(function (f, i) {
        return (
          '<div class="faq-item">' +
          '<button class="faq-q" type="button" aria-expanded="false" ' +
          'aria-controls="faqA' + i + '" id="faqQ' + i + '">' +
          "<span>" + esc(f.q) + "</span>" +
          '<span class="ico" aria-hidden="true">+</span>' +
          "</button>" +
          '<div class="faq-a" id="faqA' + i + '" role="region" aria-labelledby="faqQ' + i + '">' +
          "<p>" + esc(f.a) + "</p></div>" +
          "</div>"
        );
      })
      .join("");

    box.addEventListener("click", function (event) {
      const btn = event.target.closest(".faq-q");
      if (!btn) return;

      const item = btn.closest(".faq-item");
      const panel = $(".faq-a", item);
      const isOpen = item.classList.contains("open");

      $$(".faq-item", box).forEach(function (other) {
        other.classList.remove("open");
        const b = $(".faq-q", other);
        const p = $(".faq-a", other);
        if (b) b.setAttribute("aria-expanded", "false");
        if (p) p.style.maxHeight = "0px";
      });

      if (!isOpen && panel) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }

  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    const select = $("#serviceSelect");
    const date = $("#cDate");
    const name = $("#cName");
    const waBtn = $("#waBtn");

    /* Service options — grouped by category */
    if (select) {
      const groups = D.serviceGroups && D.serviceGroups.length
        ? D.serviceGroups
        : D.services.map(function (s) { return s.group; }).filter(function (g, i, arr) {
            return arr.indexOf(g) === i;
          });

      let html = '<option value="">Choose a service</option>';
      groups.forEach(function (group) {
        const list = D.services.filter(function (s) { return s.group === group; });
        if (!list.length) return;
        html += '<optgroup label="' + esc(group) + '">';
        list.forEach(function (s) {
          html +=
            '<option value="' + esc(s.name) + '">' + esc(s.name) +
            (s.price ? " — " + esc(s.price) : "") + "</option>";
        });
        html += "</optgroup>";
      });
      select.innerHTML = html;

      /* ?service=Bridal%20Makeup#book */
      try {
        const wanted = new URLSearchParams(window.location.search).get("service");
        if (wanted) {
          const match = $$("option", select).filter(function (o) {
            return o.value.toLowerCase() === wanted.toLowerCase();
          })[0];
          if (match) select.value = match.value;
        }
      } catch (err) { /* purane browser — ignore */ }
    }

    /* Date: aaj se pehle nahi */
    if (date) {
      const today = new Date();
      const pad = function (n) { return String(n).padStart(2, "0"); };
      date.min =
        today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
    }

    /* WhatsApp button — form ki details ke saath */
    if (waBtn) {
      function buildLink() {
        let msg = "Hi Exotic Salon, I'd like to book";
        if (select && select.value) msg += " " + select.value;
        if (date && date.value) msg += " on " + date.value;
        msg += ".";
        if (name && name.value.trim()) msg += " — " + name.value.trim();
        return D.whatsapp.link + "?text=" + encodeURIComponent(msg);
      }
      function update() { waBtn.setAttribute("href", buildLink()); }
      ["input", "change"].forEach(function (ev) { form.addEventListener(ev, update); });
      update();
    }
  }

  function initAskBox() {
    const box = $("#askBox");
    const input = $("#askInput");
    const send = $("#askSend");
    const chips = $("#askChips");
    const msg = $("#askMsg");
    if (!box || !input || !send) return;

    function ask(question) {
      const q = String(question || "").trim();
      if (!q) {
        if (msg) msg.textContent = "Pehle apna sawaal likhein.";
        input.focus();
        return;
      }
      if (msg) msg.textContent = "WhatsApp khul raha hai…";
      window.open(
        D.whatsapp.link + "?text=" + encodeURIComponent("Hi Exotic Salon, " + q),
        "_blank",
        "noopener"
      );
    }

    send.addEventListener("click", function () { ask(input.value); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        ask(input.value);
      }
    });

    if (chips && D.quickQuestions) {
      chips.innerHTML = D.quickQuestions
        .map(function (q) {
          return '<button class="chip" type="button" data-q="' + esc(q) + '">' + esc(q) + "</button>";
        })
        .join("");

      chips.addEventListener("click", function (event) {
        const chip = event.target.closest(".chip");
        if (!chip) return;
        input.value = chip.dataset.q || "";
        ask(input.value);
      });
    }
  }

  function renderHomeServiceNote() {
    const el = $("#contactHomeNote");
    if (!el) return;

    if (!D.homeService) {
      el.remove();
      return;
    }

    el.hidden = false;
    el.innerHTML =
      '<span class="hs-ic">' + icon("home") + "</span>" +
      "<span>" + esc(D.homeService) + "</span>" +
      '<a class="hs-link" href="' + esc(D.whatsapp.link) + '" target="_blank" rel="noopener">' +
      "Ask on WhatsApp</a>";
  }

  function renderOpenStatus() {
    const el = $("#openStatus");
    if (!el) return;

    let minutes = null;
    try {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(new Date());
      const hour = Number(parts.filter(function (p) { return p.type === "hour"; })[0].value) % 24;
      const minute = Number(parts.filter(function (p) { return p.type === "minute"; })[0].value);
      minutes = hour * 60 + minute;
    } catch (err) {
      const now = new Date();
      minutes = now.getHours() * 60 + now.getMinutes();
    }

    const open = minutes >= 9 * 60 && minutes < 22 * 60;
    el.textContent = open
      ? "Open now — closes at 10:00 PM"
      : "Closed now — opens at 9:00 AM";
    el.classList.toggle("is-open", open);
    el.classList.toggle("is-closed", !open);
  }

  /* ---------------------------------------------------------
     14. Boot
     --------------------------------------------------------- */
  function init() {
    fillCommon();
    injectSeo();
    initHeader();
    renderAnnouncement();
    renderMobileBar();

    renderFeaturedServices();
    renderFeatures();
    renderGalleryPreview();
    renderTestimonials();
    renderTeam();
    renderOffers();

    renderServicesPage();
    renderGalleryPage();
    renderVideos();
    initBeforeAfter();

    renderFaq();
    initContactForm();
    initAskBox();
    renderHomeServiceNote();
    renderOpenStatus();

    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* =========================================================
   2026 header: desktop dropdowns + mobile accordions
   ========================================================= */
(function () {
  "use strict";

  function closeAll(except) {
    document.querySelectorAll(".nav-item.is-open").forEach(function (item) {
      if (item === except) return;
      item.classList.remove("is-open");
      var btn = item.querySelector(".nav-drop-toggle");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  document.querySelectorAll(".nav-item.has-dropdown .nav-drop-toggle").forEach(function (btn) {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      var item = btn.closest(".nav-item");
      var open = !item.classList.contains("is-open");
      closeAll(item);
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".nav-item.has-dropdown")) closeAll(null);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var open = document.querySelector(".nav-item.is-open");
    closeAll(null);
    if (open) {
      var btn = open.querySelector(".nav-drop-toggle");
      if (btn) btn.focus();
    }
  });

  document.querySelectorAll(".m-acc-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var panel = btn.nextElementSibling;
      var open = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (panel) panel.classList.toggle("is-open", open);
    });
  });

  /* keep the floating stack and robot out of the open mobile menu */
  var menu = document.getElementById("mobileMenu");
  if (menu) {
    var syncMenu = function () {
      document.body.classList.toggle("menu-open", menu.classList.contains("open"));
    };
    new MutationObserver(syncMenu).observe(menu, { attributes: true, attributeFilter: ["class"] });
    syncMenu();
  }
})();
