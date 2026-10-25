/* Shop (all products) and category pages */
(() => {
  const S = window.Store;
  const { D, $, $$, byId, catById, catProducts, catColors, money, vars, packArt, cardHTML, bundleHTML, productUrl, categoryUrl, params, esc } = S;
  const page = document.body.dataset.page;

  const otherCats = current => D.categories.filter(c => c.id !== current).map(c => {
    const p = catColors(c.id);
    return `
      <li data-reveal>
        <a class="cat-tile" href="${categoryUrl(c.id)}" style="${vars(p)}">
          <span class="cat-tile-name">${c.name}</span>
          <span class="cat-tile-line">${c.title}</span>
          <span class="cat-tile-go" aria-hidden="true"><svg class="i"><use href="#i-arrow"/></svg></span>
        </a>
      </li>`;
  }).join('');

  /* ---------- Shop ---------- */
  if (page === 'shop') {
    const grid = $('[data-grid]');
    const search = $('[data-search]');
    const sort = $('[data-sort]');
    const count = $('[data-count]');
    const filters = $('[data-shop-filters]');
    let cat = params.get('c') && catById(params.get('c')) ? params.get('c') : 'all';
    search.value = params.get('q') || '';

    filters.innerHTML = [{ id: 'all', name: 'الكل' }, ...D.categories]
      .map(c => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${c.id === cat}">${c.name}</button>`).join('');

    const norm = s => s.toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
    function render() {
      const q = norm(search.value.trim());
      let list = D.products.filter(p => (cat === 'all' || p.cat === cat) &&
        (!q || norm([p.name, p.catLabel, p.line, p.ingredients, p.ingredientsAr, p.flavorAr].join(' ')).includes(q)));
      if (sort.value === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      if (sort.value === 'price') list = [...list].sort((a, b) => a.prices[1] - b.prices[1]);
      grid.innerHTML = list.map(p => cardHTML(p)).join('') || `
        <li class="empty-state">
          <p class="empty-title">ما لقينا شي بهالاسم.</p>
          <p>جرّب كلمة ثانية، مثل «نوم» أو «بيوتين».</p>
          <button class="link-arrow" type="button" data-reset>عرض كل المنتجات <svg class="i"><use href="#i-arrow"/></svg></button>
        </li>`;
      count.textContent = `${list.length} ${list.length === 1 ? 'منتج' : 'منتجات'}`;
      // Keep the URL shareable
      const u = new URLSearchParams();
      if (cat !== 'all') u.set('c', cat);
      if (search.value.trim()) u.set('q', search.value.trim());
      history.replaceState(null, '', `${location.pathname}${u.toString() ? `?${u}` : ''}${location.hash}`);
    }

    filters.addEventListener('click', e => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      cat = b.dataset.cat;
      $$('[data-cat]', filters).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      render();
      if (S.motion) gsap.from('[data-grid] .card', { y: 16, opacity: 0, duration: .35, stagger: .05 });
    });
    search.addEventListener('input', render);
    sort.addEventListener('change', render);
    grid.addEventListener('click', e => {
      if (!e.target.closest('[data-reset]')) return;
      search.value = ''; cat = 'all';
      $$('[data-cat]', filters).forEach(x => x.setAttribute('aria-pressed', String(x.dataset.cat === 'all')));
      render();
    });
    if (location.hash === '#search') search.focus({ preventScroll: true });

    render();
    $('[data-bundles]').innerHTML = D.bundles.map(bundleHTML).join('');
    S.mountBuilder($('[data-builder]'));
    $('[data-other-cats]').innerHTML = otherCats(null);
    S.animate();
    if (S.motion) gsap.from('[data-grid] .card', { y: 28, opacity: 0, duration: .5, stagger: .07, ease: 'power2.out', delay: .1 });
  }

  /* ---------- Category ---------- */
  if (page === 'category') {
    const c = catById(params.get('c')) || D.categories[0];
    const products = catProducts(c.id);
    const lead = products[0];
    document.title = `${c.name} | chwly تشولي`;
    $('meta[name="description"]')?.setAttribute('content', c.desc);

    const hero = $('[data-cat-hero]');
    hero.style.cssText = vars(lead);
    hero.innerHTML = `
      <div class="wrap cat-hero-grid">
        <div class="cat-hero-copy">
          <nav class="crumbs" aria-label="مسار الصفحة">
            <ol><li><a href="index.html">الرئيسية</a></li><li><a href="shop.html">المتجر</a></li><li aria-current="page">${c.name}</li></ol>
          </nav>
          <p class="eyebrow">${c.name}</p>
          <h1 class="cat-title">${c.title}</h1>
          <p class="cat-desc">${c.desc}</p>
          <div class="hero-cta">
            <a class="btn btn-primary" href="${productUrl(lead.id)}">شوف ${lead.name}</a>
            <span class="cat-count">${products.length} ${products.length === 1 ? 'منتج' : 'منتجات'} بهالتصنيف</span>
          </div>
        </div>
        <a class="cat-hero-art" href="${productUrl(lead.id)}" tabindex="-1" aria-hidden="true">
          <span class="cat-hero-word">${lead.name}</span>
          ${packArt(lead)}
        </a>
      </div>`;

    $('[data-cat-name]').textContent = `حبّات ${c.name}`;
    $('[data-grid]').innerHTML = products.map(p => cardHTML(p)).join('');

    // Usage note from the lead product
    $('[data-cat-tip]').innerHTML = `
      <div class="tip-card" style="${vars(lead)}" data-reveal>
        <p class="eyebrow">طريقة الاستخدام</p>
        <p class="tip-text">${lead.howTo}</p>
        <dl class="facts">
          <div><dt>متى</dt><dd>${lead.when}</dd></div>
          <div><dt>لمين</dt><dd>${lead.forWho}</dd></div>
          <div><dt>النكهة</dt><dd>${lead.flavorAr}</dd></div>
        </dl>
      </div>`;

    const bundles = D.bundles.filter(b => b.items.some(id => byId(id).cat === c.id));
    $('[data-bundles]').innerHTML = bundles.map(bundleHTML).join('');
    $('[data-other-cats]').innerHTML = otherCats(c.id);

    S.animate();
    if (S.motion) {
      gsap.from('.cat-hero-copy > *', { y: 20, opacity: 0, duration: .5, stagger: .07, ease: 'power3.out' });
      gsap.from('.cat-hero-art .pack', { rotation: -14, y: 60, opacity: 0, duration: .8, ease: 'back.out(1.4)', delay: .15 });
      gsap.to('.cat-hero-word', {
        xPercent: 12, ease: 'none',
        scrollTrigger: { trigger: '.cat-hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }
})();
