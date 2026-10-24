/* chwly — shared store core: helpers, cart, header, cart drawer, motion base.
   Loaded on every page before the page script; exposes window.Store. */
(() => {
  const D = window.CHWLY;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const byId = id => D.products.find(p => p.id === id);
  const catById = id => D.categories.find(c => c.id === id);
  const bundleById = id => D.bundles.find(b => b.id === id);
  const catProducts = id => D.products.filter(p => p.cat === id);
  const catColors = id => catProducts(id)[0];
  const money = n => `${n.toLocaleString('en-US')} <span class="cur">${D.currency}</span>`;
  const vars = p => `--c:${p.color};--soft:${p.soft};--ink:${p.ink}`;
  const params = new URLSearchParams(location.search);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const productUrl = id => `product.html?p=${id}`;
  const categoryUrl = id => `category.html?c=${id}`;
  const bundleList = b => b.items.reduce((s, id) => s + byId(id).prices[1], 0);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Shared templates ---------- */
  const packArt = p => `
    <div class="pack" dir="ltr" aria-hidden="true" style="${vars(p)}">
      <div class="pack-band"><b>chwly</b><small>DAILY WELLNESS GUMMIES</small></div>
      <div class="pack-face">
        <span class="pack-name">${p.name.replace(' ', '<br>')}</span>
        <span class="pack-ing">${p.ingredients}</span>
      </div>
      <span class="pack-meta"><span>${p.flavor}</span><span class="pack-count">60</span></span>
      <span class="pack-blob"></span>
    </div>`;

  const cardHTML = (p, feature = false) => `
    <li class="card${feature ? ' card--feature' : ''}" style="${vars(p)}">
      <a class="card-media" href="${productUrl(p.id)}" tabindex="-1" aria-hidden="true">${packArt(p)}</a>
      <div class="card-body">
        <a class="card-cat" href="${categoryUrl(p.cat)}">${p.catLabel}</a>
        <h3 class="card-name"><a href="${productUrl(p.id)}">${p.name}</a></h3>
        <p class="card-line">${p.line}</p>
        <div class="card-foot">
          <p class="price">${money(p.prices[1])}</p>
          <button class="btn-add" type="button" data-add="${p.id}" aria-label="أضف ${p.name} للسلة">
            <svg class="i"><use href="#i-plus"/></svg><span>أضف</span>
          </button>
        </div>
      </div>
    </li>`;

  const bundleHTML = b => `
    <li class="bundle">
      <div class="bundle-dots" aria-hidden="true">${b.items.map(id => `<span style="--c:${byId(id).color}"></span>`).join('')}</div>
      <div>
        <h3>${b.name}</h3>
        <p class="bundle-items">${b.items.map(id => byId(id).name).join(' + ')}</p>
      </div>
      <div class="bundle-buy">
        <p class="bundle-price"><s>${money(bundleList(b))}</s><strong>${money(b.price)}</strong></p>
        <button class="btn-add" type="button" data-add-bundle="${b.id}" aria-label="أضف ${b.name} للسلة">
          <svg class="i"><use href="#i-plus"/></svg><span>أضف</span>
        </button>
      </div>
    </li>`;

  /* ---------- Storage helpers ---------- */
  const read = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k)) ?? fallback; } catch { return fallback; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };

  /* ---------- Cart ---------- */
  const KEY = 'chwly-cart';
  let cart = read(KEY, []).filter(it => it.kind === 'bundle' ? bundleById(it.id) : byId(it.id));
  const listeners = [];

  function lineInfo(it) {
    if (it.kind === 'bundle') {
      const b = bundleById(it.id);
      return { title: b.name, sub: b.items.map(id => byId(id).name).join(' + '), unit: b.price, p: byId(b.items[0]), bundle: b, href: 'shop.html#bundles' };
    }
    const p = byId(it.id);
    const pack = D.packs.find(k => k.n === it.packs);
    return { title: p.name, sub: `${pack.label} · ${pack.note}`, unit: p.prices[it.packs], p, href: productUrl(p.id) };
  }

  function getCoupon() {
    const code = read('chwly-coupon', null);
    return code && D.coupons[code] ? { code, ...D.coupons[code] } : null;
  }
  function applyCoupon(code) {
    const c = String(code || '').trim().toUpperCase();
    if (!D.coupons[c]) return false;
    write('chwly-coupon', c); emit(); return true;
  }
  function removeCoupon() { try { localStorage.removeItem('chwly-coupon'); } catch { } emit(); }

  function totals(shippingId = 'standard') {
    let subtotal = 0, count = 0;
    cart.forEach(it => { subtotal += lineInfo(it).unit * it.qty; count += it.qty; });
    const coupon = getCoupon();
    const discount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
    const ship = D.shipping.find(s => s.id === shippingId) || D.shipping[0];
    const freeShip = ship.freeAbove && subtotal - discount >= D.freeShippingFrom;
    const shipping = count === 0 || freeShip ? 0 : ship.price;
    const total = subtotal - discount + shipping;
    const vat = Math.round((total - total / 1.15) * 100) / 100;
    return { subtotal, count, coupon, discount, shipping, freeShip, total, vat, toFree: Math.max(0, D.freeShippingFrom - (subtotal - discount)) };
  }

  function emit() { write(KEY, cart); renderDrawer(); listeners.forEach(fn => fn()); }
  const onChange = fn => listeners.push(fn);

  function add(item, qty = 1) {
    const key = item.kind === 'bundle' ? item.id : `${item.id}:${item.packs}`;
    const found = cart.find(x => x.key === key);
    if (found) found.qty += qty; else cart.push({ ...item, key, qty });
    emit();
    const btn = $('.cart-btn');
    if (btn) { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); }
  }
  function setQty(key, qty) {
    const it = cart.find(x => x.key === key);
    if (!it) return;
    it.qty = qty;
    if (it.qty < 1) cart = cart.filter(x => x !== it);
    emit();
  }
  const remove = key => { cart = cart.filter(x => x.key !== key); emit(); };
  const clear = () => { cart = []; emit(); };

  // Shared line markup (drawer + cart page)
  const lineHTML = (it, big = false) => {
    const info = lineInfo(it);
    return `
      <li class="cart-item${big ? ' cart-item--big' : ''}">
        <a class="cart-thumb" href="${info.href}" style="${vars(info.p)}" aria-hidden="true" tabindex="-1">${big ? packArt(info.p) : `<span>${info.bundle ? info.bundle.items.length : info.p.name[0]}</span>`}</a>
        <div class="cart-info"><h3><a href="${info.href}">${info.title}</a></h3><small>${info.sub}</small></div>
        <p class="price">${money(info.unit * it.qty)}</p>
        <div class="cart-ctrl">
          <div class="stepper">
            <button type="button" data-qty="${it.key}" data-delta="1" aria-label="زيادة الكمية"><svg class="i"><use href="#i-plus"/></svg></button>
            <output aria-label="الكمية">${it.qty}</output>
            <button type="button" data-qty="${it.key}" data-delta="-1" aria-label="إنقاص الكمية"><svg class="i"><use href="#i-minus"/></svg></button>
          </div>
          <button class="remove-btn" type="button" data-remove="${it.key}"><svg class="i"><use href="#i-trash"/></svg>حذف</button>
        </div>
      </li>`;
  };

  /* ---------- Cart drawer ---------- */
  const drawer = $('#cart');
  function renderDrawer() {
    const t = totals();
    $$('[data-cart-count]').forEach(el => { el.textContent = t.count; });
    if (!drawer) return;
    $('[data-cart-items]', drawer).innerHTML = cart.map(it => lineHTML(it)).join('') || `
      <li class="cart-empty">
        <p>سلتك فاضية.</p>
        <a class="link-arrow" href="shop.html">تسوّق المنتجات <svg class="i"><use href="#i-arrow"/></svg></a>
      </li>`;
    $('[data-cart-total]', drawer).innerHTML = money(t.subtotal - t.discount);
    $('[data-ship-msg]', drawer).innerHTML = t.toFree > 0
      ? `باقي <strong>${money(t.toFree)}</strong> ويصير الشحن مجاني`
      : '<strong>شحنك صار مجاني!</strong>';
    $('[data-ship-bar]', drawer).style.inlineSize = `${Math.min(100, ((t.subtotal - t.discount) / D.freeShippingFrom) * 100)}%`;
    $$('[data-needs-items]', drawer).forEach(a => a.toggleAttribute('data-disabled', t.count === 0));
  }

  let lenis = null;
  function openDialog(dlg) {
    if (!dlg) return;
    $$('dialog[open]').forEach(d => d !== dlg && d.close());
    if (!dlg.open) dlg.showModal();
    lenis?.stop();
  }
  $$('dialog').forEach(dlg => {
    dlg.addEventListener('close', () => { if (!$('dialog[open]')) lenis?.start(); });
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  });
  const openCart = () => openDialog(drawer);

  /* ---------- Fly a gummy to the cart icon ---------- */
  function flyToCart(from) {
    const target = $('.cart-btn');
    if (reduceMotion || !window.gsap || !from || !target) return;
    const a = from.getBoundingClientRect(), b = target.getBoundingClientRect();
    const g = Object.assign(document.createElement('img'), { src: 'assets/img/gummy.webp', alt: '', className: 'fly-gum' });
    document.body.append(g);
    gsap.set(g, { x: a.left + a.width / 2 - 20, y: a.top + a.height / 2 - 20 });
    gsap.timeline({ onComplete: () => g.remove() })
      .to(g, { x: b.left + b.width / 2 - 20, duration: .7, ease: 'power1.inOut' }, 0)
      .to(g, { y: a.top - 120, duration: .3, ease: 'power2.out' }, 0)
      .to(g, { y: b.top + b.height / 2 - 20, duration: .4, ease: 'power2.in' }, .3)
      .to(g, { scale: .3, rotation: 300, duration: .7 }, 0);
  }

  /* ---------- Delegated clicks ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-add],[data-add-bundle],[data-open-cart],[data-close-dialog],[data-qty],[data-remove]');
    if (!t) return;
    const d = t.dataset;
    const stay = 'stay' in d; // don't open the drawer (e.g. product page)
    if (d.add) {
      add({ kind: 'product', id: d.add, packs: Number(d.packs || 1) }, Number(d.count || 1));
      if (stay) { flyToCart(t); toast(`انضافت ${byId(d.add).name} للسلة`); } else openCart();
    } else if (d.addBundle) {
      add({ kind: 'bundle', id: d.addBundle });
      if (stay) { flyToCart(t); toast('انضافت الباقة للسلة'); } else openCart();
    } else if ('openCart' in d) openCart();
    else if ('closeDialog' in d) t.closest('dialog')?.close();
    else if (d.qty) { const it = cart.find(x => x.key === d.qty); if (it) setQty(d.qty, it.qty + Number(d.delta)); }
    else if (d.remove) remove(d.remove);
  });
  // Disabled links (empty cart)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[data-disabled]');
    if (a) { e.preventDefault(); toast('سلتك فاضية، أضف منتج أول.'); }
  }, true);

  /* ---------- Toast ---------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2800);
  }

  /* ---------- Header ---------- */
  const catMenu = $('[data-cat-menu]');
  if (catMenu) catMenu.innerHTML = D.categories.map(c => {
    const p = catColors(c.id);
    return `<li><a href="${categoryUrl(c.id)}" style="${vars(p)}"><span class="cat-dot" aria-hidden="true"></span><b>${c.name}</b><small>${catProducts(c.id).map(x => x.name).join('، ')}</small></a></li>`;
  }).join('');
  const footCats = $('[data-footer-cats]');
  if (footCats) footCats.insertAdjacentHTML('beforeend', D.categories.map(c => `<li><a href="${categoryUrl(c.id)}">${c.name}</a></li>`).join(''));

  const catsBtn = $('[data-cats-toggle]');
  catsBtn?.addEventListener('click', () => {
    const open = catsBtn.getAttribute('aria-expanded') !== 'true';
    catsBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (catsBtn && !e.target.closest('.has-menu')) catsBtn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && catsBtn?.getAttribute('aria-expanded') === 'true') { catsBtn.setAttribute('aria-expanded', 'false'); catsBtn.focus(); }
  });

  const menuBtn = $('[data-menu]');
  const nav = $('[data-nav]');
  menuBtn?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // Mark the current page in the nav
  const here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-list a, .footer-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === here || (href === `${here}${location.search}` && location.search)) a.setAttribute('aria-current', 'page');
  });

  const header = $('[data-header]');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', scrollY > 8);
      catsBtn?.setAttribute('aria-expanded', 'false');
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Black Friday countdown ---------- */
  const cd = $('[data-countdown]');
  if (cd) {
    const days = Math.ceil((new Date(D.promoDate) - Date.now()) / 864e5);
    cd.textContent = days > 1 ? `باقي ${days} يوم` : days === 1 ? 'باقي يوم واحد' : 'العرض شغّال الحين';
  }

  renderDrawer();

  /* ---------- Motion base: Lenis + section bites + reveals ---------- */
  const motion = !reduceMotion && window.gsap && window.ScrollTrigger;
  if (motion) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Lenis) {
      lenis = new Lenis({ duration: 1.1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href').length < 2) return;
        const target = document.getElementById(a.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        a.closest('dialog')?.close();
        lenis.start();
        lenis.scrollTo(target, { offset: -(header?.offsetHeight || 0) - 8 });
      });
      // Arriving with a hash (e.g. shop.html#bundles)
      if (location.hash) addEventListener('load', () => {
        const target = document.getElementById(location.hash.slice(1));
        if (target) lenis.scrollTo(target, { offset: -(header?.offsetHeight || 0) - 8, immediate: true });
      });
    }
  }

  // Called by page scripts after they render their content
  function animate() {
    if (!motion) return;
    $$('.bite-top').forEach(sec => {
      if (sec.dataset.bitten) return;
      sec.dataset.bitten = '1';
      const max = getComputedStyle(sec).getPropertyValue('--bite-max').trim() || '64px';
      gsap.fromTo(sec, { '--bite': '0px' }, {
        '--bite': max, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 45%', scrub: true }
      });
    });
    ScrollTrigger.batch($$('[data-reveal]:not([data-revealed])'), {
      start: 'top 88%', once: true,
      onEnter: els => {
        els.forEach(el => { el.dataset.revealed = '1'; });
        gsap.from(els, { y: 24, opacity: 0, duration: .5, stagger: .07, ease: 'power2.out' });
      }
    });
    ScrollTrigger.refresh();
  }

  window.Store = {
    D, $, $$, byId, catById, bundleById, catProducts, catColors, money, vars, params, esc,
    reduceMotion, motion, productUrl, categoryUrl, bundleList,
    packArt, cardHTML, bundleHTML, lineHTML, lineInfo,
    get cart() { return cart; }, add, setQty, remove, clear, totals, onChange,
    getCoupon, applyCoupon, removeCoupon, read, write,
    openCart, openDialog, toast, flyToCart, animate,
    get lenis() { return lenis; }
  };
})();
