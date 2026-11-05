/* =========================================================
   js/main.js
   ---------------------------------------------------------
   Contact form ko /api/enquiry par POST karta hai.

   Sirf contact.html par load hota hai. Agar page par
   #contactForm na ho to chup-chaap kuch nahi karta.

   Note: koi alert() popup nahi — success / error message
   page par hi #formMsg mein dikhta hai.
   ========================================================= */

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var msgBox = document.getElementById("formMsg");
    var submitBtn = document.getElementById("submitBtn");

    /* Page par message dikhao. type: "success" | "error" | "info" */
    function setMsg(text, type) {
      if (!msgBox) return;
      msgBox.textContent = text;
      msgBox.className = "form-msg" + (type ? " is-" + type : "");
    }

    /* FormData se value nikaalo */
    function valueOf(fd, key) {
      var v = fd.get(key);
      return v === null || v === undefined ? "" : String(v).trim();
    }

    /* Native HTML5 validation submit ko rok deta hai — us waqt bhi
       page par saaf inline error dikhe (browser tooltip ke saath). */
    form.addEventListener(
      "invalid",
      function () {
        setMsg("Kripya apna naam aur phone number bharein.", "error");
      },
      true
    );

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var fd = new FormData(form);
      var payload = {
        name: valueOf(fd, "name"),
        phone: valueOf(fd, "phone"),
        service: valueOf(fd, "service"),
        date: valueOf(fd, "date"),
        time: valueOf(fd, "time"),
        message: valueOf(fd, "message"),
        website: valueOf(fd, "website")
      };

      /* Client-side validation (server bhi dobara check karta hai) */
      if (!payload.name || !payload.phone) {
        setMsg("Kripya apna naam aur phone number bharein.", "error");
        var firstMissing = !payload.name
          ? document.getElementById("cName")
          : document.getElementById("cPhone");
        if (firstMissing) firstMissing.focus();
        return;
      }

      var originalLabel = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Bhej rahe hain…";
      }
      setMsg("Aapki enquiry bhej rahe hain…", "info");

      fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: res.ok, data: data };
            });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error((result.data && result.data.error) || "Request failed");
          }
          showConfirmCard(payload.name);
        })
        .catch(function () {
          showErrorCard();
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });

    /* Confirmation card dikhao aur form hide karo */
    function showConfirmCard(name) {
      var card = document.getElementById("confirmCard");
      if (!card) {
        /* Fallback: simple message */
        setMsg(
          "Shukriya " +
            name +
            "! Aapki enquiry bhej di gayi hai. Salon team aapko jaldi WhatsApp ya call karegi.",
          "success"
        );
        form.reset();
        return;
      }
      var nameEl = document.getElementById("confirmName");
      if (nameEl) nameEl.textContent = name;
      form.style.display = "none";
      card.style.display = "block";
      card.focus();
    }

    /* Error card/message dikhao, form bhara raha rahe */
    function showErrorCard() {
      setMsg(
        "Abhi enquiry nahi ja saki. Kripya WhatsApp par bhej dein.",
        "error"
      );
      var waBtn = document.getElementById("waBtn");
      if (waBtn) {
        waBtn.classList.add("highlight-fallback");
        waBtn.focus();
      }
    }
  });
})();
