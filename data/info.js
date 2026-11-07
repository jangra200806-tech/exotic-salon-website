/* =========================================================
   data/info.js
   ---------------------------------------------------------
   YAHAN SAB BUSINESS DETAILS HAIN.
   Poori website (har page) sirf isi object ko padhkar chalti hai.
   Price / address / phone badalna ho to sirf yahan edit karo.
   ========================================================= */

const SALON_INFO = {
  /* ---------- 1. BASIC IDENTITY ---------- */
  name: "Exotic Hair & Beauty Unisex Salon",
  shortName: "Exotic Salon",
  tagline: "Where Beauty Meets Elegance",
  heroTagline: "Look Your Best, Feel Exotic",
  badge: "Unisex Salon in Kaithal",
  taglineLong:
    "Kaithal ka premium unisex salon — hair, skin, bridal makeup aur grooming, sab ek hi jagah.",
  about:
    "Exotic Hair & Beauty Unisex Salon, Kaithal ke Huda Sector 20 mein sthit ek modern unisex salon hai. " +
    "Yahan hum ladies aur gents dono ke liye professional hair styling, skin care, bridal makeup, " +
    "nail art aur grooming services dete hain. Hamari experienced team quality products aur " +
    "hygienic environment ke saath aapko ek royal experience deti hai.",
  founded: "2019",


  /* ---------- 1c. MOBILE BOTTOM ACTION BAR (sab pages) ----------
     Mobile (768px se chhoti screen) par neeche ek fixed bar
     dikhta hai — "Call" aur "Book on WhatsApp". Desktop par ye
     bar dikhta hi nahi. Text yahan se badal sakte ho.
     ---------------------------------------------------------- */
  mobileBar: {
    enabled: true,
    callText: "Call",
    callAria: "Salon ko call karein",
    waText: "Book on WhatsApp",
    waAria: "WhatsApp par appointment book karein",
    /* WhatsApp par yeh message pehle se likha aayega */
    waMessage: "Hello, I would like to book an appointment."
  },

  /* ---------- 1d. FESTIVE OFFER STRIP (sab pages) ----------
     EDIT: enabled true karo aur text likho (jaise Diwali offer).
     endDate format YYYY-MM-DD, uske baad banner apne aap hat jayega.

     Poora example (comment mein hi, sirf sample ke liye):
       announcement: {
         enabled: true,
         text: "🪔 Diwali Offer — sabhi facial par 20% off!",
         link: "contact.html",
         linkText: "Book now",
         endDate: "2026-11-08"
       },

     endDate khaali ("") chhodo to strip hamesha dikhegi.
     enabled false hone par page mein strip bilkul nahi aayegi.
     ---------------------------------------------------------- */
  announcement: { enabled: false, text: "", link: "", linkText: "", endDate: "" },

  /* ---------- 1e. HOME PAGE VIDEO (sirf front page) ----------
     Front page par ek chhota video block dikhta hai.
     Video file videos/ folder mein rakho aur uska ek poster
     (video ka koi frame) images/ mein. `null` kar do to poora
     section page se hat jayega.
     ---------------------------------------------------------- */
  homeVideo: {
    src: "videos/bridal-blue.mp4",
    poster: "images/poster-bridal-blue.webp",
    alt: "Dulhan ka bridal look — blue lehenga, mehndi aur bridal jewellery, Exotic Hair & Beauty Unisex Salon Kaithal",
    caption: "Bridal Makeup — hamare salon se",
    note: "Sound on karne ke liye video par tap karein"
  },

  /* ---------- 1b. HERO SLIDER (home page) ----------
     3 slides. image / alt / badge / icon / title (2 lines) / accent / text
     + dono buttons ka label aur link. position = object-position. */
  heroSlides: [
    {
      image: "images/bridal-makeup-kaithal-01-720.webp",
      webp: "images/bridal-makeup-kaithal-01-480.webp",
      fallback: "images/bridal-makeup-kaithal-01.jpg",
      width: 1600,
      height: 900,
      position: "center top",
      webpMaxWidth: 720,
      alt: "Bridal makeup and hair styling by Exotic Salon in Kaithal",
      badge: "Bridal Studio",
      icon: "sparkle",
      title: ["Bridal makeup", "for your big day"],
      accent: "Bridal",
      text: "HD and airbrush bridal looks with draping, hair styling and jewellery setting — all under one roof.",
      primaryLabel: "Explore Services",
      primaryHref: "services",
      secondaryLabel: "Contact Us",
      secondaryHref: "contact"
    },
    {
      image: "images/salon-interior-kaithal-1200.webp",
      webp: "images/salon-interior-kaithal-1200.webp",
      fallback: "images/salon-interior-kaithal.jpg",
      width: 1600,
      height: 900,
      position: "center",
      webpMaxWidth: 1600,
      alt: "Exotic Salon interior in Huda Sector 20, Kaithal",
      badge: "Our Salon",
      icon: "store",
      title: ["A calm space", "in the heart of Kaithal"],
      accent: "Kaithal",
      text: "Golden mirrors, hygienic tools and a team that listens — visit us in Huda Sector 20.",
      primaryLabel: "Explore Services",
      primaryHref: "services",
      secondaryLabel: "Contact Us",
      secondaryHref: "contact"
    },
    {
      image: "images/salon-storefront-kaithal-1200.webp",
      webp: "images/salon-storefront-kaithal-1200.webp",
      fallback: "images/salon-storefront-kaithal.jpg",
      width: 1600,
      height: 900,
      position: "center",
      webpMaxWidth: 1600,
      alt: "Exotic Salon storefront exterior at Huda Sector 20, Kaithal",
      badge: "Salon Exterior",
      icon: "store",
      title: ["Visit Us Today", "in Kaithal"],
      accent: "Salon",
      text: "Visit our salon at Huda Sector 20, Kaithal — open all 7 days, 9 AM to 10 PM.",
      primaryLabel: "Visit Us",
      primaryHref: "contact",
      secondaryLabel: "Explore Services",
      secondaryHref: "services"
    }
  ],

  /* ---------- 2. CONTACT ---------- */
  phone: {
    display: "09000997800",
    tel: "+919000997800"
  },
  whatsapp: {
    number: "919000997800",
    link: "https://wa.me/919000997800"
  },
  /* EDIT: add salon email here.
     Jab tak ye khaali ("") hai, contact page par "Send enquiry by email"
     wali row dikhegi hi nahi. Email daalne par apne aap aa jayegi. */
  email: "",

  /* ---------- 2b. HOME SERVICES ----------
     Contact page par "Highlights" aur Services page par banner ke neeche
     yahi text dikhta hai. */
  homeService: "Home services available. Message us on WhatsApp to ask.",

  /* ---------- 3. ADDRESS ---------- */
  address: {
    line1: "DSS 266, Huda Sector 20",
    line2: "Huda, Kaithal",
    city: "Kaithal",
    state: "Haryana",
    pincode: "136027",
    landmark: "Near Community Center",
    country: "India",
    full: "DSS 266, Huda Sector 20, Huda, Kaithal, Haryana 136027",
    /* Google Map embed (no API key needed) */
    mapEmbed:
      "https://www.google.com/maps?q=29.8128007,76.4155915&z=17&output=embed",
    /* "Get Directions" button link */
    mapLink:
      "https://www.google.com/maps/dir/?api=1&destination=29.8128007,76.4155915",
    /* Google listing link — "Rate us on Google" ke liye base.
       Jab aapko asli Google review link mile, use reviewUrl mein daal do
       (file ke end mein, SALON_INFO.reviewUrl wali line par). */
    googleListing:
      "https://www.google.com/maps/search/?api=1&query=Exotic+Hair+%26+Beauty+Unisex+Salon+Huda+Sector+20+Kaithal"
  },

  /* ---------- 3b. GOOGLE MAPS LOCATION ----------
     Location se judi har cheez yahan se aati hai (HTML mein hardcode nahi). */
  mapLat: 29.8128007,
  mapLng: 76.4155915,
  mapEmbedUrl:
    "https://www.google.com/maps?q=29.8128007,76.4155915&z=17&output=embed",
  mapDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=29.8128007,76.4155915",

  /* ---------- 4. RATING ---------- */
  rating: {
    value: 4.9,
    count: 60,
    text: "4.9★ rated by 60+ customers in Kaithal"
  },

  /* ---------- 5. TIMINGS ---------- */
  timings: {
    days: "Monday – Sunday",
    open: "9:00 AM",
    close: "10:00 PM",
    note: "Open all 7 days",
    /* LocalBusiness schema ke liye */
    schemaOpens: "09:00",
    schemaCloses: "22:00"
  },

  /* ---------- 6. INSTAGRAM ---------- */
  instagram: {
    handle: "@exotic_hair_beauty_",
    url: "https://www.instagram.com/exotic_hair_beauty_/"
  },

  /* ---------- 6b. SEO KEYWORDS ----------
     Ye keywords chaaron pages ke <meta name="keywords"> mein
     script.js se inject ho jaate hain (HTML chhedne ki zaroorat nahi).
     Naya keyword add karna ho to bas yahan line jod do. */
  seoKeywords: [
    "beauty parlour in Kaithal",
    "hair keratin Kaithal",
    "hair smoothening Kaithal",
    "hair rebonding Kaithal",
    "hair straightening Kaithal",
    "airbrush makeup Kaithal",
    "pre bridal services Kaithal",
    "bridal makeup at home Kaithal",
    "eyebrow threading Kaithal",
    "nail extension Kaithal",
    "eyelash extension Kaithal",
    "beard shaving Kaithal",
    "beauty salon for men",
    "beauty salon for women",
    "beauty salon for kids"
  ],

  /* ---------- 7. STATS (hero ke neeche) ---------- */
  stats: [
    { value: "4.9★", label: "Google Rating" },
    { value: "60+", label: "Happy Reviews" },
    { value: "12+", label: "Services" },
    { value: "7", label: "Days Open" }
  ],

  /* ---------- 7b. BOOKING STEPS (home + contact) ---------- */
  bookingSteps: [
    {
      num: "01",
      title: "Pick your ritual",
      text: "Browse hair, skin, bridal and grooming services — prices and durations are right on the menu."
    },
    {
      num: "02",
      title: "Send your details",
      text: "Share your name, service, preferred date and time on WhatsApp or through the booking form."
    },
    {
      num: "03",
      title: "Confirm your slot",
      text: "The salon team checks availability and confirms the final slot with you. Chat never auto-confirms a booking."
    }
  ],

  /* ---------- 8. WHY CHOOSE US ---------- */
  features: [
    {
      icon: "bi-gender-ambiguous",
      emoji: "💇",
      title: "Unisex Salon",
      text: "Ladies aur gents dono ke liye alag-alag expert services."
    },
    {
      icon: "bi-award",
      emoji: "🏆",
      title: "Experienced Stylists",
      text: "Trained professionals jo aapke look ko perfect banate hain."
    },
    {
      icon: "bi-droplet-half",
      emoji: "🧴",
      title: "Quality Products",
      text: "Sirf branded aur skin-friendly products ka istemaal."
    },
    {
      icon: "bi-shield-check",
      emoji: "✨",
      title: "Hygienic & Clean",
      text: "Sanitised tools aur poori tarah clean setup."
    }
  ],

  /* ---------- 9. SERVICES ----------
     group: services page par isi heading ke neeche card dikhta hai.
            Order serviceGroups array se set hota hai (neeche).
     categories: ARRAY — ek service ek se zyada category mein aa sakti hai.
                 Valid values: "men" | "women" | "bridal"
                 ("bridal" add karne par service Bridal tab mein bhi aayegi.)
     price:  null rakho to card par "Ask for price" likha aata hai.
             Price pata chalne par yahan "₹500" jaisa likh do.
     ------------------------------------------------------------ */

  /* Services page par groups kis order mein dikhein */
  serviceGroups: ["Hair Care", "Makeup", "Nails", "Grooming", "Hair Removal", "Skin Care"],

  services: [
    /* ==================== HAIR CARE ==================== */
    { id: "m1",  group: "Hair Care", categories: ["men"],                name: "Men's Haircut",                    price: "₹200",  duration: "30 min",  desc: "Trendy cut + basic styling.",                                  popular: true  },
    { id: "w1",  group: "Hair Care", categories: ["women"],              name: "Women's Haircut",                  price: "₹350",  duration: "40 min",  desc: "Layered, bob, U/V cut with styling.",                          popular: true  },
    { id: "m3",  group: "Hair Care", categories: ["men", "women"],       name: "Hair Colour",                      price: "₹500",  duration: "45 min",  desc: "Global colour / touch-up, men & women.",                       popular: false },
    { id: "m4",  group: "Hair Care", categories: ["men", "women"],       name: "Hair Spa",                         price: "₹600",  duration: "45 min",  desc: "Deep conditioning & relaxing hair spa.",                       popular: false },
    { id: "m6",  group: "Hair Care", categories: ["men", "women"],       name: "Keratin Treatment",                price: "₹3000", duration: "2 hrs",   desc: "Smooth, frizz-free salon-finish hair.",                        popular: false },
    { id: "hc1", group: "Hair Care", categories: ["men", "women"],       name: "Kids Hair Cut",                    price: null,    duration: "20 min",  desc: "Bacchon ke liye aaramdayak aur jaldi hone wala haircut.",       popular: false },
    { id: "hc2", group: "Hair Care", categories: ["men", "women"],       name: "Advance Hair Cut",                 price: null,    duration: "45 min",  desc: "Layered, texturised ya trend wala cut expert stylist se.",     popular: false },
    { id: "hc3", group: "Hair Care", categories: ["men", "women"],       name: "Hair Oil Massage With Steam",      price: null,    duration: "40 min",  desc: "Garam oil massage aur steam se baalon ko poshan.",             popular: false },
    { id: "hc4", group: "Hair Care", categories: ["men", "women"],       name: "Pro Keratin Shine Straight Fringe",price: null,    duration: "40 min",  desc: "Fringe ko keratin finish ke saath seedha aur shiny banaye.",   popular: false },
    { id: "hc5", group: "Hair Care", categories: ["men", "women"],       name: "Volume Explosion Hair Treatment",  price: null,    duration: "50 min",  desc: "Patle baalon mein volume aur bounce laane wala treatment.",    popular: false },
    { id: "hc6", group: "Hair Care", categories: ["women"],              name: "Hair Extension",                   price: null,    duration: "2 hrs",   desc: "Natural look wale extensions se lambai aur thickness.",        popular: false },
    { id: "hc7", group: "Hair Care", categories: ["men", "women"],       name: "Hair Rebonding",                   price: null,    duration: "2 hrs",   desc: "Rebonding se ekdum seedhe, silky aur smooth baal.",            popular: false },
    { id: "hc8", group: "Hair Care", categories: ["men", "women"],       name: "Hair Weaving",                     price: null,    duration: "2 hrs",   desc: "Weaving se baalon mein natural density aur length.",           popular: false },
    { id: "hc9", group: "Hair Care", categories: ["men", "women"],       name: "Hair Smoothening",                 price: null,    duration: "1 hr 30 min", desc: "Frizz-free, soft aur aasaan manage hone wale baal.",       popular: false },
    { id: "hc10",group: "Hair Care", categories: ["men", "women", "bridal"], name: "Hair Styling",                 price: null,    duration: "30 min",  desc: "Party, shaadi ya daily look ke liye professional styling.",    popular: true  },
    { id: "hc11",group: "Hair Care", categories: ["men", "women"],       name: "Hair Straightening",               price: null,    duration: "1 hr 30 min", desc: "Straightening se baal lambe samay tak seedhe aur silky.",  popular: false },

    /* ==================== MAKEUP ==================== */
    { id: "b1",  group: "Makeup", categories: ["bridal"],                name: "Bridal Makeup",                    price: "₹8000", duration: "3 hrs",   desc: "HD bridal makeup + hairdo + draping.",                         popular: true  },
    { id: "mu1", group: "Makeup", categories: ["women", "bridal"],       name: "Air Brush Makeup",                 price: null,    duration: "1 hr 30 min", desc: "Halka airbrush finish jo ghanton tak fresh lagta hai.",    popular: false },
    { id: "mu2", group: "Makeup", categories: ["women"],                 name: "Basic Makeup",                     price: null,    duration: "45 min",  desc: "Simple aur natural look ke liye halka makeup.",                popular: false },
    { id: "mu3", group: "Makeup", categories: ["women", "bridal"],       name: "Engagement Makeup",                price: null,    duration: "1 hr 30 min", desc: "Engagement function ke liye elegant, photo-ready makeup.", popular: false },
    { id: "mu4", group: "Makeup", categories: ["women"],                 name: "Photo Shoot Makeup",               price: null,    duration: "1 hr",    desc: "Camera aur HD shoot ke liye perfect makeup.",                  popular: false },
    { id: "mu5", group: "Makeup", categories: ["bridal"],                name: "Bridal Package",                   price: null,    duration: "3 hrs",   desc: "Makeup, hairdo aur draping ka poora bridal package.",          popular: false },

    /* ==================== NAILS ==================== */
    { id: "w2",  group: "Nails", categories: ["women"],                  name: "Nail Art",                         price: "₹500",  duration: "45 min",  desc: "Designer nail art & extensions.",                              popular: true  },
    { id: "nl1", group: "Nails", categories: ["women", "bridal"],        name: "Nail Extension",                   price: null,    duration: "1 hr",    desc: "Extensions se lambe, mazboot aur stylish nails.",              popular: false },
    { id: "nl2", group: "Nails", categories: ["women", "bridal"],        name: "Manicure",                         price: null,    duration: "30 min",  desc: "Haath ki safai, scrub aur nail care.",                         popular: false },
    { id: "nl3", group: "Nails", categories: ["women", "bridal"],        name: "Pedicure",                         price: null,    duration: "40 min",  desc: "Pairon ki safai, scrub aur relaxing care.",                    popular: false },

    /* ==================== GROOMING ==================== */
    { id: "m2",  group: "Grooming", categories: ["men"],                 name: "Beard Trim & Styling",             price: "₹150",  duration: "20 min",  desc: "Beard shaping, trim aur styling.",                             popular: true  },
    { id: "gr1", group: "Grooming", categories: ["women"],               name: "Eyelash Extension",                price: null,    duration: "45 min",  desc: "Natural volume wale eyelash extensions.",                      popular: false },
    { id: "gr2", group: "Grooming", categories: ["men"],                 name: "Shaving",                          price: null,    duration: "20 min",  desc: "Clean shave, ekdum smooth finish ke saath.",                   popular: false },

    /* ==================== HAIR REMOVAL ==================== */
    { id: "w4",  group: "Hair Removal", categories: ["women", "bridal"], name: "Waxing - Body",                    price: "₹400",  duration: "40 min",  desc: "Rica / chocolate waxing (arms, legs).",                        popular: false },
    { id: "w3",  group: "Hair Removal", categories: ["women"],           name: "Threading - Eyebrows",             price: "₹50",   duration: "15 min",  desc: "Eyebrow, upper lip & face threading.",                         popular: false },

    /* ==================== SKIN CARE ==================== */
    { id: "m5",  group: "Skin Care", categories: ["men", "women"],       name: "Facial",                           price: "₹700",  duration: "50 min",  desc: "Clean-up + facial for glowing skin.",                          popular: false },
    { id: "sk1", group: "Skin Care", categories: ["men", "women"],       name: "Skin Treatment",                   price: null,    duration: "50 min",  desc: "Skin type ke hisaab se targeted treatment.",                   popular: false }
  ],

  /* ---------- 10. OFFERS ---------- */
  offers: [
    {
      title: "Bridal Package",
      tag: "Most Popular",
      desc: "Complete bridal package — makeup, hairdo, draping + free pre-bridal trial.",
      highlight: "Save up to 20%",
      icon: "👰"
    },
    {
      title: "Student Discount",
      tag: "Mon – Fri",
      desc: "Valid student ID dikhao aur saari services par special discount pao.",
      highlight: "15% OFF",
      icon: "🎓"
    },
    {
      title: "Combo Offer",
      tag: "Value Deal",
      desc: "Haircut + Facial + Hair Spa ka special combo price.",
      highlight: "Best Value",
      icon: "💫"
    }
  ],

  /* ---------- 11. TESTIMONIALS ---------- */
  testimonials: [
    {
      name: "Priya",
      stars: 5,
      text: "Meri shaadi ka bridal makeup yahin se karwaya tha — ekdum perfect! Sabne tareef ki. Team bahut supportive hai."
    },
    {
      name: "Rahul",
      stars: 5,
      text: "Kaithal ka best men's salon. Haircut aur beard styling ekdum professional. Staff friendly aur salon clean hai."
    },
    {
      name: "Simran",
      stars: 5,
      text: "Hair spa aur keratin ne mere baal ko poora badal diya. Prices bhi reasonable hain. Highly recommended!"
    }
  ],

  /* ---------- 12. TEAM ----------
     Team cards par sirf naam/role/speciality dikhti hai (photo nahi).
     ---------------------------------------------------------- */
  team: [
    { name: "Riya",  role: "Bridal & Party Makeup Artist", speciality: "HD & bridal makeup",       gender: "female" },
    { name: "Aman",  role: "Senior Hair Stylist",           speciality: "Haircut & beard styling", gender: "male" },
    { name: "Neha",  role: "Skin & Nail Specialist",        speciality: "Facial, waxing & nails",  gender: "female" }
  ],

  /* ---------- 13. GALLERY ---------- */
  gallery: [
    { src: "images/bridal-makeup-kaithal-01.jpg",          width: 720, height: 900, category: "bridal", alt: "Bride in maroon lehenga with bridal makeup at Exotic Salon Kaithal", caption: "Bridal Makeup" },
    { src: "images/services/bridal-makeup-kaithal.jpg",     width: 480, height: 854, category: "bridal", alt: "Bride in pink bridal lehenga with dupatta at Exotic Salon Kaithal",              caption: "Bridal Look" },
    { src: "images/services/airbrush-makeup-kaithal.jpg",   width: 480, height: 854, category: "bridal", alt: "Close-up of bridal makeup with gold jewellery at Exotic Salon Kaithal",                                        caption: "Bridal Jewellery" },
    { src: "images/bridal-makeup-kaithal-01.jpg",          width: 720, height: 900, category: "bridal", alt: "Bride in red bridal lehenga with jewellery at Exotic Salon Kaithal",                   caption: "HD Bridal Makeup" },
    { src: "images/services/airbrush-makeup-kaithal.jpg",   width: 480, height: 854, category: "salon",  alt: "Client in cream printed saree with party makeup at Exotic Salon Kaithal",                                        caption: "Party Makeup" },
    { src: "images/services/bridal-makeup-kaithal.jpg",     width: 480, height: 854, category: "salon",  alt: "Client in saree with party makeup beside gold panel at Exotic Salon Kaithal",                                    caption: "Party Look" }
  ],

  /* ---------- 13b. VIDEOS (gallery page) ----------
     Gallery page ke "Videos" section mein ye clips dikhte hain.
     Har video ka poster = video ka ek frame (images/ folder mein).
     Naya clip jodne ke liye: file videos/ mein daalo, uska poster
     images/ mein rakho, aur yahan ek line badha do.
     ---------------------------------------------------------- */
  videos: [
    { src: "videos/salon-front.mp4",          poster: "images/poster-salon-front.webp",          caption: "Salon Front",     alt: "Exotic Hair & Beauty Unisex Salon ka storefront bahar se, Huda Sector 20, Kaithal" },
    { src: "videos/salon-interior.mp4",       poster: "images/poster-salon-interior.webp",       caption: "Salon Interior",  alt: "Salon ke andar clients aur staff kaam karte hue, Exotic Salon Kaithal" },
    { src: "videos/mens-haircut.mp4",         poster: "images/poster-mens-haircut.webp",         caption: "Men's Haircut",   alt: "Male client ka haircut banate hue — before look, Exotic Salon Kaithal" },
    { src: "videos/mens-fade.mp4",            poster: "images/poster-mens-fade.webp",            caption: "Men's Fade Cut",  alt: "Male client ka fade aur top haircut banate hue, close-up, Exotic Salon Kaithal" },
    { src: "videos/hair-wash.mp4",            poster: "images/poster-hair-wash.webp",            caption: "Hair Wash",       alt: "Client ko hair wash basin par head wash diya ja raha hai, Exotic Salon Kaithal" },
    { src: "videos/hair-styling.mp4",         poster: "images/poster-hair-styling.webp",         caption: "Hair Styling",    alt: "Lambe baalon ko blow-dry aur style karte hue, Exotic Salon Kaithal" },
    { src: "videos/makeup-application.mp4",   poster: "images/poster-makeup-application.webp",   caption: "Makeup",          alt: "Client ke chehre par blush brush se makeup lagate hue, Exotic Salon Kaithal" },
    { src: "videos/bridal-pink.mp4",          poster: "images/poster-bridal-pink.webp",          caption: "Bridal Look",     alt: "Dulhan pink aur red bridal lehenga aur dupatta mein, Exotic Salon Kaithal" },
    { src: "videos/bridal-blue.mp4",          poster: "images/poster-bridal-blue.webp",          caption: "Bridal Makeup",   alt: "Dulhan blue lehenga, mehndi aur bridal jewellery ke saath, Exotic Salon Kaithal" },
    { src: "videos/client-look.mp4",          poster: "images/poster-client-look.webp",          caption: "Party Look",      alt: "Client ka light makeup look, front facing, Exotic Salon Kaithal" },
    { src: "videos/client-chair.mp4",         poster: "images/poster-client-chair.webp",         caption: "Salon Session",   alt: "Chair par baithi client ke baal stylist set kar rahe hain, Exotic Salon Kaithal" },
    { src: "videos/long-hair.mp4",            poster: "images/poster-long-hair.webp",            caption: "Hair Care",       alt: "Lambe aur chamakte baalon ka close-up, Exotic Salon Kaithal" },
    { src: "videos/kids-cut.mp4",             poster: "images/poster-kids-cut.webp",             caption: "Kids Haircut",    alt: "Salon mein bacche ka haircut karte hue, Exotic Salon Kaithal" },
    { src: "videos/mirror-closeup.mp4",       poster: "images/poster-mirror-closeup.webp",       caption: "Mirror Shot",     alt: "Mirror mein client ka close-up jab baal set kiye ja rahe hain, Exotic Salon Kaithal" },
    { src: "videos/client-reel.mp4",          poster: "images/poster-client-reel.webp",          caption: "Fun Reel",        alt: "Client ke saath mazedaar reel — boxing gloves ke saath, Exotic Salon Kaithal" }
  ],

  /* ---------- 14. BEFORE / AFTER SLIDER ----------
     Gallery page ka before/after slider. Filhaal koi asli
     before/after photo nahi hai, isliye ye null hai aur gallery
     page par ye section dikhta hi nahi.
     Jab aapke paas sach mein before + after photo ho, to null ki
     jagah ye likh do:
       beforeAfter: {
         before: { src: "images/before.jpg", alt: "Before — ..." },
         after:  { src: "images/after.jpg",  alt: "After — ..."  }
       },
     ---------------------------------------------------------- */
  beforeAfter: null,

  /* ---------- 15. CONTACT PAGE HIGHLIGHTS ----------
     Contact page par banner ke neeche 3 chhote items.
     icon: home | facial | bridal   (SVG script.js se aata hai)
     link: "whatsapp" ya koi page/URL (services.html#women, services.html#bridal)
     --------------------------------------------------------- */
  highlights: [
    { icon: "home",   label: "Home services", link: "whatsapp" },
    { icon: "facial", label: "Facial",        link: "services.html#women" },
    { icon: "bridal", label: "Bridal makeup", link: "services.html#bridal" }
  ],

  /* ---------- 16. ASK US ANYTHING (contact page) ----------
     Ye chips "Ask Us Anything" box mein dikhte hain. Click karne par
     WhatsApp khulta hai usi question ke saath. Koi AI / API use nahi hota. */
  quickQuestions: [
    "Do I need to book an appointment for a haircut?",
    "What are your prices for hair colouring?",
    "Can you do a facial today?"
  ],

  /* ---------- 17. FAQ ---------- */
  faqs: [
    {
      q: "Kya appointment lena zaroori hai?",
      a: "Walk-ins welcome hain, lekin weekend aur shaadi season mein appointment lena better hai taaki aapko wait na karna pade. Call ya WhatsApp par slot book kar sakte ho."
    },
    {
      q: "Bridal makeup kitne pehle book karna chahiye?",
      a: "Bridal makeup ke liye kam se kam 15–20 din pehle advance booking karna recommended hai. Trial ke saath package bhi customize ho jaata hai."
    },
    {
      q: "Payment ke kaun se options hain?",
      a: "Hum Cash, UPI (GPay / PhonePe / Paytm) aur Card accept karte hain."
    },
    {
      q: "Kya walk-in allowed hai?",
      a: "Haan, bina appointment bhi aa sakte ho. Lekin peak hours mein thoda wait ho sakta hai, isliye pehle call karna best hai."
    }
  ]
};

/* EDIT: ise apne asli Google review link se badal do.
   Abhi filhaal salon ki Google listing ka link diya hua hai
   (address.googleListing), taaki button abhi se kaam kare. */
SALON_INFO.reviewUrl = SALON_INFO.address.googleListing;

/* Compatibility aliases used by js/script.js, chatbot.js and look-builder.js.
   Keeps phone/WhatsApp links working without changing the data shape above. */
SALON_INFO.callPhone = SALON_INFO.phone.display;
SALON_INFO.whatsappNumber = SALON_INFO.whatsapp.number;
SALON_INFO.whatsappUrl = SALON_INFO.whatsapp.link;

/* Aasaan access ke liye global par attach kar dete hain */
window.SALON_INFO = SALON_INFO;
