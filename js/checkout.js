/* Cart page, checkout and order confirmation (static demo: orders live in localStorage) */
(() => {
  const S = window.Store;
  const { D, $, $$, byId, money, vars, cardHTML, lineHTML, lineInfo, params, esc } = S;
  const page = document.body.dataset.page;

  /* ---------- Order summary (shared) ---------- */
  function summaryHTML(t, { items = false, shippingKnown = false, cta = true } = {}) {
    const coupon = t.coupon;
    const shipText = t.count === 0 ? '—'
      : t.shipping === 0 ? '<b class="free">مجاني</b>'
      : shippingKnown ? money(t.shipping) : `من ${money(t.shipping)}`;
    return `
      <h2 class="summary-title">ملخص الطلب</h2>
      ${items ? `<ul class="summary-items">${S.cart.map(it => {
        const info = lineInfo(it);
        return `<li><span class="summary-thumb" style="${vars(info.p)}">${it.qty}</span><span><b>${info.title}</b><small>${info.sub}</small></span><span>${money(info.unit * it.qty)}</span></li>`;
      }).join('')}</ul>` : ''}
      <dl class="summary-rows">
        <div><dt>المجموع (${t.count} ${t.count === 1 ? 'قطعة' : 'قطع'})</dt><dd>${money(t.subtotal)}</dd></div>
        ${coupon ? `<div class="discount"><dt>الخصم (${coupon.code}) <button type="button" class="link-btn" data-remove-coupon>إزالة</button></dt><dd>−${money(t.discount)}</dd></div>` : ''}
        <div><dt>الشحن</dt><dd>${shipText}</dd></div>
        <div class="summary-total"><dt>الإجمالي</dt><dd>${money(t.total)}</dd></div>
      </dl>
      <p class="summary-vat">شامل ضريبة القيمة المضافة 15%: ${t.vat.toFixed(2)} ${D.currency}</p>
      ${coupon ? '' : `
      <form class="coupon" data-coupon novalidate>
        <label for="coupon-code">عندك كود خصم؟</label>
        <div class="coupon-row">
          <input id="coupon-code" name="code" type="text" dir="ltr" autocomplete="off" placeholder="WAITLIST10">
          <button class="btn-add" type="submit">تطبيق</button>
        </div>
        <p class="fld-err" role="status" data-coupon-msg></p>
      </form>`}
      ${cta ? `<a class="btn btn-primary btn-block" href="checkout.html"${t.count ? '' : ' data-disabled'}>إتمام الطلب</a>
      <p class="summary-pay">مدى · Visa · Apple Pay · STC Pay · تابي · تمارا</p>` : ''}`;
  }

  // Coupon + remove-coupon handlers (delegated, re-rendered summaries)
  document.addEventListener('submit', e => {
    const f = e.target.closest('[data-coupon]');
    if (!f) return;
    e.preventDefault();
    const ok = S.applyCoupon(f.code.value);
    if (!ok) { const m = $('[data-coupon-msg]'); if (m) m.textContent = 'الكود غير صحيح أو منتهي.'; }
    else S.toast('تم تطبيق الخصم');
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-remove-coupon]')) S.removeCoupon();
  });

  /* ---------- Cart page ---------- */
  if (page === 'cart') {
    const items = $('[data-page-items]');
    const summary = $('[data-summary]');
    const meter = $('[data-page-ship]');
    const label = $('[data-count-label]');
    function render() {
      const t = S.totals();
      label.textContent = t.count ? `${t.count} ${t.count === 1 ? 'قطعة' : 'قطع'}` : '';
      items.innerHTML = S.cart.map(it => lineHTML(it, true)).join('') || `
        <li class="empty-state empty-state--cart">
          <img src="assets/img/gummy.webp" width="700" height="690" alt="" class="empty-gum">
          <p class="empty-title">سلتك فاضية.</p>
          <p>ابدأ بحبّة وحدة، أو خذ باقة ووفّر.</p>
          <a class="btn btn-primary" href="shop.html">تسوّق الحين</a>
        </li>`;
      meter.hidden = t.count === 0;
      meter.innerHTML = `<p>${t.toFree > 0 ? `باقي <strong>${money(t.toFree)}</strong> ويصير الشحن مجاني` : '<strong>شحنك صار مجاني!</strong>'}</p>
        <div class="meter"><span style="inline-size:${Math.min(100, ((t.subtotal - t.discount) / D.freeShippingFrom) * 100)}%"></span></div>`;
      summary.innerHTML = summaryHTML(t);
      // Upsell: products not already in the cart
      const inCart = new Set(S.cart.flatMap(it => it.kind === 'custom' ? Object.keys(it.items) : it.kind === 'bundle' ? S.bundleById(it.id).items : [it.id]));
      const ups = D.products.filter(p => !inCart.has(p.id)).slice(0, 4);
      $('[data-upsell-wrap]').hidden = ups.length === 0;
      $('[data-upsell]').innerHTML = ups.map(p => cardHTML(p)).join('');
    }
    S.onChange(render);
    render();
    S.animate();
  }

  /* ---------- Checkout ---------- */
  if (page === 'checkout') {
    const form = $('[data-checkout]');
    const F = n => form.elements.namedItem(n);
    const summary = $('[data-summary]');
    if (!S.cart.length) {
      $('[data-co-main]').innerHTML = `
        <div class="empty-state empty-state--cart">
          <img src="assets/img/gummy.webp" width="700" height="690" alt="" class="empty-gum">
          <p class="empty-title">ما فيه شي تدفع له.</p>
          <p>سلتك فاضية. أضف منتج وارجع هنا.</p>
          <a class="btn btn-primary" href="shop.html">المتجر</a>
        </div>`;
      return;
    }

    $('[data-city]').innerHTML = '<option value="">اختر المدينة</option>' + D.cities.map(c => `<option>${c}</option>`).join('');
    $('[data-ship-options]').innerHTML = D.shipping.map((s, i) => `
      <label class="opt">
        <input type="radio" name="shipping" value="${s.id}"${i === 0 ? ' checked' : ''}>
        <span class="opt-in"><b>${s.label}</b><small>${s.eta}</small><span class="opt-price" data-ship-price="${s.id}"></span></span>
      </label>`).join('');
    $('[data-pay-options]').innerHTML = D.payments.map((p, i) => `
      <label class="opt">
        <input type="radio" name="payment" value="${p.id}"${i === 0 ? ' checked' : ''}>
        <span class="opt-in"><b>${p.label}</b><small>${p.note}</small></span>
      </label>`).join('');

    const shippingId = () => F('shipping').value || 'standard';
    function render() {
      const t = S.totals(shippingId());
      summary.innerHTML = summaryHTML(t, { items: true, shippingKnown: true, cta: false });
      D.shipping.forEach(s => {
        const st = S.totals(s.id);
        $(`[data-ship-price="${s.id}"]`).innerHTML = st.shipping === 0 ? '<b class="free">مجاني</b>' : money(st.shipping);
      });
      $('[data-pay-total]').innerHTML = money(t.total);
      $('[data-card-panel]').hidden = F('payment').value !== 'card';
    }
    form.addEventListener('change', e => { if (['shipping', 'payment'].includes(e.target.name)) render(); });
    S.onChange(render);
    render();

    // Validation
    const rules = {
      name: v => v.trim().length >= 2 || 'اكتب اسمك.',
      phone: v => /^5\d{8}$/.test(v.replace(/\D/g, '').replace(/^(966|0)/, '')) || 'رقم جوال سعودي يبدأ بـ 5 ومن 9 أرقام.',
      email: v => !v || /^\S+@\S+\.\S+$/.test(v) || 'الإيميل مو صحيح.',
      city: v => !!v || 'اختر المدينة.',
      district: v => v.trim().length >= 2 || 'اكتب الحي.',
      shortcode: v => !v || /^[A-Za-z]{4}\d{4}$/.test(v.replace(/\s/g, '')) || 'العنوان المختصر 4 حروف و4 أرقام، مثل RRRD2929.',
      terms: (v, el) => el.checked || 'لازم توافق على الشروط.'
    };
    function check(el) {
      const rule = rules[el.name];
      if (!rule) return true;
      const res = rule(el.value, el);
      const err = $(`[data-err="${el.name}"]`);
      el.setAttribute('aria-invalid', String(res !== true));
      if (err) err.textContent = res === true ? '' : res;
      return res === true;
    }
    form.addEventListener('blur', e => { if (e.target.name && e.target.value) check(e.target); }, true);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields = Object.keys(rules).map(n => F(n)).filter(Boolean);
      const bad = fields.filter(el => !check(el));
      if (bad.length) {
        bad[0].focus();
        S.toast('فيه حقول ناقصة، شيّك عليها.');
        return;
      }
      const t = S.totals(shippingId());
      const order = {
        id: `CH${Math.floor(10000 + Math.random() * 89999)}`,
        date: new Date().toISOString(),
        name: F('name').value.trim(),
        phone: F('phone').value.trim(),
        city: F('city').value,
        district: F('district').value.trim(),
        shipping: D.shipping.find(s => s.id === shippingId()).label,
        payment: D.payments.find(p => p.id === F('payment').value).label,
        items: S.cart.map(it => { const i = lineInfo(it); return { title: i.title, sub: i.sub, qty: it.qty, total: i.unit * it.qty, color: i.p.color }; }),
        totals: t
      };
      S.write('chwly-orders', [order, ...S.read('chwly-orders', [])]);
      S.write('chwly-customer', { name: order.name, phone: order.phone, city: order.city, district: order.district });
      S.removeCoupon();
      S.clear();
      location.href = `order-success.html?o=${order.id}`;
    });

    // Prefill from a previous order
    const c = S.read('chwly-customer', null);
    if (c) ['name', 'phone', 'city', 'district'].forEach(k => { if (c[k]) F(k).value = c[k]; });
  }

  /* ---------- Order confirmation ---------- */
  if (page === 'success') {
    const orders = S.read('chwly-orders', []);
    const o = orders.find(x => x.id === params.get('o')) || orders[0];
    const root = $('[data-success]');
    if (!o) {
      root.innerHTML = `<div class="empty-state"><p class="empty-title">ما لقينا الطلب.</p><a class="btn btn-primary" href="shop.html">المتجر</a></div>`;
      return;
    }
    root.innerHTML = `
      <div class="success-mark bite" aria-hidden="true"><svg class="i"><use href="#i-check"/></svg></div>
      <div class="success-copy">
        <p class="eyebrow">تم استلام طلبك</p>
        <h1 class="page-title">شكراً ${esc(o.name.split(' ')[0])}!</h1>
        <p class="page-lead">رقم طلبك <b dir="ltr">#${o.id}</b>. رح توصلك رسالة على جوالك فيها تفاصيل الطلب والتتبع.</p>
        <ol class="timeline">
          <li class="is-done"><b>تأكيد الطلب</b><small>الحين</small></li>
          <li><b>التجهيز</b><small>خلال يوم عمل</small></li>
          <li><b>الشحن</b><small>${esc(o.shipping)}</small></li>
          <li><b>التوصيل</b><small>${esc(o.city)}، ${esc(o.district)}</small></li>
        </ol>
        <div class="success-order">
          <h2 class="summary-title">طلبك</h2>
          <ul class="summary-items">${o.items.map(i => `<li><span class="summary-thumb" style="--c:${i.color}">${i.qty}</span><span><b>${esc(i.title)}</b><small>${esc(i.sub)}</small></span><span>${money(i.total)}</span></li>`).join('')}</ul>
          <dl class="summary-rows">
            <div><dt>الدفع</dt><dd>${esc(o.payment)}</dd></div>
            <div class="summary-total"><dt>الإجمالي</dt><dd>${money(o.totals.total)}</dd></div>
          </dl>
        </div>
        <div class="hero-cta">
          <a class="btn btn-primary" href="shop.html">كمّل التسوق</a>
          <a class="link-arrow" href="account.html">طلباتي <svg class="i"><use href="#i-arrow"/></svg></a>
        </div>
        <p class="ph-note">طلب تجريبي: ما انخصم أي مبلغ.</p>
      </div>`;
    if (S.motion) {
      gsap.from('.success-mark', { scale: 0, rotation: -90, duration: .7, ease: 'back.out(1.8)' });
      gsap.from('.success-copy > *', { y: 18, opacity: 0, duration: .45, stagger: .07, delay: .2 });
      gsap.fromTo('.success-mark', { '--bite': '0px' }, { '--bite': '46px', duration: .5, delay: .8, ease: 'power2.out' });
    }
  }
})();
