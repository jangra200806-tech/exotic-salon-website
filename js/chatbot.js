/* =========================================================
   js/chatbot.js
   ---------------------------------------------------------
   Exotic Salon AI assistant widget.

   - Server se baat karta hai: POST /api/chat
   - API key front-end mein kabhi nahi aati.
   - Messages hamesha textContent se render hote hain, innerHTML se nahi.
   - Phone / WhatsApp links safe tarike se clickable banate hain.
   ========================================================= */

(function () {
  "use strict";

  var D = (typeof window !== "undefined" && window.SALON_INFO) || {};
  var SALON = D.shortName || "Exotic Salon";
  var WA_BASE =
    (D.whatsapp && D.whatsapp.link) || "https://wa.me/" + (D.whatsappNumber || "917082014381");
  var PHONE = (D.phone && D.phone.display) || "09000997800";
  var STORAGE_KEY = "exotic-ai-chat-v1";
  var ROBOT_POS_KEY = "exotic-robot-pos";
  var BUBBLE_SEEN_KEY = "exotic-bubble-seen";
  var SCRIPT_NODE = document.currentScript;
  var ROBOT_URL = SCRIPT_NODE && SCRIPT_NODE.src
    ? new URL("robot3d.js", SCRIPT_NODE.src).href
    : new URL("js/robot3d.js", document.baseURI).href;

  var GREETING =
    "Namaste! Main " +
    SALON +
    " ka AI assistant hoon. Aap haircut, facial, bridal makeup, prices ya timings ke baare mein poochh sakte hain. Kaise madad karun?";

  var CHIPS = ["Prices", "Timings", "Bridal booking", "Home service"];

  var NOTE =
    "AI assistant, kabhi galti ho sakti hai. Booking ke liye WhatsApp use karein.";

  var FALLBACK =
    "Main abhi AI service se connect nahi kar paya, lekin mainin local assistant se baat kar rahe hain. Main services, prices, timings, address aur booking mein help kar sakta hoon. Apna sawal likhein ya \"help\" likhein. WhatsApp: " +
    WA_BASE +
    " · Phone: " +
    PHONE;

  var els = {};
  var history = [];
  var loading = false;
  var lastFocus = null;
  var robot = null;

  /* Public hook: window.RobotUI.setTalking(true) / setTalking(false) */
  window.RobotUI = window.RobotUI || {};
  window.RobotUI.setTalking = setTalking;

  /* ---------------------------------------------------------
     Small helpers
     --------------------------------------------------------- */
  function waLink(message) {
    var sep = WA_BASE.indexOf("?") === -1 ? "?" : "&";
    return (
      WA_BASE +
      sep +
      "text=" +
      encodeURIComponent(message || "Hello, mujhe salon ke baare mein poochhna hai.")
    );
  }

  function cleanReply(text) {
    return String(text || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^\s*#+\s*/gm, "")
      .trim();
  }

  /* ---------------------------------------------------------
     Local salon-data fallback
     ---------------------------------------------------------
     Agar /api/chat available na ho (file://, Live Server, network
     error, ya server fallback) to bhi chatbot salon ke real data
     se jawab de. Koi price/service invent nahi hoti. */
  var LOCAL_BOOKING_WORDS = [
    "appointment", "book", "booking", "slot", "reserve", "reservation",
    "schedule", "time lena", "milna", "aana", "appointment lena",
    "appointment book", "slot book", "booking karni", "booking karna"
  ];

  var LOCAL_PRICE_WORDS = [
    "price", "prices", "rate", "rates", "charge", "charges", "cost",
    "fees", "fee", "kitna", "kitne", "kimat", "keemat", "prize",
    "how much", "price list", "rate list", "menu", "paisa", "paise",
    "rupees", "rupaye", "rs", "kharcha", "kharch"
  ];

  var LOCAL_TIMING_WORDS = [
    "timing", "timings", "open", "opens", "opening", "close", "closes",
    "closing", "closed", "khula", "khulta", "khulti", "khulte", "band",
    "kab tak", "kab khulta", "kab khulte", "kab khulti", "kab khula",
    "kab band", "kitne baje", "hours"
  ];

  var LOCAL_ADDRESS_WORDS = [
    "address", "adress", "location", "kahan", "where", "map", "maps",
    "direction", "directions", "landmark", "pahunch", "sector",
    "community center", "community centre", "bus stand", "railway station",
    "reach", "near", "pincode", "pin code", "kaithal"
  ];

  var LOCAL_HOME_WORDS = [
    "home service", "home services", "ghar", "at home", "doorstep", "home par"
  ];

  var LOCAL_WALKIN_WORDS = [
    "walk in", "walk-in", "walkin", "walkins", "walk ins",
    "bina appointment", "without appointment"
  ];

  var LOCAL_APPOINTMENT_NEED_WORDS = [
    "do i need", "do you need appointment", "do you need an appointment",
    "appointment required", "appointment necessary", "appointment needed",
    "appointment zaroori", "appointment lena zaroori", "advance booking zaroori",
    "without appointment", "bina appointment", "walk in", "walkin",
    "walkins", "walk ins"
  ];

  var LOCAL_CANCEL_WORDS = [
    "cancel", "cancellation", "reschedule", "re schedule", "refund",
    "appointment change", "change appointment", "appointment badal",
    "booking change", "booking badal", "time change"
  ];

  var LOCAL_AVAILABILITY_WORDS = [
    "available at", "available today", "availability", "same day",
    "same-day", "free slot", "slot free", "time free", "free hai",
    "aaj free", "today free", "aaj available", "today available"
  ];

  var LOCAL_LAST_SLOT_WORDS = [
    "last appointment", "last slot", "last booking", "closing time appointment"
  ];

  var LOCAL_HOLIDAY_WORDS = [
    "holiday", "holidays", "festival", "festivals", "diwali", "eid",
    "christmas", "navratri", "karwa chauth", "rakhi", "chhutti", "chutti"
  ];

  var LOCAL_GALLERY_WORDS = [
    "gallery", "photos", "pictures", "portfolio", "your work", "videos",
    "video", "before after", "before and after", "reel", "reels"
  ];

  var LOCAL_PRODUCT_WORDS = [
    "product", "products", "brand", "brands", "branded", "shampoo",
    "quality product", "quality products", "skin friendly"
  ];

  var LOCAL_HYGIENE_WORDS = [
    "hygienic", "hygiene", "sanitised", "sanitized", "cleanliness",
    "clean setup", "clean salon", "safe tools", "salon clean", "clean hai",
    "saaf", "safai"
  ];

  var LOCAL_PARKING_WORDS = ["parking", "park"];
  var LOCAL_FACILITY_WORDS = [
    "facility", "facilities", "feature", "features", "highlight", "highlights",
    "why choose", "why exotic", "speciality", "specialities", "specialty",
    "specialties", "suvidha", "amenities"
  ];
  var LOCAL_DETAILS_WORDS = [
    "salon details", "salon ki details", "salon ke details", "salon detail",
    "salon information", "salon info", "salon profile", "salon ka profile",
    "salon ke baare me batao", "salon ke bare me batao", "salon ke bare mein batao",
    "salon ke baare mein batao", "about salon", "about the salon", "tell me about the salon",
    "salon kaisa hai", "salon kaisa", "sab batao", "sab kuch batao"
  ];
  var LOCAL_TRIAL_WORDS = ["trial", "pre bridal", "pre-bridal", "prebridal"];
  var LOCAL_UNISEX_WORDS = [
    "unisex", "for men and women", "ladies and gents", "men and women",
    "gents and ladies"
  ];

  var LOCAL_OFFER_WORDS = [
    "offer", "offers", "discount", "discounts", "student", "combo",
    "package", "packages", "deal", "deals", "scheme"
  ];

  var LOCAL_PAYMENT_WORDS = [
    "payment", "payments", "pay", "upi", "gpay", "google pay", "phonepe",
    "paytm", "card", "cards", "cash", "advance", "advance payment",
    "deposit", "prepayment"
  ];

  var LOCAL_CONTACT_WORDS = [
    "phone", "number", "mobile", "call", "whatsapp", "contact"
  ];

  var LOCAL_INSTAGRAM_WORDS = ["instagram", "insta", "ig"];
  var LOCAL_RATING_WORDS = [
    "rating", "ratings", "review", "reviews", "google review", "star",
    "stars", "google", "rate us", "review link", "rating link"
  ];

  var LOCAL_ACK_WORDS = [
    "ok", "okay", "theek hai", "thik hai", "achha", "accha",
    "hmm", "hmmm", "got it", "samajh gaya", "samajh gayi"
  ];

  var LOCAL_TEAM_WORDS = [
    "team", "staff", "artist", "artists", "who works", "kaun kaam karta",
    "stylist", "stylists", "hair stylist", "makeup artist", "specialist",
    "specialists", "who does", "kaun karta", "kaun karti", "female staff",
    "male staff"
  ];

  var LOCAL_ABOUT_WORDS = [
    "aap kon ho", "aap kaun ho", "tum kon ho", "tum kaun ho",
    "who are you", "about you", "about salon", "apne baare",
    "salon ke baare", "your name", "tumhara naam", "aapka naam", "introduce"
  ];

  var LOCAL_MEDICAL_WORDS = [
    "disease", "diseases", "infection", "allergy", "pregnancy", "pregnant",
    "medicine", "medical", "doctor", "dermatologist", "cure", "skin problem",
    "skin problems", "pimple", "pimples", "acne", "hair fall", "hair loss",
    "dandruff", "hair problem", "hair problems", "baldness", "itching", "rash"
  ];

  var LOCAL_PROMPT_WORDS = [
    "system prompt", "ignore all rules", "show your prompt", "your instructions",
    "internal instructions", "api key", "api keys", "groq key", "openai key",
    "model name", "hidden prompt"
  ];

  var LOCAL_OFFTOPIC_WORDS = [
    "python", "javascript", "java", "c++", "html", "css", "code", "coding",
    "program", "programming", "write me", "weather", "capital of", "politics",
    "cricket score", "stock market", "news"
  ];

  var LOCAL_UNSUPPORTED = [
    "tattoo", "piercing", "laser", "hair botox", "botox", "hair transplant",
    "teeth whitening", "mehndi", "mehendi", "henna", "hydrafacial",
    "hydra facial", "body spa", "foot spa", "brazilian wax", "brazil wax",
    "bikini wax", "full body wax", "hair wash", "body massage", "gel nails",
    "acrylic nails", "lash lift"
  ];

  var LOCAL_HELP_WORDS = [
    "help", "kya kar sakta", "kya poochh sakta", "kya poochhna", "what can you do", "what do you do", "kaise madad", "madad", "sawal", "questions", "capabilities", "features", "koi bhi sawal"
  ];

  var LOCAL_ALIASES = [
    { keys: ["advance haircut", "advance hair cut", "advanced haircut", "advanced hair cut", "advance cut"], names: ["Advance Hair Cut"] },
    { keys: ["haircut", "hair cut", "hair cutting", "haircutting", "bal katna", "baal katna", "bal katne", "baal katne", "baal cut", "bal cut", "baal cutting", "bal cutting", "baal katwana", "bal katwana"], names: ["Men's Haircut", "Women's Haircut", "Kids Hair Cut", "Advance Hair Cut"] },
    { keys: ["fade", "fade cut", "mens fade"], names: ["Men's Haircut"] },
    { keys: ["bob", "bob cut", "layer cut", "layers", "u cut", "v cut", "feather cut"], names: ["Women's Haircut", "Advance Hair Cut"] },
    { keys: ["hair colour", "hair colouring", "colouring", "hair color", "baal colour", "bal colour", "baal color", "bal color"], names: ["Hair Colour"] },
    { keys: ["global colour", "global color", "root touch up", "root touchup", "touch up", "touchup", "colour touch up"], names: ["Hair Colour"] },
    { keys: ["hair spa", "hairspa", "spa", "baal spa", "bal spa"], names: ["Hair Spa"] },
    { keys: ["keratin"], names: ["Keratin Treatment"] },
    { keys: ["smoothening", "smoothing"], names: ["Hair Smoothening"] },
    { keys: ["rebonding"], names: ["Hair Rebonding"] },
    { keys: ["straightening"], names: ["Hair Straightening"] },
    { keys: ["hair extension", "hair extensions"], names: ["Hair Extension"] },
    { keys: ["hair weaving", "weave", "weaving"], names: ["Hair Weaving"] },
    { keys: ["fringe", "straight fringe"], names: ["Pro Keratin Shine Straight Fringe"] },
    { keys: ["volume explosion", "volume treatment", "hair volume"], names: ["Volume Explosion Hair Treatment"] },
    { keys: ["bridal hair", "party hair", "curls", "curling", "blow dry", "blowdry", "updo", "hair setting"], names: ["Hair Styling"] },
    { keys: ["hair style", "hair styling", "styling"], names: ["Hair Styling"] },
    { keys: ["head massage", "hair oil massage", "oil massage", "hair massage"], names: ["Hair Oil Massage With Steam"] },
    { keys: ["hair treatment", "hair treatments"], names: ["Hair Spa", "Keratin Treatment", "Hair Smoothening", "Hair Rebonding", "Hair Straightening"] },
    { keys: ["facial", "facials", "clean up", "cleanup"], names: ["Facial"] },
    { keys: ["skin treatment"], names: ["Skin Treatment"] },
    { keys: ["skin", "skin care"], names: ["Facial", "Skin Treatment"] },
    { keys: ["bridal makeup", "dulhan makeup", "shaadi makeup", "wedding makeup"], names: ["Bridal Makeup"] },
    { keys: ["bridal package", "dulhan package", "shaadi package", "wedding package"], names: ["Bridal Package"] },
    { keys: ["airbrush", "air brush"], names: ["Air Brush Makeup"] },
    { keys: ["hd makeup"], names: ["Bridal Makeup"] },
    { keys: ["photo shoot", "photoshoot"], names: ["Photo Shoot Makeup"] },
    { keys: ["engagement"], names: ["Engagement Makeup"] },
    { keys: ["bridal", "dulhan", "shaadi", "wedding"], names: ["Bridal Makeup", "Bridal Package"] },
    { keys: ["makeup", "make up"], names: ["Bridal Makeup", "Air Brush Makeup", "Basic Makeup", "Engagement Makeup", "Photo Shoot Makeup", "Bridal Package"] },
    { keys: ["nail art", "nailart"], names: ["Nail Art"] },
    { keys: ["nail extension", "nail extensions"], names: ["Nail Extension"] },
    { keys: ["nail", "nails"], names: ["Nail Art", "Nail Extension"] },
    { keys: ["manicure"], names: ["Manicure"] },
    { keys: ["pedicure"], names: ["Pedicure"] },
    { keys: ["waxing", "wax", "body waxing", "arms waxing", "legs waxing"], names: ["Waxing - Body"] },
    { keys: ["threading", "eyebrow", "eyebrows", "upper lip", "face threading", "full face threading"], names: ["Threading - Eyebrows"] },
    { keys: ["beard", "beard trim", "beard styling", "beard shaping"], names: ["Beard Trim & Styling"] },
    { keys: ["shaving", "shave", "clean shave"], names: ["Shaving"] },
    { keys: ["eyelash", "eyelashes", "lash extension"], names: ["Eyelash Extension"] },
    { keys: ["kids", "kid", "child", "children", "bacche", "bachche", "bachcha", "baccha", "baby", "toddler"], names: ["Kids Hair Cut"] }
  ];

  function localNorm(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/coloring/g, "colouring")
      .replace(/color/g, "colour")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function localEscape(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function localHasWord(text, word) {
    var needle = localNorm(word);
    if (!needle) return false;
    if (needle.indexOf(" ") !== -1) return text.indexOf(needle) !== -1;
    return new RegExp("(^|\\s)" + localEscape(needle) + "(\\s|$)").test(text);
  }

  function localHasAny(text, words) {
    return (words || []).some(function (word) {
      return localHasWord(text, word);
    });
  }

  function localServicesByNames(names) {
    var wanted = (names || []).map(localNorm);
    return (D.services || []).filter(function (service) {
      return wanted.indexOf(localNorm(service.name)) !== -1;
    });
  }

  function localUniqueServices(list) {
    var seen = {};
    var result = [];
    (list || []).forEach(function (service) {
      var key = service.id || localNorm(service.name);
      if (!key || seen[key]) return;
      seen[key] = true;
      result.push(service);
    });
    return result;
  }

  function localPriceOf(name) {
    var service = localServicesByNames([name])[0];
    if (D.confirmed && !D.confirmed.prices) return "price ke liye WhatsApp par poochein";
    return service && service.price ? service.price : "price data me listed nahi";
  }

  function localHomeServiceText() {
    return String(D.homeService || "Home services available hain.")
      .replace(/message us on whatsapp to ask\.?/ig, "")
      .replace(/\s+/g, " ")
      .trim() || "Home services available hain.";
  }

  function localServiceLine(service, withDesc) {
    var parts = [service.name];
    if (D.confirmed && D.confirmed.prices && service.price) {
      parts.push("starting from " + service.price);
    } else if (D.confirmed && !D.confirmed.prices) {
      parts.push("price ke liye WhatsApp par poochein");
    } else if (service.price) {
      parts.push("starting from " + service.price);
    }
    if (D.confirmed && D.confirmed.durations && service.duration) {
      parts.push("(" + service.duration + ")");
    } else if (D.confirmed && !D.confirmed.durations && service.duration) {
      parts.push("(duration ke liye WhatsApp par poochein)");
    } else if (service.duration) {
      parts.push("(" + service.duration + ")");
    }
    return "• " + parts.join(" — ") +
      (withDesc && service.desc ? "\n  " + service.desc : "");
  }

  function localServiceIntent(q) {
    var all = D.services || [];
    var list = [];

    all.forEach(function (service) {
      var name = localNorm(service.name);
      if (!name) return;
      var matched = name.indexOf(" ") !== -1
        ? q.indexOf(name) !== -1
        : localHasWord(q, name);
      if (matched) list.push(service);
    });

    var multi = localHasWord(q, "and") || q.indexOf(" aur ") !== -1;
    if (!list.length || multi) {
      for (var i = 0; i < LOCAL_ALIASES.length; i += 1) {
        var alias = LOCAL_ALIASES[i];
        if (localHasAny(q, alias.keys)) {
          list = list.concat(localServicesByNames(alias.names));
          if (!multi) break;
        }
      }
    }

    var matchedServices = localUniqueServices(list);
    var men = localHasAny(q, ["men", "man", "mens", "gents", "gent", "ladka", "ladkon", "ladke", "boys", "boy"]);
    var women = localHasAny(q, ["women", "woman", "womens", "ladies", "lady", "ladki", "ladkiyon", "girls", "girl"]);
    var kids = localHasAny(q, ["kids", "kid", "child", "children", "bacche", "bachche", "bachcha", "baccha", "baby", "toddler"]);
    var filtered = list.slice();

    if (kids) {
      filtered = filtered.filter(function (service) {
        return /kids|child/i.test(service.name || "");
      });
    } else if (men && !women) {
      filtered = filtered.filter(function (service) {
        return (service.categories || []).indexOf("men") !== -1 &&
          !/kids|child/i.test(service.name || "");
      });
    } else if (women && !men) {
      filtered = filtered.filter(function (service) {
        var categories = service.categories || [];
        return (categories.indexOf("women") !== -1 || categories.indexOf("bridal") !== -1) &&
          !/kids|child/i.test(service.name || "");
      });
    }

    if (!filtered.length && !kids && !men && !women &&
        localHasAny(q, ["hair", "baal", "bal"])) {
      filtered = all.filter(function (service) {
        return service.group === "Hair Care";
      });
    }

    return {
      services: localUniqueServices(filtered).slice(0, 6),
      matched: matchedServices,
      men: men,
      women: women,
      kids: kids
    };
  }

  function localContact() {
    return { wa: WA_BASE, phone: PHONE };
  }

  function localGenderReply(intent) {
    var names = localUniqueServices(intent.matched).map(function (service) {
      return service.name;
    }).slice(0, 3);
    var label = names.length ? names.join(", ") : "Ye service";
    var gender = intent.kids ? "kids" : intent.men ? "men's" : "women's";
    return label + " data me " + gender + " category me listed nahi hai" +
      (names.length > 1 ? "n" : "") + ", isliye main confirm nahi kar sakta. " +
      "Available options ke liye WhatsApp/call karein: " + WA_BASE + " · " + PHONE;
  }

  function localServiceReply(services, q) {
    var wantsPrice = localHasAny(q, LOCAL_PRICE_WORDS);
    var withDesc = services.length <= 3;
    var lines = services.map(function (service) {
      return localServiceLine(service, withDesc);
    }).join("\n");
    var extra = "";

    if (services.some(function (service) { return /facial/i.test(service.name || ""); }) &&
        localHasAny(q, ["men", "man", "ladkon", "ladka"])) {
      extra += "\nFacial unisex hai — ladkon aur ladkiyon dono ke liye available.";
    }

    if (D.confirmed && D.confirmed.offers) {
      var bridalOffer = (D.offers || []).find(function (offer) {
        return /bridal/i.test(offer.title || "");
      });
      if (bridalOffer && localHasWord(q, "bridal")) {
        extra += "\n" + bridalOffer.desc + " (" + bridalOffer.highlight + ").";
      }
    }

    var priceNote = D.confirmed && !D.confirmed.prices
      ? "\nPrices ke liye WhatsApp par poochein."
      : "";

    return (wantsPrice ? "Ye services available hain, prices data ke according:" : "Yes, ye services available hain:") +
      "\n" + lines + extra + priceNote +
      "\n\nBooking ke liye naam, service, date aur time WhatsApp/call par bhejein: " +
      WA_BASE + " · " + PHONE;
  }

  function localServicesReply(q) {
    var all = D.services || [];
    var men = localHasAny(q, ["men", "man", "mens", "gents", "gent", "ladka", "ladkon", "ladke"]);
    var women = localHasAny(q, ["women", "woman", "womens", "ladies", "lady", "ladki", "ladkiyon"]);

    if (men || women) {
      var filtered = all.filter(function (service) {
        var categories = service.categories || [];
        if (/kids|child/i.test(service.name || "")) return false;
        if (men) return categories.indexOf("men") !== -1;
        return categories.indexOf("women") !== -1 || categories.indexOf("bridal") !== -1;
      }).slice(0, 8);

      if (filtered.length) {
        return "Ye " + (men ? "men's" : "women's") + " services available hain:\n" +
          filtered.map(function (service) { return localServiceLine(service, false); }).join("\n") +
          "\n\nKisi specific service ka price/duration poochhein.";
      }
    }

    var groups = Array.isArray(D.serviceGroups) && D.serviceGroups.length
      ? D.serviceGroups
      : Array.from(new Set(all.map(function (service) { return service.group; }).filter(Boolean)));
    var groupLines = groups.map(function (group) {
      var names = all.filter(function (service) { return service.group === group; })
        .slice(0, 3)
        .map(function (service) { return service.name; });
      return names.length ? "• " + group + ": " + names.join(", ") : "";
    }).filter(Boolean);
    var popular = D.confirmed && !D.confirmed.popular ? [] : all.filter(function (service) {
      return service.popular && service.price;
    }).slice(0, 6);

    var popularSection = D.confirmed && D.confirmed.popular && D.confirmed.prices && popular.length > 0
      ? "\n\nPopular starting prices:\n" +
        popular.map(function (service) {
          return "• " + service.name + " — starting from " + service.price;
        }).join("\n")
      : "";

    return "Exotic Salon me ye services available hain:\n" +
      groupLines.join("\n") +
      popularSection +
      "\n\nKis service ka price ya duration chahiye?";
  }

  function localPriceReply() {
    var priced = (D.services || []).filter(function (service) {
      return service.price;
    }).slice(0, 10);

    if (D.confirmed && !D.confirmed.prices) {
      return "Prices ki confirmed info data me listed nahi hai; exact price salon team confirm karegi. " +
        "Aap kis service ka price jaanna chahte hain?";
    }

    if (!priced.length) {
      return "Prices data me listed nahi hain; exact price salon team confirm karegi. " +
        "Aap kis service ka price jaanna chahte hain?";
    }

    return "Popular services ke starting prices:\n" +
      priced.map(function (service) { return localServiceLine(service, false); }).join("\n") +
      "\n\nAap kisi service ka naam poochhein to exact price/duration bata dunga. Full list services par hai.";
  }

  function localBookingDetails(q) {
    var hasService = localServiceIntent(q).services.length > 0;
    var hasWhen = /(\d{1,2}\s*(?::|\.)\s*\d{2}|\d{1,2}\s*(am|pm)|\b(aaj|kal|parso|today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|somvar|mangalvar|budhvar|guruvar|shukravar|shanivar|ravivar|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b|\b(date|time|din|tarikh|samay|baje)\b)/i.test(q);
    if (!hasService || !hasWhen) return false;

    var wantsBooking = localHasAny(q, [
      "book", "booking", "reserve", "reservation", "appointment lena",
      "appointment book", "slot book", "slot chahiye"
    ]);
    if (localHasAny(q, LOCAL_PRICE_WORDS) && !wantsBooking) return false;
    if (localHasAny(q, LOCAL_AVAILABILITY_WORDS) && !wantsBooking) return false;

    var asksQuestion = /^(can|could|do|does|are|is|will|would|kya|kab|kitne|kaun|where|when|what|how)\b/.test(q);
    if (asksQuestion && !wantsBooking) return false;
    return true;
  }

  function localBookingSummary(details) {
    var text = String(details || "").replace(/\s+/g, " ").trim().slice(0, 300);
    return "Booking summary:\n" + text +
      "\n\nKya ye booking details sahi hain?\n" +
      'Confirm karne ke liye "Yes" likhein. Uske baad main WhatsApp booking message ready kar dunga.\n' +
      "Agar kuch change karna hai to nayi details bhejein.\n\n" +
      "Note: Final slot " + (D.name || "salon") + " team WhatsApp/call par confirm karegi.";
  }

  function localLastAssistant(messages) {
    var list = Array.isArray(messages) ? messages : [];
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (list[i].role === "assistant") return String(list[i].text || "");
    }
    return "";
  }

  function localPreviousUser(messages) {
    var list = Array.isArray(messages) ? messages : [];
    var seenCurrent = false;
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (list[i].role !== "user") continue;
      if (!seenCurrent) {
        seenCurrent = true;
        continue;
      }
      return String(list[i].text || "");
    }
    return "";
  }

  function localCurrentUser(messages) {
    var list = Array.isArray(messages) ? messages : [];
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (list[i].role === "user") return String(list[i].text || "");
    }
    return "";
  }

  function localBookingFlow(q, messages) {
    var lastBot = localLastAssistant(messages);
    var prevUser = localPreviousUser(messages);
    var currentUser = localCurrentUser(messages);
    var confirm = localHasAny(q, [
      "yes", "haan", "ha", "confirm", "confirmed", "sahi hai", "theek hai",
      "ok", "okay", "proceed", "aage badho", "bilkul"
    ]);
    var no = localHasAny(q, ["no", "nahi", "galat", "change", "badal"]);
    var askedSummary = lastBot.indexOf("Kya ye booking details sahi hain") !== -1;
    var askedDetails = lastBot.indexOf("Appointment book karne ke liye") !== -1;
    var handoffSent = lastBot.indexOf("Booking request ready hai") !== -1;

    if (confirm && handoffSent) {
      return "WhatsApp link upar bheja hai. Us par click karke message send karein; salon team final slot confirm karegi.";
    }

    if (confirm && askedSummary && prevUser) {
      var details = prevUser.replace(/\s+/g, " ").trim().slice(0, 300);
      var message = "Hello Exotic Salon, mujhe appointment book karni hai.\n\nDetails: " +
        details + "\n\nPlease slot confirm karein.";
      return "Booking request ready hai. Neeche WhatsApp link kholen aur message send karein — salon team final slot confirm karegi:\n" +
        waLink(message) +
        "\n\nNote: Chat se booking automatically confirm nahi hoti; WhatsApp send karna zaroori hai.";
    }

    if (confirm && askedDetails) {
      return "Booking ke liye naam, service, date aur time ek message me bhejein. Uske baad main summary dikha kar confirm karunga.";
    }

    if (no && askedSummary) {
      return "Koi baat nahi. Sahi details dobara bhejein: naam, service, date aur time. Main naya summary dikha kar confirm karunga.";
    }

    if (askedSummary && localBookingDetails(q)) {
      return localBookingSummary(currentUser);
    }

    if (localBookingDetails(q) &&
        (askedDetails ||
         localHasAny(q, LOCAL_BOOKING_WORDS) ||
         localHasAny(q, ["mujhe", "i want", "i need", "chahiye", "karna hai", "karni hai"]))) {
      return localBookingSummary(currentUser);
    }

    var shortMessage = q.split(/\s+/).filter(Boolean).length <= 3;
    if (shortMessage && localHasAny(q, ["yes", "haan", "confirm", "confirmed", "sahi hai", "bilkul"])) {
      return "Aap kis cheez ki confirmation chahte hain? Appointment ke liye naam, service, date aur time bhejein; " +
        "main summary bana kar WhatsApp link dunga.";
    }

    if (shortMessage && localHasAny(q, ["no", "nahi", "galat"])) {
      return "Koi baat nahi. Aur kuch poochhna ho to batayein.";
    }

    return "";
  }

  function localBookingReply(q) {
    var lines = [
      "Appointment book karne ke liye ye details ek message me bhejein:",
      "1) Naam",
      "2) Service",
      "3) Date",
      "4) Time",
      "",
      "Walk-ins welcome hain, lekin weekend aur shaadi season me advance booking better hai.",
      "Details bhejne ke baad main summary dikha kar confirm karunga."
    ];

    if (localHasWord(q, "bridal")) {
      var bridal = localServicesByNames(["Bridal Makeup"])[0];
      lines.push("Bridal makeup ke liye kam se kam 15–20 din pehle booking recommended hai.");
      if (bridal && bridal.price) lines.push("Bridal Makeup starting from " + bridal.price + ".");
    }

    if (localHasAny(q, ["haircut", "hair cut", "baal katna", "bal katna"]) &&
        !localHasAny(q, ["women", "womens", "ladies"])) {
      var haircut = localServicesByNames(["Men's Haircut"])[0];
      if (haircut && haircut.price) lines.push("Haircut starting from " + haircut.price + ".");
    }

    lines.push("");
    lines.push("WhatsApp: " + WA_BASE);
    lines.push("Phone: " + PHONE);
    lines.push("Online form: contact#book");
    lines.push("Final slot salon team WhatsApp/call par confirm karegi.");
    return lines.join("\n");
  }

  function localParseClock(value) {
    var raw = String(value == null ? "" : value).trim();
    if (!raw) return null;
    var match = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (match) return Number(match[1]) * 60 + Number(match[2]);
    match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (!match) return null;
    var hours = Number(match[1]) % 12;
    if (/pm/i.test(match[3])) hours += 12;
    return hours * 60 + Number(match[2] || 0);
  }

  function localNowIstMinutes() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).formatToParts(new Date());
      var hour = Number((parts.find(function (part) { return part.type === "hour"; }) || {}).value);
      var minute = Number((parts.find(function (part) { return part.type === "minute"; }) || {}).value);
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
      return (hour % 24) * 60 + minute;
    } catch (error) {
      return null;
    }
  }

  function localFormatClock(minutes) {
    var total = ((Number(minutes) % 1440) + 1440) % 1440;
    var hours24 = Math.floor(total / 60);
    var mins = total % 60;
    var suffix = hours24 >= 12 ? "PM" : "AM";
    var hours12 = hours24 % 12 || 12;
    return hours12 + ":" + String(mins).padStart(2, "0") + " " + suffix;
  }

  function localTimingsReply(q) {
    var timings = D.timings || {};
    var openMinutes = localParseClock(timings.schemaOpens || timings.open);
    var closeMinutes = localParseClock(timings.schemaCloses || timings.close);
    var nowMinutes = localNowIstMinutes();
    var live = "";

    if (localHasAny(q, ["now", "abhi", "aaj", "today"]) &&
        nowMinutes != null && openMinutes != null && closeMinutes != null) {
      if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
        live = "\nAbhi IST " + localFormatClock(nowMinutes) + " — salon open hai, " +
          (timings.close || "10:00 PM") + " tak.";
      } else {
        live = "\nAbhi IST " + localFormatClock(nowMinutes) + " — salon closed hai, " +
          (nowMinutes < openMinutes
            ? (timings.open || "9:00 AM") + " par khulega."
            : "kal " + (timings.open || "9:00 AM") + " par khulega.");
      }
    }

    return "Salon timings: " + (timings.days || "Monday – Sunday") + ", " +
      (timings.open || "9:00 AM") + " – " + (timings.close || "10:00 PM") + ". " +
      (timings.note || "Open all 7 days") + "." + live +
      "\nAppointment confirm karne ke liye WhatsApp/call: " + WA_BASE + " · " + PHONE;
  }

  function localAddressReply() {
    var address = D.address || {};
    return "Address: " + (address.full || "DSS 266, Huda Sector 20, Kaithal, Haryana 136027") +
      "\nLandmark: " + (address.landmark || "Near Community Center") +
      "\nMap: " + (address.mapLink || "") +
      "\nPhone: " + PHONE;
  }

  function localContactReply() {
    var instagram = D.instagram || {};
    return "Phone: " + PHONE +
      "\nWhatsApp: " + WA_BASE +
      "\nContact form: contact#book" +
      (instagram.handle ? "\nInstagram: " + instagram.handle + " (" + instagram.url + ")" : "");
  }

  function localHomeReply() {
    return localHomeServiceText() +
      "\nData me home-service ka exact service list nahi hai. Aap service ka naam batao, " +
      "main uska price aur duration bata dunga. Home slot/availability team confirm karegi. " +
      "WhatsApp/call: " + WA_BASE + " · " + PHONE;
  }

  function localWalkInReply(q) {
    var faq = (D.faqs || []).find(function (item) {
      return /walk.?in|appointment/i.test((item.q || "") + " " + (item.a || ""));
    });
    var answer = (faq && faq.a ? faq.a : "Bina appointment bhi aa sakte hain, lekin peak hours me wait ho sakta hai.")
      .replace(/^Haan,\s*/i, "");
    var need = localHasAny(q, [
      "need appointment", "need an appointment", "do you need appointment",
      "do you need an appointment", "appointment required", "appointment necessary",
      "appointment needed", "appointment zaroori", "appointment lena zaroori",
      "advance booking zaroori"
    ]);
    return (need ? "Appointment zaroori nahi hai. " : "Haan, walk-in allowed hai. ") +
      answer + "\nAppointment karna ho to phone/WhatsApp par slot book kar sakte hain: " +
      PHONE + " · " + WA_BASE;
  }

  function localOffersReply() {
    return "Current offers:\n" +
      (D.offers || []).map(function (offer) {
        return "• " + offer.title + " — " + offer.desc + " (" + offer.highlight + ")";
      }).join("\n");
  }

  function localPaymentReply(q) {
    var faq = (D.faqs || []).find(function (item) {
      return /payment|upi|card|cash/i.test((item.q || "") + " " + (item.a || ""));
    });
    var answer = (faq && faq.a) || "Hum Cash, UPI (GPay / PhonePe / Paytm) aur Card accept karte hain.";
    if (localHasAny(q, ["advance", "deposit", "prepayment"])) {
      return "Advance payment ya booking deposit ki exact policy data me listed nahi hai. Payment options: " + answer;
    }
    return answer;
  }

  function localInstagramReply() {
    var instagram = D.instagram || {};
    return "Instagram: " + (instagram.handle || "@exotic_hair_beauty_") +
      "\n" + (instagram.url || "https://www.instagram.com/exotic_hair_beauty_/");
  }

  function localRatingReply() {
    if (D.confirmed && !D.confirmed.testimonials) {
      return "Reviews/rating ki confirmed info data me listed nahi hai; salon team se WhatsApp/call par poochein: " +
        PHONE + " · " + WA_BASE + ".";
    }
    var rating = D.rating || {};
    var address = D.address || {};
    return (rating.text || "4.9★ rated by 60+ customers in Kaithal") +
      "\nGoogle listing: " + (address.googleListing || "");
  }

  function localAboutReply() {
    return "Main " + (D.name || "Exotic Hair & Beauty Unisex Salon") +
      ", Kaithal ka AI assistant hoon. " + (D.about || "") +
      (D.confirmed && D.confirmed.testimonials && D.rating && D.rating.text ? "\n" + D.rating.text + "." : "");
  }

  function localFacilitiesReply() {
    var features = (D.features || []).map(function (feature) {
      return "• " + feature.title + ": " + feature.text;
    });
    var paymentFaq = (D.faqs || []).find(function (item) {
      return /payment|upi|card|cash/i.test((item.q || "") + " " + (item.a || ""));
    });
    var timings = D.timings || {};
    return "Salon facilities aur highlights:\n" +
      (features.length ? features.join("\n") : "• Unisex salon, experienced stylists, quality products aur hygienic setup.") +
      "\nPayment: " + ((paymentFaq && paymentFaq.a) || "Cash, UPI (GPay / PhonePe / Paytm) aur Card accept hote hain.").replace(/^Haan,\s*hum\s*/i, "") +
      "\nHome services: " + localHomeServiceText() +
      "\nTimings: " + (timings.days || "Monday – Sunday") + ", " +
      (timings.open || "9:00 AM") + " – " + (timings.close || "10:00 PM") + ".";
  }

  function localSalonDetailsReply() {
    var address = D.address || {};
    var timings = D.timings || {};
    var rating = D.rating || {};
    var instagram = D.instagram || {};
    var groups = Array.isArray(D.serviceGroups) ? D.serviceGroups : [];
    var paymentFaq = (D.faqs || []).find(function (item) {
      return /payment|upi|card|cash/i.test((item.q || "") + " " + (item.a || ""));
    });
    var offers = D.confirmed && D.confirmed.offers ? (D.offers || []).map(function (offer) { return offer.title; }) : [];
    return (D.name || "Exotic Hair & Beauty Unisex Salon") +
      "\n" + (D.about || "") +
      "\nServices: " + (D.services || []).length + " services — " + groups.join(", ") +
      "\nTimings: " + (timings.days || "Monday – Sunday") + ", " +
      (timings.open || "9:00 AM") + " – " + (timings.close || "10:00 PM") +
      " (" + (timings.note || "Open all 7 days") + ")" +
      "\nAddress: " + (address.full || "DSS 266, Huda Sector 20, Kaithal") +
      "\nPhone: " + PHONE +
      "\nWhatsApp: " + WA_BASE +
      (instagram.handle ? "\nInstagram: " + instagram.handle : "") +
      (D.confirmed && D.confirmed.testimonials && rating.text ? "\nRating: " + rating.text : "") +
      "\nPayment: " + ((paymentFaq && paymentFaq.a) || "Cash, UPI aur Card.").replace(/^Haan,\s*hum\s*/i, "") +
      "\nHome services: " + localHomeServiceText() +
      (offers.length ? "\nOffers: " + offers.join(", ") : "");
  }

  function localTeamReply(q) {
    if (D.confirmed && !D.confirmed.team) {
      return "Team ki details data me listed nahi hain; salon team se WhatsApp/call par poochein: " +
        PHONE + " · " + WA_BASE + ".";
    }
    var team = D.team || [];
    var lead = "Hamari team me " + team.length + " members hain:";
    var member = null;
    var wantsFemale = localHasAny(q, [
      "female staff", "ladies staff", "female artist", "female stylist",
      "woman staff", "women staff", "ladki staff"
    ]);
    var wantsMale = localHasAny(q, [
      "male staff", "gents staff", "male artist", "male stylist",
      "man staff", "men staff", "ladka staff"
    ]);

    if (wantsFemale || wantsMale) {
      var gender = wantsFemale ? "female" : "male";
      var staff = team.filter(function (item) { return item.gender === gender; });
      if (staff.length) {
        lead = "Haan, " + gender + " staff available hai: " +
          staff.map(function (item) { return item.name + " (" + item.role + ")"; }).join(", ") + ".";
      }
    } else if (localHasAny(q, ["bridal", "makeup"])) {
      member = team.find(function (item) { return /makeup/i.test((item.role || "") + " " + (item.speciality || "")); });
      if (member) lead = "Bridal/party makeup ke liye " + member.name + " (" + member.role + ") se appointment le sakte hain:";
    } else if (localHasAny(q, ["facial", "skin", "waxing", "nail", "threading", "eyebrow"])) {
      member = team.find(function (item) { return /skin|nail/i.test((item.role || "") + " " + (item.speciality || "")); });
      if (member) lead = "Facial, waxing aur nails ke liye " + member.name + " (" + member.role + ") se appointment le sakte hain:";
    } else if (localHasAny(q, ["haircut", "beard", "hair", "stylist"])) {
      member = team.find(function (item) { return /hair/i.test((item.role || "") + " " + (item.speciality || "")); });
      if (member) lead = "Haircut, beard aur hair styling ke liye " + member.name + " (" + member.role + ") se appointment le sakte hain:";
    }

    return lead + "\n" +
      team.map(function (item) {
        return "• " + item.name + " — " + item.role + " (" + item.speciality + ")";
      }).join("\n");
  }

  function localGalleryReply() {
    var instagram = D.instagram || {};
    var note = D.beforeAfter ? "" : "\nBefore/after slider abhi data me listed nahi hai.";
    return "Aap hamara work gallery page par dekh sakte hain: gallery" +
      "\n• Photos: " + (D.gallery || []).length +
      "\n• Videos: " + (D.videos || []).length +
      (instagram.handle ? "\nInstagram: " + instagram.handle + " (" + instagram.url + ")" : "") +
      note;
  }

  function localProductReply(q) {
    var feature = (D.features || []).find(function (item) { return /product/i.test(item.title || ""); });
    var sellNote = localHasAny(q, ["sell", "sale", "buy", "purchase"])
      ? "\nRetail sale ki confirmed info data me listed nahi hai; salon team se poochhein."
      : "";
    var brandNote = localHasAny(q, ["loreal", "l oreal", "matrix", "schwarzkopf", "wella", "olaplex", "mamaearth", "bare anatomy"])
      ? "\nIs specific brand ki confirmed info data me listed nahi hai; salon team se confirm karein."
      : "";
    return "Products: " + (feature ? feature.text : "Salon me branded aur skin-friendly products use hote hain.") +
      "\nAapki skin/hair type ke hisaab se stylist product suggest karega." + sellNote + brandNote;
  }

  function localHygieneReply() {
    var feature = (D.features || []).find(function (item) { return /hygien/i.test(item.title || ""); });
    return "Hygiene: " + (feature ? feature.text : "Sanitised tools aur clean setup.") +
      "\nSalon saaf aur sanitised rehta hai, tools bhi sanitise kiye jaate hain.";
  }

  function localParkingReply() {
    var address = D.address || {};
    return "Parking ki dedicated info data me listed nahi hai. Salon " +
      (address.full || "Huda Sector 20, Kaithal") + " par hai, landmark " +
      (address.landmark || "Near Community Center") + ". Parking ki exact jagah ke liye " +
      "salon phone par confirm kar sakte hain: " + PHONE + ".";
  }

  function localAvailabilityReply(q) {
    var timings = D.timings || {};
    var services = localServiceIntent(q).services;
    var serviceName = services.length === 1 ? services[0].name + " ke liye " : "";
    var walkIn = (D.faqs || []).find(function (item) {
      return /walk.?in/i.test((item.q || "") + " " + (item.a || ""));
    });
    return "Live exact slot chat me confirm nahi hota, lekin salon aaj " +
      (timings.open || "9:00 AM") + " – " + (timings.close || "10:00 PM") + " open hai. " +
      serviceName + "Walk-in allowed hai" +
      (walkIn && walkIn.a ? " — " + walkIn.a.replace(/^Haan,\s*/i, "") : ".");
  }

  function localCancelReply() {
    return "Booking cancel ya reschedule chat se automatically nahi hoti. " +
      "WhatsApp/call par apna naam, service, date aur time bhejein; salon team booking update karegi: " +
      WA_BASE + " · " + PHONE + ". " +
      "Refund ya cancellation charges ki exact policy data me listed nahi hai; us par team final batayegi.";
  }

  function localUnisexReply() {
    var feature = (D.features || []).find(function (item) { return /unisex/i.test(item.title || ""); });
    return "Haan, Exotic Salon unisex hai. " +
      (feature ? feature.text : "Ladies aur gents dono ke liye services available hain.") +
      "\nWomen's, men's ya kids services me se kya chahiye?";
  }

  function localHolidayReply() {
    var timings = D.timings || {};
    return "Salon " + (timings.days || "Monday – Sunday") + ", " +
      (timings.open || "9:00 AM") + " – " + (timings.close || "10:00 PM") + " open rehta hai. " +
      "Data me holiday closure listed nahi hai; " + (timings.note || "Open all 7 days") + ".";
  }

  function localLastSlotReply() {
    var timings = D.timings || {};
    return "Salon " + (timings.close || "10:00 PM") + " tak open rehta hai. " +
      "Last service closing se pehle start honi chahiye; exact last slot live confirm nahi hota. " +
      "Walk-in allowed hai, peak hours me thoda wait ho sakta hai. " +
      "Specific slot book karna ho to booking flow use karein.";
  }

  function localUnsupportedReply(word) {
    var notes = {
      "hair wash": "Hair wash ka separate service list me nahi hai. Hair Spa (" +
        localPriceOf("Hair Spa") + ") ya haircut ke saath wash option confirm karne ke liye WhatsApp/call karein.",
      "body spa": "Body spa list me nahi hai. Hair Spa (" + localPriceOf("Hair Spa") + ") available hai.",
      "foot spa": "Foot spa list me nahi hai. Pedicure (" + localPriceOf("Pedicure") + ") available hai.",
      "hydrafacial": "Hydrafacial list me nahi hai. Facial (" + localPriceOf("Facial") + ") available hai.",
      "brazilian wax": "Brazilian wax list me nahi hai. Waxing - Body (" +
        localPriceOf("Waxing - Body") + ", arms/legs) available hai.",
      "brazil wax": "Brazil wax list me nahi hai. Waxing - Body (" +
        localPriceOf("Waxing - Body") + ", arms/legs) available hai.",
      "bikini wax": "Bikini wax list me nahi hai. Waxing - Body (" +
        localPriceOf("Waxing - Body") + ", arms/legs) available hai.",
      "full body wax": "Full body wax list me nahi hai. Waxing - Body (" +
        localPriceOf("Waxing - Body") + ", arms/legs) available hai.",
      "gel nails": "Gel nails list me nahi hai. Nail Art (" +
        localPriceOf("Nail Art") + ") aur Nail Extension available hain.",
      "acrylic nails": "Acrylic nails list me nahi hai. Nail Art (" +
        localPriceOf("Nail Art") + ") aur Nail Extension available hain.",
      "lash lift": "Lash lift list me nahi hai. Eyelash Extension available hai.",
      "hair botox": "Hair botox list me nahi hai. Keratin Treatment (" +
        localPriceOf("Keratin Treatment") + ") aur Hair Spa available hain.",
      "hair transplant": "Hair transplant list me nahi hai. Hair Spa/Keratin options available hain; hair loss ke liye doctor se consult karna best hai.",
      "body massage": "Body massage list me nahi hai. Head massage (Hair Oil Massage With Steam) available hai.",
      "mehndi": "Mehndi/henna service list me nahi hai. Bridal Makeup (" +
        localPriceOf("Bridal Makeup") + ") aur Bridal Package available hain, " +
        "lekin unme mehndi included hai ya nahi — WhatsApp/call par confirm karein.",
      "mehendi": "Mehndi/henna service list me nahi hai. Bridal Makeup (" +
        localPriceOf("Bridal Makeup") + ") aur Bridal Package available hain, " +
        "lekin unme mehndi included hai ya nahi — WhatsApp/call par confirm karein.",
      "henna": "Mehndi/henna service list me nahi hai. Bridal Makeup (" +
        localPriceOf("Bridal Makeup") + ") aur Bridal Package available hain, " +
        "lekin unme mehndi included hai ya nahi — WhatsApp/call par confirm karein."
    };
    var note = notes[word] ||
      (word.charAt(0).toUpperCase() + word.slice(1) +
        " service hamari list mein nahi hai, isliye main confirm nahi kar sakta.");
    return note + "\nConfirmed info ke liye WhatsApp/call: " + WA_BASE + " · " + PHONE;
  }

  function localGreetingReply() {
    return "Namaste! Main " + (D.name || "Exotic Hair & Beauty Unisex Salon") +
      ", Kaithal ka AI assistant hoon. Aap services, prices, timings, address ya appointment ke baare me poochh sakte hain. Kaise help karun?";
  }

  function localUnknownReply(q) {
    var unsupported = LOCAL_UNSUPPORTED.find(function (word) {
      return localHasWord(q, word);
    });
    if (unsupported) return localUnsupportedReply(unsupported);

    if (localHasWord(q, "email")) {
      return "Salon ka email data me listed nahi hai. WhatsApp: " + WA_BASE + " · Phone: " + PHONE;
    }

    if (localHasAny(q, LOCAL_OFFTOPIC_WORDS)) {
      return "Main coding ya off-topic help nahi kar sakta. Main sirf Exotic Salon ki services, prices, timings aur booking me help kar sakta hoon.";
    }

    if (localHasAny(q, LOCAL_MEDICAL_WORDS)) {
      return "Skin/medical problem ke liye doctor se consult karna best hai. Main salon facial/skin care services ke baare me bata sakta hoon. Appointment: WhatsApp " + WA_BASE + " · Phone " + PHONE;
    }

    return "Is specific baat ki confirmed info mere paas nahi hai, lekin main in baaton mein help kar sakta hoon:\n" +
      "• Services aur prices — haircut, facial, bridal makeup, hair spa waghera\n" +
      "• Timings — salon kab khulta hai, kab band hota hai\n" +
      "• Address — salon kahan hai, kaise pahunchhein\n" +
      "• Booking — appointment kaise lena hai\n" +
      "• Contact — phone, WhatsApp number\n" +
      "• Offers — bridal package, student discount, combo\n" +
      "\n\nApna sawal likhein ya \"help\" likhein. WhatsApp: " + WA_BASE + " · Phone: " + PHONE;
  }

  function localHelpReply() {
    var popular = (D.services || [])
      .filter(function (s) { return s.popular && s.price; })
      .slice(0, 5)
      .map(function (s) { return s.name + " (" + s.price + ")"; });

    return "Main Exotic Salon ka AI assistant hoon. Main in baaton mein help kar sakta hoon:\n" +
      "• Services aur prices — jaise haircut, facial, bridal makeup, hair spa ki jankari\n" +
      "• Timings — salon kab khulta hai aur kab band hota hai\n" +
      "• Address — salon kahan hai, kaise pahunchhein\n" +
      "• Booking — appointment kaise lena hai, slot availability\n" +
      "• Contact — phone, WhatsApp number\n" +
      "• Offers aur discounts — bridal package, student discount, combo offer\n" +
      (popular.length ? "\nPopular: " + popular.join(", ") : "") +
      "\n\nBas apna sawal Hindi ya English mein likhein. Confirm info ke liye WhatsApp: " +
      WA_BASE + " · Phone: " + PHONE;
  }

  function localAnswer(raw, messages) {
    if (!D || !Array.isArray(D.services) || !D.services.length) return "";

    var q = localNorm(raw);
    if (!q) return "";

    if (localHasAny(q, LOCAL_HELP_WORDS)) return localHelpReply();

    if (localHasAny(q, LOCAL_PROMPT_WORDS)) {
      return "Main apni internal settings ya system prompt share nahi kar sakta. Main sirf Exotic Salon ki services, prices, timings aur booking me help kar sakta hoon.";
    }

    if (localHasAny(q, LOCAL_MEDICAL_WORDS)) return localUnknownReply(q);
    if (localHasAny(q, LOCAL_CANCEL_WORDS)) return localCancelReply();
    if (localHasAny(q, LOCAL_LAST_SLOT_WORDS)) return localLastSlotReply();
    if (localHasAny(q, LOCAL_HOLIDAY_WORDS)) return localHolidayReply();

    if (LOCAL_UNSUPPORTED.some(function (word) { return localHasWord(q, word); })) {
      return localUnknownReply(q);
    }

    if (localHasAny(q, LOCAL_APPOINTMENT_NEED_WORDS) || localHasAny(q, LOCAL_WALKIN_WORDS)) {
      return localWalkInReply(q);
    }

    var bookingFlow = localBookingFlow(q, messages);
    if (bookingFlow) return bookingFlow;

    var wantsBookingAction = localHasAny(q, [
      "book", "booking", "reserve", "reservation", "appointment lena",
      "appointment book", "slot book", "slot chahiye"
    ]);

    if (!wantsBookingAction && localHasAny(q, LOCAL_AVAILABILITY_WORDS)) return localAvailabilityReply(q);
    if (localHasAny(q, LOCAL_BOOKING_WORDS)) return localBookingReply(q);
    if (localHasAny(q, LOCAL_TIMING_WORDS)) return localTimingsReply(q);
    if (localHasAny(q, LOCAL_ADDRESS_WORDS)) return localAddressReply();
    if (localHasAny(q, LOCAL_HOME_WORDS)) return localHomeReply();
    if (localHasAny(q, LOCAL_PAYMENT_WORDS)) return localPaymentReply(q);
    if (localHasAny(q, LOCAL_GALLERY_WORDS)) return localGalleryReply();
    if (localHasAny(q, LOCAL_INSTAGRAM_WORDS)) return localInstagramReply();
    if (localHasAny(q, LOCAL_RATING_WORDS)) return localRatingReply();
    if (localHasAny(q, LOCAL_TRIAL_WORDS)) {
      var bridalOffer = (D.offers || []).find(function (offer) { return /bridal/i.test(offer.title || ""); });
      var bridalService = localServicesByNames(["Bridal Makeup"])[0];
      return (bridalOffer ? bridalOffer.desc + " (" + bridalOffer.highlight + ")." : "Bridal package me pre-bridal trial included hai.") +
        (bridalService && bridalService.price ? "\nBridal Makeup starting from " + bridalService.price + "." : "") +
        "\nTrial slot salon team confirm karegi; appointment ke liye booking flow use karein.";
    }

    var asksServices = localHasAny(q, ["service", "services", "facility", "facilities"]);
    if (!asksServices && localHasWord(q, "bridal") && localHasWord(q, "package")) {
      var bridalPackage = localServicesByNames(["Bridal Package"])[0];
      if (bridalPackage) return localServiceReply([bridalPackage], q);
    }
    if (!asksServices && localHasAny(q, LOCAL_OFFER_WORDS)) return localOffersReply();
    if (localHasAny(q, LOCAL_CONTACT_WORDS)) return localContactReply();
    if (localHasAny(q, LOCAL_PRODUCT_WORDS)) return localProductReply(q);
    if (localHasAny(q, LOCAL_HYGIENE_WORDS)) return localHygieneReply();
    if (localHasAny(q, LOCAL_PARKING_WORDS)) return localParkingReply();
    if (localHasAny(q, LOCAL_UNISEX_WORDS)) return localUnisexReply();
    if (localHasAny(q, LOCAL_TEAM_WORDS)) return localTeamReply(q);
    if (localHasAny(q, LOCAL_DETAILS_WORDS)) return localSalonDetailsReply();
    if (localHasAny(q, LOCAL_ABOUT_WORDS)) return localAboutReply();
    if (localHasAny(q, LOCAL_FACILITY_WORDS)) return localFacilitiesReply();

    var intent = localServiceIntent(q);
    if (intent.services.length) return localServiceReply(intent.services, q);
    if (intent.matched.length && (intent.men || intent.women || intent.kids)) {
      return localGenderReply(intent);
    }

    if (asksServices || localHasAny(q, ["treatment", "treatments", "kya kya"])) {
      if (localHasAny(q, LOCAL_PRICE_WORDS)) return localPriceReply();
      return localServicesReply(q);
    }

    if (localHasAny(q, [
      "kya available", "kya milta", "services batao", "service batao",
      "salon me kya", "is salon", "is palour", "is parlour", "yaha kya", "yahaan kya"
    ])) {
      if (localHasAny(q, LOCAL_PRICE_WORDS)) return localPriceReply();
      return localServicesReply(q);
    }

    if (localHasAny(q, ["ladies", "gents", "women", "men"]) &&
        !localHasAny(q, LOCAL_PRICE_WORDS)) {
      return localServicesReply(q);
    }

    if (localHasAny(q, LOCAL_PRICE_WORDS)) return localPriceReply();

    if (localHasAny(q, ["thanks", "thank you", "shukriya", "dhanyavaad"])) {
      return "Aapka swagat hai! Aur kuch jaanna ho to poochhein.";
    }

    if (localHasAny(q, ["bye", "goodbye", "alvida", "phir milenge"])) {
      return "Dhanyavaad! Exotic Salon aane ke liye shukriya. Appointment ke liye WhatsApp/call kar sakte hain.";
    }

    if (localHasAny(q, ["hello", "hi", "hey", "hii", "hiii", "hlo", "helo", "namaste", "namaskar", "sat sri akal", "ram ram", "good morning", "good afternoon", "good evening", "kya haal", "kaise ho", "kaise hain", "नमस्ते", "हैलो", "हाय"])) {
      return localGreetingReply();
    }

    if (localHasAny(q, LOCAL_ACK_WORDS)) {
      return "Theek hai! Aur kuch poochhna ho to batayein — services, prices, timings ya booking me help kar sakta hoon.";
    }

    return localUnknownReply(q);
  }

  function scrollBottom() {
    if (!els.log) return;
    els.log.scrollTop = els.log.scrollHeight;
  }

  function resizeInput() {
    if (!els.input) return;
    els.input.style.height = "auto";
    els.input.style.height =
      Math.min(els.input.scrollHeight || 44, 96) + "px";
  }

  /* ---------------------------------------------------------
     Safe text + links (NO innerHTML for messages)
     --------------------------------------------------------- */
  function appendTextWithLinks(parent, text) {
    var value = String(text == null ? "" : text);
    var pattern = /(https?:\/\/[^\s]+|(?:\+91[\s-]?|0)?[6-9]\d{9})/g;
    var lastIndex = 0;
    var match;

    while ((match = pattern.exec(value)) !== null) {
      if (match.index > lastIndex) {
        parent.appendChild(
          document.createTextNode(value.slice(lastIndex, match.index))
        );
      }

      var token = match[0];
      var trailing = "";

      if (/^https?:\/\//i.test(token)) {
        /* URL ke end ka punctuation link ke andar na jaye */
        var punct = token.match(/[.,!?;:]+$/);
        if (punct) {
          trailing = punct[0];
          token = token.slice(0, -trailing.length);
        }

        var link = document.createElement("a");
        link.href = token;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = token;
        parent.appendChild(link);
      } else {
        var before = match.index > 0 ? value.charAt(match.index - 1) : "";
        var after = value.charAt(match.index + match[0].length);

        /* Kisi lambi number/ID ke beech se phone na kaato */
        if (/\d/.test(before) || /\d/.test(after)) {
          parent.appendChild(document.createTextNode(match[0]));
          lastIndex = match.index + match[0].length;
          continue;
        }

        var digits = token.replace(/\D/g, "");
        var tel = digits;

        if (digits.length === 11 && digits.charAt(0) === "0") {
          tel = "+91" + digits.slice(1);
        } else if (digits.length === 10) {
          tel = "+91" + digits;
        } else if (digits.length === 12 && digits.slice(0, 2) === "91") {
          tel = "+" + digits;
        }

        var telLink = document.createElement("a");
        telLink.href = "tel:" + tel;
        telLink.textContent = token;
        parent.appendChild(telLink);
      }

      if (trailing) parent.appendChild(document.createTextNode(trailing));
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex === 0) {
      parent.textContent = value;
      return;
    }

    if (lastIndex < value.length) {
      parent.appendChild(document.createTextNode(value.slice(lastIndex)));
    }
  }

  /* ---------------------------------------------------------
     Session storage
     --------------------------------------------------------- */
  function loadHistory() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return null;

      return parsed
        .filter(function (m) {
          return (
            m &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.text === "string" &&
            m.text.trim()
          );
        })
        .slice(-40);
    } catch (e) {
      return null;
    }
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      /* Private mode / quota — chat phir bhi chalega */
    }
  }

  /* ---------------------------------------------------------
     Messages
     --------------------------------------------------------- */
  function updateChips() {
    if (!els.chips) return;

    var hasUser = history.some(function (m) {
      return m.role === "user";
    });

    els.chips.hidden = hasUser;
  }

  function addMessage(role, text, persist) {
    var el = document.createElement("div");
    el.className = "chat-msg " + (role === "user" ? "user" : "bot");
    appendTextWithLinks(el, text);
    els.log.appendChild(el);
    scrollBottom();

    if (persist !== false) {
      history.push({ role: role, text: String(text == null ? "" : text) });
      saveHistory();
    }

    updateChips();
    return el;
  }

  function showTyping() {
    var el = document.createElement("div");
    el.className = "chat-msg bot chat-typing";
    el.setAttribute("aria-label", "Assistant type kar raha hai");

    for (var i = 0; i < 3; i += 1) {
      el.appendChild(document.createElement("span"));
    }

    els.log.appendChild(el);
    scrollBottom();
    return el;
  }

  function setLoading(on) {
    loading = on;
    els.send.disabled = on;
    els.log.setAttribute("aria-busy", on ? "true" : "false");

    var chipButtons = els.chips.querySelectorAll("button");
    for (var i = 0; i < chipButtons.length; i += 1) {
      chipButtons[i].disabled = on;
    }
  }

  function resetHistory() {
    history = [];

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* ignore */
    }

    els.log.textContent = "";
    addMessage("assistant", GREETING, true);
    updateChips();
    scrollBottom();
    resizeInput();
  }

  /* ---------------------------------------------------------
     3D robot + backend status
     --------------------------------------------------------- */
  function initRobot3D() {
    if (!els.robotCanvas || robot) return;

    import(ROBOT_URL)
      .then(function (module) {
        if (!module || typeof module.mountRobot3D !== "function") {
          throw new Error("3D robot module did not expose mountRobot3D");
        }

        var mounted = module.mountRobot3D(els.robotCanvas);
        if (!mounted) throw new Error("WebGL is not available");

        robot = mounted;
        els.launcher.classList.add("robot-3d-ready");
      })
      .catch(function (error) {
        els.launcher.classList.add("robot-3d-fallback");
        console.warn(
          "3D robot unavailable, using the CSS robot: " +
            (error && (error.message || error.name) ? (error.message || error.name) : "unknown error")
        );
      });
  }

  function setBackendStatus(text, mode) {
    if (!els.statusText) return;
    els.statusText.textContent = text;
    if (els.status) {
      els.status.classList.toggle("is-data", mode === "data");
      els.status.classList.toggle("is-ai", mode === "ai");
      els.status.title = text;
    }
  }

  function checkBackendStatus() {
    /* Health endpoint alag se call nahi karte (woh 404 deta tha aur
       console mein error aata tha). Default salon-data mode dikhao;
       AI reply milne par sendMessage() status ko "Salon AI" kar deta hai. */
    setBackendStatus("Online · Salon assistant", "data");
  }

  /* ---------------------------------------------------------
     API
     --------------------------------------------------------- */
  async function sendMessage(raw) {
    var text = String(raw || "").trim();
    if (!text || loading) return;

    if (text.length > 500) text = text.slice(0, 500);

    addMessage("user", text);
    els.input.value = "";
    resizeInput();
    updateChips();

    setLoading(true);
    var typing = showTyping();

    var payload = history
      .filter(function (m) {
        return m.role === "user" || m.role === "assistant";
      })
      .slice(-10)
      .map(function (m) {
        return { role: m.role, content: m.text.slice(0, 500) };
      });

    var replyText = FALLBACK;

    function localFallbackReply() {
      try {
        var local = localAnswer(text, history);
        return local ? cleanReply(local) : "";
      } catch (localError) {
        console.warn(
          "Local salon fallback failed: " +
          (localError && (localError.message || localError.name)
            ? (localError.message || localError.name)
            : "unknown error")
        );
        return "";
      }
    }

    var apiController =
      typeof AbortController === "function" ? new AbortController() : null;
    var apiTimer = apiController
      ? window.setTimeout(function () { apiController.abort(); }, 20000)
      : null;

    try {
      var response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
        signal: apiController ? apiController.signal : undefined
      });

      var data = null;
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      var apiReply =
        data && typeof data.reply === "string" && data.reply.trim()
          ? cleanReply(data.reply)
          : "";
      var apiUsable = response.ok && apiReply && !(data && data.fallback);

      if (apiUsable) {
        replyText = apiReply;
        if (!(data && data.local === true)) {
          setBackendStatus("Online · Salon AI", "ai");
        }
      } else {
        if (!response.ok) {
          console.error(
            "Chat API failed: HTTP " + response.status +
            (data && data.error ? " - " + data.error : "")
          );
        } else if (data && data.fallback) {
          console.warn(
            "Chat API returned the fallback response. " +
            "Local salon data answer used instead."
          );
        }

        var localReply = localFallbackReply();
        if (localReply) {
          replyText = localReply;
        } else if (data && typeof data.error === "string" && data.error.trim()) {
          replyText = cleanReply(data.error);
        }
      }
    } catch (e) {
      console.error(
        "Chat API request failed: " +
        (e && (e.name || e.message) ? (e.name || e.message) : "unknown error")
      );
      replyText = localFallbackReply() || FALLBACK;
    } finally {
      if (apiTimer) window.clearTimeout(apiTimer);
    }

    if (typing && typing.parentNode) typing.parentNode.removeChild(typing);

    addMessage("assistant", replyText);
    setLoading(false);
    els.input.focus();
  }

  /* ---------------------------------------------------------
     Robot talking state (window.RobotUI)
     --------------------------------------------------------- */
  function setTalking(on) {
    var target = els.launcher || document.getElementById("chatLauncher");
    if (!target) return;
    target.classList.toggle("robot-talking", !!on);
  }

  /* ---------------------------------------------------------
     Robot menu + speech bubble
     --------------------------------------------------------- */
  var BUBBLE_KEY = "exotic-robot-bubble-v1";
  var menuOpen = false;
  var bubbleShowTimer = null;
  var bubbleHideTimer = null;

  function bubbleSeen() {
    try {
      return window.sessionStorage.getItem(BUBBLE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function markBubbleSeen() {
    try {
      window.sessionStorage.setItem(BUBBLE_KEY, "1");
    } catch (e) {}
  }

  function menuButtons() {
    if (!els.menu) return [];
    return Array.prototype.slice.call(els.menu.querySelectorAll(".robot-menu-btn"));
  }

  function openMenu() {
    if (!els.menu || menuOpen) return;
    cancelBubble();
    hideBubble();
    menuOpen = true;
    els.menu.hidden = false;
    els.launcher.setAttribute("aria-expanded", "true");
    var items = menuButtons();
    if (items[0]) items[0].focus();
  }

  function closeMenu(returnFocus) {
    if (!els.menu || !menuOpen) return;
    menuOpen = false;
    els.menu.hidden = true;
    els.launcher.setAttribute("aria-expanded", "false");
    if (returnFocus) els.launcher.focus();
  }

  function toggleMenu() {
    if (menuOpen) closeMenu(true);
    else openMenu();
  }

  function cancelBubble() {
    window.clearTimeout(bubbleShowTimer);
    window.clearTimeout(bubbleHideTimer);
  }

  function showBubble() {
    if (!els.bubble || bubbleSeen() || menuOpen) return;
    if (els.panel && els.panel.classList.contains("open")) return;
    els.bubble.hidden = false;
    bubbleHideTimer = window.setTimeout(hideBubble, 5000); /* 4s + 5s = 9s */
  }

  function hideBubble() {
    window.clearTimeout(bubbleHideTimer);
    if (!els.bubble || els.bubble.hidden) return;
    els.bubble.hidden = true;
    markBubbleSeen();
  }

  function scheduleBubble() {
    if (!els.bubble || bubbleSeen()) return;
    bubbleShowTimer = window.setTimeout(showBubble, 4000);
  }

  function startTour() {
    closeMenu(false);
    cancelBubble();
    hideBubble();
    if (els.panel && els.panel.classList.contains("open")) closeChat();

    if (window.SalonTour && typeof window.SalonTour.start === "function") {
      window.SalonTour.start();
      return;
    }

    document.dispatchEvent(new window.CustomEvent("robot:tour-start", { bubbles: true }));

    var file = (window.location.pathname.split("/").pop() || "").toLowerCase();
    if (file && file !== "index" && file !== "index.html") {
      window.location.href = "/#tour";
    }
  }

  /* ---------------------------------------------------------
     Open / close
     --------------------------------------------------------- */
  function openChat() {
    lastFocus = document.activeElement;
    closeMenu(false);
    cancelBubble();
    hideBubble();

    els.panel.classList.add("open");
    els.panel.setAttribute("aria-hidden", "false");
    els.panel.removeAttribute("inert");
    document.body.classList.add("chat-open");
    els.launcher.classList.add("chat-open");

    window.setTimeout(function () {
      els.input.focus();
      if (document.activeElement !== els.input) {
        window.setTimeout(function () {
          els.input.focus();
        }, 260);
      }
      resizeInput();
      scrollBottom();
    }, 320);
  }

  function closeChat() {
    if (!els.panel.classList.contains("open")) return;

    els.panel.classList.remove("open");
    els.panel.setAttribute("aria-hidden", "true");
    els.panel.setAttribute("inert", "");
    document.body.classList.remove("chat-open");
    els.launcher.classList.remove("chat-open");
    if (robot) robot.wave();

    var target =
      lastFocus &&
      lastFocus !== document.body &&
      lastFocus.offsetParent !== null &&
      typeof lastFocus.focus === "function"
        ? lastFocus
        : els.launcher;

    target.focus();
  }

  /* ---------------------------------------------------------
     Build DOM
     --------------------------------------------------------- */
  function buildDom() {
    var root = document.createElement("div");
    root.className = "chat-root";
    root.innerHTML =
      '<button class="chat-launcher" id="chatLauncher" type="button" ' +
      'title="Exo · Salon AI assistant" ' +
      'aria-label="Drag me! — Exo robot menu kholein" aria-haspopup="menu" aria-expanded="false" aria-controls="robotMenu">' +
      '<span class="robot-stage" aria-hidden="true">' +
      '<canvas class="robot-canvas" id="robotCanvas"></canvas>' +
      '<span class="robot-css">' +
      '<img class="robot-img" src="images/robot.svg" alt="Exotic Salon assistant" width="76" height="94" decoding="async">' +
      "</span>" +
      "</span>" +
      '<span class="robot-ping" aria-hidden="true"></span>' +
      '<span class="drag-bubble" id="dragBubble" aria-hidden="true"><span class="drag-icon">⇄</span> Drag me!</span>' +
      "</button>" +
      '<div class="robot-menu" id="robotMenu" role="group" aria-label="Exo robot menu" hidden>' +
      '<button class="robot-menu-btn" id="robotTour" type="button" aria-label="Salon ka voice tour shuru karein">Salon ka voice tour</button>' +
      '<button class="robot-menu-btn" id="robotChat" type="button" aria-label="Salon AI se chat karein">Chat karein</button>' +
      '<button class="robot-menu-btn robot-menu-close" id="robotMenuClose" type="button" aria-label="Robot menu band karein">Close</button>' +
      "</div>" +
      '<div class="robot-bubble" id="robotBubble" role="region" aria-label="Salon tour ka offer" hidden>' +
      '<button class="robot-bubble-x" id="robotBubbleClose" type="button" aria-label="Message band karein">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      "</button>" +
      '<p class="robot-bubble-text">Namaste! Salon ka voice tour dekhna chahenge?</p>' +
      '<div class="robot-bubble-actions">' +
      '<button class="robot-bubble-btn primary" id="robotBubbleTour" type="button" aria-label="Salon ka voice tour shuru karein">Voice tour shuru karo</button>' +
      '<button class="robot-bubble-btn" id="robotBubbleChat" type="button" aria-label="Salon AI se chat karein">Chat karo</button>' +
      "</div>" +
      "</div>" +
      '<section class="chat-panel" id="chatPanel" role="dialog" aria-label="Salon AI assistant" aria-hidden="true" inert>' +
      '<header class="chat-head">' +
      '<div class="chat-avatar" aria-hidden="true">' +
      '<img class="avatar-img" src="images/robot.svg" alt="Exotic Salon assistant" width="40" height="49" decoding="async">' +
      "</div>" +
      '<div class="chat-title">' +
      '<span class="chat-eyebrow">AI Concierge</span>' +
      '<b id="chatSalonName">Exotic Salon</b>' +
      '<span class="chat-status" id="chatStatus"><span class="chat-dot" aria-hidden="true"></span>' +
      '<span id="chatStatusText">Online · Salon AI</span></span>' +
      "</div>" +
      '<a class="chat-head-btn wa" id="chatWa" href="#" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp par baat karein">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9-2.7-1.2-4.4-4-4.5-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3 0 .2 0 .9-.2 1.5Z"/>' +
      "</svg></a>" +
      '<button class="chat-head-btn" id="chatClose" type="button" aria-label="Chat band karein">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      "</button>" +
      "</header>" +
      '<div class="chat-toolbar"><span>Salon ke baare mein poochhein</span>' +
      '<div class="chat-toolbar-actions">' +
      '<button class="chat-new" id="chatTour" type="button" aria-label="Salon ka voice tour shuru karein">Tour</button>' +
      '<button class="chat-new" id="chatNew" type="button">New chat</button>' +
      "</div></div>" +
      '<div class="chat-log" id="chatLog" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="chat-chips" id="chatChips" aria-label="Quick replies"></div>' +
      '<div class="chat-compose">' +
      '<textarea id="chatInput" class="chat-input" rows="1" maxlength="500" ' +
      'placeholder="Apna sawaal likhein..." aria-label="Apna sawaal likhein"></textarea>' +
      '<button class="chat-send" id="chatSend" type="button" aria-label="Message bhejein">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg>' +
      "</button>" +
      "</div>" +
      '<p class="chat-note" id="chatNote"></p>' +
      "</section>";

    document.body.appendChild(root);

    els.root = root;
    els.launcher = root.querySelector("#chatLauncher");
    els.menu = root.querySelector("#robotMenu");
    els.menuTour = root.querySelector("#robotTour");
    els.menuChat = root.querySelector("#robotChat");
    els.menuClose = root.querySelector("#robotMenuClose");
    els.bubble = root.querySelector("#robotBubble");
    els.bubbleTour = root.querySelector("#robotBubbleTour");
    els.bubbleChat = root.querySelector("#robotBubbleChat");
    els.bubbleClose = root.querySelector("#robotBubbleClose");
    els.panel = root.querySelector("#chatPanel");
    els.title = root.querySelector("#chatSalonName");
    els.wa = root.querySelector("#chatWa");
    els.close = root.querySelector("#chatClose");
    els.newChat = root.querySelector("#chatNew");
    els.chatTour = root.querySelector("#chatTour");
    els.log = root.querySelector("#chatLog");
    els.chips = root.querySelector("#chatChips");
    els.input = root.querySelector("#chatInput");
    els.send = root.querySelector("#chatSend");
    els.note = root.querySelector("#chatNote");
    els.robotCanvas = root.querySelector("#robotCanvas");
    els.status = root.querySelector("#chatStatus");
    els.statusText = root.querySelector("#chatStatusText");
    els.dragBubble = root.querySelector("#dragBubble");

    els.title.textContent = SALON;
    els.panel.setAttribute("aria-label", SALON + " AI assistant");
    els.wa.href = waLink("Hello, mujhe salon ke baare mein poochhna hai.");
    els.note.textContent = NOTE;
  }

  /* ---------------------------------------------------------
     Events
     --------------------------------------------------------- */
  function bind() {
    els.launcher.addEventListener("click", function (event) {
      event.preventDefault();
      var now = Date.now();
      if (now - lastToggleTime > 300) {
        lastToggleTime = now;
        toggleMenu();
      }
    });
    els.close.addEventListener("click", closeChat);

    els.menuTour.addEventListener("click", startTour);
    els.menuChat.addEventListener("click", function () {
      openChat();
    });
    els.menuClose.addEventListener("click", function () {
      closeMenu(true);
    });

    els.menu.addEventListener("keydown", function (event) {
      var items = menuButtons();
      if (!items.length) return;
      var index = items.indexOf(document.activeElement);
      var next = -1;

      if (event.key === "ArrowDown") next = (index + 1) % items.length;
      else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = items.length - 1;

      if (next > -1) {
        event.preventDefault();
        items[next].focus();
      }
    });

    els.bubbleTour.addEventListener("click", startTour);
    els.bubbleChat.addEventListener("click", function () {
      openChat();
    });
    els.bubbleClose.addEventListener("click", function () {
      hideBubble();
      els.launcher.focus();
    });

    document.addEventListener("pointerdown", function (event) {
      if (!menuOpen) return;
      if (els.menu.contains(event.target) || els.launcher.contains(event.target)) return;
      closeMenu(false);
    });

    els.newChat.addEventListener("click", function () {
      resetHistory();
      els.input.focus();
    });

    /* ---------- Robot drag logic ---------- */
    var drag = { active: false, startX: 0, startY: 0, startLeft: 0, startTop: 0, moved: false };

    function clamp(val, min, max) { return Math.min(max, Math.max(min, val)); }

    function snapToEdge(x, y, w, h) {
      var vw = window.innerWidth, vh = window.innerHeight;
      var leftEdge = x, rightEdge = vw - (x + w), topEdge = y, bottomEdge = vh - (y + h);
      var min = Math.min(leftEdge, rightEdge, topEdge, bottomEdge);
      if (min === leftEdge) return { x: 12, y: clamp(y, 12, vh - h - 12) };
      if (min === rightEdge) return { x: vw - w - 12, y: clamp(y, 12, vh - h - 12) };
      if (min === topEdge) return { x: clamp(x, 12, vw - w - 12), y: 12 };
      return { x: clamp(x, 12, vw - w - 12), y: vh - h - 12 };
    }

    function applyPosition(x, y) {
      els.launcher.style.left = x + "px";
      els.launcher.style.top = y + "px";
      els.launcher.style.right = "auto";
      els.launcher.style.bottom = "auto";
      try { localStorage.setItem(ROBOT_POS_KEY, JSON.stringify({ x: x, y: y })); } catch (e) {}
    }

    function loadRobotPosition() {
      try { var pos = JSON.parse(localStorage.getItem(ROBOT_POS_KEY)); } catch (e) { pos = null; }
      if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
        var vw = window.innerWidth, vh = window.innerHeight;
        var w = els.launcher.offsetWidth || 76, h = els.launcher.offsetHeight || 76;
        var nx = clamp(pos.x, 12, vw - w - 12);
        var ny = clamp(pos.y, 12, vh - h - 12);
        applyPosition(nx, ny);
      } else {
        return;
      }
    }

    els.launcher.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      drag.active = true;
      drag.moved = false;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.startLeft = parseFloat(els.launcher.style.left) || 0;
      drag.startTop = parseFloat(els.launcher.style.top) || 0;
      els.launcher.setPointerCapture(event.pointerId);
    }, { passive: false });

    els.launcher.addEventListener("pointermove", function (event) {
      if (!drag.active) return;
      var dx = event.clientX - drag.startX;
      var dy = event.clientY - drag.startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) drag.moved = true;
      var nx = clamp(drag.startLeft + dx, 12, window.innerWidth - (els.launcher.offsetWidth || 76) - 12);
      var ny = clamp(drag.startTop + dy, 12, window.innerHeight - (els.launcher.offsetHeight || 76) - 12);
      applyPosition(nx, ny);
    }, { passive: false });

    var lastToggleTime = 0;
    els.launcher.addEventListener("pointerup", function (event) {
      if (!drag.active) { drag.active = false; return; }
      drag.active = false;
      els.launcher.releasePointerCapture(event.pointerId);
      if (!drag.moved) {
        var now = Date.now();
        if (now - lastToggleTime > 300) {
          lastToggleTime = now;
          toggleMenu();
        }
      } else {
        var snapped = snapToEdge(
          parseFloat(els.launcher.style.left) || 0,
          parseFloat(els.launcher.style.top) || 0,
          els.launcher.offsetWidth || 76,
          els.launcher.offsetHeight || 76
        );
        applyPosition(snapped.x, snapped.y);
      }
    }, { passive: false });

    els.launcher.addEventListener("pointercancel", function () {
      drag.active = false;
    });

    els.chatTour.addEventListener("click", startTour);

    els.send.addEventListener("click", function () {
      sendMessage(els.input.value);
    });

    els.input.addEventListener("input", resizeInput);

    els.input.addEventListener("keydown", function (event) {
      if (event.isComposing) return;

      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage(els.input.value);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;

      if (menuOpen) {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (els.bubble && !els.bubble.hidden) {
        event.preventDefault();
        hideBubble();
        return;
      }

      if (els.panel.classList.contains("open")) {
        event.preventDefault();
        closeChat();
      }
    });

    CHIPS.forEach(function (label) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "chat-chip";
      button.textContent = label;
      button.addEventListener("click", function () {
        sendMessage(label);
      });
      els.chips.appendChild(button);
    });

    loadRobotPosition();
  }

  /* ---------------------------------------------------------
     Init
     --------------------------------------------------------- */
  function init() {
    /* Duplicate widget na bane */
    if (document.getElementById("chatPanel")) return;

    buildDom();
    bind();
    window.RobotUI = { setTalking: setTalking };
    /* Naya robot ab images/robot.svg se aata hai (detailed + animated).
       3D WebGL robot ki jagah SVG use ho raha hai — module file maujood
       hai, dobara chalu karna ho to neeche wali line un-comment kar do. */
    // initRobot3D();
    checkBackendStatus();

    var stored = loadHistory();

    if (stored) {
      history = stored;
      stored.forEach(function (message) {
        addMessage(message.role, message.text, false);
      });
      updateChips();
      scrollBottom();
    } else {
      resetHistory();
    }

    resizeInput();
    scheduleBubble();

    /* ---------- Drag me bubble: first 7s of every visit ---------- */
    try {
      els.launcher.classList.add("drag-hint");
      els.dragBubble.classList.add("show");
      setTimeout(function () {
        els.dragBubble.classList.remove("show");
        els.launcher.classList.remove("drag-hint");
      }, 7000);
    } catch (e) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

