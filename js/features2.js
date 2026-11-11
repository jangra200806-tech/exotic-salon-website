/* =========================================================
   js/features2.js
   ---------------------------------------------------------
   Exotic Salon — 2 naye interactive features:
   4. Spin & Win wheel (home page, Offers ke paas)
   5. Find your hairstyle quiz (home page, Team ke upar)
   
   Plain JS, koi library nahi.
   IntersectionObserver se sections tab activate hote hain
   jab user unke paas pahunche.
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

  function getISTDateKey() {
    /* Return YYYY-MM-DD in India time */
    return new Date().toLocaleString("en-CA", { timeZone: "Asia/Kolkata" }).split(",")[0];
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ============ FEATURE 4: SPIN & WIN WHEEL ============ */
  function initSpinWin() {
    var section = document.getElementById("spin-win");
    if (!section) return;

    var prizes = D.spinPrizes || [];
    if (!prizes.length) return;

    var wheel = document.getElementById("spinWheel");
    var spinBtn = document.getElementById("spinBtn");
    var result = document.getElementById("spinResult");
    var prizeText = document.getElementById("spinPrize");
    var codeText = document.getElementById("spinCode");
    var claimBtn = document.getElementById("spinClaimBtn");
    var triedMsg = document.getElementById("spinTriedMsg");
    var triedToday = document.getElementById("spinTriedToday");

    if (!wheel || !spinBtn || !result) return;

    var numSegments = prizes.length;
    var segmentDeg = 360 / numSegments;
    var currentRotation = 0;
    var isSpinning = false;

    /* Build wheel segments using CSS conic-gradient */
    var colors = prizes.map(function (p) { return p.color || "#C9A66B"; }).reverse();
    var conic = "conic-gradient(" + colors.map(function (c, i) {
      return c + " " + (i * segmentDeg) + "deg " + ((i + 1) * segmentDeg) + "deg";
    }).join(", ") + ")";
    wheel.style.background = conic;

    /* Add segment labels as absolutely positioned text */
    wheel.innerHTML = "";
    prizes.forEach(function (prize, i) {
      var angle = (i * segmentDeg + segmentDeg / 2) * (Math.PI / 180);
      var r = 110; /* radius for label */
      var x = 150 + Math.cos(angle) * r;
      var y = 150 - Math.sin(angle) * r;
      var label = document.createElement("div");
      label.style.position = "absolute";
      label.style.left = x + "px";
      label.style.top = y + "px";
      label.style.transform = "translate(-50%, -50%)";
      label.style.fontSize = "10px";
      label.style.fontWeight = "700";
      label.style.color = "#fff";
      label.style.textAlign = "center";
      label.style.width = "60px";
      label.style.pointerEvents = "none";
      label.textContent = prize.label;
      wheel.appendChild(label);
    });

    /* Check daily spin limit */
    function canSpinToday() {
      try {
        var last = localStorage.getItem("exotic_spin_date");
        return last !== getISTDateKey();
      } catch (e) {
        return true;
      }
    }

    function markSpinToday() {
      try {
        localStorage.setItem("exotic_spin_date", getISTDateKey());
      } catch (e) {
        /* ignore */
      }
    }

    if (!canSpinToday()) {
      spinBtn.style.display = "none";
      triedMsg.style.display = "inline";
      triedToday.style.display = "block";
      result.style.display = "none";
    }

    /* Spin */
    spinBtn.addEventListener("click", function () {
      if (isSpinning) return;
      if (!canSpinToday()) return;

      isSpinning = true;
      spinBtn.disabled = true;
      result.style.display = "none";

      /* Random prize weighted by weight */
      var totalWeight = prizes.reduce(function (sum, p) { return sum + (p.weight || 1); }, 0);
      var random = Math.random() * totalWeight;
      var selectedIndex = 0;
      var cumulative = 0;
      for (var i = 0; i < prizes.length; i++) {
        cumulative += prizes[i].weight || 1;
        if (random <= cumulative) {
          selectedIndex = i;
          break;
        }
      }

      var selectedPrize = prizes[selectedIndex];

      /* Calculate rotation: at least 3 full spins + land on selected segment */
      var fullSpins = 5;
      var targetDeg = 360 * fullSpins + (360 - (selectedIndex * segmentDeg + segmentDeg / 2));
      var rotDeg = currentRotation + targetDeg;

      if (reducedMotion()) {
        wheel.style.transform = "rotate(" + rotDeg + "deg)";
        currentRotation = rotDeg % 360;
        showResult(selectedPrize);
        markSpinToday();
        spinBtn.style.display = "none";
        triedMsg.style.display = "inline";
        triedToday.style.display = "block";
        isSpinning = false;
        return;
      }

      wheel.style.transition = "transform 4s cubic-bezier(0.1, 0, 0.2, 1)";
      wheel.style.transform = "rotate(" + rotDeg + "deg)";
      currentRotation = rotDeg % 360;

      wheel.addEventListener("transitionend", function onEnd() {
        wheel.removeEventListener("transitionend", onEnd);
        wheel.style.transition = "none";
        showResult(selectedPrize);
        markSpinToday();
        spinBtn.style.display = "none";
        triedMsg.style.display = "inline";
        triedToday.style.display = "block";
        isSpinning = false;
      }, { once: true });
    });

    function showResult(prize) {
      var code = "EXOTIC-" + Math.floor(1000 + Math.random() * 9000);
      prizeText.textContent = prize.label;
      codeText.textContent = "Code: " + code;
      result.style.display = "block";

      var waLink = D.whatsapp && D.whatsapp.link ? D.whatsapp.link : "https://wa.me/919000997800";
      var msg = "Hello Exotic Salon, maine spin me " + esc(prize.label) + " jeeta hai. Code: " + code;
      claimBtn.href = waLink + "?text=" + encodeURIComponent(msg);
    }
  }

  /* ============ FEATURE 5: FIND YOUR HAIRSTYLE QUIZ ============ */
  function initQuiz() {
    var section = document.getElementById("hair-quiz");
    if (!section) return;

    var rules = D.quizRules || {};
    var questions = rules.questions || [];
    var results = rules.results || {};
    var defaultResult = rules.defaultResult || [];
    var services = D.services || [];

    if (!questions.length) return;

    var progressText = document.getElementById("quizProgressText");
    var progressNum = document.getElementById("quizProgressNum");
    var progressFill = document.getElementById("quizProgressFill");
    var quizCard = document.getElementById("quizCard");
    var quizQuestion = document.getElementById("quizQuestion");
    var quizOptions = document.getElementById("quizOptions");
    var quizResult = document.getElementById("quizResult");
    var quizResultIcon = document.getElementById("quizResultIcon");
    var quizResultTitle = document.getElementById("quizResultTitle");
    var quizServices = document.getElementById("quizServices");
    var quizRestartBtn = document.getElementById("quizRestartBtn");

    if (!quizCard || !quizQuestion || !quizOptions) return;

    var currentQ = 0;
    var answers = {};

    function renderQuestion() {
      if (currentQ >= questions.length) {
        showResult();
        return;
      }

      var q = questions[currentQ];
      progressText.textContent = "Question " + (currentQ + 1) + " of " + questions.length;
      var pct = Math.round((currentQ / questions.length) * 100);
      progressNum.textContent = pct + "%";
      if (progressFill) progressFill.style.width = pct + "%";

      quizQuestion.textContent = q.question;
      quizOptions.innerHTML = "";

      q.options.forEach(function (opt) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "quiz-btn";
        btn.setAttribute("role", "radio");
        btn.setAttribute("aria-checked", "false");

        var emoji = document.createElement("span");
        emoji.className = "emoji";
        emoji.textContent = getEmojiFor(opt.label);

        var label = document.createElement("span");
        label.textContent = opt.label;

        btn.appendChild(emoji);
        btn.appendChild(label);
        btn.value = opt.value;

        btn.addEventListener("click", function () {
          document.querySelectorAll("#quizOptions .quiz-btn").forEach(function (b) {
            b.classList.remove("selected");
            b.setAttribute("aria-checked", "false");
          });
          btn.classList.add("selected");
          btn.setAttribute("aria-checked", "true");
          answers[q.id] = opt.value;
        });

        quizOptions.appendChild(btn);
      });
    }

    function getEmojiFor(label) {
      var l = label.toLowerCase();
      if (l.includes("ladies") || l.includes("women")) return "👩";
      if (l.includes("gents") || l.includes("men")) return "👨";
      if (l.includes("kids")) return "🧒";
      if (l.includes("short")) return "✂️";
      if (l.includes("medium")) return "💇";
      if (l.includes("long")) return "🦁";
      if (l.includes("daily")) return "🌞";
      if (l.includes("party")) return "🎉";
      if (l.includes("bridal") || l.includes("wedding")) return "👰";
      if (l.includes("low")) return "😌";
      if (l.includes("medium")) return "😐";
      if (l.includes("high")) return "✨";
      return "💈";
    }

    function nextQuestion() {
      currentQ++;
      renderQuestion();
    }

    quizCard.addEventListener("click", function (e) {
      var btn = e.target.closest(".quiz-btn");
      if (!btn || btn.classList.contains("selected")) return;
      var selected = quizOptions.querySelector(".quiz-btn.selected");
      if (selected) {
        nextQuestion();
      } else {
        btn.click();
        nextQuestion();
      }
    });

    /* Also auto-advance on selection */
    quizOptions.addEventListener("click", function (e) {
      var btn = e.target.closest(".quiz-btn");
      if (btn) {
        setTimeout(nextQuestion, 400);
      }
    });

    function showResult() {
      quizCard.style.display = "none";
      quizResult.style.display = "block";

      var key = buildResultKey();
      var suggestedIds = results[key] || defaultResult;
      var suggestedServices = services.filter(function (s) {
        return suggestedIds.indexOf(s.name) !== -1;
      }).slice(0, 3);

      quizResultIcon.textContent = "💇";
      quizResultTitle.textContent = "Aapke liye sujhaav";

      quizServices.innerHTML = "";
      suggestedServices.forEach(function (s) {
        var item = document.createElement("span");
        item.className = "quiz-service";
        item.innerHTML = esc(s.name) + " <span class=\"quiz-service-price\">" + (s.price || "Ask") + "</span>";
        quizServices.appendChild(item);
      });

      var waLink = D.whatsapp && D.whatsapp.link ? D.whatsapp.link : "https://wa.me/919000997800";
      var names = suggestedServices.map(function (s) { return s.name; }).join(", ");
      var msg = "Hello Exotic Salon, mujhe ye services book karni hain: " + names + " (quiz result)";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-primary";
      btn.textContent = "WhatsApp pe book karo";
      btn.onclick = function () {
        window.open(waLink + "?text=" + encodeURIComponent(msg), "_blank");
      };
      quizResult.appendChild(btn);
    }

    function buildResultKey() {
      var parts = [];
      questions.forEach(function (q) {
        parts.push(answers[q.id] || "unknown");
      });
      return parts.join("_");
    }

    quizRestartBtn.addEventListener("click", function () {
      currentQ = 0;
      answers = {};
      quizResult.style.display = "none";
      quizCard.style.display = "block";
      renderQuestion();
    });

    renderQuestion();
  }

  /* ============ INIT WITH INTERSECTIONOBSERVER ============ */
  function initWithObserver() {
    if (!("IntersectionObserver" in window)) {
      initSpinWin();
      initQuiz();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (entry.target.id === "spin-win") {
            initSpinWin();
            observer.unobserve(entry.target);
          }
          if (entry.target.id === "hair-quiz") {
            initQuiz();
            observer.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -100px" });

    var spinSection = document.getElementById("spin-win");
    var quizSection = document.getElementById("hair-quiz");
    if (spinSection) observer.observe(spinSection);
    if (quizSection) observer.observe(quizSection);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWithObserver);
  } else {
    initWithObserver();
  }

})();
