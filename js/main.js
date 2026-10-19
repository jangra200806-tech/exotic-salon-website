/* =========================================================
   js/main.js
   ---------------------------------------------------------
   Contact form ko /api/contact par POST karta hai
   (Brevo SMTP se salon ko email jaati hai).

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

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var fd = new FormData(form);
      var payload = {
        name: valueOf(fd, "name"),
        phone: valueOf(fd, "phone"),
        service: valueOf(fd, "service"),
        date: valueOf(fd, "date"),
        message: valueOf(fd, "message")
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
        submitBtn.textContent = "Sending…";
      }
      setMsg("Aapki enquiry bhej rahe hain…", "info");

      fetch("/api/contact", {
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
              return { ok: res.ok && data && data.ok, data: data };
            });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error((result.data && result.data.error) || "Request failed");
          }
          setMsg(
            "Shukriya " +
              payload.name +
              "! Aapki enquiry mil gayi hai — hum jaldi aapko call ya WhatsApp par contact karenge.",
            "success"
          );
          form.reset();
        })
        .catch(function () {
          setMsg(
            "Sorry, abhi enquiry nahi bhej paye. Kripya direct call karein ya neeche wale WhatsApp button se message bhejein.",
            "error"
          );
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
        });
    });
  });
})();
