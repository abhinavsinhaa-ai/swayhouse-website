(function () {
  'use strict';

  /* =============================================
   * INIT — fires when DOM is ready
   * ============================================= */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initLenis();
    heroAnimation();
    initScrollAnimations();
    initStickyHeader();
    initMobileMenu();
    initSmoothScroll();
    initContactForm();
  }

  /* =============================================
   * LENIS SMOOTH SCROLL
   * ============================================= */
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ lerp: 0.08 });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* =============================================
   * HERO ANIMATION — exact match to Vercel site
   *
   * "You Create." — letters appear one by one (stagger 0.05s each)
   * "We Elevate." — fades up at 0.9s
   * Underline draws at 1.7s
   * Subtitle fades up at 2.1s
   * CTAs fade up at 2.3s
   * ============================================= */
  function heroAnimation() {
    // ── "You Create." letter-by-letter ──
    const line1 = document.querySelector('.hero__headline .line-outer:first-child');
    if (line1) {
      const text = line1.querySelector('.line-inner');
      if (text) {
        const raw = text.textContent;
        // Split into individual letter spans
        text.innerHTML = raw.split('').map(char =>
          `<span class="letter-char" style="opacity:0;display:inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('');
        
        const letters = text.querySelectorAll('.letter-char');
        letters.forEach((letter, i) => {
          setTimeout(() => {
            letter.style.opacity = '1';
            letter.style.transition = 'opacity 0.02s ease';
          }, 200 + i * 50); // 0.05s stagger, starting at 200ms
        });
      }
    }

    // ── "We Elevate." fade up ──
    const line2 = document.querySelector('.hero__headline .line-outer:last-child');
    if (line2) {
      line2.style.opacity = '0';
      line2.style.transform = 'translateY(20px)';
      line2.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      setTimeout(() => {
        line2.style.opacity = '1';
        line2.style.transform = 'translateY(0)';
      }, 900);
    }

    // ── Underline draws left to right ──
    const underline = document.querySelector('.hero__underline');
    if (underline) {
      underline.style.transform = 'scaleX(0)';
      underline.style.transformOrigin = 'left';
      underline.style.transition = 'transform 0.9s cubic-bezier(0.16,1,0.3,1)';
      setTimeout(() => {
        underline.style.transform = 'scaleX(1)';
      }, 1700);
    }

    // ── Subtitle fades up ──
    const subtitle = document.getElementById('heroSubtitle');
    if (subtitle) {
      subtitle.style.opacity = '0';
      subtitle.style.transform = 'translateY(25px)';
      subtitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      setTimeout(() => {
        subtitle.style.opacity = '1';
        subtitle.style.transform = 'translateY(0)';
      }, 2100);
    }

    // ── CTA buttons fade up ──
    const cta = document.getElementById('heroCta');
    if (cta) {
      cta.style.opacity = '0';
      cta.style.transform = 'translateY(20px)';
      cta.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      setTimeout(() => {
        cta.style.opacity = '1';
        cta.style.transform = 'translateY(0)';
      }, 2300);
    }

    // ── Logo draws in (SVG path animation) ──
    const logoPaths = document.querySelectorAll('.logo-element svg path');
    logoPaths.forEach((path, i) => {
      const len = path.getTotalLength ? path.getTotalLength() : 100;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = `stroke-dashoffset ${i === 0 ? '1s' : '1.2s'} ease-in-out ${i === 0 ? '0.2s' : '0.5s'}`;
      setTimeout(() => {
        path.style.strokeDashoffset = '0';
      }, 50);
    });
  }

  /* =============================================
   * SCROLL ANIMATIONS — IntersectionObserver
   * Mirrors Vercel's whileInView behaviour exactly:
   *
   * About heading: slide in from left (x:-50)
   * About text: fade up (y:30)
   * Value pillars: fade up with stagger + SVG draw
   * Services cards: fade up (y:80) with stagger
   * Creator card: fade up (y:60)
   * What-to-expect: fade up (y:30)
   * Contact: scale up from 0.95
   * ============================================= */
  function initScrollAnimations() {
    // Helper: observe a single element, run callback when it enters view
    function onVisible(el, callback, margin = '-60px') {
      if (!el) return;
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            callback(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: `0px 0px ${margin} 0px` });
      obs.observe(el);
    }

    // Helper: animate an element into view
    function animateIn(el, { x = 0, y = 0, delay = 0, duration = 800, ease = 'cubic-bezier(0.16,1,0.3,1)' } = {}) {
      el.style.opacity = '0';
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.transition = `opacity ${duration}ms ${ease} ${delay}ms, transform ${duration}ms ${ease} ${delay}ms`;
      // Trigger in next frame so initial state is applied
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translate(0, 0)';
      }));
    }

    // ── ABOUT SECTION ──
    const aboutHeading = document.querySelector('#about .lg\\:col-span-1, #about .reveal:first-child, #about [class*="reveal"]:first-child');
    const aboutHeadingDirect = document.querySelector('#about .grid > div:first-child');
    if (aboutHeadingDirect) {
      aboutHeadingDirect.style.opacity = '0';
      aboutHeadingDirect.style.transform = 'translateX(-50px)';
      onVisible(aboutHeadingDirect, (el) => {
        setTimeout(() => animateIn(el, { x: 0, y: 0, delay: 0, duration: 900 }), 10);
      });
    }

    const aboutText = document.querySelector('#about .grid > div:last-child');
    if (aboutText) {
      aboutText.style.opacity = '0';
      aboutText.style.transform = 'translateY(30px)';
      onVisible(aboutText, (el) => {
        setTimeout(() => animateIn(el, { x: 0, y: 0, delay: 200, duration: 800 }), 10);
      });
    }

    // ── VALUE PILLARS — stagger fade up + SVG draw ──
    const pillarsGrid = document.querySelector('#about .grid.grid-cols-1.md\\:grid-cols-3, #about .md\\:grid-cols-3');
    const pillars = document.querySelectorAll('#about .md\\:grid-cols-3 > div, #about [class*="grid-cols-3"] > div');
    
    pillars.forEach((pillar, i) => {
      pillar.style.opacity = '0';
      pillar.style.transform = 'translateY(30px)';
    });

    if (pillars.length) {
      const firstPillar = pillars[0];
      onVisible(firstPillar, () => {
        pillars.forEach((pillar, i) => {
          const delay = i * 150;
          setTimeout(() => {
            animateIn(pillar, { delay: 0, duration: 800 });
          }, delay);
          // Draw SVG paths inside each pillar
          drawSVGPaths(pillar, i * 150 + 100);
        });
      });
    }

    // ── SERVICES HEADING ──
    const servicesH2 = document.querySelector('#services h2.font-cormorant');
    if (servicesH2) {
      servicesH2.style.opacity = '0';
      servicesH2.style.transform = 'translateY(20px)';
      onVisible(servicesH2, (el) => {
        setTimeout(() => animateIn(el, { duration: 800 }), 10);
      });
    }

    const servicesSub = document.querySelector('#services > div > div:first-child p');
    if (servicesSub) {
      servicesSub.style.opacity = '0';
      servicesSub.style.transform = 'translateY(15px)';
      onVisible(servicesSub, (el) => {
        setTimeout(() => animateIn(el, { delay: 150, duration: 800 }), 10);
      });
    }

    // ── SERVICES CARDS — stagger from y:80 ──
    const serviceCards = document.querySelectorAll('#services .grid.grid-cols-1.md\\:grid-cols-2 > div, #services [class*="md:grid-cols-2"] > div');
    serviceCards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(80px)';
    });

    if (serviceCards.length) {
      onVisible(serviceCards[0], () => {
        serviceCards.forEach((card, i) => {
          const delay = i * 120;
          setTimeout(() => {
            animateIn(card, { delay: 0, duration: 700 });
          }, delay);
        });
      }, '-30px');
    }

    // ── FREE AUDIT BANNER — scale from 0.95 ──
    const auditBanner = document.querySelector('#services .bg-coral.rounded-xl');
    if (auditBanner) {
      auditBanner.style.opacity = '0';
      auditBanner.style.transform = 'scale(0.95)';
      auditBanner.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)';
      onVisible(auditBanner, (el) => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }));
      });
    }

    // ── CREATORS SECTION HEADING ──
    const creatorsHeading = document.querySelector('#creators .text-center.mb-16');
    if (creatorsHeading) {
      creatorsHeading.style.opacity = '0';
      creatorsHeading.style.transform = 'translateY(20px)';
      onVisible(creatorsHeading, (el) => {
        setTimeout(() => animateIn(el, { duration: 800 }), 10);
      });
    }

    // ── ADITI CARD — fade up from y:60 ──
    const aditiCard = document.querySelector('#creatorsContainer > a');
    if (aditiCard) {
      aditiCard.style.opacity = '0';
      aditiCard.style.transform = 'translateY(60px)';
      onVisible(aditiCard, (el) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease, translate 0.3s ease';
        }, 50);
      });
    }

    // ── ROSTER FOOTER TEXT ──
    const rosterFooter = document.querySelector('#creators .text-center.reveal');
    if (rosterFooter) {
      rosterFooter.style.opacity = '0';
      onVisible(rosterFooter, (el) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transition = 'opacity 0.8s ease';
        }, 200);
      });
    }

    // ── WHAT TO EXPECT — heading + cards ──
    const expectHeading = document.querySelector('#what-to-expect .text-center.mb-20');
    if (expectHeading) {
      expectHeading.style.opacity = '0';
      expectHeading.style.transform = 'translateY(20px)';
      onVisible(expectHeading, (el) => {
        setTimeout(() => animateIn(el, { duration: 800 }), 10);
      });
    }

    const expectCards = document.querySelectorAll('#what-to-expect .grid.grid-cols-1.lg\\:grid-cols-2 > div');
    expectCards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
    });
    if (expectCards.length) {
      onVisible(expectCards[0], () => {
        expectCards.forEach((card, i) => {
          setTimeout(() => animateIn(card, { delay: 0, duration: 800 }), i * 180);
        });
      });
    }

    // ── CONTACT SECTION ──
    const contactHeading = document.querySelector('#contact .font-cormorant.text-4xl, #contact h2');
    if (contactHeading) {
      contactHeading.style.opacity = '0';
      contactHeading.style.transform = 'translateY(20px)';
      onVisible(contactHeading, (el) => {
        setTimeout(() => animateIn(el, { duration: 800 }), 10);
      });
    }
  }

  /* =============================================
   * SVG PATH DRAWING — only for value pillar icons
   * Targets .svg-path-1/.svg-path-2 etc (not all SVG shapes)
   * ============================================= */
  function drawSVGPaths(container, baseDelay = 0) {
    const paths = container.querySelectorAll('.svg-path-1, .svg-path-2, .svg-path-3, .svg-path-4');
    paths.forEach((path, i) => {
      let len = 100;
      try { if (path.getTotalLength) len = path.getTotalLength(); } catch (e) { len = 100; }
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = `stroke-dashoffset ${1 + i * 0.2}s cubic-bezier(0.16,1,0.3,1) ${(baseDelay + i * 200) / 1000}s`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        path.style.strokeDashoffset = '0';
      }));
    });
  }

  /* =============================================
   * STICKY HEADER
   * ============================================= */
  function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          header.classList.toggle('scrolled', window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* =============================================
   * MOBILE MENU
   * ============================================= */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');
    if (!hamburger || !mobileMenu) return;

    function toggleMenu() {
      const isActive = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';

      // Stagger mobile menu items (Vercel style)
      if (isActive) {
        const menuItems = mobileMenu.querySelectorAll('a');
        menuItems.forEach((item, i) => {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          }, i * 80 + 50);
        });
      }
    }

    function closeMenu() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
    });
  }

  /* =============================================
   * SMOOTH SCROLL
   * ============================================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.pageYOffset - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* =============================================
   * CONTACT FORM
   * ============================================= */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    if (!form || !submitBtn) return;

    document.querySelectorAll('.form__choice-btn').forEach(button => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.form__choice-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const hiddenInput = document.getElementById('formType');
        if (hiddenInput) hiddenInput.value = button.getAttribute('data-value');
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          form.style.display = 'none';
          if (formSuccess) formSuccess.classList.add('active');
          form.reset();
        } else throw new Error();
      } catch {
        form.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('active');
        form.reset();
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
      }
    });
  }

})();
