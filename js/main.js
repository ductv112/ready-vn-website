/* =============================================
   Ready.vn - Main JavaScript
   ============================================= */

(function () {
    'use strict';

    // List of available images in r-image folder (excluding anhbia.jpg)
    const availableImages = Array.from({ length: 48 }, (_, i) => `${i + 1}.jpg`);

    // Helper to shuffle array
    function shuffleArray(array) {
        const newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    // ----- Randomize Images on Load -----
    function randomizeImages() {
        const shuffled = shuffleArray(availableImages);
        let currentIndex = 0;

        // 1. Randomize Story Image (1 image)
        const storyImg = document.querySelector('.story__image img');
        if (storyImg) {
            storyImg.src = `r-image/${shuffled[currentIndex++]}`;
        }

        // 2. Randomize Brothers Section (Group photos - take first 4 from shuffled)
        const brothersImgs = document.querySelectorAll('.brothers__photo img');
        brothersImgs.forEach(img => {
            if (currentIndex < shuffled.length) {
                img.src = `r-image/${shuffled[currentIndex++]}`;
            }
        });

        // 3. Randomize Gallery Section (Moments - take remaining)
        const galleryImgs = document.querySelectorAll('.gallery__item img');
        galleryImgs.forEach(img => {
            if (currentIndex < shuffled.length) {
                img.src = `r-image/${shuffled[currentIndex++]}`;
            } else {
                // If we run out, reshuffle and continue
                const reshuffled = shuffleArray(availableImages);
                let localIdx = 0;
                img.src = `r-image/${reshuffled[localIdx++]}`;
            }
        });
    }

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
            threshold: 0.05, // Nhạy hơn cho mobile
            rootMargin: '0px 0px 50px 0px' // Load sớm hơn 50px trước khi cuộn tới
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    if (entry.target.classList.contains('stats')) {
                        animateStats();
                    }
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
        
        // Dự phòng cho mobile: Tự động hiện sau 2 giây nếu chưa kịp cuộn
        setTimeout(() => {
            animatedElements.forEach(el => el.classList.add('animated'));
        }, 2000);
    }

    // ----- Stats Counter Animation -----
    function animateStats() {
        const stats = document.querySelectorAll('.stats__number');
        stats.forEach(stat => {
            if (stat.dataset.animated === 'true') return;
            
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000;
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
        randomizeImages(); // Run randomization first
        initNavbarScroll();
        initMobileMenu();
        initScrollAnimations();
        initBackToTop();
        
        document.body.classList.add('loaded');
        console.log('🐅 Ready Web Initialized with Random Images');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
