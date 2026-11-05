/* =========================================================
   Exotic Salon — hero slider + floating button guard
   ---------------------------------------------------------
   Full-bleed photo background, text overlaid on the left.
   - data-driven slides from SALON_INFO.heroSlides
   - 6s autoplay, 800ms crossfade, slow zoom (CSS)
   - dots, swipe, keyboard arrows, hover/focus pause
   - prefers-reduced-motion: no autoplay, no zoom (CSS)
   ========================================================= */
(function () {
  "use strict";

  var D = typeof SALON_INFO !== "undefined" ? SALON_INFO : null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  var ICONS = {
    sparkle:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/></svg>',
    scissors:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/></svg>',
    store:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9.5 5 4h14l2 5.5"/><path d="M3 9.5h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0v-2z"/><path d="M4 13.5V20h16v-6.5"/></svg>'
  };

  var ARROW =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  var PHONE_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>';

  function accentLine(line, accent) {
    var text = String(line == null ? "" : line);
    var word = String(accent == null ? "" : accent).trim();
    if (!word) return esc(text);
    var index = text.toLowerCase().indexOf(word.toLowerCase());
    if (index === -1) return esc(text);
    return (
      esc(text.slice(0, index)) +
      '<span class="hs-accent">' +
      esc(text.slice(index, index + word.length)) +
      "</span>" +
      esc(text.slice(index + word.length))
    );
  }

  var slider = document.querySelector(".hero-slider");
  if (!slider) {
    initFloatGuard();
    return;
  }

  var slidesWrap = slider.querySelector("#heroSlides");
  var dotsWrap = slider.querySelector("#heroDots");
  var slides = (D && Array.isArray(D.heroSlides) ? D.heroSlides : []).filter(function (s) {
    return s && s.image;
  });

  if (!slidesWrap || !dotsWrap || !slides.length) return;

  slidesWrap.innerHTML = slides
    .map(function (slide, i) {
      var first = i === 0;
      var line1 = (slide.title && slide.title[0]) || "";
      var line2 = (slide.title && slide.title[1]) || "";
      var icon = ICONS[slide.icon] || ICONS.sparkle;
      var imgPath = esc(slide.image);
      var stem = imgPath.replace(/\.(jpg|jpeg|png)$/i, "");
      var w = slide.width || 1600;
      var h = slide.height || 900;

      /* Only reference WebP variants that we know exist (<= original width). */
      var webpSrcset = [];
      [480, 720, 800, 1200, 1600].forEach(function (tw) {
        if (tw <= w) webpSrcset.push(stem + "-" + tw + ".webp " + tw + "w");
      });

      return (
        '<article class="hs-slide' + (first ? " is-active" : "") + '" role="group" ' +
        'aria-roledescription="slide" aria-label="' + (i + 1) + " of " + slides.length + '" ' +
        'aria-hidden="' + (first ? "false" : "true") + '"' + (first ? "" : " inert") + ">" +

        /* Full-bleed background photo */
        '<picture class="hs-bg-picture">' +
        (webpSrcset.length
          ? '<source srcset="' + webpSrcset.join(", ") + '" sizes="100vw" type="image/webp">'
          : "") +
        '<source srcset="' + imgPath + ' ' + w + 'w" sizes="100vw" type="image/jpeg">' +
        '<img class="hs-bg-img" src="' + imgPath + '" alt="' + esc(slide.alt) + '" ' +
        'style="object-position:' + esc(slide.position || "center top") + '" ' +
        (first
          ? 'fetchpriority="high" loading="eager" width="' + w + '" height="' + h + '"'
          : 'loading="lazy" width="' + w + '" height="' + h + '"') +
        ' decoding="async" ' +
        'onerror="this.style.display=\'none\';this.closest(\'.hs-slide\').classList.add(\'hs-img-failed\');">' +
        '</picture>' +

        /* Text overlay, left aligned */
        '<div class="hs-inner">' +
        '<div class="container">' +
        '<div class="hs-content">' +
        '<span class="hs-badge hs-anim" style="--d:0ms">' + icon + "<span>" + esc(slide.badge) + "</span></span>" +
        (first
          ? '<h1 class="hs-title hs-anim" style="--d:45ms">'
          : '<h2 class="hs-title hs-anim" style="--d:45ms">') +
        '<span class="hs-line">' + accentLine(line1, slide.accent) + "</span>" +
        '<span class="hs-line">' + accentLine(line2, slide.accent) + "</span>" +
        (first ? "</h1>" : "</h2>") +
        '<p class="hs-text hs-anim" style="--d:120ms">' + esc(slide.text) + "</p>" +
        '<div class="hs-actions hs-anim" style="--d:270ms">' +
        '<a class="hs-btn hs-btn-primary" href="' + esc(slide.primaryHref) + '">' +
        esc(slide.primaryLabel) + ARROW + "</a>" +
        '<a class="hs-btn hs-btn-glass" href="' + esc(slide.secondaryHref) + '">' +
        PHONE_ICON + esc(slide.secondaryLabel) + "</a>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</article>"
      );
    })
    .join("");

  dotsWrap.innerHTML = slides
    .map(function (slide, i) {
      return (
        '<button class="hs-dot' + (i === 0 ? " is-active" : "") + '" type="button" ' +
        (i === 0 ? 'aria-current="true" ' : "") +
        'aria-label="Go to slide ' + (i + 1) + ": " + esc(slide.badge) + '"></button>'
      );
    })
    .join("");

  var slideEls = Array.prototype.slice.call(slidesWrap.children);
  var dotEls = Array.prototype.slice.call(dotsWrap.children);
  var index = 0;
  var timer = 0;
  var DELAY = 6000;
  var reduceQuery = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduce = !!(reduceQuery && reduceQuery.matches);
  var paused = false;

  function restartZoom(el) {
    var img = el && el.querySelector(".hs-bg-img");
    if (!img) return;
    img.style.animation = "none";
    void img.offsetWidth;
    img.style.animation = "";
  }

  function show(next) {
    var target = (next + slides.length) % slides.length;
    if (target === index) return;

    slideEls.forEach(function (el, i) {
      var on = i === target;
      el.classList.toggle("is-active", on);
      el.setAttribute("aria-hidden", on ? "false" : "true");
      if (on) el.removeAttribute("inert");
      else el.setAttribute("inert", "");
      if (on) restartZoom(el);
    });

    dotEls.forEach(function (dot, i) {
      var on = i === target;
      dot.classList.toggle("is-active", on);
      if (on) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    index = target;
  }

  function start() {
    stop();
    if (reduce || paused || slides.length < 2) return;
    timer = window.setInterval(function () {
      if (document.hidden) return;
      show(index + 1);
    }, DELAY);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = 0;
    }
  }

  function userShow(next) {
    show(next);
    start();
  }

  dotEls.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      userShow(i);
    });
  });

  slider.addEventListener("mouseenter", function () {
    paused = true;
    stop();
  });
  slider.addEventListener("mouseleave", function () {
    paused = false;
    start();
  });
  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", function (event) {
    if (!slider.contains(event.relatedTarget)) start();
  });

  slider.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      userShow(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      userShow(index - 1);
    }
  });

  var touchX = 0;
  var touchY = 0;
  slider.addEventListener(
    "touchstart",
    function (event) {
      var t = event.changedTouches[0];
      touchX = t.clientX;
      touchY = t.clientY;
    },
    { passive: true }
  );
  slider.addEventListener(
    "touchend",
    function (event) {
      var t = event.changedTouches[0];
      var dx = t.clientX - touchX;
      var dy = t.clientY - touchY;
      if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) {
        userShow(index + (dx < 0 ? 1 : -1));
      }
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  if (reduceQuery && reduceQuery.addEventListener) {
    reduceQuery.addEventListener("change", function (event) {
      reduce = event.matches;
      if (reduce) stop();
      else start();
    });
  }

  start();
  initFloatGuard();

  /* Thin strip below the hero: values from data/info.js */
  if (D && D.address) {
    var area = String(D.address.line1 || "").replace(/^DSS\s*\d+\s*,\s*/i, "");
    var areaEls = document.querySelectorAll(".js-hero-area");
    Array.prototype.forEach.call(areaEls, function (el) {
      el.textContent = area + ", " + D.address.city;
    });
  }

  if (D && D.timings && D.timings.note) {
    Array.prototype.forEach.call(document.querySelectorAll(".js-timings-note"), function (el) {
      el.textContent = D.timings.note;
    });
  }

  /* Floating buttons: hide on phones while the hero or a form is on screen,
     so they can never cover hero text, buttons or form fields. */
  function initFloatGuard() {
    var stack = document.querySelector(".float-stack");
    if (!stack || !("IntersectionObserver" in window)) return;

    var mq = window.matchMedia("(max-width: 900px)");
    var zones = [document.querySelector(".hero-slider")]
      .concat(Array.prototype.slice.call(document.querySelectorAll("form")))
      .filter(Boolean);
    if (!zones.length) return;

    var visible = [];
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var i = visible.indexOf(entry.target);
          if (entry.isIntersecting && i === -1) visible.push(entry.target);
          if (!entry.isIntersecting && i !== -1) visible.splice(i, 1);
        });
        stack.classList.toggle("is-hidden", mq.matches && visible.length > 0);
      },
      { threshold: 0.12 }
    );

    zones.forEach(function (zone) {
      io.observe(zone);
    });

    if (mq.addEventListener) {
      mq.addEventListener("change", function () {
        stack.classList.toggle("is-hidden", mq.matches && visible.length > 0);
      });
    }
  }
})();
