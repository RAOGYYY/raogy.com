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
    window.location.href = '/control/';
}

function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/control/';
        return false;
    }
    return true;
}

/* ------------- Store (local mode) ------------- */
async function loadPosts() {
    // Try localStorage first
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
        try {
            const data = JSON.parse(local);
            if (data && Array.isArray(data.posts)) return data;
        } catch {}
    }
    // Fallback: fetch current posts.json as seed
    try {
        const res = await fetch(CFG.postsJsonPath, { cache: 'no-cache' });
        if (res.ok) {
            const data = await res.json();
            savePosts(data);
            return data;
        }
    } catch {}
    // Empty default
    const empty = { version: 1, updatedAt: new Date().toISOString(), posts: [] };
    savePosts(empty);
    return empty;
}

function savePosts(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function savePost(post) {
    const data = await loadPosts();
    const idx = data.posts.findIndex(p => p.slug === post.slug);
    if (idx >= 0) {
        data.posts[idx] = { ...data.posts[idx], ...post };
    } else {
        data.posts.unshift(post);
    }
    savePosts(data);
    return post;
}

async function deletePost(slug) {
    const data = await loadPosts();
    data.posts = data.posts.filter(p => p.slug !== slug);
    savePosts(data);
}

async function getPost(slug) {
    const data = await loadPosts();
    return data.posts.find(p => p.slug === slug) || null;
}

/* ------------- Portfolio Store (local mode) ------------- */
const PORTFOLIO_KEY = 'raogy_portfolio';

async function loadProjects() {
    // Try localStorage first
    const local = localStorage.getItem(PORTFOLIO_KEY);
    if (local) {
        try {
            const data = JSON.parse(local);
            if (data && Array.isArray(data.projects)) return data;
        } catch {}
    }
    // Fallback: fetch current projects.json as seed
    try {
        const res = await fetch(CFG.portfolioJsonPath || '/portfolio/projects.json', { cache: 'no-cache' });
        if (res.ok) {
            const data = await res.json();
            saveProjects(data);
            return data;
        }
    } catch {}
    // Empty default
    const empty = { version: 1, updatedAt: new Date().toISOString(), projects: [] };
    saveProjects(empty);
    return empty;
}

function saveProjects(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(data));
}

async function saveProject(project) {
    const data = await loadProjects();
    const idx = data.projects.findIndex(p => p.slug === project.slug);
    if (idx >= 0) {
        data.projects[idx] = { ...data.projects[idx], ...project };
    } else {
        // Assign next order if none
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
    const data = await loadProjects();
    data.projects = data.projects.filter(p => p.slug !== slug);
    saveProjects(data);
}

async function getProject(slug) {
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
    slugify, fileToCompressedDataUrl,
    formatDate, estimateReadTime, escapeHtml, toast
};
