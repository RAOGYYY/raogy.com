-- =============================================================
-- RAOGY Control Panel — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. POSTS table
-- ─────────────────────────────────────────────────────────────
create table if not exists public.posts (
    slug          text primary key,
    title         text not null,
    date          text,
    excerpt       text,
    content       text,
    image         text,
    cover         text,
    tags          text[] default '{}',
    gradient      text,
    accent        text,
    read_time     text,
    featured      boolean default false,
    published     boolean default true,
    created_at    timestamptz default now(),
    updated_at    timestamptz default now()
);

create index if not exists posts_published_date_idx
    on public.posts (published, date desc);

-- ─────────────────────────────────────────────────────────────
-- 2. PROJECTS (portfolio) table
-- ─────────────────────────────────────────────────────────────
create table if not exists public.projects (
    slug            text primary key,
    title           text not null,
    category        text,
    category_label  text,
    description     text,
    tech            text[] default '{}',
    image           text,
    icon            text,
    gradient        text,
    accent          text,
    link            text,
    featured        boolean default false,
    published       boolean default true,
    "order"         int default 0,
    created_at      timestamptz default now(),
    updated_at      timestamptz default now()
);

create index if not exists projects_published_order_idx
    on public.projects (published, "order");

-- ─────────────────────────────────────────────────────────────
-- 3. Row Level Security (RLS)
-- ─────────────────────────────────────────────────────────────
alter table public.posts    enable row level security;
alter table public.projects enable row level security;

-- Public (anonymous) users can READ only PUBLISHED rows
drop policy if exists "Public read published posts"    on public.posts;
drop policy if exists "Public read published projects" on public.projects;

create policy "Public read published posts"
    on public.posts for select
    to anon
    using (published = true);

create policy "Public read published projects"
    on public.projects for select
    to anon
    using (published = true);

-- Authenticated users (you, logged in via email) can do EVERYTHING
drop policy if exists "Auth full access posts"    on public.posts;
drop policy if exists "Auth full access projects" on public.projects;

create policy "Auth full access posts"
    on public.posts for all
    to authenticated
    using (true)
    with check (true);

create policy "Auth full access projects"
    on public.projects for all
    to authenticated
    using (true)
    with check (true);

-- ─────────────────────────────────────────────────────────────
-- 4. Auto-update updated_at trigger
-- ─────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists posts_touch_updated    on public.posts;
drop trigger if exists projects_touch_updated on public.projects;

create trigger posts_touch_updated
    before update on public.posts
    for each row execute function public.touch_updated_at();

create trigger projects_touch_updated
    before update on public.projects
    for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. Storage bucket policies (blog-images)
-- ─────────────────────────────────────────────────────────────
-- Make sure the 'blog-images' bucket is PUBLIC from dashboard first.
-- Then run these policies:

drop policy if exists "Public can view images"    on storage.objects;
drop policy if exists "Auth can upload images"    on storage.objects;
drop policy if exists "Auth can delete images"    on storage.objects;

create policy "Public can view images"
    on storage.objects for select
    to anon
    using (bucket_id = 'blog-images');

create policy "Auth can upload images"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'blog-images');

create policy "Auth can delete images"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'blog-images');

-- =============================================================
-- ✅ DONE. Now:
--    1. Go to Authentication → Users → Add user
--       Email: raogyyy@gmail.com   (Auto Confirm: ON)
--    2. Go to Storage → Create bucket "blog-images" (Public: ON)
--       (skip if already created)
-- =============================================================
