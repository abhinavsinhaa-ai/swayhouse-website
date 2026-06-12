(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    heroAnimation();
    initScrollReveal();
    initStickyHeader();
    initMobileMenu();
    initSmoothScroll();
    renderCreators();
    initContactForm();
  }

  function heroAnimation() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const lines = document.querySelectorAll('.hero__headline .line-inner');
        lines.forEach(line => line.classList.add('animate'));
        const subtitle = document.getElementById('heroSubtitle');
        if (subtitle) subtitle.classList.add('animate');
        const cta = document.getElementById('heroCta');
        if (cta) cta.classList.add('animate');
      }, 200);
    });
  }

  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-child');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });
    revealElements.forEach(el => observer.observe(el));
  }

  function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 80) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-menu__link');
    if (!hamburger || !mobileMenu) return;
    function toggleMenu() {
      const isActive = hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isActive);
      mobileMenu.setAttribute('aria-hidden', !isActive);
      document.body.style.overflow = isActive ? 'hidden' : '';
    }
    function closeMenu() {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const headerHeight = parseInt(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height')
        ) || 72;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
      });
    });
  }

  /* ========================================
   * COMPACT ROSTER CARD RENDERER
   * Cards link to dedicated profile pages.
   * ======================================== */

  function renderCreators() {
    const container = document.getElementById('creatorsContainer');
    if (!container) return;

    const creators = typeof CREATORS !== 'undefined' ? CREATORS : [];

    if (creators.length === 0) {
      container.innerHTML = `
        <div class="creators__empty reveal-child" style="grid-column: 1 / -1;">
          <div class="creators__empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p class="creators__empty-text">Our roster is growing.</p>
          <p class="creators__empty-sub">Exciting announcements coming soon.</p>
        </div>
      `;
    } else {
      container.innerHTML = creators.map((creator, index) => {
        const hasImages = creator.images && creator.images.length > 0;
        const coverHtml = hasImages 
          ? `<img src="${creator.images[0]}" alt="${creator.name}" loading="lazy">` 
          : `<div class="roster-card__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
             </div>`;

        const profileUrl = creator.profilePage || '#';

        return `
          <a href="${profileUrl}" class="roster-card clickable reveal-child" data-id="${creator.id}" style="--stagger: ${index}">
            <div class="roster-card__photo">
              ${coverHtml}
            </div>
            <div class="roster-card__info">
              <span class="roster-card__tag">Managed by SwayHouse</span>
              <h3 class="roster-card__name">${creator.name}</h3>
              
              <div class="flex gap-6 mb-4 pb-4 border-b border-near-black/5">
                <div class="flex flex-col">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Niche</span>
                  <span class="text-xs font-semibold text-near-black">${creator.niche || 'Lifestyle & Feel Good'}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Platform</span>
                  <span class="inline-flex items-center gap-1 text-xs font-semibold text-near-black">
                    <svg class="w-3.5 h-3.5 text-coral" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                    Instagram
                  </span>
                </div>
              </div>
              
              <p class="roster-card__bio" style="margin-top: 0;">${creator.bio || creator.message}</p>
              <span class="roster-card__view-link">
                View Profile
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </span>
            </div>
          </a>
        `;
      }).join('');
    }

    // Re-observe newly injected elements for scroll reveal
    const newRevealElements = container.querySelectorAll('.reveal-child');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
      });
      newRevealElements.forEach(el => observer.observe(el));
    } else {
      newRevealElements.forEach(el => el.classList.add('revealed'));
    }
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    if (!form || !submitBtn) return;
    const choiceButtons = document.querySelectorAll('.form__choice-btn');
    const hiddenTypeInput = document.getElementById('formType');
    choiceButtons.forEach(button => {
      button.addEventListener('click', () => {
        choiceButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        if (hiddenTypeInput) {
          hiddenTypeInput.value = button.getAttribute('data-value');
        }
      });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        if (response.ok) {
          form.style.display = 'none';
          if (formSuccess) formSuccess.classList.add('active');
          form.reset();
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
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
