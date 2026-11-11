/* =========================================================
   js/features.js
   ---------------------------------------------------------
   Exotic Salon — 3 naye interactive features:
   1. Before/After slider (home page)
   2. Combo price estimator (home page)
   3. Open now badge + offer countdown
   
   Plain JS, koi library nahi.
   Sabhi data data/info.js se aata hai.
   ========================================================= */

(function () {
  "use strict";

  var D = typeof SALON_INFO !== "undefined" ? SALON_INFO : {};

  /* ============ UTILITY ============ */
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function getISTTime() {
    /* Indian Standard Time (Asia/Kolkata) */
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  }

  function parseTime(str) {
    /* "9:00 AM" -> minutes from midnight */
    var m = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return 0;
    var h = Number(m[1]) % 12;
    if (/pm/i.test(m[3])) h += 12;
    return h * 60 + Number(m[2]);
  }

  /* ============ FEATURE 1: BEFORE / AFTER SLIDER ============ */
  function initBeforeAfter() {
    var section = document.getElementById("beforeAfter");
    var slider = document.getElementById("baSlider");
    var handle = document.getElementById("baHandle");
    var tabs = document.querySelectorAll(".ba-tab");
    var beforeImg = document.getElementById("baBeforeImg");
    var afterImg = document.getElementById("baAfterImg");

    if (!slider || !handle || !D.beforeAfter || !D.beforeAfter.length) return;

    var currentPair = 0;
    var pairData = D.beforeAfter[currentPair];

    /* Set images from data */
    if (pairData.before) {
      beforeImg.src = pairData.before.src;
      beforeImg.alt = pairData.before.alt;
      beforeImg.width = pairData.before.width;
      beforeImg.height = pairData.before.height;
    }
    if (pairData.after) {
      afterImg.src = pairData.after.src;
      afterImg.alt = pairData.after.alt;
      afterImg.width = pairData.after.width;
      afterImg.height = pairData.after.height;
    }

    /* Update slider position */
    function updatePosition(percent) {
      percent = Math.max(0, Math.min(100, percent));
      slider.style.setProperty("--ba-pos", percent + "%");
      handle.setAttribute("aria-valuenow", String(percent));
      handle.style.left = percent + "%";
    }

    /* Mouse / touch drag */
    var isDragging = false;

    function startDrag(e) {
      isDragging = true;
      slider.classList.add("ba-dragging");
      e.preventDefault();
    }

    function moveDrag(e) {
      if (!isDragging) return;
      var rect = slider.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var percent = ((clientX - rect.left) / rect.width) * 100;
      updatePosition(percent);
      e.preventDefault();
    }

    function endDrag() {
      isDragging = false;
      slider.classList.remove("ba-dragging");
    }

    slider.addEventListener("mousedown", startDrag, { passive: false });
    window.addEventListener("mousemove", moveDrag, { passive: false });
    window.addEventListener("mouseup", endDrag);

    slider.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("touchmove", moveDrag, { passive: false });
    window.addEventListener("touchend", endDrag);

    /* Keyboard */
    handle.addEventListener("keydown", function (e) {
      var current = Number(handle.getAttribute("aria-valuenow")) || 50;
      var step = 10;
      if (e.key === "ArrowLeft") updatePosition(current - step);
      if (e.key === "ArrowRight") updatePosition(current + step);
    });

    /* Tabs */
    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () {
        currentPair = i;
        pairData = D.beforeAfter[currentPair];

        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        if (pairData.before) {
          beforeImg.src = pairData.before.src;
          beforeImg.alt = pairData.before.alt;
        }
        if (pairData.after) {
          afterImg.src = pairData.after.src;
          afterImg.alt = pairData.after.alt;
        }

        updatePosition(50);
      });
    });

    /* Init at 50% */
    updatePosition(50);
  }

  /* ============ FEATURE 2: COMBO PRICE ESTIMATOR ============ */
  function initComboEstimator() {
    var grid = document.getElementById("comboGrid");
    var countEl = document.getElementById("comboCount");
    var totalEl = document.getElementById("comboTotal");
    var timeEl = document.getElementById("comboTime");
    var waBtn = document.getElementById("comboWaBtn");

    if (!grid || !D.services) return;

    /* Filter services that have price and belong to men/women/bridal */
    var categories = ["men", "women", "bridal"];
    var comboServices = D.services.filter(function (s) {
      return s.price && categories.some(function (c) { return s.categories.indexOf(c) !== -1; });
    });

    /* Group by category for display */
    var catLabels = { men: "Men", women: "Women", bridal: "Bridal" };

    /* Render checkboxes */
    var html = "";
    categories.forEach(function (cat) {
      var catServices = comboServices.filter(function (s) { return s.categories.indexOf(cat) !== -1; });
      if (!catServices.length) return;
      html += '<fieldset class="combo-cat"><legend>' + esc(catLabels[cat]) + '</legend>';
      catServices.forEach(function (s) {
        var price = s.price || "Ask";
        var duration = s.duration || "";
        html += (
          '<label class="combo-item">' +
          '<input type="checkbox" value="' + esc(s.id) + '" data-price="' + esc(s.price) + '" data-duration="' + esc(s.duration) + '">' +
          '<span>' + esc(s.name) + '</span>' +
          '<span class="price-tag">' + esc(price) + '</span>' +
          '</label>'
        );
      });
      html += '</fieldset>';
    });
    grid.innerHTML = html;

    /* Calculate totals */
    function updateTotals() {
      var checked = grid.querySelectorAll('input[type="checkbox"]:checked');
      var count = checked.length;
      var totalPrice = 0;
      var totalTime = 0;

      checked.forEach(function (cb) {
        var p = cb.getAttribute("data-price");
        var d = cb.getAttribute("data-duration");
        if (p && p.startsWith("₹")) totalPrice += Number(p.replace("₹", ""));
        if (d) {
          var dm = d.match(/(\d+)\s*(hr|hrs|min)/i);
          if (dm) {
            var val = Number(dm[1]);
            if (/hr/i.test(dm[2])) val *= 60;
            totalTime += val;
          }
        }
      });

      countEl.textContent = count;
      totalEl.textContent = count ? "₹" + totalPrice : "₹0";
      timeEl.textContent = count ? totalTime + " min" : "0 min";

      /* WhatsApp message */
      if (count > 0) {
        var names = [];
        checked.forEach(function (cb) {
          var li = cb.closest(".combo-item");
          if (li) names.push(li.querySelector("span").textContent.trim());
        });
        var msg = "Hello Exotic Salon, mujhe ye services book karni hain: " +
          names.join(", ") +
          ". Total: ₹" + totalPrice + ", Time: " + totalTime + " min.";
        waBtn.href = D.whatsapp.link + "?text=" + encodeURIComponent(msg);
        waBtn.style.display = "inline-block";
      } else {
        waBtn.style.display = "none";
      }
    }

    grid.addEventListener("change", updateTotals);
    updateTotals();
  }

  /* ============ FEATURE 3: OPEN NOW BADGE + COUNTDOWN ============ */
  function initOpenNow() {
    var badge = document.getElementById("openBadge");
    var badgeText = document.getElementById("openBadgeText");
    var countdown = document.getElementById("offerCountdown");

    if (!D.timings) return;

    var openMin = parseTime(D.timings.open || "9:00");
    var closeMin = parseTime(D.timings.close || "22:00");

    function updateOpenStatus() {
      var now = getISTTime();
      var nowMin = now.getHours() * 60 + now.getMinutes();

      var isOpen = nowMin >= openMin && nowMin < closeMin;

      if (badge && badgeText) {
        if (isOpen) {
          badge.className = "open-badge open";
          badgeText.textContent = "Open now · closes " + D.timings.close;
        } else {
          badge.className = "open-badge closed";
          var nextOpen = nowMin < openMin ? D.timings.open : D.timings.open + " (kal)";
          badgeText.textContent = "Closed · opens " + nextOpen;
        }
      }
    }

    updateOpenStatus();
    setInterval(updateOpenStatus, 60000); /* Check every minute */

    /* Offer countdown */
    if (countdown && D.offerEndDate) {
      var end = new Date(D.offerEndDate + "T23:59:59+05:30");
      function updateCountdown() {
        var now = new Date();
        var diff = end - now;
        if (diff <= 0) {
          countdown.style.display = "none";
          return;
        }
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var secs = Math.floor((diff % (1000 * 60)) / 1000);
        countdown.textContent =
          "Offer ends in: " + days + "d " + hours + "h " + mins + "m " + secs + "s";
      }
      updateCountdown();
      setInterval(updateCountdown, 1000);
    }
  }

  /* ============ INIT ============ */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initBeforeAfter();
      initComboEstimator();
      initOpenNow();
    });
  } else {
    initBeforeAfter();
    initComboEstimator();
    initOpenNow();
  }

})();
