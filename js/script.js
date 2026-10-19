/* =========================================================
   Exotic Hair & Beauty Unisex Salon — js/script.js
   ---------------------------------------------------------
   Yeh file data/info.js ke SALON_INFO object ko padhkar
   saare pages ka content render karti hai.
   ========================================================= */

(function () {
  "use strict";

  /* -------- SHORTCUTS -------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* info.js load na ho to chup-chaap ruk jao */
  if (typeof SALON_INFO === "undefined") {
    console.warn("SALON_INFO not found — data/info.js load karo.");
    return;
  }
  const D = SALON_INFO;

  /* =========================================================
     1. COMMON / GLOBAL FILLERS
     ========================================================= */
  function fillCommon() {
    /* Saal (footer copyright) */
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* Call buttons / phone text */
    $$(".js-phone").forEach((el) => {
      el.setAttribute("href", "tel:" + D.phone.tel);
    });
    $$(".js-phone-text").forEach((el) => (el.textContent = D.phone.display));

    /* WhatsApp links */
    $$(".js-wa").forEach((el) => el.setAttribute("href", D.whatsapp.link));

    /* Instagram links */
    $$(".js-insta").forEach((el) => el.setAttribute("href", D.instagram.url));
    $$(".js-insta-handle").forEach((el) => (el.textContent = D.instagram.handle));

    /* Address blocks */
    $$(".js-address").forEach((el) => (el.textContent = D.address.full));
    $$(".js-landmark").forEach((el) => (el.textContent = D.address.landmark));
    $$(".js-map-link").forEach((el) => el.setAttribute("href", D.address.mapLink));

    /* Google Map embed */
    $$(".js-map-embed").forEach((el) => el.setAttribute("src", D.address.mapEmbed));

    /* Before / After slider ki photos (gallery page).
       info.js mein beforeAfter null ho to poora section hata diya jata hai. */
    const baWrap = $("#baWrap");
    if (!D.beforeAfter || !D.beforeAfter.before || !D.beforeAfter.after) {
      if (baWrap) {
        const baSection = baWrap.closest("section");
        if (baSection) baSection.remove();
      }
    } else {
      const baBefore = $(".js-ba-before");
      const baAfter = $(".js-ba-after");
      if (baBefore) {
        baBefore.setAttribute("src", D.beforeAfter.before.src);
        baBefore.setAttribute("alt", D.beforeAfter.before.alt);
      }
      if (baAfter) {
        baAfter.setAttribute("src", D.beforeAfter.after.src);
        baAfter.setAttribute("alt", D.beforeAfter.after.alt);
      }
    }

    /* Timings blocks */
    const timingText = `${D.timings.days}, ${D.timings.open} – ${D.timings.close}`;
    $$(".js-timings").forEach((el) => (el.textContent = timingText));
    $$(".js-timings-note").forEach((el) => (el.textContent = D.timings.note));

    /* Rating text */
    $$(".js-rating-text").forEach((el) => (el.textContent = D.rating.text));
    $$(".js-rating-value").forEach((el) => (el.textContent = D.rating.value));
    $$(".js-rating-count").forEach((el) => (el.textContent = D.rating.count + "+"));

    /* Salon name */
    $$(".js-salon-name").forEach((el) => (el.textContent = D.name));
    $$(".js-short-name").forEach((el) => (el.textContent = D.shortName));
  }

  /* =========================================================
     2. HOME — STATS, FEATURES, OFFERS, SERVICES, TEAM, TESTIMONIALS
     ========================================================= */
  /* =========================================================
     2b. HERO SLIDESHOW (front page banner)
     Photos data/info.js ke heroSlides se aati hain aur apne aap
     cross-fade hoti hain. HTML chhedne ki zaroorat nahi.
     ========================================================= */
  function renderHeroSlides() {
    const hero = $(".hero");
    const slides = D.heroSlides || [];
    if (!hero || !slides.length) return;

    /* Slides hero ke andar sabse pehle — background ki tarah,
       content ke peeche. aria-hidden kyunki ye sirf sajawat hai. */
    const box = document.createElement("div");
    box.className = "hero-slides";
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = slides
      .map(
        (s, i) =>
          `<div class="hero-slide${i === 0 ? " is-active" : ""}" data-bg="${s.src}"` +
          (i === 0 ? ` style="background-image:url('${s.src}')"` : "") +
          `></div>`
      )
      .join("");
    hero.insertBefore(box, hero.firstChild);

    const layers = $$(".hero-slide", box);

    /* Baaki photos page load hone ke baad load karo, taaki pehli
       screen jaldi dikhe. */
    const loadRest = () =>
      layers.forEach((el, i) => {
        if (!el.style.backgroundImage && slides[i]) {
          el.style.backgroundImage = "url('" + slides[i].src + "')";
        }
      });
    if (document.readyState === "complete") loadRest();
    else window.addEventListener("load", loadRest);

    if (layers.length < 2) return;

    /* "Reduce motion" on ho to sirf pehli photo dikhao */
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* 2 second — photo itni der dikhti hai, phir agli */
    const DELAY = 2000;
    let i = 0;
    let timer = null;

    function go(n) {
      layers[i].classList.remove("is-active");
      i = (n + layers.length) % layers.length;
      layers[i].classList.add("is-active");
    }
    function start() {
      if (timer) return;
      timer = setInterval(() => go(i + 1), DELAY);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
    }

    start();
    /* Tab peeche chala jaye to timer band — battery bachao */
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    /* Mouse upar aaye to ruko, hatane par phir chalu */
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
  }

  function renderStats() {
    const box = $("#stats");
    if (!box) return;
    box.innerHTML = D.stats
      .map(
        (s) => `<div class="stat reveal">
            <b>${s.value}</b><span>${s.label}</span></div>`
      )
      .join("");
  }

  function renderFeatures() {
    const box = $("#features");
    if (!box) return;
    box.innerHTML = D.features
      .map(
        (f, i) => `<div class="card feature reveal d${(i % 3) + 1}">
            <div class="ic">${f.emoji}</div>
            <h3>${f.title}</h3>
            <p>${f.text}</p>
          </div>`
      )
      .join("");
  }

  function renderOffers() {
    const box = $("#offers");
    if (!box) return;
    box.innerHTML = D.offers
      .map(
        (o, i) => `<div class="card offer reveal d${(i % 3) + 1}">
            <span class="tag">${o.tag}</span>
            <div class="emoji">${o.icon}</div>
            <h3>${o.title}</h3>
            <p>${o.desc}</p>
            <div class="highlight">${o.highlight}</div>
          </div>`
      )
      .join("");
  }

  /* Service card HTML (shared by home + services page)
     categories ek ARRAY hai, isliye data-category mein space se juda
     hua string jaata hai: data-category="men women" */
  function serviceCard(s) {
    const cats = s.categories || [];
    /* Men + women dono ho to pill mein "Unisex" dikhate hain */
    const pill =
      cats.indexOf("men") > -1 && cats.indexOf("women") > -1
        ? "Unisex"
        : cats.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(" & ");
    /* "Book this" → contact page, service pehle se chuni hui */
    const bookHref = "contact.html?service=" + encodeURIComponent(s.name) + "#book";

    return `<div class="card svc reveal" data-category="${cats.join(" ")}">
        <div class="svc-top">
          <h3>${s.name}</h3>
          ${s.price ? `<span class="price">${s.price}</span>` : ""}
        </div>
        <p class="desc">${s.desc}</p>
        <div class="meta">
          <span class="cat-pill">${pill}</span>
          <span>${s.popular ? '<span class="pop">★ Popular</span> &nbsp;·&nbsp; ' : ""}${s.duration}</span>
        </div>
        <a class="svc-book" href="${bookHref}">Book this →</a>
      </div>`;
  }

  function renderTopServices() {
    const box = $("#topServices");
    if (!box) return;
    const top = D.services.filter((s) => s.popular).slice(0, 6);
    box.innerHTML = top.map(serviceCard).join("");
  }

  /* Services page: cards ko group headings ke neeche dikhate hain.
     Heading ek hi grid item nahi banti — inline style se poori row
     le leti hai (grid-column: 1 / -1), isliye layout same rehta hai. */
  function serviceGroupOrder() {
    const known = Array.isArray(D.serviceGroups) ? D.serviceGroups.slice() : [];
    /* Jo group serviceGroups mein listed nahi, use bhi include karo
       (data mein naya group aaya aur yahan add karna bhool gaye to
       card gum nahi hoga). */
    D.services.forEach((s) => {
      if (s.group && known.indexOf(s.group) === -1) known.push(s.group);
    });
    return known;
  }

  function groupHeading(g) {
    return `<h3 class="svc-group" style="grid-column: 1 / -1">${g}</h3>`;
  }

  function renderServicesPage() {
    const box = $("#servicesGrid");
    if (!box) return;
    const order = serviceGroupOrder();
    box.innerHTML = order
      .map((g) => {
        const items = D.services.filter((s) => s.group === g);
        if (!items.length) return "";
        return groupHeading(g) + items.map(serviceCard).join("");
      })
      .join("");
  }

  function renderTeam() {
    const box = $("#team");
    if (!box) return;
    box.innerHTML = D.team
      .map(
        (t, i) => `<div class="card team-card reveal d${(i % 3) + 1}">
            <h3>${t.name}</h3>
            <div class="role">${t.role}</div>
            <div class="spec">${t.speciality}</div>
          </div>`
      )
      .join("");
  }

  /* -------- TESTIMONIAL SLIDER -------- */
  let testiIndex = 0;
  function renderTestimonials() {
    const track = $("#testiTrack");
    if (!track) return;
    track.innerHTML = D.testimonials
      .map(
        (t) => `<div class="testi-slide">
            <div class="testimonial card">
              <div class="stars">${"★".repeat(t.stars)}</div>
              <p>"${t.text}"</p>
              <div class="who">
                <div class="avatar">${t.name.charAt(0)}</div>
                <div><b>${t.name}</b><span>Verified Google Review</span></div>
              </div>
            </div>
          </div>`
      )
      .join("");
    buildTestiSlider();
  }

  function buildTestiSlider() {
    const track = $("#testiTrack");
    if (!track) return;
    const slides = $$(".testi-slide", track);
    const dots = $("#testiDots");
    if (dots) {
      dots.innerHTML = slides
        .map((_, i) => `<button class="dot" data-i="${i}" aria-label="Review ${i + 1}"></button>`)
        .join("");
    }
    testiIndex = 0;
    updateTesti();

    const next = $("#testiNext");
    const prev = $("#testiPrev");
    if (next) next.addEventListener("click", () => slideTesti(1));
    if (prev) prev.addEventListener("click", () => slideTesti(-1));

    if (dots) {
      $$(".dot", dots).forEach((d) =>
        d.addEventListener("click", () => {
          testiIndex = Number(d.dataset.i);
          updateTesti();
        })
      );
    }

    /* auto-play */
    setInterval(() => slideTesti(1), 6000);
  }

  function slideTesti(dir) {
    const track = $("#testiTrack");
    if (!track) return;
    const total = $$(".testi-slide", track).length;
    testiIndex = (testiIndex + dir + total) % total;
    updateTesti();
  }

  function updateTesti() {
    const track = $("#testiTrack");
    if (!track) return;
    const slides = $$(".testi-slide", track);
    const many = window.innerWidth >= 900;
    const perView = many ? 3 : 1;
    const maxIndex = Math.max(0, slides.length - perView);
    if (testiIndex > maxIndex) testiIndex = 0;
    track.style.transform = `translateX(-${testiIndex * (100 / perView)}%)`;
    $$(".dot").forEach((d, i) => d.classList.toggle("active", i === testiIndex));
  }

  function renderInsta() {
    const box = $("#instaGrid");
    if (!box) return;
    box.innerHTML = D.gallery
      .slice(0, 6)
      .map(
        (g) => `<a href="${D.instagram.url}" target="_blank" rel="noopener" aria-label="${g.caption}">
            <img src="${g.src}" alt="${g.alt}" loading="lazy">
          </a>`
      )
      .join("");
  }

  /* =========================================================
     2c. VIDEOS — home page par ek video, gallery page par grid
     ========================================================= */
  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  function videoCard(v, extra) {
    return (
      '<figure class="video-card' + (extra || "") + '">' +
        '<video controls preload="none" playsinline poster="' + esc(v.poster) + '"' +
          ' aria-label="' + esc(v.alt) + '">' +
          '<source src="' + esc(v.src) + '" type="video/mp4">' +
          "Aapka browser video support nahi karta." +
        "</video>" +
        '<figcaption class="video-cap">' + esc(v.caption) + "</figcaption>" +
      "</figure>"
    );
  }

  /* Ek hi video ek waqt par chale — doosri chalu ho to pehli ruk jaye */
  function soloPlayback(box) {
    const vids = $$("video", box);
    vids.forEach((vid) => {
      vid.addEventListener("play", () => {
        vids.forEach((o) => {
          if (o !== vid && !o.paused) o.pause();
        });
      });
    });
  }

  function renderHomeVideo() {
    const box = $("#homeVideoWrap");
    if (!box) return;
    const v = D.homeVideo;
    if (!v || !v.src) {
      const sec = box.closest("section");
      if (sec) sec.remove();
      return;
    }
    box.innerHTML = videoCard(v, " video-card-home") +
      (v.note ? '<p class="video-note">' + esc(v.note) + "</p>" : "");
    soloPlayback(box);
  }

  function renderVideos() {
    const box = $("#videoGrid");
    if (!box) return;
    const list = D.videos || [];
    if (!list.length) {
      const sec = box.closest("section");
      if (sec) sec.remove();
      return;
    }
    box.innerHTML = list.map((v) => videoCard(v, " reveal")).join("");
    soloPlayback(box);
  }

  /* =========================================================
     3. SERVICES PAGE — FILTER TABS
     ========================================================= */
  function initTabs() {
    const tabs = $$(".tab");
    if (!tabs.length) return;
    const cards = () => $$("#servicesGrid .svc");

    /* Group heading sirf tab dikhe jab us group ka koi card visible ho.
       Warna khaali heading (jaise "Makeup" Men tab mein) le ke baith jaati. */
    function updateGroupHeadings() {
      const grid = $("#servicesGrid");
      if (!grid) return;
      const kids = Array.from(grid.children);
      let i = 0;
      while (i < kids.length) {
        if (kids[i].classList.contains("svc-group")) {
          const head = kids[i];
          let anyVisible = false;
          let j = i + 1;
          while (j < kids.length && !kids[j].classList.contains("svc-group")) {
            if (kids[j].classList.contains("svc") && kids[j].style.display !== "none") {
              anyVisible = true;
            }
            j++;
          }
          head.style.display = anyVisible ? "" : "none";
          i = j;
        } else {
          i++;
        }
      }
    }

    /* Ek category lagao. Ek service ki multiple categories ho sakti hain,
       isliye data-category ko space par todkar check karte hain —
       "men women" mein "women" bhi match karega. */
    function applyFilter(cat) {
      tabs.forEach((t) => t.classList.toggle("active", t.dataset.filter === cat));
      cards().forEach((c) => {
        const cats = (c.dataset.category || "").split(" ");
        const show = cat === "all" || cats.indexOf(cat) > -1;
        c.style.display = show ? "" : "none";
        /* ZAROORI: filter se dikhne wale card ko turant reveal karo.
           Warna jo card pehle screen ke neeche tha (class "reveal" par
           "visible" nahi), wo display to ho jayega lekin opacity:0 par
           atka rahega — yaani khaali card dikhega. */
        if (show) c.classList.add("visible");
      });
      updateGroupHeadings();
    }

    tabs.forEach((tab) =>
      tab.addEventListener("click", () => applyFilter(tab.dataset.filter))
    );

    /* Deep link: services.html#bridal seedha usi tab par khulega
       (Home page se aise link kar sakte ho). */
    function fromHash() {
      const cat = (location.hash || "").replace("#", "").toLowerCase();
      if (cat && tabs.some((t) => t.dataset.filter === cat)) applyFilter(cat);
    }
    fromHash();
    window.addEventListener("hashchange", fromHash);
  }

  /* =========================================================
     4. GALLERY PAGE — GRID + LIGHTBOX
     ========================================================= */
  let lbIndex = 0;
  function renderGallery() {
    const box = $("#galleryGrid");
    if (!box) return;
    box.innerHTML = D.gallery
      .map(
        (g, i) => `<div class="gallery-item reveal" data-i="${i}">
            <img src="${g.src}" alt="${g.alt}" loading="lazy">
            <div class="cap">${g.caption}</div>
          </div>`
      )
      .join("");
    initLightbox();
  }

  function initLightbox() {
    const lb = $("#lightbox");
    if (!lb) return;
    const img = $("#lbImg", lb);
    const cap = $("#lbCap", lb);
    const items = $$(".gallery-item");

    const open = (i) => {
      lbIndex = (i + D.gallery.length) % D.gallery.length;
      img.src = D.gallery[lbIndex].src;
      img.alt = D.gallery[lbIndex].alt;
      cap.textContent = D.gallery[lbIndex].caption;
      lb.classList.add("open");
      document.body.classList.add("no-scroll");
    };
    const close = () => {
      lb.classList.remove("open");
      document.body.classList.remove("no-scroll");
    };

    items.forEach((it) => it.addEventListener("click", () => open(Number(it.dataset.i))));
    $("#lbClose", lb).addEventListener("click", close);
    $("#lbPrev", lb).addEventListener("click", () => open(lbIndex - 1));
    $("#lbNext", lb).addEventListener("click", () => open(lbIndex + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") open(lbIndex - 1);
      if (e.key === "ArrowRight") open(lbIndex + 1);
    });
  }

  /* -------- BEFORE / AFTER SLIDER -------- */
  function initBeforeAfter() {
    const wrap = $("#baWrap");
    if (!wrap) return;
    const range = $("#baRange", wrap);
    const after = $("#baAfter", wrap);
    const handle = $("#baHandle", wrap);
    const move = (v) => {
      after.style.clipPath = `inset(0 0 0 ${v}%)`;
      handle.style.left = v + "%";
    };
    range.addEventListener("input", () => move(range.value));
    move(range.value);
  }

  /* =========================================================
     5. CONTACT PAGE — FORM (opens WhatsApp) + FAQ
     ========================================================= */
  function initContactForm() {
    const form = $("#contactForm");
    if (!form) return;

    /* Service dropdown fill */
    const select = $("#serviceSelect");
    if (select) {
      select.innerHTML =
        '<option value="">-- Select a service --</option>' +
        D.services
          .map((s) => `<option value="${s.name}">${s.name}${s.price ? " (" + s.price + ")" : ""}</option>`)
          .join("");

      /* URL se service pehle se chuni hui dikhao.
         services page ka "Book this" link aise aata hai:
         contact.html?service=Nail%20Art#book */
      const wanted = new URLSearchParams(location.search).get("service");
      if (wanted) {
        const found = Array.from(select.options).find((o) => o.value === wanted);
        if (found) select.value = wanted;
      }
    }

    /* Form ka SUBMIT ab js/main.js handle karta hai (email -> /api/contact).
       Yahan sirf alag "Send on WhatsApp" button ka kaam hai. */
    const waBtn = $("#waBtn");
    if (waBtn) {
      waBtn.addEventListener("click", () => {
        const val = (sel) => {
          const el = $(sel);
          return el ? el.value.trim() : "";
        };
        const name = val("#cName");
        const phone = val("#cPhone");
        const service = select ? select.value : "";
        const date = val("#cDate");
        const message = val("#cMessage");

        /* Message ko lines array se banate hain.
           Zaroori: encodeURIComponent() — kyunki salon ke naam aur
           user ke input mein "&" jaise characters ho sakte hain,
           warna WhatsApp ka message beech se toot jaata hai. */
        const lines = [
          `Hello ${D.name}!`,
          ``,
          `I would like to book an appointment.`,
          `Name: ${name || "-"}`,
          `Phone: ${phone || "-"}`,
          `Service: ${service || "-"}`,
          `Preferred Date: ${date || "-"}`
        ];
        if (message) lines.push(`Message: ${message}`);

        window.open(D.whatsapp.link + "?text=" + encodeURIComponent(lines.join("\n")), "_blank");
      });
    }
  }

  function renderFaq() {
    const box = $("#faqList");
    if (!box) return;
    box.innerHTML = D.faqs
      .map(
        (f) => `<div class="faq-item">
            <button class="faq-q" type="button">${f.q}<span class="ico">+</span></button>
            <div class="faq-a"><p>${f.a}</p></div>
          </div>`
      )
      .join("");

    $$(".faq-q", box).forEach((q) =>
      q.addEventListener("click", () => {
        const item = q.parentElement;
        const ans = $(".faq-a", item);
        const isOpen = item.classList.contains("open");
        $$(".faq-item", box).forEach((it) => {
          it.classList.remove("open");
          $(".faq-a", it).style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("open");
          ans.style.maxHeight = ans.scrollHeight + "px";
        }
      })
    );
  }

  /* =========================================================
     5b. SEO — meta keywords + hasOfferCatalog JSON-LD
     Sab kuch data/info.js se banta hai. HTML pages chhue bina.
     ========================================================= */
  function injectSeo() {
    /* ---- meta keywords: jo page par already hain + info.js ke naye ---- */
    if (Array.isArray(D.seoKeywords) && D.seoKeywords.length) {
      let kw = $('meta[name="keywords"]');
      if (!kw) {
        kw = document.createElement("meta");
        kw.setAttribute("name", "keywords");
        document.head.appendChild(kw);
      }
      const list = (kw.getAttribute("content") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      D.seoKeywords.forEach((k) => {
        if (list.indexOf(k) === -1) list.push(k);
      });
      kw.setAttribute("content", list.join(", "));
    }

    /* ---- hasOfferCatalog (saari services ke naam) ---- */
    const catalog = {
      "@type": "OfferCatalog",
      name: "Salon Services",
      itemListElement: D.services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.name }
      }))
    };

    /* Page par pehle se jo LocalBusiness JSON-LD hai, usme daal dete hain */
    let done = false;
    $$('script[type="application/ld+json"]').forEach((sc) => {
      try {
        const data = JSON.parse(sc.textContent);
        const node = Array.isArray(data)
          ? data.find((d) => d && d["@type"] === "LocalBusiness")
          : data && data["@type"] === "LocalBusiness"
          ? data
          : null;
        if (node) {
          node.hasOfferCatalog = catalog;
          sc.textContent = JSON.stringify(data);
          done = true;
        }
      } catch (e) {
        /* Ye hamara schema nahi — chhod do */
      }
    });

    /* Kisi page par schema na ho to naya bana dete hain */
    if (!done) {
      const sc = document.createElement("script");
      sc.type = "application/ld+json";
      sc.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: D.name,
        telephone: D.phone.display,
        hasOfferCatalog: catalog
      });
      document.head.appendChild(sc);
    }
  }

  /* =========================================================
     5c. HOME SERVICES NOTICE (services page + contact page)
     ========================================================= */
  function waHref(text) {
    return D.whatsapp.link + (text ? "?text=" + encodeURIComponent(text) : "");
  }

  function renderHomeServiceNotice() {
    const text = D.homeService;
    if (!text) return;

    const inner = `<span class="hs-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
               stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10.5 12 3l9 7.5"/><path d="M5.6 9.4V21h12.8V9.4"/>
          </svg>
        </span>
        <span class="hs-text">${text}</span>
        <a class="hs-link" href="${waHref("Hi " + D.name + "! I would like to know about home services.")}"
           target="_blank" rel="noopener">Chat on WhatsApp</a>`;

    /* Services page — banner ke neeche */
    if ($("#servicesGrid")) {
      const banner = $(".page-banner");
      if (banner) {
        const note = document.createElement("div");
        note.className = "home-service-note";
        note.innerHTML = `<div class="container">${inner}</div>`;
        banner.insertAdjacentElement("afterend", note);
      }
    }

    /* Contact page — details ke andar */
    const cNote = $("#contactHomeNote");
    if (cNote) cNote.innerHTML = inner;
  }

  /* =========================================================
     5d. CONTACT PAGE — highlights, quick info, live status, ask box
     ========================================================= */
  const HL_ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5.6 9.4V21h12.8V9.4"/>',
    facial: '<path d="M12 3s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.4 12 3 12 3Z"/>',
    bridal: '<path d="M4 19h16"/><path d="M4 16 3 8l5 4 4-7 4 7 5-4-1 8Z"/>'
  };

  function hlIcon(name) {
    const path = HL_ICONS[name] || HL_ICONS.home;
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
        stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
  }

  function renderHighlights() {
    const box = $("#contactHighlights");
    if (!box) return;
    const items = D.highlights || [];
    if (!items.length) {
      const wrap = box.closest(".highlights-wrap");
      if (wrap) wrap.style.display = "none";
      return;
    }
    box.innerHTML = items
      .map((h) => {
        const toWa = h.link === "whatsapp";
        const href = toWa
          ? waHref("Hi " + D.name + "! I would like to know about home services.")
          : h.link || "#";
        const ext =
          toWa || /^https?:/i.test(h.link || "")
            ? ' target="_blank" rel="noopener"'
            : "";
        return `<a class="hl-item" href="${href}"${ext}>
            <span class="hl-ic">${hlIcon(h.icon)}</span>
            <span class="hl-label">${h.label}</span>
            <span class="hl-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="15" height="15"
                fill="none" stroke="currentColor" stroke-width="2.2"
                stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>
          </a>`;
      })
      .join("");
  }

  /* Clipboard copy — naye browsers par navigator.clipboard,
     purane par textarea + execCommand fallback. */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error("copy failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  /* Button ka label 2 second ke liye badal dete hain ("Copied" etc.) */
  function flashLabel(btn, text) {
    if (!btn || btn.dataset.busy === "1") return;
    btn.dataset.busy = "1";
    const old = btn.textContent;
    btn.textContent = text;
    setTimeout(() => {
      btn.textContent = old;
      btn.dataset.busy = "0";
    }, 2000);
  }

  function renderQuickInfo() {
    const box = $("#quickInfo");
    if (!box) return;
    const rows = [];

    rows.push(`<div class="qi-row">
        <div class="qi-label">Address</div>
        <div class="qi-val">${D.address.full}</div>
        <button type="button" class="qi-btn" id="qiCopy"
                aria-label="Copy salon address to clipboard">Copy address</button>
      </div>`);

    rows.push(`<div class="qi-row">
        <div class="qi-label">Directions</div>
        <a class="qi-btn qi-link" href="${D.address.mapLink}" target="_blank" rel="noopener"
           aria-label="Get directions to the salon on Google Maps">Get Directions</a>
      </div>`);

    rows.push(`<div class="qi-row">
        <div class="qi-label">Open / Closed</div>
        <div class="qi-status" id="openStatus" role="status" aria-live="polite">&nbsp;</div>
        <div class="qi-sub">${D.timings.days} · ${D.timings.open} – ${D.timings.close} · ${D.timings.note}</div>
      </div>`);

    rows.push(`<div class="qi-row">
        <div class="qi-label">Share</div>
        <button type="button" class="qi-btn" id="qiShare"
                aria-label="Share this page">Share</button>
      </div>`);

    if (D.reviewUrl) {
      rows.push(`<div class="qi-row">
          <div class="qi-label">Reviews</div>
          <a class="qi-btn qi-link" href="${D.reviewUrl}" target="_blank" rel="noopener"
             aria-label="Rate us on Google">Rate us on Google</a>
        </div>`);
    }

    /* Email row SIRF tab jab info.js mein email bhara ho */
    if (D.email && String(D.email).trim()) {
      rows.push(`<div class="qi-row">
          <div class="qi-label">Email</div>
          <a class="qi-btn qi-link" href="mailto:${D.email}"
             aria-label="Send enquiry by email">Send enquiry by email</a>
          <div class="qi-sub">${D.email}</div>
        </div>`);
    }

    box.innerHTML = `<h3 class="qi-title">Quick Information</h3>` + rows.join("");

    const copyBtn = $("#qiCopy");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        copyText(D.address.full).then(
          () => flashLabel(copyBtn, "Copied"),
          () => flashLabel(copyBtn, "Copy failed")
        );
      });
    }

    const shareBtn = $("#qiShare");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        const url = location.href;
        if (navigator.share) {
          navigator.share({ title: D.name, url: url }).catch(() => {});
        } else {
          copyText(url).then(
            () => flashLabel(shareBtn, "Link copied"),
            () => flashLabel(shareBtn, "Copy failed")
          );
        }
      });
    }
  }

  /* Live "Open now / Closed now" — Asia/Kolkata time se, har minute update */
  function initLiveStatus() {
    const el = $("#openStatus");
    if (!el) return;

    const toMin = (hhmm) => {
      const p = String(hhmm || "0:0").split(":");
      return Number(p[0]) * 60 + Number(p[1] || 0);
    };
    const pretty = (hhmm) => {
      const p = String(hhmm || "0:0").split(":");
      let h = Number(p[0]);
      const m = Number(p[1] || 0);
      const ampm = h >= 12 ? "PM" : "AM";
      h %= 12;
      if (h === 0) h = 12;
      return h + ":" + String(m).padStart(2, "0") + " " + ampm;
    };

    const openMin = toMin(D.timings.schemaOpens);
    const closeMin = toMin(D.timings.schemaCloses);

    function update() {
      let hh, mm;
      try {
        const parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }).formatToParts(new Date());
        const get = (t) => Number((parts.find((p) => p.type === t) || {}).value || 0);
        hh = get("hour") % 24;
        mm = get("minute");
      } catch (e) {
        const now = new Date();
        hh = now.getHours();
        mm = now.getMinutes();
      }

      const nowMin = hh * 60 + mm;
      const isOpen = nowMin >= openMin && nowMin < closeMin;
      el.textContent = isOpen
        ? "Open now, closes at " + pretty(D.timings.schemaCloses)
        : "Closed now, opens at " + pretty(D.timings.schemaOpens);
      el.classList.toggle("is-open", isOpen);
      el.classList.toggle("is-closed", !isOpen);
    }

    update();
    setInterval(update, 60000);
  }

  /* "Ask Us Anything" — sirf WhatsApp kholta hai, koi AI / API nahi */
  function initAskBox() {
    const box = $("#askBox");
    if (!box) return;
    const input = $("#askInput");
    const send = $("#askSend");
    const chips = $("#askChips");
    const msg = $("#askMsg");

    function ask(text) {
      const q = String(text || "").trim();
      if (!q) {
        if (msg) msg.textContent = "Kripya pehle apna sawaal likhein.";
        if (input) input.focus();
        return;
      }
      if (msg) msg.textContent = "";
      window.open(waHref(q), "_blank");
      if (input) input.value = "";
    }

    if (chips) {
      chips.innerHTML = (D.quickQuestions || [])
        .map(
          (q) =>
            `<button type="button" class="chip" data-q="${String(q).replace(/"/g, "&quot;")}">${q}</button>`
        )
        .join("");
      $$(".chip", chips).forEach((c) =>
        c.addEventListener("click", () => ask(c.dataset.q))
      );
    }

    if (send) send.addEventListener("click", () => ask(input ? input.value : ""));
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          ask(input.value);
        }
      });
    }
  }

  /* Services page ke group heading ka chhota CSS.
     Ye sirf script.js se aata hai — css/style.css ko haath nahi lagaya. */
  function injectServiceStyles() {
    if ($("#svcGroupStyles")) return;
    const st = document.createElement("style");
    st.id = "svcGroupStyles";
    st.textContent =
      ".svc-group {" +
      "  font-family: var(--font-head, 'Playfair Display', serif);" +
      "  font-size: 1.45rem; font-weight: 700; color: var(--text, #3a2230);" +
      "  text-align: center; position: relative;" +
      "  margin: 14px 0 0; padding-bottom: 12px;" +
      "}" +
      ".svc-group::after {" +
      "  content: ''; position: absolute; left: 50%; bottom: 0;" +
      "  transform: translateX(-50%); width: 62px; height: 3px; border-radius: 3px;" +
      "  background: linear-gradient(90deg, var(--gold-deep, #c9a24b), var(--gold-light, #e6cf94));" +
      "}";
    document.head.appendChild(st);
  }

  /* =========================================================
     5e. MOBILE BOTTOM ACTION BAR (sab pages)
     ---------------------------------------------------------
     Sirf 768px ya usse chhoti screen par dikhta hai (CSS dekhta
     hai). HTML yahin banta hai, isliye info.js mein
     mobileBar.enabled false karne par bar page par aati hi nahi.
     ========================================================= */
  /* Icons — site ke purane float-call / float-wa wale hi SVG
     paths, taaki dekhne mein ek jaise lagein. */
  const BAR_ICONS = {
    phone:
      '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
    whatsapp:
      '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .2 0 .9-.2 1.5Z"/>'
  };

  function barIcon(name, size) {
    const solid = name === "whatsapp";
    return (
      `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" ` +
      (solid
        ? 'fill="currentColor"'
        : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"') +
      `>${BAR_ICONS[name] || ""}</svg>`
    );
  }

  function renderMobileBar() {
    const cfg = D.mobileBar;
    if (!cfg || cfg.enabled === false) return;
    if ($("#mobileBar")) return;

    const bar = document.createElement("div");
    bar.className = "mobile-bar";
    bar.id = "mobileBar";
    bar.innerHTML =
      `<div class="mb-inner">
          <a class="btn btn-primary mb-btn" id="mbCall" href="tel:${D.phone.tel}">
            ${barIcon("phone", 18)}<span>${cfg.callText || "Call"}</span>
          </a>
          <a class="btn btn-wa mb-btn" id="mbWa" href="${waHref(cfg.waMessage)}"
             target="_blank" rel="noopener">
            ${barIcon("whatsapp", 18)}<span>${cfg.waText || "WhatsApp"}</span>
          </a>
        </div>`;

    /* Icons ke saath saaf label — screen reader ke liye */
    const call = $("#mbCall", bar);
    const wa = $("#mbWa", bar);
    call.setAttribute("aria-label", cfg.callAria || call.textContent.trim());
    wa.setAttribute("aria-label", cfg.waAria || wa.textContent.trim());

    document.body.appendChild(bar);

    /* Asli height naap kar CSS variable mein daalte hain — usi se
       page ka bottom padding aur #backTop ki position banti hai.
       (Font bada ho ya text lamba, tab bhi sahi rahega.) */
    const syncHeight = () =>
      document.documentElement.style.setProperty("--mb-bar-h", bar.offsetHeight + "px");
    syncHeight();
    window.addEventListener("load", syncHeight);
    window.addEventListener("resize", syncHeight);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncHeight).catch(() => {});
    }
  }

  /* =========================================================
     5f. FESTIVE OFFER STRIP (sab pages)
     ---------------------------------------------------------
     info.js ke announcement se chalta hai. enabled false ho to
     strip page mein bilkul nahi banti. Band karne par us browser
     session ke liye band rehti hai (sessionStorage).
     ========================================================= */
  const ANN_KEY = "exoticAnnounceClosed";

  function annClosed() {
    try {
      return sessionStorage.getItem(ANN_KEY) === "1";
    } catch (e) {
      return false; /* private mode / storage band ho to dikha do */
    }
  }

  function annRememberClosed() {
    try {
      sessionStorage.setItem(ANN_KEY, "1");
    } catch (e) {
      /* kuch nahi — sirf is page par band rahegi */
    }
  }

  /* enabled + text ho, aur endDate aaj ya aage ho (ya khaali) */
  function annIsLive(a) {
    if (!a || a.enabled !== true || !a.text) return false;
    if (!a.endDate) return true;
    const end = new Date(a.endDate + "T23:59:59");
    if (isNaN(end.getTime())) return true; /* galat date → expiry maaf */
    return Date.now() <= end.getTime();
  }

  function renderAnnouncement() {
    if (!annIsLive(D.announcement)) return;
    if (annClosed()) return;
    if ($("#annStrip")) return;

    const a = D.announcement;
    const strip = document.createElement("div");
    strip.className = "ann-strip";
    strip.id = "annStrip";
    strip.setAttribute("role", "region");
    strip.setAttribute("aria-label", "Special offer");
    strip.innerHTML =
      `<div class="container ann-inner">
          <p class="ann-text">${a.text}</p>
          ${a.link ? `<a class="ann-link" href="${a.link}">${a.linkText || "Know more"}</a>` : ""}
          <button type="button" class="ann-close" id="annClose" aria-label="Offer band karein">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </div>`;

    /* Navbar se pehle, normal flow mein — isliye sticky header ke
       saath kabhi overlap nahi hota. */
    document.body.insertBefore(strip, document.body.firstChild);

    $("#annClose", strip).addEventListener("click", () => {
      annRememberClosed();
      strip.remove();
    });
  }

  /* =========================================================
     6. UI BEHAVIOUR (preloader, nav, reveal, back-to-top)
     ========================================================= */
  function initPreloader() {
    const pre = $("#preloader");
    if (!pre) return;
    window.addEventListener("load", () =>
      setTimeout(() => {
        pre.classList.add("hidden");
        /* ab hero ka text slide-in shuru hota hai (CSS section 25) */
        document.body.classList.add("hero-in");
      }, 400)
    );
  }

  function initHeader() {
    const header = $(".header");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
      window.addEventListener("scroll", onScroll);
      onScroll();
    }

    const burger = $("#hamburger");
    const menu = $("#mobileMenu");
    if (burger && menu) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        menu.classList.toggle("open");
        document.body.classList.toggle("no-scroll");
      });
      $$("a", menu).forEach((a) =>
        a.addEventListener("click", () => {
          burger.classList.remove("open");
          menu.classList.remove("open");
          document.body.classList.remove("no-scroll");
        })
      );
    }
  }

  function initReveal() {
    const els = $$(".reveal");
    if (!els.length || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("visible");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((e) => io.observe(e));
  }

  function initBackTop() {
    const btn = $("#backTop");
    if (!btn) return;
    window.addEventListener("scroll", () =>
      btn.classList.toggle("show", window.scrollY > 500)
    );
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* =========================================================
     7. BOOT
     ========================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    fillCommon();
    injectServiceStyles();
    injectSeo();
    renderAnnouncement();
    renderMobileBar();
    renderHeroSlides();
    renderStats();
    renderFeatures();
    renderOffers();
    renderTopServices();
    renderServicesPage();
    renderHomeServiceNotice();
    initTabs();
    renderTeam();
    renderTestimonials();
    renderInsta();
    renderGallery();
    renderVideos();
    renderHomeVideo();
    initBeforeAfter();
    initContactForm();
    renderHighlights();
    renderQuickInfo();
    initLiveStatus();
    initAskBox();
    renderFaq();
    initPreloader();
    initHeader();
    initBackTop();
    initReveal();

    window.addEventListener("resize", updateTesti);
  });
})();
