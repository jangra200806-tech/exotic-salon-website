/* =========================================================
   js/quiz.js
   ---------------------------------------------------------
   "Style Match" quiz. 5 single-choice questions, plain rule
   based scoring, no AI and no API calls.

   Questions and service tags / prices all come from
   data/info.js. This file only handles the UI and scoring.
   ========================================================= */

(function () {
  "use strict";

  var D = window.SALON_INFO;
  var Q = D && D.quiz;

  if (!D || !Q || !Array.isArray(Q.questions) || !Q.questions.length) return;
  if (!Array.isArray(D.services) || !D.services.length) return;

  var openers = [];
  var modal = null;
  var overlay = null;
  var titleEl = null;
  var bodyEl = null;
  var progressEl = null;
  var progressFill = null;
  var stepLabel = null;
  var safetyEl = null;
  var closeBtn = null;
  var backBtn = null;

  var state = {
    open: false,
    step: 0,
    mode: "question",
    answers: [],
    results: [],
    opener: null
  };

  /* ---------------------------------------------------------
     Small helpers
     --------------------------------------------------------- */
  function setInert(el, on) {
    if (!el) return;
    if (on) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  }

  function focusElement(el) {
    if (!el) return;
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      el.focus();
    }
  }

  function focusQuestion() {
    if (!state.open || state.mode !== "question") return;
    focusElement(document.getElementById("quizQuestion"));
  }

  function focusResults() {
    if (!state.open || state.mode !== "result") return;
    focusElement(document.getElementById("quizResultsTitle"));
  }

  function setStatus(text) {
    var el = document.getElementById("quizStatus");
    if (el) el.textContent = text;
  }

  function focusableItems() {
    if (!modal) return [];
    var nodes = modal.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return Array.prototype.filter.call(nodes, function (el) {
      return !el.hidden && el.offsetParent !== null;
    });
  }

  /* ---------------------------------------------------------
     Modal shell
     --------------------------------------------------------- */
  function buildModal() {
    if (modal) return;

    overlay = document.createElement("div");
    overlay.className = "quiz-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);

    modal = document.createElement("div");
    modal.className = "quiz-modal";
    modal.id = "quizModal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "quizTitle");
    modal.setAttribute("aria-describedby", "quizSafety");
    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("tabindex", "-1");
    modal.innerHTML =
      '<div class="quiz-head">' +
      '<div class="quiz-head-copy">' +
      '<p class="quiz-kicker">Style Match</p>' +
      '<h2 class="quiz-title" id="quizTitle"></h2>' +
      "</div>" +
      '<button class="quiz-close" id="quizClose" type="button" aria-label="Quiz band karein">&times;</button>' +
      "</div>" +
      '<div class="quiz-progress-row">' +
      '<div class="quiz-progress" id="quizProgress" role="progressbar" aria-valuemin="1" aria-valuemax="' +
      Q.questions.length +
      '" aria-valuenow="1" aria-label="Quiz progress"><span class="quiz-progress-fill" id="quizProgressFill"></span></div>' +
      '<span class="quiz-step-label" id="quizStepLabel"></span>' +
      "</div>" +
      '<div class="quiz-body" id="quizBody"></div>' +
      '<p class="quiz-safety" id="quizSafety"></p>' +
      '<div class="quiz-nav"><button class="quiz-back" id="quizBack" type="button">Back</button></div>';

    document.body.appendChild(modal);

    titleEl = document.getElementById("quizTitle");
    bodyEl = document.getElementById("quizBody");
    progressEl = document.getElementById("quizProgress");
    progressFill = document.getElementById("quizProgressFill");
    stepLabel = document.getElementById("quizStepLabel");
    safetyEl = document.getElementById("quizSafety");
    closeBtn = document.getElementById("quizClose");
    backBtn = document.getElementById("quizBack");

    titleEl.textContent = Q.title || "Style Match quiz";
    safetyEl.textContent =
      Q.safety ||
      "Allergy ya skin problem ho to pehle stylist se baat karein.";

    closeBtn.addEventListener("click", closeQuiz);
    backBtn.addEventListener("click", goBack);
    overlay.addEventListener("click", closeQuiz);

    document.addEventListener("keydown", onKeydown);

    setInert(modal, true);
  }

  function bindOpeners() {
    openers = Array.prototype.slice.call(
      document.querySelectorAll("[data-quiz-open]")
    );

    openers.forEach(function (btn) {
      btn.setAttribute("aria-haspopup", "dialog");
      btn.setAttribute("aria-controls", "quizModal");
      btn.setAttribute("aria-expanded", "false");
      btn.addEventListener("click", function () {
        openQuiz(btn);
      });
    });
  }

  function setOpenersExpanded(value) {
    openers.forEach(function (btn) {
      btn.setAttribute("aria-expanded", value ? "true" : "false");
    });
  }

  /* ---------------------------------------------------------
     Open / close
     --------------------------------------------------------- */
  function openQuiz(opener) {
    if (state.open) return;

    buildModal();

    state.open = true;
    state.step = 0;
    state.mode = "question";
    state.answers = [];
    state.results = [];
    state.opener = opener || document.activeElement;

    document.body.classList.add("quiz-open");
    overlay.classList.add("is-open");
    modal.classList.add("is-open");
    modal.removeAttribute("aria-hidden");
    setInert(modal, false);
    setOpenersExpanded(true);

    renderQuestion();

    window.setTimeout(focusQuestion, 30);
  }

  function closeQuiz() {
    if (!state.open) return;

    state.open = false;
    document.body.classList.remove("quiz-open");
    overlay.classList.remove("is-open");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    setInert(modal, true);
    setOpenersExpanded(false);

    var opener = state.opener;
    state.opener = null;

    window.setTimeout(function () {
      if (opener && typeof opener.focus === "function") {
        opener.focus();
      }
    }, 0);
  }

  function onKeydown(event) {
    if (!state.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeQuiz();
      return;
    }

    if (event.key !== "Tab") return;

    var items = focusableItems();
    if (!items.length) {
      event.preventDefault();
      focusElement(modal);
      return;
    }

    var first = items[0];
    var last = items[items.length - 1];

    if (!modal.contains(document.activeElement)) {
      event.preventDefault();
      focusElement(first);
      return;
    }

    if (event.shiftKey) {
      if (document.activeElement === first || document.activeElement === modal) {
        event.preventDefault();
        focusElement(last);
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      focusElement(first);
    }
  }

  /* ---------------------------------------------------------
     Questions
     --------------------------------------------------------- */
  function renderQuestion() {
    state.mode = "question";

    var question = Q.questions[state.step];
    var stepNumber = state.step + 1;
    var total = Q.questions.length;

    stepLabel.textContent = "Sawaal " + stepNumber + " / " + total;
    progressEl.setAttribute("aria-valuenow", String(stepNumber));
    progressEl.setAttribute("aria-valuetext", "Sawaal " + stepNumber + " / " + total);
    progressFill.style.width = (stepNumber / total) * 100 + "%";

    backBtn.disabled = state.step === 0;
    backBtn.hidden = false;

    bodyEl.innerHTML = "";
    bodyEl.scrollTop = 0;

    var wrap = document.createElement("div");
    wrap.className = "quiz-question-wrap";

    var heading = document.createElement("h3");
    heading.className = "quiz-question";
    heading.id = "quizQuestion";
    heading.setAttribute("tabindex", "-1");
    heading.textContent = question.question;
    wrap.appendChild(heading);

    if (state.step === 0 && Q.intro) {
      var intro = document.createElement("p");
      intro.className = "quiz-question-sub";
      intro.textContent = Q.intro;
      wrap.appendChild(intro);
    }

    var list = document.createElement("div");
    list.className = "quiz-answers";
    list.setAttribute("role", "group");
    list.setAttribute("aria-labelledby", "quizQuestion");

    var previous = state.answers[state.step];

    (question.options || []).forEach(function (option, index) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-answer";
      btn.setAttribute("data-answer-index", String(index));

      if (previous && previous.label === option.label) {
        btn.classList.add("is-selected");
      }

      var label = document.createElement("span");
      label.className = "quiz-answer-label";
      label.textContent = option.label;

      var arrow = document.createElement("span");
      arrow.className = "quiz-answer-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.textContent = "\u2192";

      btn.appendChild(label);
      btn.appendChild(arrow);
      btn.addEventListener("click", function () {
        chooseAnswer(index);
      });

      list.appendChild(btn);
    });

    wrap.appendChild(list);
    bodyEl.appendChild(wrap);

    window.setTimeout(focusQuestion, 20);
  }

  function chooseAnswer(index) {
    var question = Q.questions[state.step];
    var option = question && question.options && question.options[index];
    if (!option) return;

    state.answers[state.step] = {
      label: option.label,
      tags: Array.isArray(option.tags) ? option.tags.slice() : []
    };

    if (state.step < Q.questions.length - 1) {
      state.step += 1;
      renderQuestion();
    } else {
      state.results = scoreServices(state.answers);
      renderResults();
    }
  }

  function goBack() {
    if (state.mode === "result") {
      state.mode = "question";
      state.step = Q.questions.length - 1;
      renderQuestion();
      return;
    }

    if (state.step > 0) {
      state.step -= 1;
      renderQuestion();
    }
  }

  function resetQuiz() {
    state.step = 0;
    state.mode = "question";
    state.answers = [];
    state.results = [];
    renderQuestion();
  }

  /* ---------------------------------------------------------
     Rule-based scoring
     --------------------------------------------------------- */
  function weightFor(tag) {
    if (tag.indexOf("goal-") === 0) return 4;
    if (tag.indexOf("occasion-") === 0) return 3;
    if (tag.indexOf("time-") === 0) return 2;
    if (tag.indexOf("budget-") === 0) return 2;
    return 0;
  }

  function scoreServices(answers) {
    var audience =
      answers[0] && answers[0].tags && answers[0].tags.length
        ? answers[0].tags[0]
        : null;

    if (!audience) return [];

    var ranked = [];

    D.services.forEach(function (service, index) {
      if (!service || !service.id || !Array.isArray(service.tags)) return;
      if (service.tags.indexOf(audience) === -1) return;

      var score = 0;
      var goalMatches = 0;
      var tagMatches = 0;

      answers.slice(1).forEach(function (answer) {
        (answer.tags || []).forEach(function (tag) {
          if (service.tags.indexOf(tag) === -1) return;
          score += weightFor(tag);
          tagMatches += 1;
          if (tag.indexOf("goal-") === 0) goalMatches += 1;
        });
      });

      if (service.popular) score += 1;

      ranked.push({
        service: service,
        score: score,
        goalMatches: goalMatches,
        tagMatches: tagMatches,
        index: index
      });
    });

    ranked.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (b.goalMatches !== a.goalMatches) {
        return b.goalMatches - a.goalMatches;
      }
      if (b.tagMatches !== a.tagMatches) {
        return b.tagMatches - a.tagMatches;
      }
      return a.index - b.index;
    });

    return ranked.slice(0, 3).map(function (item) {
      return item.service;
    });
  }

  /* ---------------------------------------------------------
     Reasons
     --------------------------------------------------------- */
  function reasonFor(service) {
    var tags = Array.isArray(service.tags) ? service.tags : [];
    var chosen = {};

    state.answers.forEach(function (answer) {
      (answer.tags || []).forEach(function (tag) {
        chosen[tag] = true;
      });
    });

    function has(tag) {
      return tags.indexOf(tag) !== -1;
    }

    function wants(tag) {
      return !!chosen[tag];
    }

    if (wants("kids") && has("kids")) {
      return "Bacchon ke liye easy aur quick service.";
    }

    if (wants("goal-facial") && has("goal-facial")) {
      return "Skin glow ke liye facial; allergy ho to pehle stylist se baat karein.";
    }

    if (wants("goal-skin") && has("goal-skin")) {
      return "Skin type ke hisaab se salon treatment; pehle stylist se baat karein.";
    }

    if (wants("goal-haircut") && has("goal-haircut")) {
      if (wants("occasion-wedding") && has("occasion-wedding")) {
        return "Shaadi ke liye haircut styling.";
      }
      if (wants("occasion-party") && has("occasion-party")) {
        return "Party ke liye fresh haircut.";
      }
      if (has("time-short")) return "Quick haircut, daily look ke liye.";
      return "Naya haircut, aapke look ke liye.";
    }

    if (wants("goal-colour") && has("goal-colour")) {
      return "Colour se look fresh.";
    }

    if (wants("goal-smoothing") && has("goal-smoothing")) {
      if (has("goal-spa")) return "Smooth + spa finish, frizz-free look.";
      return "Smooth aur frizz-free finish.";
    }

    if (wants("goal-spa") && has("goal-spa")) {
      return "Spa time, relaxation ke liye.";
    }

    if (wants("goal-nails") && has("goal-nails")) {
      return "Nails ko complete look.";
    }

    if (wants("goal-grooming") && has("goal-grooming")) {
      return "Grooming ke liye quick touch-up.";
    }

    if (wants("occasion-wedding") && has("occasion-wedding")) {
      if (has("bridal")) return "Shaadi ke liye perfect finish.";
      return "Shaadi ya engagement ke liye ready.";
    }

    if (wants("occasion-party") && has("occasion-party")) {
      return "Party look ke liye ready.";
    }

    if (wants("occasion-selfcare") && has("occasion-selfcare")) {
      return "Self-care ka perfect time.";
    }

    if (wants("occasion-daily") && has("occasion-daily")) {
      return "Daily look ke liye easy choice.";
    }

    if (has("goal-facial")) return "Skin glow ke liye facial.";
    if (has("goal-skin")) return "Skin glow ke liye salon care.";
    if (has("goal-haircut")) return "Naya haircut, aapke look ke liye.";
    if (has("goal-colour")) return "Colour se look fresh.";
    if (has("goal-smoothing")) return "Smooth aur frizz-free finish.";
    if (has("goal-spa")) return "Spa time, relaxation ke liye.";
    if (has("goal-nails")) return "Nails ko complete look.";
    if (has("goal-grooming")) return "Grooming ke liye quick touch-up.";
    if (has("bridal") && has("occasion-wedding")) {
      return "Shaadi ke liye perfect finish.";
    }
    if (has("bridal")) return "Bridal look ke liye perfect choice.";
    if (has("occasion-wedding")) return "Shaadi ya engagement ke liye ready.";
    if (has("occasion-party")) return "Party look ke liye ready.";
    if (has("occasion-selfcare")) return "Self-care ka perfect time.";
    if (has("occasion-daily")) return "Daily look ke liye easy choice.";

    return "Aapke answers ke hisaab se best match.";
  }

  /* ---------------------------------------------------------
     Results
     --------------------------------------------------------- */
  function renderResults() {
    state.mode = "result";

    stepLabel.textContent = "Result";
    progressEl.setAttribute("aria-valuenow", String(Q.questions.length));
    progressEl.setAttribute("aria-valuetext", "Result");
    progressFill.style.width = "100%";
    backBtn.disabled = false;
    backBtn.hidden = false;

    bodyEl.innerHTML = "";
    bodyEl.scrollTop = 0;

    var wrap = document.createElement("div");
    wrap.className = "quiz-results-wrap";

    var heading = document.createElement("h3");
    heading.className = "quiz-results-title";
    heading.id = "quizResultsTitle";
    heading.setAttribute("tabindex", "-1");
    heading.textContent = Q.resultsHeading || "Aapke liye best 3 services";
    wrap.appendChild(heading);

    var sub = document.createElement("p");
    sub.className = "quiz-results-sub";
    sub.textContent =
      "Aapke answers ke hisaab se. Price aur availability salon se confirm karein.";
    wrap.appendChild(sub);

    var list = document.createElement("div");
    list.className = "quiz-results";

    state.results.forEach(function (service) {
      list.appendChild(buildResultCard(service));
    });

    if (!state.results.length) {
      var empty = document.createElement("p");
      empty.className = "quiz-empty";
      empty.textContent =
        "Is combination ke liye direct salon se baat karein. WhatsApp par poochein.";
      list.appendChild(empty);
    }

    wrap.appendChild(list);

    var status = document.createElement("p");
    status.className = "quiz-status";
    status.id = "quizStatus";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    wrap.appendChild(status);

    var again = document.createElement("button");
    again.type = "button";
    again.className = "btn btn-outline quiz-again";
    again.textContent = "Dobara quiz";
    again.addEventListener("click", resetQuiz);
    wrap.appendChild(again);

    bodyEl.appendChild(wrap);

    window.setTimeout(focusResults, 20);
  }

  function buildResultCard(service) {
    var card = document.createElement("article");
    card.className = "quiz-result";
    card.setAttribute("data-service-id", service.id);

    var head = document.createElement("div");
    head.className = "quiz-result-head";

    var name = document.createElement("h4");
    name.className = "quiz-result-name";
    name.textContent = service.name;

    var price = document.createElement("span");
    price.className =
      "quiz-price" + (service.price == null ? " is-ask" : "");
    price.textContent =
      service.price == null
        ? "Price ke liye WhatsApp par poochein"
        : "Starting " + service.price;

    head.appendChild(name);
    head.appendChild(price);

    var reason = document.createElement("p");
    reason.className = "quiz-reason";
    reason.textContent = reasonFor(service);

    var actions = document.createElement("div");
    actions.className = "quiz-actions";

    var addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-primary quiz-add";
    addBtn.setAttribute("data-quiz-add", service.id);

    var builder = window.ExoticLookBuilder;
    var builderReady = builder && typeof builder.add === "function";
    var alreadyAdded =
      builderReady &&
      typeof builder.has === "function" &&
      builder.has(service.id);

    if (!builderReady) {
      addBtn.disabled = true;
      addBtn.textContent = "Builder available nahi";
    } else {
      addBtn.textContent = alreadyAdded ? "Look mein jud gaya" : "Look mein jodein";
      addBtn.setAttribute("aria-pressed", alreadyAdded ? "true" : "false");
      if (alreadyAdded) addBtn.classList.add("is-added");
      addBtn.addEventListener("click", function () {
        addToLook(service, addBtn);
      });
    }

    var waBtn = document.createElement("button");
    waBtn.type = "button";
    waBtn.className = "btn btn-outline quiz-wa";
    waBtn.setAttribute("data-quiz-wa", service.id);
    waBtn.textContent = "WhatsApp par poochein";
    waBtn.addEventListener("click", function () {
      askOnWhatsApp(service);
    });

    actions.appendChild(addBtn);
    actions.appendChild(waBtn);

    card.appendChild(head);
    card.appendChild(reason);
    card.appendChild(actions);

    return card;
  }

  function addToLook(service, btn) {
    var builder = window.ExoticLookBuilder;

    if (!builder || typeof builder.add !== "function") {
      btn.disabled = true;
      btn.textContent = "Builder available nahi";
      setStatus("Look builder load nahi hua. Services page par try karein.");
      return;
    }

    var already =
      typeof builder.has === "function" && builder.has(service.id);
    var added = builder.add(service.id);

    if (!added) {
      setStatus("Service add nahi ho payi. Phir try karein.");
      return;
    }

    btn.textContent = "Look mein jud gaya";
    btn.classList.add("is-added");
    btn.setAttribute("aria-pressed", "true");

    setStatus(
      already
        ? service.name + " pehle se aapke look mein hai."
        : service.name + " aapke look mein add ho gayi."
    );
  }

  function askOnWhatsApp(service) {
    var base = D.whatsappUrl || (D.whatsapp && D.whatsapp.link);
    if (!base) return;

    var message =
      "Hello " +
      D.name +
      ", mujhe " +
      service.name +
      " ke baare mein jaankari chahiye.";

    if (service.price == null) {
      message += " Price confirm kar dijiye.";
    } else {
      message += " Listed price: " + service.price + ".";
    }

    message += " Availability bataiye.";

    var url;
    try {
      url = new URL(base, window.location.href);
      url.searchParams.set("text", message);
      url = url.toString();
    } catch (e) {
      url =
        base +
        (base.indexOf("?") === -1 ? "?" : "&") +
        "text=" +
        encodeURIComponent(message);
    }

    window.open(url, "_blank", "noopener");
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    openers = Array.prototype.slice.call(
      document.querySelectorAll("[data-quiz-open]")
    );

    if (!openers.length) return;

    buildModal();
    bindOpeners();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
