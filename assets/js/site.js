/* WINDCHIC v6 — progressive enhancement only: every page works without JS. */
(() => {
  'use strict';
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  /* Language preference: remember explicit choices; on a first visit to the
     English home page, send Chinese/French browsers to their version once. */
  const LANG_KEY = 'windchic-lang';
  const pageLang = document.documentElement.lang.startsWith('zh') ? 'zh' : document.documentElement.lang.slice(0, 2);
  $$('a[data-lang]').forEach(a => a.addEventListener('click', () => {
    try { localStorage.setItem(LANG_KEY, a.dataset.lang); } catch (_) {}
  }));
  if (document.body.classList.contains('page-index') && pageLang === 'en') {
    let saved = null;
    try { saved = localStorage.getItem(LANG_KEY); } catch (_) {}
    const nav = (navigator.language || '').toLowerCase();
    const want = saved || (nav.startsWith('zh') ? 'zh' : nav.startsWith('fr') ? 'fr' : null);
    let done = false; try { done = !!sessionStorage.getItem('windchic-redirected'); } catch (_) {}
    if (want && want !== 'en' && !done) {
      try { sessionStorage.setItem('windchic-redirected', '1'); } catch (_) {}
      location.replace(want + '/');
      return;
    }
  }

  /* Header state */
  const header = $('[data-header]');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const btn = $('.menu-btn'), menu = $('#mobile-menu');
  const setMenu = open => {
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? btn.dataset.closeLabel : btn.dataset.openLabel);
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    header && header.classList.toggle('is-scrolled', open || scrollY > 40);
    if (open) $('a', menu)?.focus();
  };
  btn?.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu || document.createElement('div')).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && btn?.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); } });
  matchMedia('(min-width: 961px)').addEventListener('change', e => e.matches && setMenu(false));

  /* Reveal on scroll */
  const reveals = $$('.reveal, .img-reveal, .footer-word');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));

  /* Count-up numbers */
  const counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    const co = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = parseInt(el.dataset.count, 10) || 0, t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0'; requestAnimationFrame(tick); co.unobserve(el);
    }), { threshold: 0.6 });
    counters.forEach(el => co.observe(el));
  }

  /* Subtle parallax on page headers */
  const par = $('.subhero-img');
  if (par && !reduced) {
    let ticking = false;
    addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight);
        par.style.transform = `translateY(${y * 0.25}px) scale(1.05)`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* Hero carousel */
  const slides = $$('.hero-slide');
  if (slides.length > 1) {
    let i = 0, timer = null;
    const count = $('.hero-count b'), bar = $('.hero-progress i');
    const show = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === i);
        const img = $('img', s);
        if (k === i && img.loading === 'lazy') img.loading = 'eager';
      });
      if (count) count.textContent = String(i + 1).padStart(2, '0');
      if (bar) { bar.classList.remove('run'); void bar.offsetWidth; if (!reduced) bar.classList.add('run'); }
    };
    const start = () => { clearInterval(timer); if (!reduced && !document.hidden) timer = setInterval(() => show(i + 1), 7000); };
    $('.hero-next')?.addEventListener('click', () => { show(i + 1); start(); });
    $('.hero-prev')?.addEventListener('click', () => { show(i - 1); start(); });
    document.addEventListener('visibilitychange', start);
    show(0); start();
  }

  /* Clipboard helper */
  const copy = async (text, statusEl, msgs) => {
    try { await navigator.clipboard.writeText(text); if (statusEl) statusEl.textContent = msgs.ok; }
    catch (_) { if (statusEl) statusEl.textContent = msgs.fail; }
  };

  /* Contact form: 3 steps, builds a brief for email / WeChat / WhatsApp */
  const form = $('#brief-form');
  const i18nEl = $('#form-i18n');
  const L = i18nEl ? JSON.parse(i18nEl.textContent) : {};
  const msgs = { ok: L['form.copied'] || 'Copied.', fail: L['form.copyfail'] || 'Copy manually.' };
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => copy(b.dataset.copy, b.parentElement.querySelector('.status'), msgs)));

  if (form) {
    const steps = $$('.form-step', form), progress = $('.form-progress');
    let step = 1;
    const go = n => {
      step = n;
      steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === n));
      if (progress) progress.textContent = `0${n} / 03`;
      $('input, select, textarea', steps[n - 1])?.focus({ preventScroll: true });
      form.closest('.form-card').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    };
    const valid = n => {
      for (const el of $$('[required]', steps[n - 1])) {
        const bad = !el.value.trim() || (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
        el.setAttribute('aria-invalid', String(bad));
        if (bad) { el.setCustomValidity(L['form.required'] || ''); el.reportValidity(); el.setCustomValidity(''); el.focus(); return false; }
      }
      return true;
    };
    $$('[data-next]', form).forEach(b => b.addEventListener('click', () => valid(step) && go(Math.min(3, step + 1))));
    $$('[data-back]', form).forEach(b => b.addEventListener('click', () => go(Math.max(1, step - 1))));
    $$('input, select, textarea', form).forEach(el => el.addEventListener('input', () => el.removeAttribute('aria-invalid')));

    // Preselect a service from ?service=<id>
    const pre = new URLSearchParams(location.search).get('service');
    if (pre) { const cb = $(`input[data-service="${CSS.escape(pre)}"]`, form); if (cb) cb.checked = true; }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!valid(3)) return;
      const f = new FormData(form), ns = L['form.notset'] || '—';
      const v = k => (f.get(k) || '').toString().trim() || ns;
      const services = f.getAll('services').join(', ') || ns;
      const lines = [
        'WINDCHIC',
        '',
        `${L['form.type']}: ${v('type')}`,
        `${L['form.services']}: ${services}`,
        `${L['form.location']}: ${v('location')}`,
        `${L['form.date']}: ${v('date')}`,
        `${L['form.guests']}: ${v('guests')}`,
        `${L['form.budget']}: ${v('budget')}`,
        `${L['form.desc']}: ${v('description')}`,
        '',
        `${L['form.name']}: ${v('name')}`,
        `${L['form.company']}: ${v('company')}`,
        `${L['form.mail']}: ${v('email')}`,
        `${L['form.messenger']}: ${v('messenger')}`,
      ];
      const text = lines.join('\n');
      $('#brief-output').textContent = text;
      $('#send-email').href = 'mailto:info@windchic.com?subject=' + encodeURIComponent(L['form.subject'] || 'WINDCHIC') + '&body=' + encodeURIComponent(text);
      $('#copy-brief').onclick = () => copy(text, $('#copy-status'), msgs);
      form.hidden = true;
      const res = $('#form-result');
      res.hidden = false;
      res.focus();
    });
  }
})();
