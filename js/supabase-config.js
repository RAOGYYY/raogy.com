/* =========================================================
 * RAOGY Public Site — Supabase read-only client
 * Used by blog pages + homepage + portfolio to fetch live content.
 * Anon key is safe to expose (RLS only allows reading published rows).
 * ========================================================= */
window.RAOGY_SUPABASE = {
    url: 'https://efklrqzvafzvwmegmvcw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVma2xycXp2YWZ6dndtZWdtdmN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2NTc4NTUsImV4cCI6MjA5MjIzMzg1NX0.qZAh1AVEOnQemJ0Ym8XAHarD4PvyMSRYjimsfThopIU'
};

/** Lazy-init Supabase client. Returns null if supabase-js not loaded yet. */
window.getRaogySB = function () {
    if (window._raogySB) return window._raogySB;
    if (typeof supabase === 'undefined') return null;
    window._raogySB = supabase.createClient(
        window.RAOGY_SUPABASE.url,
        window.RAOGY_SUPABASE.anonKey
    );
    return window._raogySB;
};

/**
 * Map DB row → JS post object (snake_case → camelCase).
 */
window.raogyPostFromRow = function (row) {
    if (!row) return null;
    return {
        slug:      row.slug,
        title:     row.title,
        date:      row.date,
        excerpt:   row.excerpt,
        content:   row.content,
        image:     row.image,
        cover:     row.cover,
        tags:      row.tags || [],
        gradient:  row.gradient,
        accent:    row.accent,
        readTime:  row.read_time,
        featured:  !!row.featured,
        published: row.published !== false
    };
};

window.raogyProjectFromRow = function (row) {
    if (!row) return null;
    return {
        slug:           row.slug,
        title:          row.title,
        category:       row.category,
        categoryLabel:  row.category_label,
        description:    row.description,
        tech:           row.tech || [],
        image:          row.image,
        icon:           row.icon,
        gradient:       row.gradient,
        accent:         row.accent,
        link:           row.link,
        featured:       !!row.featured,
        published:      row.published !== false,
        order:          row.order
    };
};

/**
 * Fetch all published posts, sorted newest first.
 * Falls back to /blog/posts.json if Supabase fails (offline/config error).
 */
window.raogyLoadPublishedPosts = async function () {
    const sb = window.getRaogySB();
    if (sb) {
        try {
            const { data, error } = await sb.from('posts')
                .select('*')
                .eq('published', true)
                .order('date', { ascending: false });
            if (!error && Array.isArray(data)) {
                return data.map(window.raogyPostFromRow);
            }
        } catch (e) { console.warn('Supabase fetch failed, falling back:', e); }
    }
    // Fallback to static JSON
    try {
        const res = await fetch('/blog/posts.json', { cache: 'no-cache' });
        if (res.ok) {
            const j = await res.json();
            return (j.posts || []).filter(p => p.published !== false);
        }
    } catch {}
    return [];
};

/** Fetch one published post by slug (with fallback). */
window.raogyLoadPost = async function (slug) {
    const sb = window.getRaogySB();
    if (sb) {
        try {
            const { data, error } = await sb.from('posts')
                .select('*')
                .eq('slug', slug)
                .eq('published', true)
                .maybeSingle();
            if (!error && data) return window.raogyPostFromRow(data);
        } catch (e) { console.warn('Supabase post fetch failed:', e); }
    }
    try {
        const res = await fetch('/blog/posts.json', { cache: 'no-cache' });
        if (res.ok) {
            const j = await res.json();
            const p = (j.posts || []).find(x => x.slug === slug);
            return (p && p.published !== false) ? p : null;
        }
    } catch {}
    return null;
};

/** Fetch all published projects, sorted by order asc (with fallback). */
window.raogyLoadPublishedProjects = async function () {
    const sb = window.getRaogySB();
    if (sb) {
        try {
            const { data, error } = await sb.from('projects')
                .select('*')
                .eq('published', true)
                .order('order', { ascending: true });
            if (!error && Array.isArray(data)) {
                return data.map(window.raogyProjectFromRow);
            }
        } catch (e) { console.warn('Supabase projects fetch failed:', e); }
    }
    try {
        const res = await fetch('/portfolio/projects.json', { cache: 'no-cache' });
        if (res.ok) {
            const j = await res.json();
            return (j.projects || []).filter(p => p.published !== false)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
        }
    } catch {}
    return [];
};
