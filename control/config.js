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
    mode: 'local',

    // Local auth passphrase (change this immediately!)
    // When mode === 'supabase', Supabase Auth is used instead.
    localPassword: 'raogy-admin-2026',

    // Supabase settings (ignored in local mode)
    supabase: {
        url: '',          // e.g. 'https://xxxx.supabase.co'
        anonKey: '',      // e.g. 'eyJhbGc...'
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
