# RAOGY Control Panel — Setup Guide

A lightweight admin panel to manage the RAOGY blog without touching git every time you publish a post.

- **URL (local):** `http://localhost:5174/control/`
- **URL (prod):** `https://control.raogy.com/` (after DNS setup — see below)
- **Default passphrase:** `raogy-admin-2026` → **change this in `config.js` immediately!**

---

## 1. Quick Start (Local mode)

This is what's enabled out of the box. **No backend required.**

1. Start the control panel server:
   ```powershell
   python -m http.server 5174
   ```
   (run from the repo root)

2. Open `http://localhost:5174/control/` in your browser.
3. Enter the passphrase from `control/config.js`.
4. Create / edit / publish posts — they live in **`localStorage`** of the browser.
5. When ready to go live, click **Export JSON** on the dashboard → save as `blog/posts.json` → commit & push.

### Pros
- Zero backend setup
- Works offline
- No monthly cost
- Full CRUD, image uploads, drafts, preview

### Cons
- Browser-specific (your drafts are only on the browser where you edited them)
- Needs a manual export + git commit to publish

---

## 2. Live Cloud Mode (Supabase) — Recommended for Production

Upgrade to real-time publishing that works from any device and goes live **instantly** without a deploy.

### Step 2.1 — Create Supabase project

1. Sign up at [supabase.com](https://supabase.com) (free tier is plenty)
2. Create a new project → pick a region close to your users
3. From Project Settings → API, copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **`anon` public key** (long string starting with `eyJ…`)

### Step 2.2 — Create the `posts` table

In the **SQL Editor**, run:

```sql
create table public.posts (
  slug         text primary key,
  title        text not null,
  excerpt      text,
  cover        text,
  cover_gradient text,
  date         date,
  author       text,
  tags         text[],
  read_time    text,
  published    boolean default true,
  content      text,
  updated_at   timestamptz default now()
);

alter table public.posts enable row level security;

-- Anyone can read published posts (for the public blog)
create policy "Public read published"
  on public.posts for select
  using (published = true);

-- Only authenticated users can modify (for the control panel)
create policy "Authenticated full access"
  on public.posts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
```

### Step 2.3 — Create the image storage bucket

1. Go to **Storage** → **Create bucket**
2. Name: `blog-images`
3. Public: **ON**
4. Add storage policy for public read + authenticated write.

### Step 2.4 — Create admin user

Go to **Authentication → Users → Add user** with your email + password.
This is the account you'll log into the control panel with.

### Step 2.5 — Enable in the panel

Edit `control/config.js`:

```js
window.RAOGY_CONFIG = {
    mode: 'supabase',
    localPassword: 'ignored-in-supabase-mode',
    supabase: {
        url: 'https://xxxx.supabase.co',
        anonKey: 'eyJhbGc…',
        bucket: 'blog-images'
    },
    // …rest unchanged
};
```

Now the blog, preview, and panel all read/write through Supabase — changes go live instantly.

> **Note:** The current build ships Local mode. Supabase mode is scaffolded but requires
> wiring the `supabase-js` client in `app.js`. Ping me when you're ready and I'll plug it in
> — it's a ~30-line change.

---

## 3. Deploying `control.raogy.com` as a Subdomain

### Option A — Same host, new subdomain (simplest)

If your main site is on Vercel / Netlify / Cloudflare Pages:

1. **Make a new project/site** in the same platform
2. Point its root at this repo's `control/` directory
3. Add `control.raogy.com` as a custom domain
4. In your DNS provider, add a CNAME record:
   ```
   control   CNAME   cname.vercel-dns.com   (or your host's target)
   ```
5. Wait for SSL to auto-provision (5–15 min)

### Option B — Cloudflare Pages (free, fast)

1. Connect this repo to Cloudflare Pages
2. Create a new project
3. Root directory: `control/`
4. Build command: `# leave empty (static)`
5. Output: `.`
6. Domain → add `control.raogy.com`

### Option C — Same site, routed internally

Keep the `control/` folder inside this single repo. Your static host will automatically
serve `https://raogy.com/control/`. Then set up `control.raogy.com` as a **redirect** or
subdomain alias pointing to the same origin, optionally with a rewrite rule:

```
control.raogy.com/*  →  raogy.com/control/:splat  (200 rewrite)
```

---

## 4. Security Checklist

- [ ] **Change `localPassword`** in `config.js` from the default
- [ ] Add `control/` to `robots.txt` as `Disallow`
- [ ] Each HTML file already has `<meta name="robots" content="noindex, nofollow">`
- [ ] If going public-domain on `control.raogy.com`, strongly prefer **Supabase Auth mode**
- [ ] Never commit real Supabase `service_role` key (only the `anon` key is safe in client code)
- [ ] Rotate credentials if you ever suspect exposure
- [ ] Consider adding Cloudflare Access / Turnstile in front of `control.raogy.com` for extra defense

---

## 5. Features

### Dashboard
- Live stats (total, published, drafts, last-updated)
- Search across title, excerpt, tags
- Filter + sort by date
- Quick toggle: publish ↔ unpublish
- One-click preview on the live blog
- Import / Export JSON
- "Reset" → sync local with the live `posts.json`

### Editor
- Title + auto-generated slug (editable)
- Publish date picker
- Excerpt
- Tags (comma-separated)
- Featured image: **upload** (compressed to 1400px, JPEG 82%) OR pick one of 12 gradient presets
- Inline image insertion: click 🖼 button OR **drag & drop** directly into the text area
- Markdown body with GFM support (tables, fenced code, task lists)
- Live toolbar: bold, italic, code, H2, list, quote, link, code block
- Live side-by-side preview
- Word count + auto read-time
- Ctrl/Cmd+S to save
- Draft / Live status toggle
- Delete with confirmation

### Public Blog
- `/blog/` — listing with search + tag filter
- `/blog/post.html?slug=…` — individual article with:
  - Markdown rendering via marked.js
  - Reading progress bar
  - Share buttons (X, LinkedIn, WhatsApp, copy link)
  - Related posts by tag
  - Author box linking back to your portfolio

---

## 6. Roadmap / Ideas

- [ ] Markdown paste from clipboard
- [ ] AI-assisted draft → polished article
- [ ] Scheduled publishing
- [ ] Multi-author
- [ ] Analytics widget (views/click-throughs per post)
- [ ] RSS feed generation at `/blog/rss.xml`

---

Questions? Open an issue on the repo or ping me on WhatsApp.
