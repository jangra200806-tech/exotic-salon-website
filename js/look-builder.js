/* =========================================================
   js/look-builder.js
   ---------------------------------------------------------
   "Apna Look Banao" - services chuno, starting estimate dekho
   aur WhatsApp par booking message bhejo.

   Saara service / price / duration / time-slot data
   data/info.js se aata hai. Yahan kuch hardcode nahi hai.
   ========================================================= */

(function () {
  "use strict";

  var D = window.SALON_INFO;
  if (!D || !Array.isArray(D.services) || !D.services.length) return;

  var STORE_KEY = "exotic-look-services";
  var services = D.services;
  var byId = {};
  var selected = [];
  var hasServicesPage = !!document.getElementById("servicesGrid");
  var reducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  services.forEach(function (s) {
    if (s && s.id) byId[s.id] = s;
  });

  var bar = null;
  var countEl = null;
  var barTotalEl = null;
  var barOpenBtn = null;
  var panel = null;
  var overlay = null;
  var listEl = null;
  var totalEl = null;
  var askEl = null;
  var durationEl = null;
  var closeBtn = null;
  var form = null;
  var formStatus = null;
  var nameInput = null;
  var phoneInput = null;
  var dateInput = null;
  var timeInput = null;
  var noteInput = null;
  var panelOpen = false;
  var lastFocus = null;
  var barObserver = null;

  var currency = detectCurrency();
  var numberFormat =
    window.Intl && window.Intl.NumberFormat
      ? new window.Intl.NumberFormat("en-IN")
      : null;

  /* ---------------------------------------------------------
     Small data helpers
     --------------------------------------------------------- */
  function detectCurrency() {
    for (var i = 0; i < services.length; i += 1) {
      var p = services[i] && services[i].price;
      if (p == null) continue;
      var symbol = String(p).replace(/[\d,\s.]/g, "");
      if (symbol) return symbol;
    }
    return "\u20B9";
  }

  function priceNumber(s) {
    if (!s || s.price == null) return null;
    var match = String(s.price).match(/[\d,]+/);
    if (!match) return null;
    var n = parseInt(match[0].replace(/,/g, ""), 10);
    return isFinite(n) ? n : null;
  }

  function durationMinutes(s) {
    if (!s || !s.duration) return null;
    var text = String(s.duration).toLowerCase();
    var hours = text.match(/(\d+)\s*(?:hr|hour)/);
    var mins = text.match(/(\d+)\s*min/);
    var total =
      (hours ? parseInt(hours[1], 10) * 60 : 0) +
      (mins ? parseInt(mins[1], 10) : 0);
    return total > 0 ? total : null;
  }

  function formatMoney(n) {
    return currency + (numberFormat ? numberFormat.format(n) : String(n));
  }

  function formatDuration(total) {
    var h = Math.floor(total / 60);
    var m = total % 60;
    if (h && m) return h + " hr" + (h > 1 ? "s" : "") + " " + m + " min";
    if (h) return h + " hr" + (h > 1 ? "s" : "");
    return m + " min";
  }

  function summary(ids) {
    var sum = 0;
    var priced = 0;
    var ask = 0;
    var duration = 0;
    var durationCount = 0;

    ids.forEach(function (id) {
      var s = byId[id];
      if (!s) return;

      var p = priceNumber(s);
      if (p == null) {
        ask += 1;
      } else {
        sum += p;
        priced += 1;
      }

      var d = durationMinutes(s);
      if (d != null) {
        duration += d;
        durationCount += 1;
      }
    });

    return {
      sum: sum,
      priced: priced,
      ask: ask,
      duration: durationCount === ids.length ? duration : null
    };
  }

  function totalLabel(info) {
    return info.priced ? "From " + formatMoney(info.sum) : "Price on request";
  }

  function countLabel(n) {
    return n + (n === 1 ? " service chuni" : " services chuni");
  }

  function askLine(n) {
    return (
      "+ " +
      n +
      " service" +
      (n === 1 ? "" : "s") +
      " ka price WhatsApp par poochein"
    );
  }

  function isSelected(id) {
    return selected.indexOf(id) !== -1;
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function formatDate(value) {
    if (!value) return "";
    var parts = value.split("-");
    if (parts.length !== 3) return value;
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) return value;
    try {
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch (e) {
      return value;
    }
  }

  /* ---------------------------------------------------------
     Selection storage
     --------------------------------------------------------- */
  function readSelected() {
    var ids = [];
    try {
      var raw = window.sessionStorage.getItem(STORE_KEY);
      if (!raw) return ids;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return ids;

      var seen = {};
      parsed.forEach(function (id) {
        if (typeof id === "string" && byId[id] && !seen[id]) {
          seen[id] = true;
          ids.push(id);
        }
      });
    } catch (e) {
      return [];
    }
    return ids;
  }

  function saveSelected() {
    try {
      window.sessionStorage.setItem(STORE_KEY, JSON.stringify(selected));
    } catch (e) {
      /* Private mode / storage blocked: in-page selection still works. */
    }
  }

  selected = readSelected();

  /* ---------------------------------------------------------
     Card + chip controls
     --------------------------------------------------------- */
  function updateToggles() {
    document.querySelectorAll("[data-look-add]").forEach(function (btn) {
      var id = btn.getAttribute("data-look-add");
      var s = byId[id];
      if (!s) return;

      var on = isSelected(id);
      btn.classList.toggle("is-added", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");

      if (btn.classList.contains("look-chip")) {
        var mark = btn.querySelector(".look-chip-mark");
        if (mark) mark.textContent = on ? "\u2713" : "+";
        btn.setAttribute("aria-label", (on ? "Remove " : "Add ") + s.name);
      } else {
        var label = btn.querySelector(".look-add-label");
        var check = btn.querySelector(".look-add-check");
        if (label) label.textContent = on ? "Added" : "Add";
        if (check) check.hidden = !on;
        btn.setAttribute(
          "aria-label",
          (on ? "Remove " : "Add ") +
            s.name +
            (on ? " from your look" : " to your look")
        );
      }
    });
  }

  function enhanceCards() {
    document
      .querySelectorAll(".service-card[data-service-id]")
      .forEach(function (card) {
        if (card.querySelector(".look-add")) return;

        var id = card.getAttribute("data-service-id");
        var s = byId[id];
        if (!s) return;

        var link = card.querySelector(".service-link");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "look-add";
        btn.setAttribute("data-look-add", id);
        btn.setAttribute("aria-pressed", "false");

        var check = document.createElement("span");
        check.className = "look-add-check";
        check.setAttribute("aria-hidden", "true");
        check.hidden = true;
        check.textContent = "\u2713";

        var label = document.createElement("span");
        label.className = "look-add-label";
        label.textContent = "Add";

        btn.appendChild(check);
        btn.appendChild(label);
        btn.addEventListener("click", function () {
          toggleService(id, { trigger: btn });
        });

        if (link) {
          var actions = card.querySelector(".service-actions");
          if (!actions) {
            actions = document.createElement("div");
            actions.className = "service-actions";
            link.parentNode.insertBefore(actions, link);
            actions.appendChild(link);
          }
          actions.appendChild(btn);
        } else {
          card.appendChild(btn);
        }
      });

    bindBookLinks();
  }

  function bindBookLinks() {
    document
      .querySelectorAll(".service-card[data-service-id]")
      .forEach(function (card) {
        var link = card.querySelector(".service-link");
        if (!link || link.dataset.lookBound) return;
        link.dataset.lookBound = "1";

        link.addEventListener("click", function (event) {
          var id = card.getAttribute("data-service-id");
          if (!id || !byId[id]) return;

          event.preventDefault();

          if (!isSelected(id)) {
            selected.push(id);
            saveSelected();
            sync();
          }

          if (hasServicesPage) {
            openPanel(link);
          } else {
            window.location.href = "services.html?look=1";
          }
        });
      });
  }

  function initHome() {
    var box = document.getElementById("lookHomeChips");
    if (!box || box.querySelector(".look-chip")) return;

    var popular = services.filter(function (s) {
      return s && s.popular;
    });

    if (popular.length < 3) {
      services.forEach(function (s) {
        if (popular.length < 3 && popular.indexOf(s) === -1) popular.push(s);
      });
    }

    popular.slice(0, 3).forEach(function (s) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "look-chip";
      btn.setAttribute("data-look-add", s.id);
      btn.setAttribute("aria-pressed", "false");

      var name = document.createElement("span");
      name.className = "look-chip-name";
      name.textContent = s.name;

      var mark = document.createElement("span");
      mark.className = "look-chip-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "+";

      btn.appendChild(name);
      btn.appendChild(mark);
      btn.addEventListener("click", function () {
        toggleService(s.id, { trigger: btn });
      });

      box.appendChild(btn);
    });
  }

  function findAddButton(id) {
    return document.querySelector('[data-look-add="' + id + '"]');
  }

  function toggleService(id, opts) {
    if (!byId[id]) return false;

    var index = selected.indexOf(id);
    var added;

    if (index === -1) {
      selected.push(id);
      added = true;
    } else {
      selected.splice(index, 1);
      added = false;
    }

    saveSelected();
    sync();

    if (panelOpen && !selected.length) {
      closePanel({
        focusTarget: opts && opts.trigger,
        restoreFocus: true
      });
    }

    return added;
  }

  function sync() {
    updateToggles();
    if (bar) renderBar();
    if (panel) renderPanel();
  }

  /* ---------------------------------------------------------
     Public integration points for other UI (Style Match quiz)
     --------------------------------------------------------- */
  window.ExoticLookBuilder = {
    add: function (id) {
      if (!byId[id]) return false;
      if (!isSelected(id)) {
        selected.push(id);
        saveSelected();
        sync();
      }
      return true;
    },

    remove: function (id) {
      var index = selected.indexOf(id);
      if (index === -1) return false;
      selected.splice(index, 1);
      saveSelected();
      sync();
      return true;
    },

    has: function (id) {
      return isSelected(id);
    },

    count: function () {
      return selected.length;
    },

    open: function (trigger) {
      if (!hasServicesPage || !selected.length) return false;
      openPanel(trigger || barOpenBtn);
      return true;
    }
  };

  /* ---------------------------------------------------------
     Sticky summary bar (services page)
     --------------------------------------------------------- */
  function buildBar() {
    if (!hasServicesPage || bar) return;

    bar = document.createElement("div");
    bar.className = "look-bar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Aapka look");
    bar.hidden = true;
    bar.innerHTML =
      '<div class="look-bar-info" aria-live="polite" aria-atomic="true">' +
      '<span class="look-bar-count" id="lookBarCount"></span>' +
      '<span class="look-bar-total" id="lookBarTotal"></span>' +
      "</div>" +
      '<button class="btn btn-primary look-bar-btn" id="lookBarOpen" type="button">Look dekhein</button>';

    document.body.appendChild(bar);

    countEl = bar.querySelector("#lookBarCount");
    barTotalEl = bar.querySelector("#lookBarTotal");
    barOpenBtn = bar.querySelector("#lookBarOpen");
    barOpenBtn.setAttribute("aria-haspopup", "dialog");
    barOpenBtn.setAttribute("aria-controls", "lookPanel");
    barOpenBtn.addEventListener("click", function () {
      openPanel(barOpenBtn);
    });

    if ("ResizeObserver" in window) {
      barObserver = new ResizeObserver(setLookBarHeight);
      barObserver.observe(bar);
    }
    window.addEventListener("resize", setLookBarHeight);
  }

  function setLookBarHeight() {
    if (!bar) return;
    var h = bar.hidden ? 0 : bar.offsetHeight;
    document.documentElement.style.setProperty("--look-bar-h", h + "px");
  }

  function renderBar() {
    if (!bar) return;

    if (!selected.length) {
      bar.hidden = true;
      document.body.classList.remove("look-bar-visible");
      setLookBarHeight();
      return;
    }

    var info = summary(selected);
    countEl.textContent = countLabel(selected.length);
    barTotalEl.textContent = totalLabel(info);
    barTotalEl.classList.toggle("is-ask", !info.priced);
    bar.hidden = false;
    document.body.classList.add("look-bar-visible");
    window.requestAnimationFrame(setLookBarHeight);
  }

  /* ---------------------------------------------------------
     Drawer / bottom sheet
     --------------------------------------------------------- */
  function buildPanel() {
    if (!hasServicesPage || panel) return;

    overlay = document.createElement("div");
    overlay.className = "look-overlay";
    overlay.setAttribute("aria-hidden", "true");

    panel = document.createElement("aside");
    panel.className = "look-panel";
    panel.id = "lookPanel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "lookPanelTitle");
    panel.setAttribute("aria-hidden", "true");
    panel.innerHTML =
      '<div class="look-panel-head">' +
      "<div>" +
      '<h2 class="look-panel-title" id="lookPanelTitle">Aapka look</h2>' +
      "<p>Chuni hui services, starting estimate aur booking details.</p>" +
      "</div>" +
      '<button class="look-close" id="lookClose" type="button" aria-label="Look panel band karein">\u00D7</button>' +
      "</div>" +
      '<div class="look-panel-body">' +
      '<div class="look-selected" id="lookSelected" aria-live="polite"></div>' +
      '<div class="look-totals">' +
      '<div class="look-total-line"><span>Estimated starting total</span>' +
      '<strong id="lookTotal" aria-live="polite"></strong></div>' +
      '<p class="look-ask" id="lookAsk" hidden></p>' +
      '<p class="look-duration" id="lookDuration" hidden></p>' +
      '<p class="look-note">Ye starting estimate hai. Final price stylist batayenge.</p>' +
      "</div>" +
      '<form class="look-form" id="lookForm" novalidate>' +
      '<div class="form-group">' +
      '<label for="lookName">Naam</label>' +
      '<input id="lookName" name="lookName" type="text" autocomplete="name" placeholder="Aapka naam" required aria-describedby="lookErrName" />' +
      '<p class="look-error" id="lookErrName" role="alert"></p>' +
      "</div>" +
      '<div class="form-group">' +
      '<label for="lookPhone">Phone</label>' +
      '<input id="lookPhone" name="lookPhone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="10 digit number" required aria-describedby="lookErrPhone" />' +
      '<p class="look-error" id="lookErrPhone" role="alert"></p>' +
      "</div>" +
      '<div class="look-form-row">' +
      '<div class="form-group">' +
      '<label for="lookDate">Preferred date</label>' +
      '<input id="lookDate" name="lookDate" type="date" required aria-describedby="lookErrDate" />' +
      '<p class="look-error" id="lookErrDate" role="alert"></p>' +
      "</div>" +
      '<div class="form-group">' +
      '<label for="lookTime">Time slot</label>' +
      '<select id="lookTime" name="lookTime" required aria-describedby="lookErrTime">' +
      '<option value="">Select time slot</option>' +
      "</select>" +
      '<p class="look-error" id="lookErrTime" role="alert"></p>' +
      "</div>" +
      "</div>" +
      '<div class="form-group">' +
      '<label for="lookNote">Note (optional)</label>' +
      '<textarea id="lookNote" name="lookNote" rows="3" maxlength="300" placeholder="Koi special request?"></textarea>' +
      "</div>" +
      '<button class="btn btn-primary look-send" type="submit">Send on WhatsApp</button>' +
      '<p class="look-form-status" id="lookFormStatus" role="status" aria-live="polite"></p>' +
      "</form>" +
      "</div>";

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    closeBtn = panel.querySelector("#lookClose");
    listEl = panel.querySelector("#lookSelected");
    totalEl = panel.querySelector("#lookTotal");
    askEl = panel.querySelector("#lookAsk");
    durationEl = panel.querySelector("#lookDuration");
    form = panel.querySelector("#lookForm");
    formStatus = panel.querySelector("#lookFormStatus");
    nameInput = panel.querySelector("#lookName");
    phoneInput = panel.querySelector("#lookPhone");
    dateInput = panel.querySelector("#lookDate");
    timeInput = panel.querySelector("#lookTime");
    noteInput = panel.querySelector("#lookNote");

    dateInput.min = todayISO();

    (Array.isArray(D.timeSlots) ? D.timeSlots : []).forEach(function (slot) {
      var value = typeof slot === "string" ? slot : slot && (slot.value || slot.label);
      var label = typeof slot === "string" ? slot : slot && (slot.label || slot.value);
      if (!value) return;
      var option = document.createElement("option");
      option.value = value;
      option.textContent = label || value;
      timeInput.appendChild(option);
    });

    if ("inert" in panel) panel.inert = true;

    closeBtn.addEventListener("click", function () {
      closePanel();
    });
    overlay.addEventListener("click", function () {
      closePanel();
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!validateForm()) return;

      var url = buildWhatsAppUrl();
      if (!url) {
        setStatus("WhatsApp link config nahi hai.", true);
        return;
      }

      setStatus("WhatsApp khul raha hai...", false);
      window.open(url, "_blank", "noopener");
    });

    phoneInput.addEventListener("input", function () {
      var digits = phoneDigits();
      if (phoneInput.value !== digits) phoneInput.value = digits;
      clearError("lookPhone");
    });

    [nameInput, phoneInput, dateInput, timeInput].forEach(function (field) {
      field.addEventListener("input", function () {
        clearError(field.id);
      });
      field.addEventListener("change", function () {
        clearError(field.id);
      });
    });

    document.addEventListener("keydown", onPanelKeydown);
  }

  function openPanel(trigger) {
    if (!hasServicesPage || !panel || !selected.length || panelOpen) return;

    panelOpen = true;
    lastFocus = trigger || document.activeElement;

    renderPanel();
    setStatus("", false);

    panel.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
    panel.classList.add("is-open");
    overlay.classList.add("is-open");
    document.body.classList.add("look-panel-open");
    if (barOpenBtn) barOpenBtn.setAttribute("aria-expanded", "true");
    if ("inert" in panel) panel.inert = false;

    /* Panel ko pehle visible hone do, phir focus andar le jao. */
    closeBtn.focus({ preventScroll: true });
    window.setTimeout(function () {
      if (panelOpen && !panel.contains(document.activeElement)) {
        closeBtn.focus({ preventScroll: true });
      }
    }, 60);
  }

  function closePanel(opts) {
    if (!panel || !panelOpen) {
      if (opts && opts.restoreFocus && opts.focusTarget) {
        restoreFocus(opts.focusTarget);
      }
      return;
    }

    panelOpen = false;
    panel.classList.remove("is-open");
    overlay.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("look-panel-open");
    if (barOpenBtn) barOpenBtn.setAttribute("aria-expanded", "false");
    if ("inert" in panel) panel.inert = true;

    var restore = !opts || opts.restoreFocus !== false;
    if (restore) {
      restoreFocus((opts && opts.focusTarget) || lastFocus);
    }
  }

  function restoreFocus(target) {
    if (target && document.documentElement.contains(target)) {
      var rect = target.getBoundingClientRect();
      if (rect.width || rect.height) {
        try {
          target.focus({ preventScroll: true });
          return;
        } catch (e) {
          /* fall through */
        }
      }
    }

    var fallback =
      barOpenBtn ||
      document.querySelector(".look-add") ||
      document.querySelector(".look-chip");
    if (fallback) {
      try {
        fallback.focus({ preventScroll: true });
      } catch (e) {
        /* ignore */
      }
    }
  }

  function onPanelKeydown(event) {
    if (!panelOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closePanel();
      return;
    }

    if (event.key !== "Tab") return;

    var nodes = Array.prototype.filter.call(
      panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ),
      function (node) {
        var rect = node.getBoundingClientRect();
        return rect.width > 0 || rect.height > 0;
      }
    );

    if (!nodes.length) return;

    var first = nodes[0];
    var last = nodes[nodes.length - 1];

    if (!panel.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function renderPanel() {
    if (!panel || !listEl) return;

    listEl.textContent = "";

    if (!selected.length) {
      var empty = document.createElement("p");
      empty.className = "look-empty";
      empty.textContent = "Abhi koi service select nahi ki.";
      listEl.appendChild(empty);
    } else {
      selected.forEach(function (id, index) {
        var s = byId[id];
        if (!s) return;

        var row = document.createElement("div");
        row.className = "look-item";

        var main = document.createElement("div");
        main.className = "look-item-main";

        var name = document.createElement("span");
        name.className = "look-item-name";
        name.textContent = s.name;

        var meta = document.createElement("span");
        meta.className = "look-item-meta";

        var priceText = document.createElement("span");
        priceText.className = "look-item-price" + (s.price ? "" : " is-ask");
        priceText.textContent = s.price ? s.price : "Ask for price";
        meta.appendChild(priceText);

        if (s.duration) {
          meta.appendChild(document.createTextNode(" \u00B7 "));
          var durationText = document.createElement("span");
          durationText.className = "look-item-duration";
          durationText.textContent = s.duration;
          meta.appendChild(durationText);
        }

        main.appendChild(name);
        main.appendChild(meta);

        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "look-remove";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", "Remove " + s.name);
        remove.addEventListener("click", function () {
          removeFromPanel(id, index);
        });

        row.appendChild(main);
        row.appendChild(remove);
        listEl.appendChild(row);
      });
    }

    var info = summary(selected);
    totalEl.textContent = totalLabel(info);
    totalEl.classList.toggle("is-ask", !info.priced);

    if (info.ask) {
      askEl.textContent = askLine(info.ask);
      askEl.hidden = false;
    } else {
      askEl.textContent = "";
      askEl.hidden = true;
    }

    if (selected.length && info.duration) {
      durationEl.textContent =
        "Estimated duration: " + formatDuration(info.duration);
      durationEl.hidden = false;
    } else {
      durationEl.textContent = "";
      durationEl.hidden = true;
    }
  }

  function removeFromPanel(id, index) {
    var selectedIndex = selected.indexOf(id);
    if (selectedIndex === -1) return;

    selected.splice(selectedIndex, 1);
    saveSelected();
    sync();

    if (!selected.length) {
      closePanel({ focusTarget: findAddButton(id), restoreFocus: true });
      return;
    }

    var buttons = listEl.querySelectorAll(".look-remove");
    var next = buttons[Math.min(index, buttons.length - 1)];
    if (next) next.focus();
  }

  /* ---------------------------------------------------------
     Form validation + WhatsApp
     --------------------------------------------------------- */
  function phoneDigits() {
    var digits = phoneInput.value.replace(/\D/g, "");
    if (digits.length > 10 && digits.slice(0, 2) === "91") {
      digits = digits.slice(2);
    }
    return digits.slice(0, 10);
  }

  function setError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var error = document.getElementById("lookErr" + fieldId.slice(4));
    if (input) input.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }

  function clearError(fieldId) {
    var input = document.getElementById(fieldId);
    var error = document.getElementById("lookErr" + fieldId.slice(4));
    if (input) input.removeAttribute("aria-invalid");
    if (error) error.textContent = "";
    setStatus("", false);
  }

  function setStatus(text, isError) {
    if (!formStatus) return;
    formStatus.textContent = text;
    formStatus.classList.toggle("is-error", !!isError);
  }

  function validateForm() {
    ["lookName", "lookPhone", "lookDate", "lookTime"].forEach(function (id) {
      clearError(id);
    });

    var firstInvalid = null;
    var name = nameInput.value.trim();
    var phone = phoneDigits();
    var date = dateInput.value;
    var time = timeInput.value;

    if (!name) {
      setError("lookName", "Apna naam likhein.");
      if (!firstInvalid) firstInvalid = nameInput;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("lookPhone", "10 digit ka phone number likhein.");
      if (!firstInvalid) firstInvalid = phoneInput;
    }

    if (!date) {
      setError("lookDate", "Preferred date chunein.");
      if (!firstInvalid) firstInvalid = dateInput;
    } else if (date < todayISO()) {
      setError("lookDate", "Date aaj ya uske baad ki honi chahiye.");
      if (!firstInvalid) firstInvalid = dateInput;
    }

    if (!time) {
      setError("lookTime", "Time slot chunein.");
      if (!firstInvalid) firstInvalid = timeInput;
    }

    if (!selected.length) {
      setStatus("Pehle koi service add karein.", true);
      return false;
    }

    if (firstInvalid) {
      firstInvalid.focus();
      setStatus("Kripya highlighted fields check karein.", true);
      return false;
    }

    setStatus("", false);
    return true;
  }

  function buildWhatsAppUrl() {
    var base = D.whatsappUrl || (D.whatsapp && D.whatsapp.link);
    if (!base) return "";

    var lines = [];
    lines.push(
      "Hello " +
        D.name +
        ", main ye look book karna chahta/chahti hoon:"
    );

    selected.forEach(function (id, index) {
      var s = byId[id];
      if (s) lines.push(index + 1 + ") " + s.name);
    });

    lines.push("Naam: " + nameInput.value.trim());
    lines.push("Phone: " + phoneDigits());
    lines.push("Date: " + formatDate(dateInput.value));
    lines.push("Time: " + timeInput.value);

    var info = summary(selected);
    if (info.priced) {
      lines.push("Estimated starting total: " + formatMoney(info.sum));
    } else {
      lines.push("Estimated starting total: WhatsApp par poochein");
    }

    if (info.ask) {
      lines.push(
        "Price on request: " +
          info.ask +
          " service" +
          (info.ask === 1 ? "" : "s")
      );
    }

    var note = noteInput.value.trim();
    if (note) lines.push("Note: " + note);

    var text = lines.join("\n");

    try {
      var url = new URL(base, window.location.href);
      url.searchParams.set("text", text);
      return url.toString();
    } catch (e) {
      return (
        base +
        (base.indexOf("?") === -1 ? "?" : "&") +
        "text=" +
        encodeURIComponent(text)
      );
    }
  }

  /* ---------------------------------------------------------
     Home link -> services builder
     --------------------------------------------------------- */
  function handleLookParam() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return;
    }

    if (params.get("look") !== "1") return;

    params.delete("look");
    var query = params.toString();

    try {
      window.history.replaceState(
        null,
        "",
        window.location.pathname +
          (query ? "?" + query : "") +
          window.location.hash
      );
    } catch (e) {
      /* ignore */
    }

    window.setTimeout(function () {
      if (selected.length) {
        openPanel(barOpenBtn);
      } else {
        var grid = document.getElementById("servicesGrid");
        if (grid) {
          try {
            grid.scrollIntoView({
              behavior: reducedMotion ? "auto" : "smooth",
              block: "start"
            });
          } catch (e) {
            grid.scrollIntoView();
          }
        }

        var first = document.querySelector(".look-add");
        if (first) {
          try {
            first.focus({ preventScroll: true });
          } catch (e) {
            first.focus();
          }
        }
      }
    }, 300);
  }

  function observeTour() {
    if (!("MutationObserver" in window) || !panel) return;

    var observer = new MutationObserver(function () {
      if (document.body.classList.contains("tour-active") && panelOpen) {
        closePanel({ restoreFocus: false });
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    enhanceCards();
    initHome();

    if (hasServicesPage) {
      buildBar();
      buildPanel();
      sync();
      handleLookParam();
      observeTour();
    } else {
      updateToggles();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
