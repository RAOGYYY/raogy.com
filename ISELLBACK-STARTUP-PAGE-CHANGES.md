# raogy.com — Startup Progress Page (Change Log)

**Date:** 26 August 2026
**Base commit before these changes:** `86770d9`
**Goal:** remove the "Latest Articles" blog block, and turn raogy.com back into a credible
front door for the **iSell Back** startup so a reviewer can see how far the work has come
since the first $1,000 Kiro credit grant.

Nothing was deleted from disk except HTML markup inside `index.html`. Every removal is
reproduced verbatim in this file so it can be restored.

---

## Table of contents

1. [Files touched](#1-files-touched)
2. [Removals — blog / Latest Articles](#2-removals--blog--latest-articles)
3. [Additions — homepage startup spotlight](#3-additions--homepage-startup-spotlight)
4. [Rewrite — /isellback progress report](#4-rewrite--isellback-progress-report)
5. [SEO, sitemap, routing](#5-seo-sitemap-routing)
6. [False claims that were removed](#6-false-claims-that-were-removed)
7. [Facts used, and where each one comes from](#7-facts-used-and-where-each-one-comes-from)
8. [How to revert](#8-how-to-revert)
9. [Verification performed](#9-verification-performed)

---

## 1. Files touched

| File | Change |
|---|---|
| `index.html` | Blog section + nav links + loader script removed. New `#startup` section added after the hero. SEO meta + JSON-LD updated. |
| `isellback/index.html` | **Fully rewritten** as a startup progress report. |
| `sitemap.xml` | 6 blog URLs removed. `/isellback` and `/#startup` added. |
| `.htaccess` | `isellback` added to the two subdirectory clean-URL rewrite rules. |
| `ISELLBACK-STARTUP-PAGE-CHANGES.md` | This file (new). |

**Deliberately left alone:**

- `blog/` directory (`index.html`, `post.html`, `posts.json`) — still on disk, still
  reachable by direct URL. Only unlinked and de-indexed.
- `vercel.json` blog rewrites — untouched, so old `/blog/:slug` links do not 404.
- `js/supabase-config.js` — `window.raogyLoadPublishedPosts` is still used by
  `blog/index.html:202` and `blog/post.html:306`. Do not remove it.
- `BUYBACK-ELITE-CHANGES.md` — the earlier change log for the reverted homepage carousel.
- `portfolio/projects.json` and the whole Portfolio section — kept. A shipping track record
  helps the credit application rather than hurting it.

---

## 2. Removals — blog / Latest Articles

### 2.1 Desktop nav link

Replaced with a Startup link:

```html
<!-- REMOVED -->
<a href="/blog/"
  class="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium tracking-wide">
  Blog
</a>

<!-- ADDED IN ITS PLACE -->
<a href="/isellback"
  class="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm font-medium tracking-wide">
  Startup
</a>
```

### 2.2 Mobile nav link

```html
<!-- REMOVED -->
<a href="/blog/"
  class="mobile-menu-item text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">Blog</a>

<!-- ADDED IN ITS PLACE -->
<a href="/isellback"
  class="mobile-menu-item text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">Startup</a>
```

### 2.3 The "Latest Articles" section

Sat between the Portfolio section and the cosmic CTA section. Removed in full:

```html
<!-- Blog Preview Section -->
<section id="blog"
  class="py-20 bg-gradient-to-br from-gray-50/60 to-purple-50/60 dark:from-slate-900/40 dark:to-slate-800/40 backdrop-blur-sm">
  <div class="container mx-auto px-6">
    <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
      <div class="text-center md:text-left">
        <h2 class="text-4xl md:text-5xl font-bold mb-2">Latest <span class="gradient-text">Articles</span></h2>
        <div class="w-20 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mx-auto md:mx-0"></div>
        <p class="text-gray-600 dark:text-gray-400 mt-3 text-sm">Thoughts on mobile, web &amp; shipping real products
        </p>
      </div>
      <a href="/blog/"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
        View All Articles
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </a>
    </div>

    <div id="blog-preview-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- Posts injected by JS from /blog/posts.json -->
      <div class="text-center col-span-full py-8 text-gray-500 dark:text-gray-400 text-sm">Loading articles…</div>
    </div>
  </div>
</section>
```

The tag/category chips the user wanted gone were the `p.tags` badges rendered inside these
cards, so they went with the section.

### 2.4 The blog preview loader

45 lines removed from the bottom script block, immediately above the
`loadPortfolio()` IIFE:

```js
    // =========================
    // Blog preview loader (fetches /blog/posts.json)
    // =========================
    (function loadBlogPreview() {
      const grid = document.getElementById('blog-preview-grid');
      if (!grid) return;
      window.raogyLoadPublishedPosts()
        .then(all => {
          const posts = all
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);
          const data = { posts };
          if (!posts.length) {
            grid.innerHTML = '<div class="text-center col-span-full py-8 text-gray-500 dark:text-gray-400 text-sm">No articles yet — check back soon.</div>';
            return;
          }
          grid.innerHTML = posts.map(p => `
                        <a href="/blog/${encodeURIComponent(p.slug)}" class="tilt-3d group block bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300">
                            <div class="h-36 bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 relative overflow-hidden">
                                ${p.cover ? `<img src="${p.cover}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.style.display='none'">` : ''}
                                <div class="absolute top-2 left-2 flex flex-wrap gap-1">
                                    ${(p.tags || []).slice(0, 2).map(t => `<span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-white/90 dark:bg-slate-900/80 text-gray-800 dark:text-gray-200 backdrop-blur">${t}</span>`).join('')}
                                </div>
                            </div>
                            <div class="p-4">
                                <div class="text-[11px] uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold mb-1.5 flex items-center gap-2">
                                    <span>${new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    <span>•</span>
                                    <span>${p.readTime || '3 min read'}</span>
                                </div>
                                <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1.5 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">${p.title}</h3>
                                <p class="text-gray-600 dark:text-gray-400 text-xs leading-relaxed line-clamp-3">${p.excerpt || ''}</p>
                                <span class="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    Read more
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </span>
                            </div>
                        </a>
                    `).join('');
        })
        .catch(() => {
          grid.innerHTML = '<div class="text-center col-span-full py-8 text-gray-500 dark:text-gray-400 text-sm">Unable to load articles right now.</div>';
        });
    })();
```

### 2.5 Sitemap

Removed the `<!-- Blog -->` comment and 6 `<url>` blocks (29 → 23 blocks, before the
new additions in §5). Restore by re-adding:

```xml
    <!-- Blog -->
    <url><loc>https://raogy.com/blog/</loc><lastmod>2026-04-19</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
    <url><loc>https://raogy.com/blog/building-paani-boss-ro-service-management</loc><lastmod>2026-04-18</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
    <url><loc>https://raogy.com/blog/why-flutter-still-wins-in-2026</loc><lastmod>2026-04-10</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
    <url><loc>https://raogy.com/blog/supabase-row-level-security-cheatsheet</loc><lastmod>2026-04-03</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
    <url><loc>https://raogy.com/blog/3d-web-effects-without-threejs</loc><lastmod>2026-03-28</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
    <url><loc>https://raogy.com/blog/control-panel-raogy-dot-com</loc><lastmod>2026-04-20</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>
```

---

## 3. Additions — homepage startup spotlight

A new `<section id="startup">` was inserted **between the hero (`#home`) and the About
section (`#about`)**, so it is the first content block a reviewer sees after the hero.

Layout: 5-column grid on large screens. Left (3 cols) carries the narrative and three
CTAs; right (2 cols) carries a 6-tile metric card, a stack tag row, and a one-line
pre-revenue disclaimer.

CTAs it contains:

| Button | Destination |
|---|---|
| Read the progress report | `/isellback` |
| Open isellback.com | `https://isellback.com` |
| Google Play | `https://play.google.com/store/apps/details?id=com.buybackelite.app&hl=en_IN` |

Metric tiles: `6` shipped apps, `47` migrations, `139` RLS policies, `146` test files,
`119` Postgres functions, `194` Kiro spec tasks closed.

To remove this section later, delete everything from the
`<!-- ===== Startup Spotlight — iSell Back ===== -->` comment down to the closing
`</section>` immediately before `<!-- About Section -->`.

---

## 4. Rewrite — /isellback progress report

`isellback/index.html` was replaced entirely. The previous version (286 lines) was an
architecture overview containing several claims the codebase does not support — see §6.

New structure:

| # | Section | Purpose |
|---|---|---|
| — | Hero | Live badges, positioning, three CTAs |
| — | Summary in one paragraph | The whole case in ~90 words, for a skim-reader |
| 01 | What changed since the first grant | 9-row then-vs-now table. **The most important section for the credit application.** |
| 02 | By the numbers | 8 metric tiles + 3 breakdown cards |
| 03 | The six surfaces | Customer / agent / operator, plus a 4-step lifecycle timeline |
| 04 | How the credits were spent | Kiro spec table with per-spec task completion bars |
| 05 | The parts that are hard to fake | 6 engineering invariants + the bundle-size before/after |
| 06 | Current stack | 4 columns, no aspirational entries |
| 07 | Where this honestly stands | Pre-revenue, flags still off, open work |
| 08 | What the next phase needs | 5 prioritised items = the funding rationale |
| 09 | Founders | Anwar Rao, Abdul Mannan |
| — | CTA + footer | |

Section 07 is deliberately unflattering. In a credit review, a founder who names their own
gaps reads as more credible than one who does not, and it means nothing on the page can be
contradicted by a reviewer who goes looking.

---

## 5. SEO, sitemap, routing

### 5.1 `index.html` head

| Tag | Before | After |
|---|---|---|
| `<title>` | `RAOGY - Web, iOS & Android App Developer \| Full-Stack & Mobile Solutions` | `RAOGY — Home of iSell Back \| Web, iOS & Android App Developer` |
| `description` | developer-only | leads with iSell Back, keeps the dev services |
| `keywords` | no startup terms | adds iSell Back, Buyback Elite, device recommerce India, Kiro spec-driven development |
| `og:title` / `twitter:title` | `RAOGY - Web, iOS & Android App Developer` | `RAOGY — Home of iSell Back` |
| `og:description` / `twitter:description` | developer-only | startup + progress report |

Original values are in git at `86770d9` if the developer-first framing is ever wanted back.

### 5.2 JSON-LD

The single `ProfessionalService` node became an `@graph` with three nodes:

- `ProfessionalService` — `https://raogy.com/#service`, unchanged content
- `Organization` — `https://raogy.com/isellback#organization`, iSell Back, `alternateName`
  Buyback Elite, `areaServed` India, both founders
- `WebPage` — `https://raogy.com/isellback#report`, the progress report, linked to the
  Organization via `about` and to the service via `isPartOf`

### 5.3 Sitemap additions

```xml
    <!-- iSell Back — Startup Progress Report -->
    <url>
        <loc>https://raogy.com/isellback</loc>
        <lastmod>2026-08-26</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://raogy.com/#startup</loc>
        <lastmod>2026-08-26</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
```

### 5.4 Routing

`/isellback` already resolves on Vercel because `vercel.json` sets `"cleanUrls": true` and
`"trailingSlash": false`, so `isellback/index.html` is served at `/isellback`. No
`vercel.json` change was needed.

`.htaccess` was updated anyway so an Apache deploy behaves identically — `isellback` was
added to both subdirectory rules:

```apache
RewriteRule ^(screenscribe|paaniboss|rewardnest|snapscribe|krexo|isellback)/([^\.]+)$ $1/$2.html [NC,L]
...
RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\ /(screenscribe|paaniboss|rewardnest|snapscribe|krexo|isellback)/([^.]+)\.html\ HTTP
RewriteRule ^(screenscribe|paaniboss|rewardnest|snapscribe|krexo|isellback)/([^.]+)\.html$ /$1/$2 [R=301,L]
```

---

## 6. False claims that were removed

The old `/isellback` page asserted things that are not in the codebase. Anyone verifying the
application would have found the gap, so they are gone. Recorded here so they are not
reintroduced by accident.

| Old claim | Reality |
|---|---|
| "powered by secure **AWS infrastructure**" | No AWS SDK, service call or dependency exists anywhere in the monorepo. The stack is Supabase, Firebase FCM, Razorpay, Vercel. |
| "dynamic **ML pricing** engines" | No ML or AI runtime library anywhere. Pricing is deterministic SQL: base price minus condition deductions. |
| Heading: "**AWS Infrastructure Scaling**" | Removed. Replaced with the actual hosting description. |
| CTO bio: "...and **ML pricing logic**" | Replaced with schema, RLS, payments, CI — what is actually owned. |
| `field.buybackelite.com` | Dead host. Now `agent.isellback.com`. |
| `control.buybackelite.com` | Dead host. Now `control.isellback.com`. Fixing this was audit finding H2. |

The honest version of the AI story is the stronger one anyway: the credits funded
**Kiro spec-driven development**, and the six specs under `.kiro/specs/` with their tracked
task lists are auditable proof of exactly what the money produced.

---

## 7. Facts used, and where each one comes from

Every number on both pages is a count from
`/Users/apple/Downloads/My All Projects/iSellback 31 Jul (new)/iSellback New 26 Jun/`.
If any of these change, update both `index.html` (`#startup` tiles) and
`isellback/index.html` (§02 and the §01 table).

| Claim | Source |
|---|---|
| 6 shipped surfaces (3 web, 3 Android) | `buybackelite-com-main`, `Admin-main`, `agent-master`, `buyback_app_fixed_app`, `buyback_admin_app`, `buyback_agent_app` |
| 47 migrations | `migrations/0001…0047` (mirrored as 56 timestamped files in `supabase/migrations/`) |
| ~77 tables, 119 functions, 139 RLS policies, 62 triggers, 160 indexes | SQL statement counts across `db_setup/` + `migrations/` |
| 14 `canonical_*` RPCs | server-authoritative pricing/lifecycle function set |
| 13 serverless handlers | `Admin-main/api/` |
| 1 Edge Function + 5 Deno tests | `supabase/functions/send-push-notification/` |
| 146 test files | 68 JS/JSX (Vitest) + 43 Dart + 5 Deno + 30 generated E2E |
| 6-job CI, 250 KB gz budget gate | `.github/workflows/ci.yml` |
| 134.8 KB gz first load, was 297 KB gz / 1,112 KB / 0 split points | `.kiro/specs/store-discovery-launch/requirements.md`, `ui-overhaul` design doc |
| 35 models (21 MacBook, 14 iPad), 56 deduction rows | `db_setup/seed_catalog.mjs` |
| ~70 mobile spec entries | `buyback_app_fixed_app/lib/config/model_specifications.dart` |
| 194 / 258 spec tasks | task checkboxes across the four specs that carry task lists |
| Per-spec: 54/54, 52/75, 61/92, 27/37 | `ui-overhaul`, `multi-tenant-marketplace`, `production-hardening`, `india-launch-audit` |
| App ids and versions | `com.buybackelite.app` v1.0.4+5 · `com.buyback.app` v1.0.1+2 · `com.buyback.agent` v1.0.1+2 |
| Seoul region, 150–250 ms to India | stated as a design constraint in the specs |
| July 2026 audit, 11 findings, static review only | `AUDIT_REPORT_2026-07-24.md` |
| Notifications dormant behind a flag | migration `0045_notification_registry.sql` |
| Private media flag off by default | `VITE_PRIVATE_MEDIA_CAPTURE` / `PRIVATE_MEDIA_CAPTURE` |
| 11 unrouted Flutter marketplace screens | `store-discovery-launch` requirements |

### Numbers deliberately **not** claimed

No user count, signup count, order count, GMV, revenue, install count or launch date appears
on either page, because none of those exist in the repository and none could be verified.
Do not add them to look better — a reviewer asking for the source is the one thing that
would actually damage the application.

---

## 8. How to revert

**Everything, back to the pre-change state:**

```bash
cd "/Users/apple/Downloads/My All Projects/raogy.guide/raogy.com 25-3-26"
git checkout 86770d9 -- index.html sitemap.xml .htaccess isellback/index.html
rm ISELLBACK-STARTUP-PAGE-CHANGES.md
```

**Bring back only the blog, keep the startup page:**

1. Re-add the two nav links from §2.1 and §2.2 (or keep both Blog and Startup).
2. Re-insert the section from §2.3 before `<!-- CTA Section — Deep space...`.
3. Re-insert the loader from §2.4 above the `loadPortfolio()` IIFE.
4. Re-add the sitemap URLs from §2.5.

**Remove only the startup spotlight, keep the blog removal:**

Delete the `<section id="startup">` block described in §3, and drop the `/#startup` sitemap
entry. `/isellback` keeps working on its own.

---

## 9. Verification performed

- HTML well-formedness: both `index.html` and `isellback/index.html` parse with zero
  unclosed tags and zero mismatched end tags.
- `sitemap.xml` parses as valid XML — 25 URLs, no `/blog` entries remaining.
- JSON-LD parses as valid JSON, `@graph` resolves to
  `[ProfessionalService, Organization, WebPage]`.
- Zero remaining occurrences of `blog` in `index.html`.
- Zero occurrences of `AWS`, `ML pricing`, `machine learning`, `buybackelite.com` or
  `field.buyback` in `isellback/index.html`.
- Served locally over HTTP: `/` returned 200, `/isellback/` returned 200.
- Every internal `href` resolves to a file that exists; every on-page anchor
  (`#home`, `#startup`, `#about`, `#services`, `#portfolio`, `#contact`, `#main`,
  `#next-phase`) has a matching `id`.
- Founder images `assets/RAOGY.jpg` and `assets/Abdul.jpg` confirmed present.
- External links confirmed reachable: `isellback.com` → 200 (title
  "Sell MacBook & iPad Online in India | iSell Back"), `control.isellback.com` → 200,
  Play Store listing → 200 (`og:title` "BuyBack Elite: Sell Mac & iPad").
- `146 = 68 + 43 + 5 + 30` — the total and its published breakdown agree.

**Not verified:** whether the 47 migrations are actually applied to the live production
database, and whether the admin and agent Android apps are published on Play (only the
customer app listing was confirmed reachable). Both are stated on the page in terms of what
is built, not what is deployed.

---

## 10. Follow-up: public / private split (same day)

After review, the credit-application material was separated from the public page. The
reasoning: raogy.com is read by customers, competitors and prospective partner stores, not
only by a credit reviewer. Content that reads as commendable candour to a reviewer reads as
"this company is broke and has open security holes" to a customer about to hand over a
₹1 lakh device and their bank details.

Same facts, split by audience.

### Removed from the public pages

| Removed | Where it was | Why |
|---|---|---|
| "$1,000 in Kiro startup credits" | `isellback/index.html` summary + §01 + §04 + §08 + `og:description`; `index.html` `#startup` | Publicly discloses how thinly funded the company is. |
| "The credits are now exhausted" | `isellback/index.html` summary + §08 | Reads as "may not exist next month" to a customer. |
| "iSell Back is pre-revenue" | `isellback/index.html` §07; `index.html` disclaimer line | Same trust problem on a page meant to build confidence. |
| Agent access to payment details not yet masked | `isellback/index.html` §07 | Publicly advertising an unfixed access-control weakness on a live payout system. |
| Private-media capture flag off by default | `isellback/index.html` §07 | Same — states identity documents are still on the public storage path. |
| Launch-gate harness never run against live | `isellback/index.html` §07 + §08 item 2 | Tells an attacker which invariant is unverified in production. |
| The $5,000 ask | never added | Belongs in the application form; on a public page the whole site reads as a funding request. |

### Reframed, not deleted

- **§01 table header** "At the $1,000 grant" → "Prototype phase". The delta story survives
  without the funding disclosure.
- **§07** "Where this honestly stands" → **"How the work is governed"**. Same underlying
  facts — staged rollout behind flags, additive schema changes, written proposals for
  anything touching pricing/access/payments, findings tracked to closure in a spec — but
  framed as engineering discipline rather than as a list of things that are broken. The
  July 2026 static-review caveat was kept, because that one is honesty with no downside.
- **§08 intro** "It is now exhausted" → "The build phase is largely done".
- **§08 item 2** "never been run against a real provisioned environment" → "re-running them
  against the provisioned India environment is the sign-off step".
- **§08 closing box** "Why credits specifically" → "Infrastructure, not features".
- **Summary paragraph** now opens "iSell Back started as a single-business prototype…"
  with no timeframe claim (the repo dates could not be reconciled with filesystem mtimes,
  so no "N months ago" figure is asserted).

### Test count tightened

`146` → **`116`**, relabelled "hand-written test files".

The old 146 bundled in 30 generated TestSprite scripts whose single recorded run was
4 pass / 8 fail / 18 blocked. Leading with a number whose weakest third is a mostly-blocked
suite was the one soft spot a reviewer could have pushed on. 116 = 68 JS/JSX + 43 Dart +
5 Deno, all hand-written and all green in CI. The generated suite is now a one-line footnote
in the breakdown card instead of a third of the headline.

Updated in four places: `index.html` metric tile, and `isellback/index.html` summary
paragraph, §01 table row, §02 metric tile + breakdown card.

### New file — NOT committed

`APPLICATION-NOTES.md` holds the private half: the ROI paragraph, the plain status
statement, the three unfixed security gaps with audit finding ids, the $5,000 ask with
allocation, the AWS answer, and the full fact→source table.

It is **gitignored** (`.gitignore` line 47). This matters: the repo is public, so committing
it would have published the security gaps to GitHub and defeated the entire split. An
"unlisted" URL is not sufficient either — unlisted is not private.

Recommendation recorded in that file: close audit findings **H3** (agent payment masking)
and **H1** (private-media cutover) before the application goes in. "Found it, fixed it,
here is the migration" is a materially stronger story than "found it, drafted a proposal".

### Verification after the split

- Both pages: 0 unclosed tags, 0 mismatched end tags. JSON-LD valid. Sitemap valid.
- Zero occurrences across both public pages of: `$1,000`, `exhausted`, `pre-revenue`,
  `Column-level masking`, `payment details from agents`, `off by default`,
  `not yet executed`, `AWS`, `$5,000`, `bank_details`.
- `146` gone from both; `116` present in both.
- `git check-ignore` confirms `APPLICATION-NOTES.md` is ignored.
- Line endings preserved as committed: `index.html` CRLF, `sitemap.xml` CRLF,
  `isellback/index.html` LF.
- Served locally: `/` 200, `/isellback` 200.
