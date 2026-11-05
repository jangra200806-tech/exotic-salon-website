# Exotic Salon — Content Check

This document lists every business claim on the website, its source, and whether it is confirmed (flag = true in data/info.js).

| Content | Value (current) | Source (file + key) | Confirmed? |
|---------|-----------------|---------------------|------------|
| Salon name | Exotic Hair & Beauty Unisex Salon | data/info.js: `name` | Fixed data |
| Brand name | Exotic Salon | data/info.js: `shortName` | Fixed data |
| Tagline | Where Beauty Meets Elegance | data/info.js: `tagline` | Fixed data |
| Phone (call) | 09000997800 | data/info.js: `callPhone` | From owner's data |
| Phone (tel link) | +919000997800 | data/info.js: `phone.tel` | From owner's data |
| WhatsApp number | 917082014381 | data/info.js: `whatsappNumber` | From owner's data |
| WhatsApp link | https://wa.me/917082014381 | data/info.js: `whatsapp.link` | From owner's data |
| Address | DSS 266, Huda Sector 20, Huda, Kaithal, Haryana 136027 | data/info.js: `address.full` | From owner's data |
| Landmark | Near Community Center | data/info.js: `address.landmark` | From owner's data |
| Timings | Monday – Sunday, 9:00 AM – 10:00 PM | data/info.js: `timings` | From owner's data |
| Open all 7 days | Yes | data/info.js: `timings.note` | From owner's data |
| Rating | 4.9★ | data/info.js: `rating.value` | From owner's data |
| Reviews count | 60+ | data/info.js: `rating.count` | From owner's data |
| Rating text | 4.9★ rated by 60+ customers in Kaithal | data/info.js: `rating.text` | From owner's data |
| Instagram | @exotic_hair_beauty_ | data/info.js: `instagram.handle` | From owner's data |
| Instagram URL | https://www.instagram.com/exotic_hair_beauty_/ | data/info.js: `instagram.url` | From owner's data |
| Map embed URL | https://www.google.com/maps?q=29.8128007,76.4155915&z=17&output=embed | data/info.js: `address.mapEmbed` | From owner's data |
| Map directions URL | https://www.google.com/maps/dir/?api=1&destination=29.8128007,76.4155915 | data/info.js: `address.mapLink` | From owner's data |
| Home services text | Home services available. Message us on WhatsApp to ask. | data/info.js: `homeService` | From owner's data |
| Founded year | 2019 | data/info.js: `founded` | From owner's data |

## Confirmation Flags

| Flag | Current Value | Content Affected |
|------|--------------|------------------|
| `confirmed.prices` | **false** | All service prices (₹ amounts), hero "starting prices", service cards, Look Builder totals, quiz results, offers discounts, chatbot price answers |
| `confirmed.durations` | **false** | All service durations (30 min, 3 hrs, etc.), hero "durations" text |
| `confirmed.offers` | **false** | Offers section (Save up to 20%, 15% OFF, Best Value), chatbot offer answers |
| `confirmed.parking` | **false** | "Free parking on the street" sentence on contact page |
| `confirmed.team` | **false** | Team section on home page, chatbot team answers, tour team mentions |
| `confirmed.testimonials` | **false** | Testimonials section (3 reviews), chatbot rating/review answers |
| `confirmed.popular` | **false** | "Popular" badges on service cards, chatbot "Popular starting prices" |

When any flag is `false`, the corresponding content is **hidden** from the website and chatbot responses.

## Owner Confirmation Checklist

- [ ] I have verified the phone number `09000997800` is correct for calls
- [ ] I have verified the WhatsApp number `917082014381` is correct for WhatsApp bookings
- [ ] I have verified the address `DSS 266, Huda Sector 20, Huda, Kaithal, Haryana 136027` is correct
- [ ] I have verified the timings `Monday – Sunday, 9:00 AM – 10:00 PM` are correct
- [ ] I have verified the rating `4.9★` and `60+` reviews are accurate
- [ ] I have verified each service price before setting `confirmed.prices = true`
- [ ] I have verified each service duration before setting `confirmed.durations = true`
- [ ] I have verified each offer (Bridal Package, Student Discount, Combo Offer) before setting `confirmed.offers = true`
- [ ] I have verified parking information before setting `confirmed.parking = true`
- [ ] I have verified team member details before setting `confirmed.team = true`
- [ ] I have verified testimonials/reviews before setting `confirmed.testimonials = true`
- [ ] I have verified which services are "Popular" before setting `confirmed.popular = true`
- [ ] I have verified the Google Maps pin location is correct for my salon
- [ ] I have set Vercel environment variables: CALLMEBOT_PHONE, CALLMEBOT_APIKEY, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SMTP_USER, SMTP_PASS, EMAIL_TO
- [ ] I have redeployed to Vercel after setting environment variables
