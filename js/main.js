/* =============================================
   Ready.vn - Main JavaScript
   ============================================= */

(function () {
    'use strict';

    // ----- Navbar Scroll Effect -----
    function initNavbarScroll() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', function () {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar--scrolled');
            } else {
                navbar.classList.remove('navbar--scrolled');
            }
        });
    }

    // ----- Mobile Menu Toggle -----
    function initMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('open');
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
    }

    // ----- Intersection Observer for Animations -----
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Start counter if it's a stats item
                    if (entry.target.classList.contains('stats')) {
                        animateStats();
                    }
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    }

    // ----- Stats Counter Animation -----
    function animateStats() {
        const stats = document.querySelectorAll('.stats__number');
        stats.forEach(stat => {
            if (stat.dataset.animated === 'true') return;
            
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            let startTimestamp = null;

            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                stat.innerText = Math.floor(progress * target);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    stat.dataset.animated = 'true';
                }
            };
            window.requestAnimationFrame(step);
        });
    }

    // ----- Back to Top -----
    function initBackToTop() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ----- Initialize -----
    function init() {
        initNavbarScroll();
        initMobileMenu();
        initScrollAnimations();
        initBackToTop();
        
        // Remove loading state if any
        document.body.classList.add('loaded');
        
        console.log('🐅 Ready Web Initialized');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
