/* =========================================================
 * RAOGY Control Panel — Core logic
 * Works in two modes:
 *   - 'local'    → localStorage (default, zero setup)
 *   - 'supabase' → live cloud sync (optional)
 * ========================================================= */

const CFG = window.RAOGY_CONFIG;
const STORAGE_KEY = 'raogy_posts';
const SESSION_KEY = 'raogy_session';

/* ------------- Supabase client (lazy-init) ------------- */
let _sb = null;
function getSB() {
    if (_sb) return _sb;
    if (CFG.mode !== 'supabase') return null;
    if (!CFG.supabase.url || !CFG.supabase.anonKey) return null;
    if (typeof supabase === 'undefined') return null;
    _sb = supabase.createClient(CFG.supabase.url, CFG.supabase.anonKey);
    return _sb;
}

/* ------------- Auth ------------- */
function isLoggedIn() {
    if (CFG.mode === 'supabase') {
        // Supabase mode: check localStorage for persisted session token
        try {
            const raw = localStorage.getItem('raogy_sb_session');
            if (!raw) return false;
            const { expiresAt } = JSON.parse(raw);
            return expiresAt > Date.now();
        } catch { return false; }
    }
    // Local mode: sessionStorage short-lived token
    const s = sessionStorage.getItem(SESSION_KEY);
    if (!s) return false;
    try {
        const { expiresAt } = JSON.parse(s);
        return expiresAt > Date.now();
    } catch { return false; }
}

// Local-mode only (called directly from legacy doLogin)
function login(password) {
    if (CFG.mode === 'supabase') return false; // use loginWithEmail instead
    if (password !== CFG.localPassword) return false;
    const session = { expiresAt: Date.now() + 4 * 60 * 60 * 1000 };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
}

// Supabase-mode login — returns { error } or {}
async function loginWithEmail(email, password) {
    const sb = getSB();
    if (!sb) return { error: 'Supabase not configured. Check config.js.' };
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // Persist lightweight session marker (actual JWT stays in Supabase storage)
    const expiresAt = Date.now() + (data.session.expires_in || 3600) * 1000;
    localStorage.setItem('raogy_sb_session', JSON.stringify({ expiresAt }));
    return {};
}

async function logout() {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) await sb.auth.signOut();
        localStorage.removeItem('raogy_sb_session');
    } else {
        sessionStorage.removeItem(SESSION_KEY);
    }
    window.location.href = '/';
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/';
        return false;
    }
    return true;
}

/* ------------- Posts: DB ↔ JS field mapping ------------- */
// Supabase uses snake_case columns; our app uses camelCase
function postFromRow(row) {
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
}
function postToRow(post) {
    return {
        slug:      post.slug,
        title:     post.title,
        date:      post.date,
        excerpt:   post.excerpt,
        content:   post.content,
        image:     post.image,
        cover:     post.cover,
        tags:      post.tags || [],
        gradient:  post.gradient,
        accent:    post.accent,
        read_time: post.readTime,
        featured:  !!post.featured,
        published: post.published !== false
    };
}

/* ------------- Posts: CRUD (dual-mode) ------------- */
async function loadPosts() {
    // ── Supabase mode ──
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            const { data, error } = await sb.from('posts')
                .select('*')
                .order('date', { ascending: false });
            if (error) {
                console.error('loadPosts supabase error:', error);
                return { version: 1, updatedAt: new Date().toISOString(), posts: [] };
            }
            return {
                version: 1,
                updatedAt: new Date().toISOString(),
                posts: (data || []).map(postFromRow)
            };
        }
    }
    // ── Local mode ──
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
        try {
            const d = JSON.parse(local);
            if (d && Array.isArray(d.posts)) return d;
        } catch {}
    }
    try {
        const res = await fetch(CFG.postsJsonPath, { cache: 'no-cache' });
        if (res.ok) {
            const d = await res.json();
            savePosts(d);
            return d;
        }
    } catch {}
    const empty = { version: 1, updatedAt: new Date().toISOString(), posts: [] };
    savePosts(empty);
    return empty;
}

