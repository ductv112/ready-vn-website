/* =============================================
   Ready.vn - Main JavaScript
   ============================================= */

(function () {
    'use strict';

    // ----- Loading Screen -----
    function initLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (!loadingScreen) return;

        window.addEventListener('load', function () {
            setTimeout(function () {
                loadingScreen.classList.add('hidden');
            }, 600);

            // Remove from DOM after transition
            loadingScreen.addEventListener('transitionend', function () {
                loadingScreen.remove();
            });
        });
    }

    // ----- Header Scroll Effect -----
    function initHeaderScroll() {
        const header = document.querySelector('header');
        if (!header) return;

        let ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    header.classList.toggle('scrolled', window.scrollY > 80);
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ----- Active Navigation Link -----
    function initActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-links a');

        if (sections.length === 0 || navLinks.length === 0) return;

        function setActiveLink() {
            var scrollY = window.scrollY + 120;

            sections.forEach(function (section) {
                var sectionTop = section.offsetTop;
                var sectionHeight = section.offsetHeight;
                var sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(function (link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        window.addEventListener('scroll', setActiveLink);
        setActiveLink();
    }

    // ----- Mobile Menu -----
    function initMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');

        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    // ----- Smooth Scrolling -----
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
            anchor.addEventListener('click', function (e) {
                var href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                var target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ----- Parallax Effect (Hero) -----
    function initParallax() {
        var hero = document.getElementById('hero');
        if (!hero) return;

        var ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    var scrolled = window.pageYOffset;
                    if (scrolled < window.innerHeight) {
                        hero.style.transform = 'translateY(' + (scrolled * 0.4) + 'px)';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ----- Contact Form -----
    function initContactForm() {
        var form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var btn = form.querySelector('button[type="submit"]');
            var originalText = btn.textContent;

            // Simple feedback animation
            btn.textContent = 'Đang gửi...';
            btn.disabled = true;

            setTimeout(function () {
                alert('Cảm ơn bạn! Tin nhắn đã được gửi thành công. Chúng tôi sẽ liên hệ sớm!');
                form.reset();
                btn.textContent = originalText;
                btn.disabled = false;
            }, 800);
        });
    }

    // ----- Back to Top Button -----
    function initBackToTop() {
        var btn = document.querySelector('.back-to-top');
        if (!btn) return;

        var ticking = false;

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    btn.classList.toggle('visible', window.scrollY > 400);
                    ticking = false;
                });
                ticking = true;
            }
        });

        btn.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ----- AOS (Animate on Scroll) Init -----
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true,
                offset: 80,
                easing: 'ease-out-cubic'
            });
        }
    }

    // ----- Counter Animation (for stats) -----
    function initCounterAnimation() {
        var statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers.length === 0) return;

        var animated = false;

        function animateCounters() {
            if (animated) return;

            var statsSection = document.querySelector('.about-stats');
            if (!statsSection) return;

            var rect = statsSection.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
                animated = true;

                statNumbers.forEach(function (el) {
                    var target = parseInt(el.getAttribute('data-target'), 10);
                    if (isNaN(target)) return;

                    var duration = 1500;
                    var start = 0;
                    var startTime = null;

                    function step(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var progress = Math.min((timestamp - startTime) / duration, 1);
                        // Ease out cubic
                        var eased = 1 - Math.pow(1 - progress, 3);
                        el.textContent = Math.floor(eased * target) + '+';
                        if (progress < 1) {
                            window.requestAnimationFrame(step);
                        }
                    }

                    window.requestAnimationFrame(step);
                });
            }
        }

        window.addEventListener('scroll', animateCounters);
        animateCounters(); // Check on load
    }

    // ----- Initialize Everything -----
    function init() {
        initLoadingScreen();
        initHeaderScroll();
        initActiveNav();
        initMobileMenu();
        initSmoothScroll();
        initParallax();
        initContactForm();
        initBackToTop();
        initCounterAnimation();
        initAOS();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
