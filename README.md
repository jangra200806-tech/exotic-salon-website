# 🏪 Exotic Hair & Beauty Unisex Salon - Website

A modern, responsive, and fast-loading website for **Exotic Hair & Beauty Unisex Salon** located in Kaithal, Haryana, India.

## 🚀 Live Website
**[https://exotic-salon.vercel.app](https://exotic-salon.vercel.app)**

---

## 📁 Project Structure

```
exotic-salon/
├── index.html                 # Home page
├── services.html              # Services page
├── gallery.html               # Gallery & videos page
├── contact.html               # Contact & booking page
├── data/
│   └── info.js                # All salon data (services, prices, timings, address, etc.)
├── css/
│   └── style.css              # Main stylesheet
├── js/
│   ├── script.js              # Main JS (renderers, header, mobile menu, gallery, videos)
│   ├── hero.js                # Hero slider engine
│   ├── chatbot.js             # AI assistant widget
│   ├── tour.js                # Voice tour engine
│   ├── look-builder.js        # Look Builder feature
│   ├── quiz.js                # Style match quiz
│   ├── robot3d.js             # 3D robot concierge
│   └── main.js                # Contact form handler
├── images/                    # All optimized images (JPG + WebP)
├── originals/                 # Original image backups
├── scripts/
│   ├── optimize-images.mjs    # Image optimization script
│   ├── minify-css.mjs         # CSS minification script
│   └── check-assets.mjs       # Asset verification script
├── vercel.json                # Vercel deployment config
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Hero Slider** | Full-screen auto-sliding hero with 3 slides, crossfade, zoom effect, dots navigation |
| 🤖 **Robot Chatbot** | Floating AI assistant with voice tour capability |
| 🎤 **Voice Tour** | Guided salon tour with audio and step counter |
| 💅 **Look Builder** | Mix and match salon services |
| 🧩 **Quiz** | Style match quiz for personalized recommendations |
| 📸 **Gallery + Lightbox** | Photo gallery with lightbox viewer |
| 📱 **Mobile Responsive** | Works on all devices (320px to 2560px+) |
| ⚡ **Fast Loading** | Optimized images, deferred CSS, lazy loading |
| 📅 **Booking Form** | Contact form for appointment booking |
| 📞 **Floating Buttons** | WhatsApp, Instagram, Call buttons |
| 🗺️ **Google Maps** | Integrated salon location map |

---

## 🛠️ Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom CSS with CSS variables, no frameworks
- **JavaScript (Vanilla)** - No jQuery or React
- **Google Fonts** - Playfair Display (headings) + Inter (body)
- **Vercel** - Hosting & deployment

---

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/jangra200806-tech/exotic-salon-website.git

# Navigate to project folder
cd exotic-salon-website

# Install dependencies (optional, for image optimization)
npm install

# Serve locally using any static server
npx serve .  # or use Live Server extension in VS Code
```

### Deployment (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## 📊 Performance Optimizations

### Images
- **WebP format** for all photos (78% quality)
- **Multiple sizes** (480w, 800w, 1200w, 1600w) with `srcset`
- **JPG fallback** for browsers without WebP support
- **Originals preserved** in `originals/` folder
- **5.43 MB saved** across all images

### CSS
- **Critical CSS inlined** for above-the-fold content
- **Non-blocking CSS** loading with `media="print" onload` technique
- **82 KB total** CSS file size

### JavaScript
- **`defer` attribute** on all scripts
- **Idle loading** for heavy features (quiz, look-builder)
- **RequestIdleCallback** with 3s timeout fallback

### Fonts
- **`display=swap`** for font loading
- **Preconnect** to Google Fonts
- **Only necessary weights** loaded (400, 500, 600)

---

## 📱 Responsive Breakpoints

| Screen Size | Layout |
|-------------|--------|
| 320px - 360px | Extra small phones |
| 360px - 480px | Small phones |
| 480px - 900px | Tablets |
| 900px - 1280px | Laptops |
| 1280px - 1920px | Desktop |
| 1920px+ | Large monitors/TV |

---

## 📸 Image Optimization Script

```bash
# Optimize all images (WebP + JPG fallback)
npm run images

# Minify CSS
npm run build:css

# Check all assets exist
node scripts/check-assets.mjs
```

---

## 📞 Contact Information

**Exotic Hair & Beauty Unisex Salon**  
📍 DSS 266, Huda Sector 20, Near Community Center, Kaithal, Haryana 136027  
📞 +91 9000 997 800  
💬 WhatsApp: +91 91708 20143  
🌐 Website: https://exotic-salon.vercel.app  
📧 Instagram: @exotic_hair_beauty_

**Timings:** Monday – Sunday, 9:00 AM – 10:00 PM  
**Rating:** 4.9 ★ (60+ Google reviews)

---

## 📄 License

This project is created for Exotic Hair & Beauty Unisex Salon. All rights reserved.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- Images sourced from Exotic Salon Kaithal
- Icons: SVG (inline)
- Fonts: Google Fonts (Playfair Display, Inter)
- Hosting: Vercel

---

**Last Updated:** November 2026  
**Version:** 1.0.0