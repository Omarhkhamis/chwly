/* Home page: ticker, products, routine tabs, bundles, ingredients, waitlist, hero motion */
(() => {
  const S = window.Store;
  const { D, $, $$, byId, money, vars, packArt, cardHTML, bundleHTML, productUrl } = S;

  /* ---------- Ticker ---------- */
  const run = D.products.map(p => `<span style="--c:${p.color}">${p.name}</span><img src="assets/img/gummy.webp" alt="" width="700" height="690">`).join('');
  $('[data-ticker]').innerHTML = run + run;

  /* ---------- Products grid + filters ---------- */
  const grid = $('[data-product-grid]');
  const renderProducts = (filter = 'all') => {
    grid.innerHTML = D.products
      .filter(p => filter === 'all' || p.cat === filter)
      .map(p => cardHTML(p, p.featured && filter === 'all')).join('');
  };
  renderProducts();
  $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    renderProducts(btn.dataset.filter);
    if (S.motion) gsap.from('.product-grid .card', { y: 16, opacity: 0, duration: .35, stagger: .05, ease: 'power2.out' });
  }));

  /* ---------- Routine tabs ---------- */
  const routine = $('[data-routine]');
  const tabs = $('[data-routine-tabs]');
  const panel = $('[data-routine-panel]');
  tabs.innerHTML = D.products.map((p, i) => `
    <button type="button" role="tab" id="tab-${p.id}" aria-controls="routine-panel"
      aria-selected="${i === 1}" tabindex="${i === 1 ? 0 : -1}" data-routine-id="${p.id}">${p.catLabel}</button>`).join('');

  function showRoutine(id, animate = true) {
    const p = byId(id);
    routine.style.cssText = vars(p);
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    $$('[role="tab"]', tabs).forEach(t => {
      const on = t.dataset.routineId === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    panel.innerHTML = `
      <div class="routine-text">
        <p class="routine-name" aria-hidden="true">${p.name}</p>
        <h3 class="routine-line">${p.line}</h3>
        <dl class="facts">
          <div><dt>وش فيها</dt><dd>${p.ingredientsAr}</dd></div>
          <div><dt>لمين</dt><dd>${p.forWho}</dd></div>
          <div><dt>متى</dt><dd>${p.when}</dd></div>
        </dl>
        <div class="routine-cta">
          <button class="btn btn-primary" type="button" data-add="${p.id}">أضف للسلة · ${money(p.prices[1])}</button>
          <a class="link-arrow" href="${productUrl(p.id)}">صفحة المنتج <svg class="i"><use href="#i-arrow"/></svg></a>
        </div>
      </div>
      <a class="routine-art" href="${productUrl(p.id)}" tabindex="-1" aria-hidden="true">${packArt(p)}</a>`;
    if (animate && S.motion) {
      gsap.from('.routine-name', { x: -40, opacity: 0, duration: .5, ease: 'power3.out' });
      gsap.from('.routine-art', { rotation: -10, y: 30, opacity: 0, duration: .55, ease: 'back.out(1.6)' });
    }
  }
  showRoutine(D.products[1].id, false);
  tabs.addEventListener('click', e => {
    const t = e.target.closest('[role="tab"]');
    if (t) showRoutine(t.dataset.routineId);
  });
  // Arrow keys follow RTL reading order: left = next
  tabs.addEventListener('keydown', e => {
    const list = $$('[role="tab"]', tabs);
    const i = list.indexOf(document.activeElement);
    const step = { ArrowLeft: 1, ArrowRight: -1 }[e.key];
    if (i < 0 || !step) return;
    e.preventDefault();
    const next = list[(i + step + list.length) % list.length];
    next.focus();
    showRoutine(next.dataset.routineId);
  });

  /* ---------- Bundles & ingredients ---------- */
  $('[data-bundles]').innerHTML = D.bundles.map(bundleHTML).join('');
  S.mountBuilder($('[data-builder]'));
  $('[data-ingredients]').innerHTML = D.products.map(p => `
    <li style="--c:${p.color}"><span class="ing-dot" aria-hidden="true"></span><b><a href="${productUrl(p.id)}">${p.name}</a></b><span>${p.ingredientsAr}</span></li>`).join('');

  /* ---------- Waitlist (placeholder: nothing is sent) ---------- */
  const wl = $('[data-waitlist]');
  wl.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#wl-phone');
    const msg = $('[data-form-msg]');
    const phone = input.value.replace(/\D/g, '').replace(/^(966|0)/, '');
    const ok = /^5\d{8}$/.test(phone);
    msg.classList.toggle('is-error', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    msg.textContent = ok ? 'تم! رح نرسل لك أول ما نفتح. (تجربة: ما انرسل شي)' : 'اكتب رقم جوال سعودي يبدأ بـ 5 ومن 9 أرقام.';
    if (ok) wl.reset();
  });

  /* ---------- Motion ---------- */
  S.animate();
  if (!S.motion) return;

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero-title .line', { yPercent: 50, opacity: 0, duration: .6, stagger: .08 })
    .from('.lead, .hero-cta, .hero-facts', { y: 14, opacity: 0, duration: .45, stagger: .06 }, '-=.35')
    .from('.hero-photo', { scale: .94, opacity: 0, duration: .6 }, .1)
    .from('.gum', { y: -220, rotation: -140, opacity: 0, duration: .9, ease: 'bounce.out', stagger: .12 }, .3)
    .from('.sticker', { scale: 0, rotation: -60, duration: .5, ease: 'back.out(2)' }, .7);
  gsap.to('.gum', { y: '+=12', rotation: '+=10', duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: .5, delay: 1.6 });

  // Signature: the hero photo gets bitten deeper as you scroll away
  gsap.fromTo('.hero-photo', { '--bite': '40px' }, {
    '--bite': '120px', ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  gsap.to('.ticker-track', {
    xPercent: -25, ease: 'none',
    scrollTrigger: { trigger: '.ticker', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  gsap.from('.product-grid .card', {
    y: 28, opacity: 0, duration: .5, stagger: .07, ease: 'power2.out',
    scrollTrigger: { trigger: '.product-grid', start: 'top 82%' }
  });

  const mm = gsap.matchMedia();
  // Desktop: pin "why" — the capsule gets eaten, the gummy takes its place
  mm.add('(min-width: 900px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '.why', start: 'top top', end: '+=130%', pin: true, scrub: .6 } })
      .fromTo('.capsule', { scale: 1, opacity: 1, rotation: 35 }, { scale: .15, opacity: 0, rotation: 200, duration: 1 })
      .fromTo('.why-gum', { scale: .2, opacity: 0, rotation: -120 }, { scale: 1, opacity: 1, rotation: 0, duration: 1 }, '<.35')
      .fromTo('.why-list li', { opacity: .2 }, { opacity: 1, duration: .3, stagger: .45 }, 0);
  });
  // Mobile: same swap, scrubbed as the visual scrolls through (no pin)
  mm.add('(max-width: 899px)', () => {
    gsap.set('.why-list li', { opacity: 1 }); // text stays fully visible on mobile
    gsap.timeline({ scrollTrigger: { trigger: '.why-visual', start: 'top 85%', end: 'center 45%', scrub: .5 } })
      .fromTo('.capsule', { scale: 1, opacity: 1, rotation: 35 }, { scale: .15, opacity: 0, rotation: 200, duration: 1 })
      .fromTo('.why-gum', { scale: .2, opacity: 0, rotation: -120 }, { scale: 1, opacity: 1, rotation: 0, duration: 1 }, '<.35');
  });

  gsap.from('.wl-gum', {
    y: -120, rotation: -90, opacity: 0, duration: .8, ease: 'bounce.out',
    scrollTrigger: { trigger: '.waitlist-card', start: 'top 75%' }
  });
})();
