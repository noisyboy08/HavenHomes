/* ═══════════════════════════════════════════════════════════
   HavenHomes — Advanced JavaScript
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Preloader ───────────────────────────────────── */
  const preloader = document.querySelector('.preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('loaded'), 600);
    });
    // Fallback: hide after 3s even if load event doesn't fire
    setTimeout(() => preloader.classList.add('loaded'), 3000);
  }

  /* ── 2. Dark Mode Toggle ────────────────────────────── */
  const themeToggles = document.querySelectorAll('.theme-toggle');
  const savedTheme = localStorage.getItem('hh-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('hh-theme', next);
    });
  });

  /* ── 3. Scroll Progress Bar ─────────────────────────── */
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      scrollProgress.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── 4. Scroll-triggered reveals ────────────────────── */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ── 5. Stagger delay helper ────────────────────────── */
  document.querySelectorAll('.stagger').forEach(parent => {
    Array.from(parent.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

  /* ── 6. Navigation scroll effect ────────────────────── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const onNavScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  /* ── 7. Mobile hamburger menu ───────────────────────── */
  const hamburger = document.querySelector('.nav__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const opening = !mobileMenu.classList.contains('open');
      hamburger.classList.toggle('active', opening);
      mobileMenu.classList.toggle('open', opening);
      document.body.style.overflow = opening ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── 8. Animated counters ───────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => counterObs.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 2200;
    const start = performance.now();
    function update(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ── 9. Testimonials slider with swipe ──────────────── */
  const track = document.querySelector('.testimonials__track');
  const prevBtn = document.querySelector('.testimonials__prev');
  const nextBtn = document.querySelector('.testimonials__next');
  let slideIdx = 0;

  if (track && prevBtn && nextBtn) {
    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;

    function getPerView() { return window.innerWidth > 1024 ? 2 : 1; }

    function updateSlider() {
      const perView = getPerView();
      const gap = 24;
      const containerW = track.parentElement.offsetWidth;
      const cardW = (containerW - gap * (perView - 1)) / perView;
      cards.forEach(c => c.style.minWidth = cardW + 'px');
      const maxIdx = Math.max(total - perView, 0);
      slideIdx = Math.min(slideIdx, maxIdx);
      track.style.transform = `translateX(-${slideIdx * (cardW + gap)}px)`;
    }

    nextBtn.addEventListener('click', () => { slideIdx++; updateSlider(); });
    prevBtn.addEventListener('click', () => { slideIdx = Math.max(slideIdx - 1, 0); updateSlider(); });
    window.addEventListener('resize', () => { slideIdx = 0; updateSlider(); });
    updateSlider();

    // Touch swipe
    let startX = 0, diff = 0, dragging = false;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; dragging = true; }, { passive: true });
    track.addEventListener('touchmove', e => { if (dragging) diff = e.touches[0].clientX - startX; }, { passive: true });
    track.addEventListener('touchend', () => {
      if (Math.abs(diff) > 50) {
        diff < 0 ? slideIdx++ : slideIdx = Math.max(slideIdx - 1, 0);
        updateSlider();
      }
      diff = 0; dragging = false;
    });
  }

  /* ── 10. Property filtering ─────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const propCards = document.querySelectorAll('.projects-grid .property-card');
  const noResults = document.querySelector('.no-results');

  if (filterBtns.length && propCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const f = btn.dataset.filter;
        let shown = 0;
        propCards.forEach(card => {
          const match = f === 'all' || card.dataset.category === f;
          card.classList.toggle('hidden', !match);
          if (match) shown++;
        });
        if (noResults) noResults.style.display = shown === 0 ? 'block' : 'none';
        applySearchFilter();
      });
    });
  }

  /* ── 11. Property search ────────────────────────────── */
  const searchInput = document.querySelector('.search-box__input');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(applySearchFilter, 200);
    });
  }

  function applySearchFilter() {
    if (!searchInput || !propCards.length) return;
    const q = searchInput.value.toLowerCase().trim();
    const activeFilter = document.querySelector('.filter-btn.active');
    const category = activeFilter ? activeFilter.dataset.filter : 'all';
    let shown = 0;

    propCards.forEach(card => {
      const catMatch = category === 'all' || card.dataset.category === category;
      const text = card.textContent.toLowerCase();
      const searchMatch = !q || text.includes(q);
      const visible = catMatch && searchMatch;
      card.classList.toggle('hidden', !visible);
      if (visible) shown++;
    });

    if (noResults) noResults.style.display = shown === 0 ? 'block' : 'none';
  }

  /* ── 12. Favorite toggle ────────────────────────────── */
  document.querySelectorAll('.property-card__favorite').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle('liked');
      // Quick scale animation
      btn.style.transform = 'scale(1.3)';
      setTimeout(() => btn.style.transform = '', 200);
    });
  });

  /* ── 13. Contact form validation ────────────────────── */
  const form = document.getElementById('contactForm');
  const formSuccess = document.querySelector('.form-success');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) { field.classList.add('error'); valid = false; }
      });

      const email = form.querySelector('input[type="email"]');
      if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.classList.add('error');
        valid = false;
      }

      if (valid) {
        form.style.display = 'none';
        if (formSuccess) formSuccess.classList.add('show');
      }
    });

    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => {
        if (field.value.trim()) field.classList.remove('error');
      });
    });
  }

  /* ── 14. Lightbox ───────────────────────────────────── */
  const lightbox = document.querySelector('.lightbox');
  const lbImg = document.querySelector('.lightbox__img');
  const lbClose = document.querySelector('.lightbox__close');
  const lbPrev = document.querySelector('.lightbox__prev');
  const lbNext = document.querySelector('.lightbox__next');
  const galleryImgs = document.querySelectorAll('[data-lightbox]');
  let lbIdx = 0, lbSrcs = [];

  if (galleryImgs.length && lightbox) {
    lbSrcs = Array.from(galleryImgs).map(el => el.dataset.lightbox);
    galleryImgs.forEach((el, i) => el.addEventListener('click', () => { lbIdx = i; openLB(); }));
    lbClose.addEventListener('click', closeLB);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
    if (lbPrev) lbPrev.addEventListener('click', () => navLB(-1));
    if (lbNext) lbNext.addEventListener('click', () => navLB(1));
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowLeft') navLB(-1);
      if (e.key === 'ArrowRight') navLB(1);
    });

    // Touch swipe for lightbox
    let lbStartX = 0, lbDiffX = 0;
    lightbox.addEventListener('touchstart', e => { lbStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchmove', e => { lbDiffX = e.touches[0].clientX - lbStartX; }, { passive: true });
    lightbox.addEventListener('touchend', () => {
      if (Math.abs(lbDiffX) > 60) navLB(lbDiffX < 0 ? 1 : -1);
      lbDiffX = 0;
    });
  }

  function openLB() { lbImg.src = lbSrcs[lbIdx]; lightbox.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeLB() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
  function navLB(d) { lbIdx = (lbIdx + d + lbSrcs.length) % lbSrcs.length; lbImg.src = lbSrcs[lbIdx]; }

  /* ── 15. Back to top ────────────────────────────────── */
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => btt.classList.toggle('visible', window.scrollY > 500), { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── 16. Smooth anchor scrolling ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ── 17. Lazy image loading ─────────────────────────── */
  if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[data-src]');
    const lazyObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.addEventListener('load', () => img.classList.add('loaded'));
          lazyObs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    lazyImgs.forEach(img => lazyObs.observe(img));
  }

  /* ── 18. Typing text animation (hero) ───────────────── */
  const typingEl = document.querySelector('[data-typing]');
  if (typingEl) {
    const words = typingEl.dataset.typing.split('|');
    let wordIdx = 0, charIdx = 0, deleting = false;

    function typeStep() {
      const word = words[wordIdx];
      if (!deleting) {
        typingEl.textContent = word.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === word.length) {
          setTimeout(() => { deleting = true; typeStep(); }, 2000);
          return;
        }
        setTimeout(typeStep, 80);
      } else {
        typingEl.textContent = word.substring(0, charIdx);
        charIdx--;
        if (charIdx < 0) {
          deleting = false;
          charIdx = 0;
          wordIdx = (wordIdx + 1) % words.length;
          setTimeout(typeStep, 400);
          return;
        }
        setTimeout(typeStep, 40);
      }
    }
    setTimeout(typeStep, 1000);
  }

  /* ── 19. Parallax-lite on scroll (hero elements) ────── */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    // Store each element's base CSS transform so parallax doesn't overwrite it
    parallaxEls.forEach(el => {
      el._baseTransform = getComputedStyle(el).transform;
      if (el._baseTransform === 'none') el._baseTransform = '';
    });
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        const yOffset = scrollY * speed;
        // Preserve the original translateX(-50%) or any base transform
        if (el.classList.contains('hero__title')) {
          el.style.transform = `translateX(-50%) translateY(${yOffset}px)`;
        } else {
          el.style.transform = `translateY(${yOffset}px)`;
        }
      });
    }, { passive: true });
  }

  /* ── 20. Active nav link highlight ──────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) link.classList.add('active');
  });

});
