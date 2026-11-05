/* ---------------------------------------------------------
   Exotic Salon - voice guided website tour
   - Speaks each section with the Web Speech API
   - Scrolls the page in sync with the narration
   - Walks through all four pages, one after another
   --------------------------------------------------------- */
(function () {
  "use strict";

  var STORE_KEY = "exotic-tour-active";
  var SOUND_KEY = "exotic-tour-sound";
  var SPEECH_OK =
    typeof window.speechSynthesis !== "undefined" &&
    typeof window.SpeechSynthesisUtterance !== "undefined";

  var synth = SPEECH_OK ? window.speechSynthesis : null;
  var voices = [];

  function tourText(text, D) {
    var c = D && D.confirmed;
    if (!c) return text;
    if (!c.prices) {
      text = text.replace(/with clear starting prices/g, "");
      text = text.replace(/with prices and durations/g, "with durations");
      text = text.replace(/prices at a glance/g, "services at a glance");
      text = text.replace(/starting prices/g, "services");
      text = text.replace(/prices and durations/g, "durations");
      text = text.replace(/and durations/g, "");
      text = text.replace(/duration/g, "");
      text = text.replace(/\s+/g, " ").trim();
    }
    if (!c.durations) {
      text = text.replace(/with prices and durations/g, "with prices");
      text = text.replace(/prices and durations/g, "prices");
      text = text.replace(/and durations/g, "");
      text = text.replace(/duration/g, "");
      text = text.replace(/\s+/g, " ").trim();
    }
    if (!c.offers) {
      text = text.replace(/, and check the current offers for extra value/g, "");
      text = text.replace(/offers for extra value/g, "");
    }
    if (!c.team) {
      text = text.replace(/Meet the specialists/g, "Visit us");
      text = text.replace(/specialists behind your look/g, "our services");
    }
    return text;
  }

  var PAGES = {
    "index.html": {
      label: "Home",
      next: "services",
      steps: [
        {
          sel: "#home",
          text:
            "Namaste! Welcome to Exotic Hair and Beauty Unisex Salon, Huda Sector 20, Kaithal. " +
            "Hair, skin, bridal makeup and grooming, all under one roof."
        },
        {
          sel: "#services",
          text:
            "These are six of our most loved services, with clear starting prices. " +
            "For the full menu, tap View all services."
        },
        {
          sel: "#why",
          text:
            "Why choose us? Skilled stylists, hygienic tools, branded products and a calm space. " +
            "We are rated four point nine on Google by more than sixty clients."
        },
        {
          sel: "#gallery-preview",
          text:
            "Here is a quick look at real client work. " +
            "Open the full gallery for more photos and videos."
        },
        {
          sel: "#reviews",
          text:
            "Our clients in Kaithal share their experience here. " +
            "Swipe or use the arrows to read more reviews."
        },
        {
          sel: "#team-offers",
          text:
            "Meet the specialists behind your look, and check the current offers for extra value."
        },
        {
          sel: "#visit",
          text:
            "We are open all seven days, from nine in the morning to ten at night. " +
            "Book on WhatsApp, call us, or send the enquiry form. " +
            "Now let's see the full service menu."
        }
      ]
    },
    "services.html": {
      label: "Services",
      next: "gallery",
      steps: [
        {
          sel: ".page-banner",
          text:
            "This is our complete service menu: hair, skin, grooming and bridal, " +
            "with prices and durations for every treatment."
        },
        {
          sel: ".tabs",
          text:
            "Use the All, Men, Women and Bridal tabs to filter the list and find what you need."
        },
        {
          sel: "#servicesGrid",
          text:
            "Services are grouped by category, so you can compare treatments and prices at a glance. " +
            "Next, let's look at our work."
        }
      ]
    },
    "gallery.html": {
      label: "Gallery",
      next: "contact",
      steps: [
        {
          sel: ".page-banner",
          text: "This is our work, up close: haircuts, colour, bridal looks and nail work from the salon."
        },
        {
          sel: "#galleryGrid",
          text:
            "Tap any photo to open it full screen. Use the arrows to move between photos, and Escape to close."
        },
        {
          sel: "#videoGrid",
          text:
            "Short videos from the salon show the space, the services and the results. " +
            "Next, let's see how to book."
        }
      ]
    },
    "contact.html": {
      label: "Contact",
      next: null,
      steps: [
        {
          sel: ".page-banner",
          text: "Ready to book? Here is how to reach us."
        },
        {
          sel: "#book",
          text:
            "Visit us at DSS two sixty six, Huda Sector twenty, near Community Center, Kaithal. " +
            "Or send an enquiry with your name, phone, service and preferred date. " +
            "The team confirms your slot during salon hours."
        },
        {
          sel: "#map",
          text: "Use the map for directions, or tap Get directions to open Google Maps."
        },
        {
          sel: "#faq",
          text:
            "Common questions about appointments, payments and bridal bookings are answered here. " +
            "That's the end of the tour. Thank you for visiting Exotic Salon."
        }
      ]
    }
  };

  var active = false;
  var soundOn = true;
  var voiceBlocked = false;
  var runToken = 0;
  var currentIndex = 0;
  var currentPageKey = "index.html";
  var bar = null;
  var captionEl = null;
  var soundBtn = null;
  var stopBtn = null;
  var narrationDone = null;
  var listenersBound = false;

  function normalizePage(file) {
    var name = String(file || "").toLowerCase();
    if (!name || name === "/" || name === "index.html" || name === "index.htm") {
      return "index.html";
    }

    var clean = name.replace(/\/+$/, "");
    var map = {
      index: "index.html",
      services: "services.html",
      gallery: "gallery.html",
      contact: "contact.html"
    };

    return map[clean] || clean;
  }

  function pageKey() {
    var file = window.location.pathname.split("/").pop() || "";
    return PAGES[normalizePage(file)] ? normalizePage(file) : "index.html";
  }

  function pageInfo() {
    return PAGES[pageKey()] || PAGES["index.html"];
  }

  function storeGet() {
    try {
      return window.sessionStorage.getItem(STORE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function storeSet() {
    try {
      window.sessionStorage.setItem(STORE_KEY, "1");
    } catch (e) {}
  }

  function storeClear() {
    try {
      window.sessionStorage.removeItem(STORE_KEY);
    } catch (e) {}
  }

  function readSoundPref() {
    try {
      return window.sessionStorage.getItem(SOUND_KEY) !== "0";
    } catch (e) {
      return true;
    }
  }

  function saveSoundPref() {
    try {
      window.sessionStorage.setItem(SOUND_KEY, soundOn ? "1" : "0");
    } catch (e) {}
  }

  function cleanTourParam() {
    try {
      var url = new URL(window.location.href);
      if (!url.searchParams.has("tour")) return;
      url.searchParams.delete("tour");
      var next =
        url.pathname +
        (url.search ? url.search : "") +
        (url.hash ? url.hash : "");
      window.history.replaceState(null, "", next);
    } catch (e) {}
  }

  function hasTourParam() {
    return /(?:^|[?&])tour=1(?:&|$)/.test(window.location.search);
  }

  function loadVoices() {
    if (!synth) return;
    try {
      voices = synth.getVoices() || [];
    } catch (e) {
      voices = [];
    }
  }

  function pickVoice() {
    if (!voices.length) loadVoices();
    if (!voices.length) return null;

    var wanted = ["en-in", "en-gb", "en-us"];

    for (var i = 0; i < wanted.length; i += 1) {
      for (var j = 0; j < voices.length; j += 1) {
        var lang = String(voices[j].lang || "").toLowerCase().replace("_", "-");
        if (lang.indexOf(wanted[i]) === 0) return voices[j];
      }
    }

    for (var k = 0; k < voices.length; k += 1) {
      if (/^en/i.test(String(voices[k].lang || ""))) return voices[k];
    }

    return null;
  }

  function estimateMs(text) {
    var words = String(text || "").split(/\s+/).filter(Boolean).length;
    return Math.max(2600, words * 380 + 900);
  }

  function setTalking(on) {
    if (window.RobotUI && typeof window.RobotUI.setTalking === "function") {
      window.RobotUI.setTalking(on);
    }
  }

  function cancelSpeech() {
    if (narrationDone) {
      var done = narrationDone;
      narrationDone = null;
      done();
    }
    if (synth) {
      try {
        synth.cancel();
      } catch (e) {}
    }
    setTalking(false);
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, ms);
    });
  }

  function narrate(text) {
    return new Promise(function (resolve) {
      var settled = false;
      var safety = null;
      var watchdog = null;

      function finish() {
        if (settled) return;
        settled = true;

        /* Purani utterance ka late error naye narration ko na roke */
        var isCurrent = narrationDone === finish;
        if (isCurrent) narrationDone = null;

        if (safety) window.clearTimeout(safety);
        if (watchdog) window.clearTimeout(watchdog);
        if (isCurrent) setTalking(false);
        resolve();
      }

      narrationDone = finish;

      if (!soundOn || !SPEECH_OK || voiceBlocked) {
        safety = window.setTimeout(finish, estimateMs(text));
        return;
      }

      try {
        synth.cancel();

        var utter = new window.SpeechSynthesisUtterance(text);
        var voice = pickVoice();

        if (voice) utter.voice = voice;
        utter.lang = (voice && voice.lang) || "en-IN";
        utter.rate = 0.95;
        utter.pitch = 1;
        utter.volume = 1;

        utter.onstart = function () {
          if (watchdog) {
            window.clearTimeout(watchdog);
            watchdog = null;
          }
        };

        utter.onend = finish;
        utter.onerror = function (event) {
          if (event && (event.error === "interrupted" || event.error === "canceled")) {
            finish();
            return;
          }

          /* Voice blocked (usually first load / autoplay policy).
             Caption ko poora padhne ka time do, aur Sound button se
             retry ka option rakho. */
          voiceBlocked = true;
          soundOn = false;
          updateSoundButton();
          if (safety) window.clearTimeout(safety);
          if (watchdog) window.clearTimeout(watchdog);
          safety = window.setTimeout(finish, Math.max(1800, estimateMs(text)));
        };

        safety = window.setTimeout(
          finish,
          Math.max(7000, estimateMs(text) * 1.6 + 4000)
        );

        /* Agar browser me koi voice install nahi hai to speak() chup rehta
           hai. Is case me captions-only mode par chale jao. */
        watchdog = window.setTimeout(function () {
          watchdog = null;
          voiceBlocked = true;
          soundOn = false;
          updateSoundButton();
          if (safety) window.clearTimeout(safety);
          safety = window.setTimeout(
            finish,
            Math.max(1800, estimateMs(text) - 4000)
          );
        }, 4000);

        setTalking(true);
        synth.speak(utter);
      } catch (e) {
        voiceBlocked = true;
        updateSoundButton();
        safety = window.setTimeout(finish, estimateMs(text));
      }
    });
  }

  function scrollToElement(el) {
    var header = document.getElementById("siteHeader") || document.querySelector(".header");
    var offset = (header ? header.getBoundingClientRect().height : 72) + 14;
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    try {
      window.scrollTo({
        top: Math.max(0, top),
        behavior: reduce ? "auto" : "smooth"
      });
    } catch (e) {
      window.scrollTo(0, Math.max(0, top));
    }
  }

  function setCaption(text) {
    if (captionEl) captionEl.textContent = text;
  }

  function updateSoundButton() {
    if (!soundBtn) return;
    soundBtn.textContent = soundOn ? "Sound on" : "Sound off";
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    soundBtn.setAttribute(
      "aria-label",
      soundOn ? "Voice band karein" : "Voice chalu karein"
    );
    soundBtn.title = voiceBlocked
      ? "Tap to retry voice. Captions are on."
      : soundOn
        ? "Voice on"
        : "Voice off";
  }

  function buildBar() {
    if (bar) return;

    bar = document.createElement("div");
    bar.className = "tour-bar";
    bar.id = "tourBar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Website tour");
    bar.innerHTML =
      '<span class="tour-badge" aria-hidden="true">Exo</span>' +
      '<p class="tour-caption" id="tourCaption" aria-live="polite"></p>' +
      '<div class="tour-actions">' +
      '<button class="tour-btn" id="tourSound" type="button" aria-pressed="true">Sound on</button>' +
      '<button class="tour-btn" id="tourNext" type="button">Next</button>' +
      '<button class="tour-btn tour-stop" id="tourStop" type="button">Stop</button>' +
      "</div>";

    document.body.appendChild(bar);

    captionEl = bar.querySelector("#tourCaption");
    soundBtn = bar.querySelector("#tourSound");
    stopBtn = bar.querySelector("#tourStop");

    soundBtn.addEventListener("click", toggleSound);
    stopBtn.addEventListener("click", function () {
      stopTour();
    });
    bar.querySelector("#tourNext").addEventListener("click", skipStep);

    updateSoundButton();

    try {
      stopBtn.focus({ preventScroll: true });
    } catch (e) {
      stopBtn.focus();
    }
  }

  function removeBar() {
    if (!bar) return;
    bar.parentNode.removeChild(bar);
    bar = null;
    captionEl = null;
    soundBtn = null;
    stopBtn = null;
  }

  function onKeydown(event) {
    if (event.key === "Escape" && active) {
      event.preventDefault();
      stopTour();
    }
  }

  function onLinkClick(event) {
    if (!active) return;
    var link = event.target && event.target.closest
      ? event.target.closest("a[href]")
      : null;
    if (link) stopTour();
  }

  function bindGlobal() {
    if (listenersBound) return;
    listenersBound = true;
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onLinkClick, true);
    window.addEventListener("pagehide", cancelSpeech);
  }

  function unbindGlobal() {
    if (!listenersBound) return;
    listenersBound = false;
    document.removeEventListener("keydown", onKeydown);
    document.removeEventListener("click", onLinkClick, true);
    window.removeEventListener("pagehide", cancelSpeech);
  }

  function goToNextPage(info) {
    if (!info.next) {
      finishTour();
      return;
    }

    storeSet();
    setCaption("Next page: " + (PAGES[info.next] ? PAGES[info.next].label : "next") + "...");
    window.setTimeout(function () {
      if (!active) return;
      window.location.href = info.next + "?tour=1";
    }, 900);
  }

  async function runPage(info, startIndex) {
    var token = ++runToken;
    currentPageKey = pageKey();
    var steps = info.steps || [];

    for (var i = startIndex; i < steps.length; i += 1) {
      if (!active || token !== runToken) return;

      currentIndex = i;
      var step = steps[i];
      var el = step.sel ? document.querySelector(step.sel) : null;

      if (step.sel && !el) continue;

      if (el) {
        scrollToElement(el);
        await wait(
          window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 120
            : 700
        );
        if (!active || token !== runToken) return;
      }

      var spokenText = tourText(step.text, window.SALON_INFO);
      setCaption((i + 1) + " / " + steps.length + "  ·  " + spokenText);
      await narrate(spokenText);
      if (!active || token !== runToken) return;

      await wait(step.pause || 900);
      if (!active || token !== runToken) return;
    }

    if (!active || token !== runToken) return;
    goToNextPage(info);
  }

  function skipStep() {
    if (!active) return;

    var info = PAGES[currentPageKey] || pageInfo();
    var nextIndex = currentIndex + 1;

    cancelSpeech();
    runToken += 1;

    if (nextIndex < (info.steps || []).length) {
      runPage(info, nextIndex);
    } else {
      goToNextPage(info);
    }
  }

  function toggleSound() {
    soundOn = !soundOn;
    voiceBlocked = false;
    saveSoundPref();
    updateSoundButton();
    cancelSpeech();

    if (!active) return;

    var info = PAGES[currentPageKey] || pageInfo();
    runToken += 1;
    runPage(info, currentIndex);
  }

  function finishTour() {
    active = false;
    runToken += 1;
    cancelSpeech();
    storeClear();
    setCaption("Tour complete. Chat me koi bhi sawaal poochhein.");
    window.setTimeout(function () {
      stopTour();
    }, 2600);
  }

  function stopTour() {
    if (!active && !bar) return;

    active = false;
    runToken += 1;
    cancelSpeech();
    storeClear();
    unbindGlobal();
    document.body.classList.remove("tour-active");
    removeBar();
  }

  function beginTour() {
    if (active) return;

    active = true;
    soundOn = readSoundPref();
    voiceBlocked = false;
    currentIndex = 0;
    currentPageKey = pageKey();

    document.body.classList.add("tour-active");
    buildBar();
    bindGlobal();

    var firstInfo = PAGES[currentPageKey] || PAGES["index.html"];
    var firstStep = firstInfo.steps && firstInfo.steps[0];
    setCaption(firstStep ? firstStep.text : "Starting the tour...");

    var startToken = runToken;
    window.setTimeout(function () {
      if (!active || runToken !== startToken) return;
      runPage(PAGES[currentPageKey] || PAGES["index.html"], 0);
    }, 450);
  }

  function startTour() {
    if (active) return;

    if (pageKey() !== "index.html") {
      storeSet();
      window.location.href = "/?tour=1";
      return;
    }

    beginTour();
  }

  function maybeAutoStart() {
    /* Shareable link ya page-to-page flow: ?tour=1 se seedha shuru */
    if (hasTourParam()) {
      cleanTourParam();
      beginTour();
      return;
    }

    /* Adhoora tour flag bina param ke reh gaya ho to clear kar do */
    if (storeGet()) storeClear();
  }

  /* ---------------------------------------------------------
     Entry points: nav + hero + mobile menu me "Voice tour" button
     --------------------------------------------------------- */
  function closeMobileMenu() {
    var menu = document.getElementById("mobileMenu");
    var burger = document.getElementById("hamburger");
    if (menu) menu.classList.remove("open");
    if (burger) {
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
    }
  }

  function injectEntryPoints() {
    if (document.querySelector(".js-voice-tour")) return;

    var actions = document.querySelector(".nav-actions");
    if (actions) {
      var navBtn = document.createElement("button");
      navBtn.type = "button";
      navBtn.className = "nav-tour js-voice-tour";
      navBtn.setAttribute("aria-label", "Salon ka voice tour shuru karein");
      navBtn.title = "Voice tour — agent suno";
      navBtn.innerHTML =
        '<span class="nav-tour-icon" aria-hidden="true">▶</span>' +
        '<span class="nav-tour-dot" aria-hidden="true"></span>';
      navBtn.addEventListener("click", startTour);

      var burger = actions.querySelector(".hamburger");
      if (burger) actions.insertBefore(navBtn, burger);
      else actions.appendChild(navBtn);
    }

    var hero = document.querySelector(".hero-actions");
    if (hero) {
      var heroBtn = document.createElement("button");
      heroBtn.type = "button";
      heroBtn.className = "btn btn-tour js-voice-tour";
      heroBtn.setAttribute("aria-label", "Salon ka voice tour shuru karein");
      heroBtn.innerHTML =
        '<span class="btn-tour-icon" aria-hidden="true">▶</span> Voice tour';
      heroBtn.addEventListener("click", startTour);
      hero.appendChild(heroBtn);
    }

    var mob = document.querySelector(".mobile-menu-inner");
    if (mob) {
      var mobBtn = document.createElement("button");
      mobBtn.type = "button";
      mobBtn.className = "mobile-tour-link js-voice-tour";
      mobBtn.innerHTML =
        '<span class="btn-tour-icon" aria-hidden="true">▶</span> Voice tour';
      mobBtn.addEventListener("click", function () {
        closeMobileMenu();
        startTour();
      });

      var bookBtn = mob.querySelector("a.btn");
      if (bookBtn) mob.insertBefore(mobBtn, bookBtn);
      else mob.appendChild(mobBtn);
    }
  }

  if (synth) {
    loadVoices();
    if (typeof synth.onvoiceschanged !== "undefined") {
      synth.onvoiceschanged = loadVoices;
    }
  }

  function scheduleAutoStart() {
    injectEntryPoints();
    window.setTimeout(maybeAutoStart, 400);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleAutoStart);
  } else {
    scheduleAutoStart();
  }

  window.SalonTour = {
    start: startTour,
    stop: stopTour,
    isActive: function () {
      return active;
    }
  };
})();
