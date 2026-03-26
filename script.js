// ========================================
// Kocort Official Website - Script
// ========================================

(function () {
    'use strict';

    // --- Language system ---
    var currentLang = localStorage.getItem('kocort-lang') || 'zh';

    function applyLang(lang) {
        currentLang = lang;
        localStorage.setItem('kocort-lang', lang);
        document.documentElement.setAttribute('data-lang', lang);
        document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');

        // Update all elements with data-zh / data-en
        document.querySelectorAll('[data-zh][data-en]').forEach(function (el) {
            var text = el.getAttribute('data-' + lang);
            if (text) {
                el.innerHTML = text;
            }
        });

        // Update toggle buttons
        var label = lang === 'zh' ? 'EN' : '中文';
        document.querySelectorAll('.lang-toggle').forEach(function (btn) {
            btn.textContent = label;
        });

        // Update page title
        document.title = lang === 'zh'
            ? 'Kocort — 桌面级 AI Agent 助手'
            : 'Kocort — Desktop AI Agent Assistant';

        // Re-render Lucide icons after DOM changes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function toggleLang() {
        applyLang(currentLang === 'zh' ? 'en' : 'zh');
    }

    // Bind language toggles
    var langToggle = document.getElementById('langToggle');
    var langToggleMobile = document.getElementById('langToggleMobile');
    if (langToggle) langToggle.addEventListener('click', toggleLang);
    if (langToggleMobile) langToggleMobile.addEventListener('click', toggleLang);

    // Apply saved language on load
    applyLang(currentLang);

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // --- Navbar scroll effect ---
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    function onScroll() {
        const y = window.scrollY;
        if (y > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('open');
        });

        // Close on link click
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
            });
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const offset = 80; // nav height
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // --- Copy code button ---
    window.copyCode = function (btn) {
        const pre = btn.closest('.code-block').querySelector('pre code');
        if (!pre) return;

        const text = pre.textContent;
        navigator.clipboard.writeText(text).then(function () {
            var copiedText = currentLang === 'zh' ? '已复制' : 'Copied';
            const original = btn.getAttribute('data-' + currentLang) || btn.textContent;
            btn.textContent = copiedText;
            btn.style.color = '#22c55e';
            setTimeout(function () {
                btn.textContent = original;
                btn.style.color = '';
            }, 1500);
        }).catch(function () {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            var copiedText = currentLang === 'zh' ? '已复制' : 'Copied';
            const original = btn.getAttribute('data-' + currentLang) || btn.textContent;
            btn.textContent = copiedText;
            setTimeout(function () {
                btn.textContent = original;
            }, 1500);
        });
    };

    // --- Intersection Observer for animations ---
    if ('IntersectionObserver' in window) {
        const animateElements = document.querySelectorAll(
            '.feature-card, .doc-card, .security-layer, .step, .arch-principle'
        );

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        animateElements.forEach(function (el) {
            // Don't override security-layer animations
            if (!el.classList.contains('security-layer')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }
            observer.observe(el);
        });
    }
})();
