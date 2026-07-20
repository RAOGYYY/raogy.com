# Buyback Elite — Homepage Feature (Change Documentation)

This document captures **every change** that was made to the RAOGY homepage
(`raogy.com`) before it was reverted, so the same feature set can be re-added to
another site (e.g. **raogy.guide**).

It includes the full CSS, HTML, and JavaScript for the **Buyback Elite live-app
showcase** (a responsive, auto-playing, swipeable phone-screenshot carousel), plus
the supporting SEO, navigation, and content edits.

> Stack assumptions: the page uses **Tailwind CSS (CDN)** and the **Inter** font,
> same as raogy.com. All the section markup is Tailwind utility classes; only the
> carousel/phone-frame visuals rely on the custom CSS below.

---

## Table of contents

1. [Summary of all changes](#1-summary-of-all-changes)
2. [Prerequisites](#2-prerequisites)
3. [Image optimization step](#3-image-optimization-step)
4. [CSS — add to your `<style>` block](#4-css--add-to-your-style-block)
5. [Required helper classes](#5-required-helper-classes)
6. [HTML — the Buyback Elite section](#6-html--the-buyback-elite-section)
7. [JavaScript — the carousel](#7-javascript--the-carousel)
8. [Navigation links](#8-navigation-links)
9. [SEO / meta tags](#9-seo--meta-tags)
10. [Other content edits](#10-other-content-edits)
11. [Accessibility & performance notes](#11-accessibility--performance-notes)

---

## 1. Summary of all changes

| # | Change | Where |
|---|--------|-------|
| 1 | New **Buyback Elite** section with an 8-screenshot phone carousel (autoplay, swipe, dots, prev/next) | Homepage, below the iSellBack section |
| 2 | Optimized 8 app screenshots from ~3–5 MB PNGs to ~100–175 KB JPEGs | `assets/buyback-elite/1..8.jpg` |
| 3 | "Get it on Google Play" CTA + "Desktop app coming next" badge | Inside the new section |
| 4 | Added **App** link to desktop + mobile nav | Navbar |
| 5 | SEO: title, description, keywords, Open Graph, Twitter tags updated to feature Buyback Elite | `<head>` |
| 6 | iSellBack badge changed **"Launching Soon" → "Launching 2027"** | iSellBack section |
| 7 | Hero name changed **"RAOGY" → "Abdul Mannan"** | Hero |
| 8 | Founding-team photos swapped (Anwar Rao ⇄ Abdul Mannan) | iSellBack section + `/isellback` page |

App listing referenced: `https://play.google.com/store/apps/details?id=com.buybackelite.app&hl=en_IN`

---

## 2. Prerequisites

Include Tailwind and Inter in your `<head>` (raogy.guide likely already has these):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { darkMode: 'class' };
</script>
```

Dark mode is toggled by adding the `dark` class to `<html>`.

---

## 3. Image optimization step

The original screenshots were 3–5 MB PNGs (~30 MB total) — far too heavy for the
web. They were resized to 720 px wide and converted to ~82%-quality JPEG using
macOS `sips`, dropping the total to about 1 MB.

```bash
# Run from the folder that contains the source PNGs (1.png … 8.png)
mkdir -p assets/buyback-elite
for i in 1 2 3 4 5 6 7 8; do
  sips -s format jpeg -s formatOptions 82 --resampleWidth 720 \
    "assets/$i.png" --out "assets/buyback-elite/$i.jpg"
done
```

On Linux/Windows you can use ImageMagick instead:

```bash
for i in 1 2 3 4 5 6 7 8; do
  magick "assets/$i.png" -resize 720x -quality 82 "assets/buyback-elite/$i.jpg"
done
```

Place the results in `assets/buyback-elite/1.jpg … 8.jpg`. The screenshots have an
aspect ratio of roughly **1386 × 2483** (used by the `.phone-screen` CSS below).

---

## 4. CSS — add to your `<style>` block

```css
/* ===== Buyback Elite — Live App Showcase ===== */
.bbe-section {
  background: linear-gradient(180deg, #ffffff 0%, #f3f0ff 55%, #eef4ff 100%);
  position: relative;
}
.dark .bbe-section {
  background: linear-gradient(180deg, #050309 0%, #0b0820 55%, #08060f 100%);
}
.bbe-section::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  background:
    radial-gradient(ellipse 50% 40% at 15% 20%, rgba(16, 185, 129, 0.16), transparent 60%),
    radial-gradient(ellipse 55% 45% at 85% 80%, rgba(139, 92, 246, 0.16), transparent 60%);
}
.dark .bbe-section::before { opacity: 1; }

/* Carousel track (native scroll-snap) */
.bbe-carousel {
  display: flex;
  gap: 1.75rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 1.5rem 0.5rem 2rem;
  scroll-padding: 0 50%;
}
.bbe-carousel::-webkit-scrollbar { display: none; }
.bbe-slide {
  scroll-snap-align: center;
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
}

/* Phone frame */
.phone-frame {
  position: relative;
  width: 248px;
  max-width: 70vw;
  border-radius: 2.4rem;
  padding: 0.55rem;
  background: linear-gradient(155deg, #2a2a3a 0%, #16161f 100%);
  box-shadow: 0 30px 60px -25px rgba(15, 23, 42, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s;
}
.dark .phone-frame {
  box-shadow: 0 30px 70px -25px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06) inset, 0 0 40px -10px rgba(139, 92, 246, 0.35);
}
.phone-frame:hover { transform: translateY(-8px); }
.phone-frame::before {
  content: '';
  position: absolute;
  top: 0.95rem;
  left: 50%;
  transform: translateX(-50%);
  width: 46%;
  height: 1.05rem;
  background: #16161f;
  border-radius: 0 0 0.9rem 0.9rem;
  z-index: 3;
}
.phone-screen {
  position: relative;
  border-radius: 1.9rem;
  overflow: hidden;
  background: #000;
  aspect-ratio: 1386 / 2483;
}
.phone-screen img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Prev / next buttons */
.bbe-nav-btn {
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.06);
  color: #4b5563;
  box-shadow: 0 8px 24px -10px rgba(15, 23, 42, 0.4);
  transition: all 0.25s ease;
}
.dark .bbe-nav-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  color: #e5e7eb;
}
.bbe-nav-btn:hover {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff;
  border-color: transparent;
  transform: scale(1.08);
}

/* Dots */
.bbe-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: rgba(100, 116, 139, 0.35);
  transition: all 0.3s ease;
  cursor: pointer;
}
.bbe-dot.active {
  width: 26px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
}

/* Google Play button */
.gplay-btn { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.gplay-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 40px -12px rgba(16, 185, 129, 0.55);
}

@media (max-width: 640px) {
  .phone-frame { width: 230px; }
}

/* Respect reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .bbe-carousel { scroll-behavior: auto; }
}
```

---

## 5. Required helper classes

The section markup reuses two classes that exist elsewhere on raogy.com. If your
target site doesn't have them, add these too:

```css
.cta-gradient-text {
  background: linear-gradient(135deg, #a78bfa 0%, #ec4899 50%, #60a5fa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.feature-card-hover { transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.feature-card-hover:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px -15px rgba(139, 92, 246, 0.25);
}
```

---

## 6. HTML — the Buyback Elite section

Paste this section into the page where you want it (on raogy.com it sat directly
below the iSellBack section and above Contact). Update the image paths and the
Play Store URL if needed.

```html
<!-- ===== Buyback Elite — Live App Showcase ===== -->
<section id="app" class="relative py-24 md:py-32 overflow-hidden bbe-section">
  <div class="container mx-auto px-6 relative z-10">
    <div class="max-w-5xl mx-auto">

      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-400/20 backdrop-blur-md mb-7">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300 tracking-[0.2em] uppercase">Now Live on Google Play</span>
        </div>

        <h2 class="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-[1.1] text-gray-900 dark:text-white">
          Buyback <span class="cta-gradient-text">Elite</span>
        </h2>
        <p class="text-base md:text-lg text-gray-600 dark:text-gray-300/90 max-w-2xl mx-auto leading-relaxed">
          Our first shipped product — a mobile app that lets you instantly value and sell your MacBook, iPad &amp; Apple devices for cash. Proof that the team behind iSellBack is already building and shipping.
        </p>
      </div>

      <!-- Carousel -->
      <div class="relative">
        <div id="bbe-carousel" class="bbe-carousel">
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/1.jpg" alt="Buyback Elite app — home screen" loading="lazy" width="720" height="1290" /></div></div></div>
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/2.jpg" alt="Buyback Elite app — device selection" loading="lazy" width="720" height="1290" /></div></div></div>
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/3.jpg" alt="Buyback Elite app — instant valuation" loading="lazy" width="720" height="1290" /></div></div></div>
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/4.jpg" alt="Buyback Elite app — quote details" loading="lazy" width="720" height="1290" /></div></div></div>
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/5.jpg" alt="Buyback Elite app — sell flow" loading="lazy" width="720" height="1290" /></div></div></div>
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/6.jpg" alt="Buyback Elite app — order tracking" loading="lazy" width="720" height="1290" /></div></div></div>
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/7.jpg" alt="Buyback Elite app — payout" loading="lazy" width="720" height="1290" /></div></div></div>
          <div class="bbe-slide"><div class="phone-frame"><div class="phone-screen"><img src="/assets/buyback-elite/8.jpg" alt="Buyback Elite app — profile" loading="lazy" width="720" height="1290" /></div></div></div>
        </div>

        <!-- Controls -->
        <div class="flex items-center justify-center gap-5 mt-2">
          <button class="bbe-nav-btn" aria-label="Previous screenshot" onclick="bbeMove(-1)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div id="bbe-dots" class="flex items-center gap-2"></div>
          <button class="bbe-nav-btn" aria-label="Next screenshot" onclick="bbeMove(1)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      <!-- App highlights -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-14 mb-12">
        <div class="feature-card-hover bg-white/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl p-6 text-center shadow-sm dark:shadow-none">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-bold text-sm mb-1.5">Instant Quotes</h4>
          <p class="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">Get a fair price for your device in seconds, right from your phone.</p>
        </div>
        <div class="feature-card-hover bg-white/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl p-6 text-center shadow-sm dark:shadow-none">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-bold text-sm mb-1.5">Safe &amp; Tracked</h4>
          <p class="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">Track every order from pickup to payout with full transparency.</p>
        </div>
        <div class="feature-card-hover bg-white/80 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl p-6 text-center shadow-sm dark:shadow-none">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </div>
          <h4 class="text-gray-900 dark:text-white font-bold text-sm mb-1.5">Fast Payouts</h4>
          <p class="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">Direct-to-account payment once your device is confirmed.</p>
        </div>
      </div>

      <!-- CTA: Google Play + Desktop teaser -->
      <div class="flex flex-col items-center gap-6">
        <a href="https://play.google.com/store/apps/details?id=com.buybackelite.app&hl=en_IN" target="_blank" rel="noopener noreferrer"
           class="gplay-btn inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-black text-white shadow-lg">
          <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.2 2.3c-.3.2-.5.6-.5 1.1v17.2c0 .5.2.9.5 1.1l9.1-9.7-9.1-9.7zM14.6 13l2.7 2.9-9.6 5.5 6.9-8.4zM18.3 9.5l2.9 1.7c.8.5.8 1.6 0 2.1l-2.9 1.7-3-3.2 3-2.3zM7.7 2.6l9.6 5.5-2.7 2.9-6.9-8.4z" />
          </svg>
          <span class="text-left leading-tight">
            <span class="block text-[10px] uppercase tracking-wide text-gray-300">Get it on</span>
            <span class="block text-base font-bold -mt-0.5">Google Play</span>
          </span>
        </a>

        <div class="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/70 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] text-sm text-gray-600 dark:text-gray-300 backdrop-blur text-center">
          <svg class="w-4 h-4 flex-shrink-0 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          <span><span class="font-semibold text-gray-900 dark:text-white">Desktop app coming next</span> — the same experience on Mac &amp; Windows.</span>
        </div>
      </div>

    </div>
  </div>
</section>
```

---

## 7. JavaScript — the carousel

Place this before `</body>` (or inside your existing script block). It builds the
dots, wires prev/next, syncs the active dot while swiping, autoplays every 4.5 s,
pauses on hover/touch, only autoplays while the section is on screen, and respects
`prefers-reduced-motion`.

```html
<script>
// Buyback Elite carousel
(function () {
  const track = document.getElementById('bbe-carousel');
  const dotsWrap = document.getElementById('bbe-dots');
  if (!track || !dotsWrap) return;
  const slides = Array.from(track.querySelectorAll('.bbe-slide'));
  let current = 0;
  let autoTimer = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'bbe-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to screenshot ' + (i + 1));
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function setActive(i) {
    current = i;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
  }

  function goTo(i, userAction) {
    const max = slides.length - 1;
    i = i < 0 ? max : (i > max ? 0 : i);
    const slide = slides[i];
    const left = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2;
    track.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
    setActive(i);
    if (userAction) restartAuto();
  }

  window.bbeMove = function (dir) { goTo(current + dir, true); };

  // Sync dots while scrolling/swiping
  let raf = null;
  track.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0, bestDist = Infinity;
      slides.forEach((s, idx) => {
        const c = s.offsetLeft + s.offsetWidth / 2;
        const d = Math.abs(c - center);
        if (d < bestDist) { bestDist = d; best = idx; }
      });
      setActive(best);
      raf = null;
    });
  }, { passive: true });

  function startAuto() {
    if (reduceMotion) return;
    autoTimer = setInterval(() => goTo(current + 1, false), 4500);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  function restartAuto() { stopAuto(); startAuto(); }

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);
  track.addEventListener('touchstart', stopAuto, { passive: true });

  // Only autoplay when section is visible
  const sec = document.getElementById('app');
  if (sec && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      entries.forEach(e => e.isIntersecting ? startAuto() : stopAuto());
    }, { threshold: 0.25 }).observe(sec);
  } else {
    startAuto();
  }

  // Center first slide on load
  window.addEventListener('load', () => goTo(0, false));
})();
</script>
```

---

## 8. Navigation links

An **App** link was added to both the desktop and mobile menus, pointing to the
new section anchor `#app`.

Desktop nav:

```html
<a href="#app" class="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white transition-colors">App</a>
```

Mobile nav:

```html
<a href="#app" class="mobile-menu-item text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">App</a>
```

---

## 9. SEO / meta tags

These `<head>` tags were updated to feature Buyback Elite alongside iSellBack.

```html
<title>RAOGY - iSellBack & Buyback Elite | Sell Your MacBook & iPad the Smart Way</title>
<meta name="description"
  content="RAOGY builds iSellBack — a premium B2C buyback platform for Apple devices. Our app Buyback Elite is now live on Google Play. Get instant MacBook & iPad valuations and sell seamlessly.">
<meta name="keywords"
  content="RAOGY, iSellBack, Buyback Elite, MacBook buyback, iPad sell, Apple device recommerce, sell MacBook app, gadget valuation, recommerce platform, web developer, iOS developer, Android developer">

<!-- Open Graph -->
<meta property="og:title" content="RAOGY - iSellBack & Buyback Elite | Sell Your MacBook & iPad">
<meta property="og:description"
  content="Premium B2C buyback platform for Apple devices. Our app Buyback Elite is now live on Google Play — get instant valuations and sell seamlessly.">

<!-- Twitter -->
<meta name="twitter:title" content="RAOGY - iSellBack & Buyback Elite | Sell Your MacBook & iPad">
<meta name="twitter:description" content="Premium B2C buyback platform for Apple devices. Buyback Elite is live on Google Play.">
```

Adapt the wording/branding for **raogy.guide** as needed.

---

## 10. Other content edits

**iSellBack launch badge** — changed from "Launching Soon" to a concrete year:

```html
<span class="text-xs font-bold text-emerald-700 dark:text-white/90 tracking-[0.2em] uppercase">Launching 2027</span>
```

**Hero heading name** — was changed from `RAOGY` to `Abdul Mannan`:

```html
<h1 class="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
  Hi, I'm <span class="gradient-text">Abdul Mannan</span>
</h1>
```

**Founding-team photos** — the two founder portraits were swapped:

- Anwar Rao card → `/assets/Abdul.jpg`
- Abdul Mannan card → `/assets/RAOGY.jpg`

(Keep the `alt` text matching the person's name; only the `src` was swapped.)

---

## 11. Accessibility & performance notes

- **Lazy loading:** every screenshot uses `loading="lazy"` with explicit
  `width`/`height` to avoid layout shift (CLS).
- **Reduced motion:** autoplay is disabled and smooth-scroll becomes instant when
  the user prefers reduced motion.
- **Autoplay is polite:** it only runs while the section is in the viewport and
  pauses on hover/touch.
- **Keyboard/ARIA:** prev/next buttons and dots have `aria-label`s; dots are real
  `<button>` elements.
- **Image weight:** keep the optimized JPEGs (~100–175 KB each). Do not ship the
  multi-MB source PNGs.
- **Touch:** the carousel is a native scroll-snap container, so swipe works with
  no extra JS/library.

---

*Generated from the pre-revert version of `raogy.com` (commit `b319bc8`).*