function savePosts(data) {
    // Local cache snapshot — only used in local mode (and as a cache in supabase mode)
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function savePost(post) {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            const { data, error } = await sb.from('posts')
                .upsert(postToRow(post), { onConflict: 'slug' })
                .select()
                .single();
            if (error) throw new Error(error.message);
            return postFromRow(data);
        }
    }
    const data = await loadPosts();
    const idx = data.posts.findIndex(p => p.slug === post.slug);
    if (idx >= 0) data.posts[idx] = { ...data.posts[idx], ...post };
    else data.posts.unshift(post);
    savePosts(data);
    return post;
}

async function deletePost(slug) {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            const { error } = await sb.from('posts').delete().eq('slug', slug);
            if (error) throw new Error(error.message);
            return;
        }
    }
    const data = await loadPosts();
    data.posts = data.posts.filter(p => p.slug !== slug);
    savePosts(data);
}

async function getPost(slug) {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            const { data, error } = await sb.from('posts')
                .select('*').eq('slug', slug).maybeSingle();
            if (error) { console.error(error); return null; }
            return postFromRow(data);
        }
    }
    const data = await loadPosts();
    return data.posts.find(p => p.slug === slug) || null;
}

/* ------------- Projects: DB ↔ JS field mapping ------------- */
const PORTFOLIO_KEY = 'raogy_portfolio';

function projectFromRow(row) {
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
}
function projectToRow(project) {
    return {
        slug:            project.slug,
        title:           project.title,
        category:        project.category,
        category_label:  project.categoryLabel,
        description:     project.description,
        tech:            project.tech || [],
        image:           project.image,
        icon:            project.icon,
        gradient:        project.gradient,
        accent:          project.accent,
        link:            project.link,
        featured:        !!project.featured,
        published:       project.published !== false,
        order:           project.order ?? 0
    };
}

/* ------------- Projects: CRUD (dual-mode) ------------- */
async function loadProjects() {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            const { data, error } = await sb.from('projects')
                .select('*')
                .order('order', { ascending: true });
            if (error) {
                console.error('loadProjects supabase error:', error);
                return { version: 1, updatedAt: new Date().toISOString(), projects: [] };
            }
            return {
                version: 1,
                updatedAt: new Date().toISOString(),
                projects: (data || []).map(projectFromRow)
            };
        }
    }
    const local = localStorage.getItem(PORTFOLIO_KEY);
    if (local) {
        try {
            const d = JSON.parse(local);
            if (d && Array.isArray(d.projects)) return d;
        } catch {}
    }
    try {
        const res = await fetch(CFG.portfolioJsonPath || '/portfolio/projects.json', { cache: 'no-cache' });
        if (res.ok) {
            const d = await res.json();
            saveProjects(d);
            return d;
        }
    } catch {}
    const empty = { version: 1, updatedAt: new Date().toISOString(), projects: [] };
    saveProjects(empty);
    return empty;
}

function saveProjects(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(data));
}

async function saveProject(project) {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            // Assign next order if new + missing
            if (project.order == null) {
                const { data: existing } = await sb.from('projects').select('slug, order').eq('slug', project.slug).maybeSingle();
                if (!existing) {
                    const { data: maxRow } = await sb.from('projects').select('order').order('order', { ascending: false }).limit(1).maybeSingle();
                    project.order = ((maxRow && maxRow.order) || 0) + 1;
                }
            }
            const { data, error } = await sb.from('projects')
                .upsert(projectToRow(project), { onConflict: 'slug' })
                .select()
                .single();
            if (error) throw new Error(error.message);
            return projectFromRow(data);
        }
    }
    const data = await loadProjects();
    const idx = data.projects.findIndex(p => p.slug === project.slug);
    if (idx >= 0) data.projects[idx] = { ...data.projects[idx], ...project };
    else {
        if (project.order == null) {
            const maxOrder = data.projects.reduce((m, p) => Math.max(m, p.order || 0), 0);
            project.order = maxOrder + 1;
        }
        data.projects.unshift(project);
    }
    saveProjects(data);
    return project;
}

async function deleteProject(slug) {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            const { error } = await sb.from('projects').delete().eq('slug', slug);
            if (error) throw new Error(error.message);
            return;
        }
    }
    const data = await loadProjects();
    data.projects = data.projects.filter(p => p.slug !== slug);
    saveProjects(data);
}

