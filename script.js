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
        if (downloadState.selectedPlatformId) {
            updatePrimaryDownload(
                downloadState.selectedPlatformId,
                downloadState.selectedPlatformId === downloadState.detectedPlatformId
            );
        }
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

    // --- Download config and platform detection ---
    var downloadState = {
        selectedPlatformId: null,
        detectedPlatformId: null
    };

    function getDownloadConfig() {
        if (!window.KOCORT_DOWNLOADS || !Array.isArray(window.KOCORT_DOWNLOADS.platforms)) {
            return null;
        }
        return window.KOCORT_DOWNLOADS;
    }

    function getPlatformById(id) {
        var config = getDownloadConfig();
        if (!config) return null;
        return config.platforms.find(function (platform) {
            return platform.id === id;
        }) || null;
    }

    function getPlatformFileHint(platform) {
        if (!platform) return '';
        if (platform.assetName.indexOf('.dmg') !== -1) return 'DMG';
        if (platform.assetName.indexOf('.tar.gz') !== -1) return 'TAR.GZ';
        if (platform.assetName.indexOf('.zip') !== -1) return 'ZIP';
        return platform.assetName.split('.').pop().toUpperCase();
    }

    function getPlatformDownloadUrl(platform) {
        var config = getDownloadConfig();
        if (!config || !platform) return '#';
        var baseMap = config.latestDownloadBaseByLang || {};
        var base = baseMap[currentLang] || baseMap.zh || baseMap.en || '';
        return base + platform.assetName;
    }

    function getReleasesPageUrl() {
        var config = getDownloadConfig();
        if (!config) return '#';
        var pageMap = config.releasesPageByLang || {};
        return pageMap[currentLang] || pageMap.zh || pageMap.en || '#';
    }

    function detectOS() {
        var uaData = navigator.userAgentData;
        var platform = uaData && uaData.platform ? uaData.platform.toLowerCase() : '';
        var navPlatform = (navigator.platform || '').toLowerCase();
        var ua = (navigator.userAgent || '').toLowerCase();
        var source = platform || navPlatform || ua;

        if (source.indexOf('win') !== -1) return 'windows';
        if (source.indexOf('mac') !== -1 || source.indexOf('darwin') !== -1) return 'macos';
        if (source.indexOf('linux') !== -1 || source.indexOf('x11') !== -1) return 'linux';
        return 'windows';
    }

    function detectArchFallback() {
        var ua = (navigator.userAgent || '').toLowerCase();
        var navPlatform = (navigator.platform || '').toLowerCase();
        var source = ua + ' ' + navPlatform;

        if (source.indexOf('aarch64') !== -1 || source.indexOf('arm64') !== -1) return 'arm64';
        if (source.indexOf('arm') !== -1) return 'arm64';
        return 'amd64';
    }

    function detectCurrentPlatformIdSync() {
        var os = detectOS();
        var arch = detectArchFallback();
        return os + '-' + arch;
    }

    function updatePrimaryDownload(platformId, isDetected) {
        var platform = getPlatformById(platformId);
        var config = getDownloadConfig();
        if (!platform || !config) return;

        downloadState.selectedPlatformId = platform.id;

        var title = document.getElementById('downloadPrimaryTitle');
        var desc = document.getElementById('downloadPrimaryDesc');
        var label = document.getElementById('downloadDetectedLabel');
        var primaryBtn = document.getElementById('downloadPrimaryBtn');
        var primaryBtnText = document.getElementById('downloadPrimaryBtnText');
        var allBtn = document.getElementById('downloadAllBtn');

        if (title) title.textContent = platform.label;
        if (desc) {
            desc.textContent = currentLang === 'zh'
                ? (isDetected ? '已为当前设备自动匹配对应发行包。' : '已切换到你手动选择的平台发行包。')
                : (isDetected ? 'Matched automatically for this device.' : 'Switched to the package you selected.');
        }
        if (label) {
            label.textContent = currentLang === 'zh'
                ? (isDetected ? '自动识别当前平台' : '当前手动选择平台')
                : (isDetected ? 'Auto-detected platform' : 'Manually selected platform');
        }
        if (primaryBtn) primaryBtn.href = getPlatformDownloadUrl(platform);
        if (primaryBtnText) {
            primaryBtnText.textContent = currentLang === 'zh'
                ? ('下载 ' + platform.label)
                : ('Download ' + platform.label);
        }
        if (allBtn) allBtn.href = getReleasesPageUrl();

        document.querySelectorAll('.platform-choice').forEach(function (button) {
            var active = button.getAttribute('data-platform-id') === platform.id;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function renderPlatformPicker() {
        var config = getDownloadConfig();
        var picker = document.getElementById('platformPicker');
        if (!config || !picker) return;

        picker.innerHTML = '';

        config.platforms.forEach(function (platform) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'platform-choice';
            button.setAttribute('data-platform-id', platform.id);
            button.setAttribute('aria-pressed', 'false');
            button.innerHTML = ''
                + '<span class="platform-choice-label-row">'
                + '<span class="platform-choice-label">' + platform.label + '</span>'
                + '<span class="platform-choice-badge">' + getPlatformFileHint(platform) + '</span>'
                + '</span>'
                + '<span class="platform-choice-meta">' + platform.assetName + '</span>';
            button.addEventListener('click', function () {
                updatePrimaryDownload(platform.id, false);
            });
            picker.appendChild(button);
        });
    }

    function initializeDownloads() {
        var config = getDownloadConfig();
        if (!config) return;

        renderPlatformPicker();

        var detectedId = detectCurrentPlatformIdSync();
        downloadState.detectedPlatformId = getPlatformById(detectedId)
            ? detectedId
            : config.platforms[0].id;
        updatePrimaryDownload(downloadState.detectedPlatformId, true);

        var uaData = navigator.userAgentData;
        if (uaData && typeof uaData.getHighEntropyValues === 'function') {
            uaData.getHighEntropyValues(['architecture']).then(function (values) {
                var os = detectOS();
                var arch = values && values.architecture && values.architecture.toLowerCase().indexOf('arm') !== -1
                    ? 'arm64'
                    : 'amd64';
                var refinedId = os + '-' + arch;
                if (downloadState.selectedPlatformId === downloadState.detectedPlatformId && getPlatformById(refinedId)) {
                    downloadState.detectedPlatformId = refinedId;
                    updatePrimaryDownload(refinedId, true);
                }
            }).catch(function () {
                // Ignore and keep the fallback result.
            });
        }
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

    initializeDownloads();

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
