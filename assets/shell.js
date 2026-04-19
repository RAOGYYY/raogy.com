/* =========================================================
 * RAOGY — Shared Site Shell
 * Injects the same navbar, footer, starfield, scroll-to-top
 * into every sub-page (blog posts, articles, etc.)
 *
 * Usage in any HTML:
 *   <body>
 *     <div id="site-shell-header"></div>
 *     ... page content ...
 *     <div id="site-shell-footer"></div>
 *     <script src="/assets/shell.js" data-active="blog"></script>
 *
 * The `data-active` attribute highlights the current nav link.
 * Valid: home | about | services | portfolio | blog | contact
 * ========================================================= */

(function () {
    const CURRENT = document.currentScript?.getAttribute('data-active') || '';

    // --- Shared CSS for the shell (starfield, nebula, light orbs, theme) ---
    const SHELL_STYLES = `
        :root { color-scheme: light dark; }
        html { background: #f8fafc; }
        html.dark { background: #050816; }
        body { font-family: 'Inter', sans-serif; }

        .raogy-gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Starfield stage */
        .raogy-stage { position: fixed; inset: 0; z-index: -1; pointer-events: none; overflow: hidden; }
        .raogy-stars {
            position: absolute; inset: -50%; width: 200%; height: 200%;
            opacity: 0; transition: opacity 0.8s ease; background-repeat: repeat;
        }
        html.dark .raogy-stars { opacity: 1; }
        .raogy-stars.s1 {
            background-image:
                radial-gradient(1px 1px at 20px 30px, #ffffff, transparent),
                radial-gradient(1.2px 1.2px at 90px 40px, #fff, transparent),
                radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.7), transparent),
                radial-gradient(1px 1px at 280px 90px, rgba(255,255,255,0.6), transparent);
            background-size: 350px 200px;
            animation: raogy-drift 240s linear infinite;
        }
        .raogy-stars.s2 {
            background-image:
                radial-gradient(1.5px 1.5px at 120px 140px, #fff, transparent),
                radial-gradient(2px 2px at 330px 40px, rgba(255,255,255,0.95), transparent),
                radial-gradient(1px 1px at 400px 180px, rgba(255,255,255,0.7), transparent);
            background-size: 500px 260px;
            animation: raogy-drift 340s linear infinite reverse;
        }
        @keyframes raogy-drift {
            from { transform: translate3d(0,0,0); }
            to   { transform: translate3d(-350px, -200px, 0); }
        }

        .raogy-nebula {
            position: absolute; inset: 0; opacity: 0; transition: opacity 1s ease;
            background:
                radial-gradient(ellipse 60% 40% at 15% 20%, rgba(139,92,246,0.16), transparent 60%),
                radial-gradient(ellipse 50% 40% at 85% 70%, rgba(14,165,233,0.13), transparent 60%);
        }
        html.dark .raogy-nebula { opacity: 1; }

        .raogy-orbs { position: absolute; inset: 0; opacity: 1; transition: opacity 0.8s ease; }
        html.dark .raogy-orbs { opacity: 0; }
        .raogy-orbs .o { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.3; }
        .raogy-orbs .o1 { width: 380px; height: 380px; top: 8%; left: -60px; background: radial-gradient(circle, #c4b5fd, transparent 70%); }
        .raogy-orbs .o2 { width: 460px; height: 460px; top: 40%; right: -100px; background: radial-gradient(circle, #93c5fd, transparent 70%); }

        /* Scroll-to-top */
        #raogyScrollTop {
            position: fixed;
            bottom: 1.5rem; right: 1.5rem;
            z-index: 40;
            padding: 0.5rem;
            border-radius: 9999px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px) scale(0.9);
            transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s;
        }
        #raogyScrollTop.show { opacity: 1; visibility: visible; transform: translateY(0) scale(1); }

        .raogy-nav-link {
            color: rgb(55 65 81);
            transition: color 0.2s;
            font-size: 0.875rem;
            font-weight: 500;
            letter-spacing: 0.025em;
        }
        html.dark .raogy-nav-link { color: rgb(209 213 219); }
        .raogy-nav-link:hover { color: rgb(124 58 237); }
        html.dark .raogy-nav-link:hover { color: rgb(167 139 250); }
        .raogy-nav-link.active { color: rgb(124 58 237); }
        html.dark .raogy-nav-link.active { color: rgb(167 139 250); }

        .animate-fade-in-up { animation: raogyFadeInUp 0.4s ease-out; }
        @keyframes raogyFadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;

    function injectStyles() {
        if (document.getElementById('raogy-shell-styles')) return;
        const style = document.createElement('style');
        style.id = 'raogy-shell-styles';
        style.textContent = SHELL_STYLES;
        document.head.appendChild(style);
    }

    function injectStage() {
        if (document.getElementById('raogy-stage')) return;
        const stage = document.createElement('div');
        stage.id = 'raogy-stage';
        stage.className = 'raogy-stage';
        stage.setAttribute('aria-hidden', 'true');
        stage.innerHTML = `
            <div class="raogy-nebula"></div>
            <div class="raogy-stars s1"></div>
            <div class="raogy-stars s2"></div>
            <div class="raogy-orbs">
                <div class="o o1"></div>
                <div class="o o2"></div>
            </div>`;
        document.body.insertBefore(stage, document.body.firstChild);
    }

    function navLinkClass(id) {
        return 'raogy-nav-link' + (CURRENT === id ? ' active' : '');
    }

    function themeToggleSvg() {
        return `
            <svg class="w-5 h-5 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
            </svg>
            <svg class="w-5 h-5 dark:hidden" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"/>
            </svg>`;
    }

    function buildNavbar() {
        return `
        <nav id="navbar" class="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm py-4 border-b border-gray-200/60 dark:border-slate-700/60">
            <div class="container mx-auto px-6 flex justify-between items-center">
                <a href="/" class="flex items-center gap-3 cursor-pointer">
                    <img src="/images/logo.svg" alt="RAOGY Logo" class="w-10 h-10">
                    <div class="text-2xl font-bold raogy-gradient-text">RAOGY</div>
                </a>

                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/#home" class="${navLinkClass('home')}">Home</a>
                    <a href="/#about" class="${navLinkClass('about')}">About</a>
                    <a href="/#services" class="${navLinkClass('services')}">Services</a>
                    <a href="/#portfolio" class="${navLinkClass('portfolio')}">Portfolio</a>
                    <a href="/blog/" class="${navLinkClass('blog')}">Blog</a>
                    <a href="/#contact" class="${navLinkClass('contact')}">Contact</a>

                    <button onclick="RAOGY_Shell.toggleTheme()" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
                        ${themeToggleSvg()}
                    </button>

                    <a href="/#contact" class="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-lg">
                        Hire Me
                    </a>
                </div>

                <!-- Mobile toggle -->
                <div class="md:hidden flex items-center gap-2">
                    <button onclick="RAOGY_Shell.toggleTheme()" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" aria-label="Toggle theme">
                        ${themeToggleSvg()}
                    </button>
                    <button onclick="RAOGY_Shell.toggleMobile()" class="text-gray-700 dark:text-white p-2" aria-label="Menu">
                        <svg id="raogy-menu-icon" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                        <svg id="raogy-close-icon" class="w-6 h-6 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Mobile menu -->
            <div id="raogy-mobile-menu" class="md:hidden bg-white dark:bg-slate-800 w-full border-t border-gray-200 dark:border-slate-700 hidden">
                <div class="flex flex-col p-4 space-y-2">
                    <a href="/#home" class="text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">Home</a>
                    <a href="/#about" class="text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">About</a>
                    <a href="/#services" class="text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">Services</a>
                    <a href="/#portfolio" class="text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">Portfolio</a>
                    <a href="/blog/" class="text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">Blog</a>
                    <a href="/#contact" class="text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white py-3 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">Contact</a>
                </div>
            </div>
        </nav>`;
    }

    function buildFooter() {
        const year = new Date().getFullYear();
        return `
        <footer class="py-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-t border-gray-200 dark:border-slate-800 mt-16">
            <div class="container mx-auto px-6">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div class="flex items-center gap-3">
                        <img src="/images/logo.svg" alt="RAOGY" class="w-8 h-8">
                        <div class="text-xl font-bold raogy-gradient-text">RAOGY</div>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 text-center text-sm">
                        © ${year} RAOGY. Crafted with ❤️ for web, iOS &amp; Android.
                    </p>
                    <div class="flex gap-3 text-sm">
                        <a href="/privacy" class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy</a>
                        <span class="text-gray-400">•</span>
                        <a href="/terms" class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms</a>
                        <span class="text-gray-400">•</span>
                        <a href="/blog/" class="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Blog</a>
                    </div>
                </div>
            </div>
        </footer>`;
    }

    function buildScrollToTop() {
        return `
        <button id="raogyScrollTop" onclick="RAOGY_Shell.scrollToTop()" aria-label="Scroll to top">
            <span class="flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:text-white hover:border-transparent shadow-md hover:shadow-xl transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                </svg>
            </span>
        </button>`;
    }

    // Theme helpers
    function initTheme() {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved === 'dark' || (!saved && prefersDark)) {
            document.documentElement.classList.add('dark');
        }
    }
    function toggleTheme() {
        const html = document.documentElement;
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
    }
    function toggleMobile() {
        const m = document.getElementById('raogy-mobile-menu');
        const i = document.getElementById('raogy-menu-icon');
        const c = document.getElementById('raogy-close-icon');
        if (!m) return;
        m.classList.toggle('hidden');
        i?.classList.toggle('hidden');
        c?.classList.toggle('hidden');
    }
    function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

    function mountScrollBehavior() {
        const btn = document.getElementById('raogyScrollTop');
        if (!btn) return;
        const update = () => {
            const footer = document.querySelector('footer');
            const y = window.pageYOffset;
            if (y <= 300) { btn.classList.remove('show'); return; }
            if (footer) {
                const r = footer.getBoundingClientRect();
                if (r.top < window.innerHeight - 40) { btn.classList.remove('show'); return; }
            }
            btn.classList.add('show');
        };
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
    }

    // --- Mount ---
    function mount() {
        initTheme();
        injectStyles();
        injectStage();

        const header = document.getElementById('site-shell-header');
        if (header) header.innerHTML = buildNavbar();

        const footer = document.getElementById('site-shell-footer');
        if (footer) {
            footer.innerHTML = buildFooter() + buildScrollToTop();
        } else {
            // Inject scroll-to-top anyway
            const tmp = document.createElement('div');
            tmp.innerHTML = buildScrollToTop();
            document.body.appendChild(tmp.firstElementChild);
        }

        mountScrollBehavior();
    }

    // Expose
    window.RAOGY_Shell = { toggleTheme, toggleMobile, scrollToTop };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', mount);
    } else {
        mount();
    }
})();