async function getProject(slug) {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            const { data, error } = await sb.from('projects')
                .select('*').eq('slug', slug).maybeSingle();
            if (error) { console.error(error); return null; }
            return projectFromRow(data);
        }
    }
    const data = await loadProjects();
    return data.projects.find(p => p.slug === slug) || null;
}

async function exportProjectsJson() {
    const data = await loadProjects();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.json';
    a.click();
    URL.revokeObjectURL(url);
}

async function importProjectsJson(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.projects || !Array.isArray(data.projects)) throw new Error('Invalid projects.json');
    saveProjects(data);
    return data;
}

async function resetProjectsToLive() {
    localStorage.removeItem(PORTFOLIO_KEY);
    return loadProjects();
}

/* ------------- Supabase Storage image upload ------------- */
/**
 * Upload an image File to Supabase Storage (supabase mode)
 * or fall back to compressed base64 data URL (local mode).
 * Returns: { url: string } on success, { error: string } on failure.
 */
async function uploadImageToStorage(file, folder = 'blog') {
    if (CFG.mode === 'supabase') {
        const sb = getSB();
        if (sb) {
            // Compress first (max 1400px, 82% JPEG)
            let uploadFile = file;
            try {
                const dataUrl = await fileToCompressedDataUrl(file, 1400, 0.82);
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                uploadFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
            } catch { /* use original file if compression fails */ }

            const ext = uploadFile.name.split('.').pop();
            const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error } = await sb.storage.from(CFG.supabase.bucket).upload(path, uploadFile, {
                cacheControl: '31536000',
                upsert: false
            });
            if (error) return { error: error.message };
            const { data } = sb.storage.from(CFG.supabase.bucket).getPublicUrl(path);
            return { url: data.publicUrl };
        }
    }
    // Local mode fallback — compress to base64 data URL
    try {
        const url = await fileToCompressedDataUrl(file, 1400, 0.82);
        return { url };
    } catch (err) {
        return { error: err.message };
    }
}

/* ------------- Slug + image helpers ------------- */
function slugify(text) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

/**
 * Compress a File → base64 data URL (for storing inside posts.json)
 * Max dimension 1200px, quality 0.82, JPEG.
 */
function fileToCompressedDataUrl(file, maxDim = 1200, quality = 0.82) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) return reject(new Error('Not an image'));
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round(height * (maxDim / width));
                        width = maxDim;
                    } else {
                        width = Math.round(width * (maxDim / height));
                        height = maxDim;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/* ------------- Export / Import JSON ------------- */
async function exportPostsJson() {
    const data = await loadPosts();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'posts.json';
    a.click();
    URL.revokeObjectURL(url);
}

async function importPostsJson(file) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data.posts || !Array.isArray(data.posts)) throw new Error('Invalid posts.json');
    savePosts(data);
    return data;
}

async function resetToLiveJson() {
    localStorage.removeItem(STORAGE_KEY);
    return loadPosts();
}

/* ------------- Utilities ------------- */
function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function estimateReadTime(text = '') {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
}

function escapeHtml(s = '') {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
}

function toast(msg, type = 'info') {
    const existing = document.getElementById('toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 'toast';
    const colors = {
        info:    'bg-gray-900 dark:bg-slate-700 text-white',
        success: 'bg-emerald-600 text-white',
        error:   'bg-red-600 text-white',
        warn:    'bg-amber-500 text-white'
    };
    el.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${colors[type] || colors.info} animate-fade-in-up`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, 2500);
    setTimeout(() => el.remove(), 3000);
}

/* ------------- Theme ------------- */
(function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) document.documentElement.classList.add('dark');
})();
function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
}
window.toggleTheme = toggleTheme;

/* ------------- Expose ------------- */
window.RAOGY = {
    isLoggedIn, login, loginWithEmail, logout, requireAuth,
    // Posts
    loadPosts, savePost, deletePost, getPost, savePosts,
    exportPostsJson, importPostsJson, resetToLiveJson,
    // Portfolio
    loadProjects, saveProject, deleteProject, getProject, saveProjects,
    exportProjectsJson, importProjectsJson, resetProjectsToLive,
    // Common
    slugify, fileToCompressedDataUrl, uploadImageToStorage,
    formatDate, estimateReadTime, escapeHtml, toast
};
