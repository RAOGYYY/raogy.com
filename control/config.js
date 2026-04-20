// =========================================================
// RAOGY Control Panel — Config
// =========================================================
//
// By default the panel runs in LOCAL mode (localStorage + JSON export/import).
// To upgrade to live cloud sync:
//   1. Create a Supabase project at https://supabase.com
//   2. Paste your project URL + anon key below
//   3. Set mode to 'supabase'
//   4. Create table `posts` and storage bucket `blog-images`
//      (see CONTROL_PANEL_SETUP.md)
// =========================================================

window.RAOGY_CONFIG = {
    // 'local'  → localStorage only (default, works offline, browser-specific)
    // 'supabase' → live cloud sync across all devices
    mode: 'supabase',  // 'local' | 'supabase'

    // Local auth passphrase — only used when mode === 'local'
    localPassword: 'raogy-admin-2026',

    // Supabase settings — paste your values here after creating the project
    supabase: {
        url: '',          // TODO: paste 'https://xxxx.supabase.co'
        anonKey: '',      // TODO: paste your anon public key 'eyJhbGc...'
        bucket: 'blog-images'
    },

    // Site URLs
    publicBlogUrl: '/blog/',
    postsJsonPath: '/blog/posts.json',
    portfolioJsonPath: '/portfolio/projects.json',

    // Branding
    siteName: 'RAOGY Control Panel',
    accentGradient: 'from-purple-600 to-blue-600'
};
