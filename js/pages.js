/* Account (OTP demo login + orders), contact form, policies side nav */
(() => {
  const S = window.Store;
  const { $, $$, money, esc } = S;
  const page = document.body.dataset.page;
  const cleanPhone = v => v.replace(/\D/g, '').replace(/^(966|0)/, '');

  /* ---------- Account ---------- */
  if (page === 'account') {
    const root = $('[data-account]');

    function renderLogin(step = 'phone', phone = '') {
      root.innerHTML = `
        <div class="auth-card bite">
          <p class="eyebrow">حسابي</p>
          <h1 class="page-title">${step === 'phone' ? 'أهلاً فيك' : 'اكتب الرمز'}</h1>
          <p class="page-lead">${step === 'phone' ? 'ادخل برقم جوالك، بدون كلمة مرور.' : `أرسلنا رمز من 4 أرقام إلى <span dir="ltr">+966 ${esc(phone)}</span>.`}</p>
          <form class="auth-form" data-auth="${step}" novalidate>
            ${step === 'phone' ? `
              <label for="acc-phone">رقم الجوال</label>
              <div class="field field--light"><span class="field-prefix" dir="ltr">+966</span>
                <input id="acc-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" dir="ltr" placeholder="5X XXX XXXX" aria-describedby="acc-err"></div>`
            : `
              <label for="acc-otp">رمز التحقق</label>
              <input class="otp" id="acc-otp" name="otp" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="4" dir="ltr" placeholder="••••" aria-describedby="acc-err">`}
            <p class="fld-err" id="acc-err" role="status"></p>
            <button class="btn btn-primary btn-block" type="submit">${step === 'phone' ? 'أرسل الرمز' : 'دخول'}</button>
            ${step === 'otp' ? '<button class="link-btn" type="button" data-change-phone>غيّر الرقم</button>' : ''}
          </form>
          <p class="ph-note">تجربة: أي رمز من 4 أرقام يشتغل. الدخول الحقيقي يكون من سلة.</p>
        </div>`;
      $('input', root).focus();
    }

    function renderDashboard(session) {
      const orders = S.read('chwly-orders', []);
      const c = S.read('chwly-customer', null);
      root.innerHTML = `
        <div class="acc-head">
          <div>
            <p class="eyebrow">حسابي</p>
            <h1 class="page-title">أهلاً${c?.name ? ` ${esc(c.name.split(' ')[0])}` : ''}</h1>
            <p class="page-lead" dir="ltr">+966 ${esc(session.phone)}</p>
          </div>
          <button class="btn btn-dark" type="button" data-logout>تسجيل خروج</button>
        </div>
        <div class="acc-grid">
          <section aria-labelledby="orders-title">
            <h2 id="orders-title" class="acc-h">طلباتي</h2>
            ${orders.length ? `<ul class="order-list">${orders.map(o => `
              <li class="order">
                <div class="order-top">
                  <b dir="ltr">#${esc(o.id)}</b>
                  <span class="badge">قيد التجهيز</span>
                </div>
                <p class="order-meta">${new Date(o.date).toLocaleDateString('ar-SA-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' })} · ${o.items.reduce((s, i) => s + i.qty, 0)} قطع · ${esc(o.payment)}</p>
                <div class="order-dots" aria-hidden="true">${o.items.map(i => `<span style="--c:${i.color}"></span>`).join('')}</div>
                <p class="order-items">${o.items.map(i => esc(i.title)).join('، ')}</p>
                <p class="order-total">${money(o.totals.total)}</p>
                <a class="link-arrow" href="order-success.html?o=${encodeURIComponent(o.id)}">التفاصيل <svg class="i"><use href="#i-arrow"/></svg></a>
              </li>`).join('')}</ul>`
            : `<div class="empty-state"><p class="empty-title">ما عندك طلبات لسا.</p><a class="btn btn-primary" href="shop.html">ابدأ التسوق</a></div>`}
          </section>
          <aside aria-labelledby="addr-title">
            <h2 id="addr-title" class="acc-h">عنواني</h2>
            <div class="addr-card">
              ${c ? `<p><b>${esc(c.name)}</b></p><p>${esc(c.city)}، ${esc(c.district)}</p><p dir="ltr">+966 ${esc(c.phone)}</p>`
              : '<p>ما فيه عنوان محفوظ. ينحفظ تلقائياً مع أول طلب.</p>'}
            </div>
            <h2 class="acc-h">تحتاج مساعدة؟</h2>
            <div class="addr-card"><p>فريقنا يرد عليك بالواتساب.</p><a class="link-arrow" href="contact.html">تواصل معنا <svg class="i"><use href="#i-arrow"/></svg></a></div>
          </aside>
        </div>`;
    }

    root.addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      const err = $('#acc-err');
      if (f.dataset.auth === 'phone') {
        const phone = cleanPhone(f.phone.value);
        if (!/^5\d{8}$/.test(phone)) { err.textContent = 'رقم جوال سعودي يبدأ بـ 5 ومن 9 أرقام.'; f.phone.setAttribute('aria-invalid', 'true'); return; }
        root.dataset.phone = phone;
        renderLogin('otp', phone);
      } else {
        if (!/^\d{4}$/.test(f.otp.value)) { err.textContent = 'الرمز 4 أرقام.'; f.otp.setAttribute('aria-invalid', 'true'); return; }
        const session = { phone: root.dataset.phone };
        S.write('chwly-session', session);
        renderDashboard(session);
      }
    });
    root.addEventListener('click', e => {
      if (e.target.closest('[data-change-phone]')) renderLogin('phone');
      if (e.target.closest('[data-logout]')) { try { localStorage.removeItem('chwly-session'); } catch { } renderLogin('phone'); }
    });

    const session = S.read('chwly-session', null);
    session ? renderDashboard(session) : renderLogin();
    S.animate();
  }

  /* ---------- Contact form (placeholder: nothing is sent) ---------- */
  if (page === 'contact') {
    const form = $('[data-contact]');
    const rules = {
      cname: v => v.trim().length >= 2 || 'اكتب اسمك.',
      cphone: v => /^5\d{8}$/.test(cleanPhone(v)) || 'رقم جوال سعودي يبدأ بـ 5.',
      ctopic: v => !!v || 'اختر الموضوع.',
      cmsg: v => v.trim().length >= 10 || 'اكتب رسالتك (10 أحرف على الأقل).'
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      let first = null;
      Object.entries(rules).forEach(([n, rule]) => {
        const el = form.elements.namedItem(n);
        const res = rule(el.value);
        el.setAttribute('aria-invalid', String(res !== true));
        $(`[data-err="${n}"]`).textContent = res === true ? '' : res;
        if (res !== true && !first) first = el;
      });
      if (first) { first.focus(); return; }
      form.reset();
      $('[data-contact-msg]').textContent = 'وصلتنا رسالتك، رح نرد عليك خلال يوم عمل. (تجربة: ما انرسل شي)';
    });
    S.animate();
  }

  /* ---------- Policies: highlight the section in view ---------- */
  if (page === 'policies') {
    const links = $$('.pol-nav a');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === `#${en.target.id}`));
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('.pol-section').forEach(s => io.observe(s));
    S.animate();
  }

  if (['about', 'notfound'].includes(page)) S.animate();
  if (page === 'about' && S.motion) {
    gsap.from('.about-hero .page-title .line', { yPercent: 50, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' });
    gsap.to('.about-gums img', { y: (i) => (i % 2 ? -60 : 60), rotation: (i) => (i % 2 ? 40 : -40), ease: 'none', scrollTrigger: { trigger: '.about-hero', start: 'top top', end: 'bottom top', scrub: true } });
  }
  if (page === 'notfound' && S.motion) {
    gsap.from('.nf-num', { scale: .6, opacity: 0, duration: .6, ease: 'back.out(1.8)' });
    gsap.to('.nf-gum', { y: -14, rotation: 12, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }
})();
