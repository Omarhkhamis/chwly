/* Product page — renders from ?p=<id> */
(() => {
  const S = window.Store;
  const { D, $, $$, byId, catById, money, vars, packArt, cardHTML, bundleHTML, productUrl, categoryUrl, params } = S;
  const root = $('[data-product]');
  const p = byId(params.get('p'));

  if (!p) {
    root.innerHTML = `
      <section class="page-hero"><div class="wrap">
        <h1 class="page-title">ما لقينا هالمنتج.</h1>
        <p class="page-lead">يمكن الرابط قديم. شوف كل المنتجات من هنا.</p>
        <a class="btn btn-primary" href="shop.html">المتجر</a>
      </div></section>`;
    S.animate();
    return;
  }

  const cat = catById(p.cat);
  document.title = `${p.name} · ${p.line} | chwly تشولي`;
  $('meta[name="description"]')?.setAttribute('content', p.desc);
  document.body.style.cssText = vars(p);

  const perGummy = n => (p.prices[n] / (D.gummiesPerPack * n)).toFixed(2);
  const ph = label => `<div class="ph-img"><span>${label}</span><small>Placeholder</small></div>`;
  const slides = [
    { label: 'العبوة', html: packArt(p) },
    p.photo
      ? { label: 'صورة', html: `<img src="${p.photo}" width="1200" height="1200" alt="${p.name}: يد تسكب الحبّات من العبوة">` }
      : { label: 'صورة العبوة', html: ph('صورة العبوة الحقيقية') },
    { label: 'الحبّة', html: `<img class="slide-gum" src="assets/img/gummy.webp" width="700" height="690" alt="حبّة جيلي من قريب">` },
    { label: 'لايف ستايل', html: ph('صورة لايف ستايل') }
  ];
  const ingredientRows = p.ingredientsAr.split('+').map(s => `<tr><th scope="row">${s.trim()}</th><td>[—] ملغ</td></tr>`).join('');
  const related = D.products.filter(x => x.id !== p.id);
  const bundles = D.bundles.filter(b => b.items.includes(p.id));

  root.innerHTML = `
    <section class="pdp">
      <div class="wrap">
        <nav class="crumbs" aria-label="مسار الصفحة">
          <ol><li><a href="index.html">الرئيسية</a></li><li><a href="shop.html">المتجر</a></li><li><a href="${categoryUrl(cat.id)}">${cat.name}</a></li><li aria-current="page">${p.name}</li></ol>
        </nav>
        <div class="pdp-grid">
          <div class="gallery">
            <div class="gallery-stage bite" data-stage>
              ${slides.map((s, i) => `<div class="slide" data-slide="${i}"${i ? ' hidden' : ''}>${s.html}</div>`).join('')}
            </div>
            <div class="gallery-thumbs" role="group" aria-label="صور المنتج">
              ${slides.map((s, i) => `<button type="button" class="thumb" data-thumb="${i}" aria-pressed="${i === 0}" aria-label="عرض: ${s.label}">${i === 0 ? `<span class="thumb-pack" aria-hidden="true">${p.name.split(' ')[0]}</span>` : s.html.includes('<img') ? s.html.replace(/alt="[^"]*"/, 'alt=""') : `<span class="thumb-ph" aria-hidden="true">${s.label}</span>`}</button>`).join('')}
            </div>
          </div>

          <div class="pdp-info">
            <a class="card-cat" href="${categoryUrl(cat.id)}">${cat.name}</a>
            <h1 class="pdp-title">${p.name}</h1>
            <p class="pdp-line">${p.line}</p>
            <p class="pdp-price"><strong data-price>${money(p.prices[1])}</strong><span class="pdp-per" data-per>${perGummy(1)} ${D.currency} للحبّة</span></p>
            <p class="pdp-vat">الأسعار شاملة ضريبة القيمة المضافة</p>
            <p class="pdp-desc">${p.desc}</p>
            <ul class="pdp-benefits">${p.benefits.map(b => `<li><svg class="i"><use href="#i-check"/></svg>${b}</li>`).join('')}</ul>

            <form class="pdp-form" data-pdp-form>
              <fieldset class="packs">
                <legend>كم عبوة؟</legend>
                ${D.packs.map((k, i) => `
                  <label class="pack-opt">
                    <input type="radio" name="packs" value="${k.n}"${i === 0 ? ' checked' : ''}>
                    <span class="pack-opt-in">
                      <b>${k.label}</b><small>${k.note}</small>
                      <span class="pack-opt-price"><span>${money(p.prices[k.n])}</span>${k.n > 1 ? `<em>وفّر ${p.prices[1] * k.n - p.prices[k.n]} ${D.currency}</em>` : ''}</span>
                    </span>
                  </label>`).join('')}
              </fieldset>
              <div class="pdp-actions">
                <div class="stepper stepper--lg">
                  <button type="button" data-step="1" aria-label="زيادة الكمية"><svg class="i"><use href="#i-plus"/></svg></button>
                  <output data-count-out aria-label="الكمية">1</output>
                  <button type="button" data-step="-1" aria-label="إنقاص الكمية"><svg class="i"><use href="#i-minus"/></svg></button>
                </div>
                <button class="btn btn-primary pdp-add" type="submit">أضف للسلة</button>
              </div>
              <button class="btn btn-dark btn-block" type="button" data-buy-now>اشترِ الحين</button>
            </form>

            <ul class="pdp-assure">
              <li><svg class="i"><use href="#i-truck"/></svg>شحن مجاني فوق ${D.freeShippingFrom} ${D.currency}</li>
              <li><svg class="i"><use href="#i-lock"/></svg>دفع آمن: مدى، Apple Pay، تابي، تمارا</li>
              <li><svg class="i"><use href="#i-check"/></svg><a href="policies.html#returns">سياسة الاسترجاع</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="pdp-details bite-top" aria-labelledby="details-title">
      <div class="wrap pdp-details-grid">
        <div>
          <p class="pdp-word" aria-hidden="true">${p.name}</p>
          <h2 id="details-title">كل شي عن ${p.name}</h2>
          <dl class="facts facts--stack">
            <div><dt>النكهة</dt><dd>${p.flavorAr}</dd></div>
            <div><dt>متى</dt><dd>${p.when}</dd></div>
            <div><dt>لمين</dt><dd>${p.forWho}</dd></div>
            <div><dt>بالعبوة</dt><dd>${D.gummiesPerPack} حبّة</dd></div>
          </dl>
        </div>
        <div class="faq-list">
          <details open>
            <summary>الوصف</summary>
            <p>${p.desc} [يُضاف وصف أطول من فريق المحتوى.]</p>
          </details>
          <details>
            <summary>المكوّنات</summary>
            <table class="ing-table">
              <thead><tr><th scope="col">المكوّن</th><th scope="col">لكل حبّة</th></tr></thead>
              <tbody>${ingredientRows}</tbody>
            </table>
            <p class="ph-note">الكميات تُضاف من ملصق العبوة المعتمد.</p>
          </details>
          <details>
            <summary>طريقة الاستخدام</summary>
            <p>${p.howTo} الجرعة: [تُضاف من العبوة].</p>
          </details>
          <details>
            <summary>تنبيهات</summary>
            <p>[تُضاف التحذيرات المعتمدة: الحمل والرضاعة، الأدوية، الحساسية.] المكمّلات الغذائية ليست بديلاً عن نظام غذائي متوازن.</p>
          </details>
          <details>
            <summary>الشحن والاسترجاع</summary>
            <p>شحن مجاني للطلبات فوق ${D.freeShippingFrom} ${D.currency}. التفاصيل في <a href="policies.html#shipping">سياسة الشحن</a> و<a href="policies.html#returns">سياسة الاسترجاع</a>.</p>
          </details>
        </div>
      </div>
    </section>

    <section class="pdp-reviews" aria-labelledby="reviews-title">
      <div class="wrap reviews-grid">
        <h2 id="reviews-title">التقييمات</h2>
        <div class="reviews-empty" data-reveal>
          <p class="empty-title">ما فيه تقييمات لسا.</p>
          <p>المنتج جديد. التقييمات رح تظهر هنا بعد أول الطلبات (تنربط بتقييمات سلة).</p>
        </div>
      </div>
    </section>

    ${bundles.length ? `
    <section class="bundles bite-top" aria-labelledby="pdp-bundles-title">
      <div class="wrap bundles-grid">
        <div class="bundles-head">
          <h2 id="pdp-bundles-title">وفّر<br>بالباقة</h2>
          <p>${p.name} موجودة بهالباقات بسعر أقل.</p>
        </div>
        <ul class="bundle-list">${bundles.map(bundleHTML).join('')}</ul>
      </div>
    </section>` : ''}

    <section class="related" aria-labelledby="related-title">
      <div class="wrap">
        <div class="sec-head">
          <h2 id="related-title">كمّل روتينك</h2>
          <p>حبّات ثانية تمشي مع ${p.name}.</p>
        </div>
        <ul class="product-grid product-grid--4">${related.map(x => cardHTML(x)).join('')}</ul>
      </div>
    </section>

    <div class="buy-bar" data-buy-bar>
      <div><b>${p.name}</b><span data-bar-price>${money(p.prices[1])}</span></div>
      <button class="btn btn-primary" type="button" data-bar-add>أضف للسلة</button>
    </div>`;

  /* ---------- Gallery ---------- */
  const stage = $('[data-stage]');
  $$('[data-thumb]').forEach(btn => btn.addEventListener('click', () => {
    const i = btn.dataset.thumb;
    $$('[data-thumb]').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    $$('[data-slide]', stage).forEach(s => { s.hidden = s.dataset.slide !== i; });
    if (S.motion) gsap.from(`[data-slide="${i}"]`, { scale: .94, opacity: 0, duration: .35, ease: 'power2.out' });
  }));

  /* ---------- Options, quantity, add ---------- */
  const form = $('[data-pdp-form]');
  let qty = 1;
  const packs = () => Number(new FormData(form).get('packs'));
  const update = () => {
    const n = packs();
    $('[data-price]').innerHTML = money(p.prices[n] * qty);
    $('[data-per]').textContent = `${perGummy(n)} ${D.currency} للحبّة`;
    $('[data-bar-price]').innerHTML = money(p.prices[n] * qty);
    $('[data-count-out]').textContent = qty;
  };
  form.addEventListener('change', update);
  $$('[data-step]', form).forEach(b => b.addEventListener('click', () => {
    qty = Math.max(1, Math.min(20, qty + Number(b.dataset.step)));
    update();
  }));
  const addSelected = from => {
    S.add({ kind: 'product', id: p.id, packs: packs() }, qty);
    S.flyToCart(from);
  };
  form.addEventListener('submit', e => {
    e.preventDefault();
    addSelected($('.pdp-add'));
    S.toast(`انضافت ${p.name} للسلة`);
  });
  $('[data-bar-add]').addEventListener('click', e => { addSelected(e.currentTarget); S.toast(`انضافت ${p.name} للسلة`); });
  $('[data-buy-now]').addEventListener('click', () => {
    S.add({ kind: 'product', id: p.id, packs: packs() }, qty);
    location.href = 'checkout.html';
  });

  // Mobile buy bar appears once the main add button scrolls away
  const bar = $('[data-buy-bar]');
  new IntersectionObserver(([en]) => bar.classList.toggle('is-on', !en.isIntersecting && en.boundingClientRect.top < 0))
    .observe($('.pdp-add'));

  S.animate();
  if (S.motion) {
    gsap.from('.pdp-info > *', { y: 18, opacity: 0, duration: .45, stagger: .05, ease: 'power3.out' });
    gsap.from('.gallery-stage', { scale: .95, opacity: 0, duration: .6, ease: 'power3.out' });
    gsap.fromTo('.gallery-stage', { '--bite': '36px' }, {
      '--bite': '90px', ease: 'none',
      scrollTrigger: { trigger: '.pdp', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.pdp-word', {
      xPercent: -15, ease: 'none',
      scrollTrigger: { trigger: '.pdp-details', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }
})();
