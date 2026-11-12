const $ = s => document.querySelector(s);
let cart = store.get(CART_KEY, []);
let cur = null;           // item being customised
let activeCat = 'pizza';
const co = { step: 1, type: 'delivery', data: {} };

/* ---------- Menu ---------- */
function renderTabs() {
  $('#tabs').innerHTML = CATEGORIES.map(c => `<button class="tab ${c.id === activeCat ? 'active' : ''}" data-cat="${c.id}">${c.icon} ${c.name}</button>`).join('');
}
function renderMenu() {
  $('#menuGrid').innerHTML = MENU.filter(m => m.cat === activeCat).map(m => `
    <article class="item" data-id="${m.id}">
      <div class="item-img" style="background:${m.bg}">${m.tag ? `<span class="ribbon">${m.tag}</span>` : ''}<div class="plate">${m.icon}</div></div>
      <div class="item-body">
        <h3>${m.name}</h3><p>${m.desc}</p>
        <div class="item-foot"><div class="price"><small>يبدأ من</small><b>${money(m.prices[0])}</b></div><button class="add" aria-label="إضافة">+</button></div>
      </div>
    </article>`).join('');
}
$('#tabs').onclick = e => { const t = e.target.closest('[data-cat]'); if (!t) return; activeCat = t.dataset.cat; renderTabs(); renderMenu(); };
document.querySelectorAll('[data-goto]').forEach(a => a.addEventListener('click', () => { activeCat = a.dataset.goto; renderTabs(); renderMenu(); }));
$('#menuGrid').onclick = e => { const c = e.target.closest('.item'); if (c) openItem(c.dataset.id); };

/* ---------- Overlays ---------- */
function open(el) { closeAll(); el.classList.add('show'); $('#backdrop').classList.add('show'); document.body.classList.add('lock'); }
function closeAll() { document.querySelectorAll('.modal.show,.drawer.show').forEach(x => x.classList.remove('show')); $('#backdrop').classList.remove('show'); document.body.classList.remove('lock'); }
$('#backdrop').onclick = closeAll;
document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeAll);
document.addEventListener('keydown', e => e.key === 'Escape' && closeAll());

/* ---------- Item customisation ---------- */
function openItem(id) {
  const m = itemById(id);
  cur = { id, size: 1, extras: [], qty: 1 };
  const sizes = SIZE_LABELS[m.cat];
  $('#itemBody').innerHTML = `
    <div class="m-hero" style="background:${m.bg}">${m.icon}</div>
    <div class="m-body">
      <h3>${m.name}</h3><p>${m.desc}</p>
      <div class="opt-title">اختر الحجم <small>مطلوب</small></div>
      <div class="sizes">${sizes.map((s, i) => `
        <button class="size ${i === 1 ? 'sel' : ''}" data-size="${i}">
          <span class="dot" style="width:${s.s}px;height:${s.s}px"></span><b>${s.n}</b><small>${s.d}</small><br><b style="color:var(--red)">${money(m.prices[i])}</b>
        </button>`).join('')}</div>
      <div class="opt-title">الإضافات <small>اختياري</small></div>
      <div class="extras">${EXTRAS[m.cat].map((x, i) => `
        <label class="extra"><span><input type="checkbox" value="${i}"> ${x.i} ${x.n}</span><em>${x.p ? '+' + money(x.p) : 'مجانًا'}</em></label>`).join('')}</div>
      <div class="opt-title">ملاحظات خاصة</div>
      <textarea class="note" id="itemNote" rows="2" placeholder="مثال: بدون بصل، مقرمشة أكثر..."></textarea>
    </div>`;
  $('#qVal').textContent = 1;
  updateItemTotal();
  open($('#itemModal'));
  $('#itemModal .modal-scroll').scrollTop = 0;
}
$('#itemBody').addEventListener('click', e => {
  const s = e.target.closest('[data-size]'); if (!s) return;
  cur.size = +s.dataset.size;
  document.querySelectorAll('.size').forEach(b => b.classList.toggle('sel', b === s));
  updateItemTotal();
});
$('#itemBody').addEventListener('change', e => {
  if (e.target.type !== 'checkbox') return;
  cur.extras = [...document.querySelectorAll('.extra input:checked')].map(i => +i.value);
  updateItemTotal();
});
const unitPrice = c => { const m = itemById(c.id); return m.prices[c.size] + c.extras.reduce((s, i) => s + EXTRAS[m.cat][i].p, 0); };
function updateItemTotal() { $('#itemTotal').textContent = money(unitPrice(cur) * cur.qty); }
$('#qMinus').onclick = () => { if (cur.qty > 1) { cur.qty--; $('#qVal').textContent = cur.qty; updateItemTotal(); } };
$('#qPlus').onclick = () => { if (cur.qty < 20) { cur.qty++; $('#qVal').textContent = cur.qty; updateItemTotal(); } };
$('#addToCart').onclick = () => {
  const note = $('#itemNote').value.trim();
  const key = `${cur.id}|${cur.size}|${[...cur.extras].sort().join(',')}|${note}`;
  const ex = cart.find(c => c.key === key);
  if (ex) ex.qty += cur.qty; else cart.push({ key, id: cur.id, size: cur.size, extras: cur.extras, qty: cur.qty, note });
  saveCart(); closeAll();
  toast(`✅ تمت إضافة ${itemById(cur.id).name} إلى السلة`);
  const cc = $('#cartCount'); cc.classList.remove('bump'); void cc.offsetWidth; cc.classList.add('bump');
};

/* ---------- Cart ---------- */
const totals = () => {
  const sub = cart.reduce((s, c) => s + unitPrice(c) * c.qty, 0);
  const del = co.type === 'pickup' || sub >= FREE_DELIVERY || !sub ? 0 : DELIVERY_FEE;
  return { sub, del, total: sub + del };
};
function saveCart() { store.set(CART_KEY, cart); $('#cartCount').textContent = cart.reduce((s, c) => s + c.qty, 0); renderCart(); }
const describe = c => { const m = itemById(c.id); return [SIZE_LABELS[m.cat][c.size].n, ...c.extras.map(i => EXTRAS[m.cat][i].n)].join(' · '); };

function renderCart() {
  if (!cart.length) {
    $('#cartBody').innerHTML = `<div class="empty-cart"><div>🛒</div><h3 style="color:var(--dark)">سلتك فارغة</h3><p>أضف بعض الأطباق اللذيذة من القائمة</p></div>`;
    $('#cartFoot').innerHTML = `<button class="btn btn-dark w100" data-close-cart>تصفح القائمة</button>`;
    return;
  }
  $('#cartBody').innerHTML = cart.map((c, i) => { const m = itemById(c.id); return `
    <div class="c-item">
      <div class="c-thumb" style="background:${m.bg}">${m.icon}</div>
      <div class="c-info"><b>${m.name}</b><small>${describe(c)}</small>${c.note ? `<small>📝 ${c.note}</small>` : ''}
        <div class="c-row"><div class="qty"><button data-dec="${i}">−</button><b>${c.qty}</b><button data-inc="${i}">+</button></div><span class="c-price">${money(unitPrice(c) * c.qty)}</span></div>
      </div>
    </div>`; }).join('');
  const t = totals(), left = Math.max(0, FREE_DELIVERY - t.sub);
  $('#cartFoot').innerHTML = `
    <div class="free-bar">${left ? `أضف <b>${money(left)}</b> للحصول على توصيل مجاني 🚚` : '🎉 مبروك! حصلت على توصيل مجاني'}<div class="bar"><i style="width:${Math.min(100, t.sub / FREE_DELIVERY * 100)}%"></i></div></div>
    <div class="line"><span>المجموع الفرعي</span><span>${money(t.sub)}</span></div>
    <div class="line"><span>رسوم التوصيل</span><span>${t.del ? money(t.del) : 'مجانًا'}</span></div>
    <div class="line total"><span>الإجمالي</span><span>${money(t.total)}</span></div>
    <button class="btn btn-primary w100" style="margin-top:12px" id="goCheckout">إتمام الطلب ←</button>`;
}
$('#cartBody').onclick = e => {
  const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
  if (inc) cart[inc.dataset.inc].qty++;
  else if (dec) { const i = +dec.dataset.dec; if (--cart[i].qty <= 0) cart.splice(i, 1); }
  else return;
  saveCart();
};
$('#cartFoot').onclick = e => {
  if (e.target.closest('[data-close-cart]')) { closeAll(); $('#menu').scrollIntoView(); }
  if (e.target.closest('#goCheckout')) { co.step = 1; renderCheckout(); open($('#checkout')); }
};
$('#openCart').onclick = () => { renderCart(); open($('#drawer')); };

/* ---------- Checkout ---------- */
function renderCheckout() {
  $('#co2').classList.toggle('on', co.step === 2);
  $('#coBack').style.display = co.step === 2 ? '' : 'none';
  const d = co.data;
  if (co.step === 1) {
    $('#coBody').innerHTML = `
      <h3>بيانات الطلب</h3><p style="color:var(--muted)">أدخل بياناتك لإيصال الطلب إليك</p>
      <div class="opt-title">طريقة الاستلام</div>
      <div class="seg">
        <button data-type="delivery" class="${co.type === 'delivery' ? 'sel' : ''}">🛵<span>توصيل للمنزل<small>30–40 دقيقة</small></span></button>
        <button data-type="pickup" class="${co.type === 'pickup' ? 'sel' : ''}">🏪<span>استلام من الفرع<small>جاهز خلال 20 دقيقة</small></span></button>
      </div>
      <div class="opt-title">معلومات التواصل</div>
      <div class="form">
        <div class="field"><label>الاسم *</label><input id="cName" value="${d.name || ''}" placeholder="الاسم الكامل"><span class="msg">الرجاء إدخال الاسم</span></div>
        <div class="field"><label>رقم الجوال *</label><input id="cPhone" value="${d.phone || ''}" placeholder="05xxxxxxxx" maxlength="10" inputmode="numeric" dir="ltr" style="text-align:right"><span class="msg">رقم جوال غير صحيح (05xxxxxxxx)</span></div>
        ${co.type === 'delivery' ? `
        <div class="field"><label>الحي *</label><select id="cDistrict"><option value="">اختر الحي</option>${DISTRICTS.map(x => `<option ${d.district === x ? 'selected' : ''}>${x}</option>`).join('')}</select><span class="msg">اختر الحي</span></div>
        <div class="field"><label>الشارع / رقم المبنى *</label><input id="cAddress" value="${d.address || ''}" placeholder="مثال: شارع الأمير سعود، مبنى 12"><span class="msg">الرجاء إدخال العنوان</span></div>` : ''}
        <div class="field full"><label>ملاحظات للمندوب</label><input id="cNotes" value="${d.notes || ''}" placeholder="مثال: الدور الثاني، الباب الأيمن"></div>
      </div>
      <div class="opt-title">طريقة الدفع</div>
      <div class="pay"><span class="ic">💵</span><div><b>الدفع عند الاستلام</b><small>نقدًا أو بالشبكة عند استلام الطلب</small></div><span class="tick">✓</span></div>
      <div class="pay off" style="margin-top:8px"><span class="ic">💳</span><div><b>الدفع الإلكتروني</b><small>غير متاح حاليًا</small></div></div>`;
    $('#coNext').textContent = 'مراجعة الطلب ←';
    $('#cPhone').addEventListener('input', e => e.target.value = e.target.value.replace(/\D/g, ''));
  } else {
    const t = totals();
    $('#coBody').innerHTML = `
      <h3>مراجعة الطلب</h3><p style="color:var(--muted)">تأكد من تفاصيل طلبك قبل التأكيد</p>
      <div class="opt-title">الأصناف (${cart.reduce((s, c) => s + c.qty, 0)})</div>
      <div class="review-list">${cart.map(c => `<div class="r"><span>${c.qty}× ${itemById(c.id).name} <small style="color:var(--muted)">(${describe(c)})</small></span><b>${money(unitPrice(c) * c.qty)}</b></div>`).join('')}</div>
      <div class="info-grid">
        <div><small>الاسم</small><b>${d.name}</b></div><div><small>الجوال</small><b dir="ltr">${d.phone}</b></div>
        <div><small>الاستلام</small><b>${co.type === 'delivery' ? '🛵 توصيل' : '🏪 من الفرع'}</b></div><div><small>الدفع</small><b>💵 عند الاستلام</b></div>
        ${co.type === 'delivery' ? `<div style="grid-column:1/-1"><small>العنوان</small><b>حي ${d.district}، ${d.address}</b></div>` : ''}
      </div>
      <div style="margin-top:14px">
        <div class="line"><span>المجموع الفرعي</span><span>${money(t.sub)}</span></div>
        <div class="line"><span>التوصيل</span><span>${t.del ? money(t.del) : 'مجانًا'}</span></div>
        <div class="line total"><span>الإجمالي المستحق عند الاستلام</span><span style="color:var(--red)">${money(t.total)}</span></div>
        <small style="color:var(--muted)">الأسعار شاملة ضريبة القيمة المضافة</small>
      </div>`;
    $('#coNext').textContent = `تأكيد الطلب · ${money(t.total)}`;
  }
}
$('#coBody').addEventListener('click', e => {
  const b = e.target.closest('[data-type]'); if (!b) return;
  collect(); co.type = b.dataset.type; renderCheckout();
});
function collect() {
  const v = id => ($('#' + id) || {}).value?.trim?.() ?? co.data[id.slice(1).toLowerCase()];
  co.data = { ...co.data, name: v('cName'), phone: v('cPhone'), notes: v('cNotes'),
    ...(co.type === 'delivery' ? { district: v('cDistrict'), address: v('cAddress') } : {}) };
}
function validate() {
  const checks = [['cName', x => x.length >= 3], ['cPhone', x => /^05\d{8}$/.test(x)]];
  if (co.type === 'delivery') checks.push(['cDistrict', x => !!x], ['cAddress', x => x.length >= 4]);
  let ok = true;
  checks.forEach(([id, fn]) => { const el = $('#' + id); const good = fn(el.value.trim()); el.parentElement.classList.toggle('err', !good); if (!good) ok = false; });
  return ok;
}
$('#coNext').onclick = () => {
  if (co.step === 1) { if (!validate()) return; collect(); co.step = 2; renderCheckout(); $('#checkout .modal-scroll').scrollTop = 0; return; }
  placeOrder();
};
$('#coBack').onclick = () => { co.step = 1; renderCheckout(); };

function placeOrder() {
  const btn = $('#coNext'); btn.disabled = true; btn.textContent = 'جارِ إرسال الطلب...';
  setTimeout(() => {
    const t = totals();
    const order = { no: '#' + Math.floor(10000 + Math.random() * 90000), type: co.type, ...co.data,
      items: cart.map(c => ({ name: itemById(c.id).name, qty: c.qty, desc: describe(c), price: unitPrice(c) * c.qty })),
      ...t, status: 'new', createdAt: new Date().toISOString() };
    store.set(ORDERS_KEY, [order, ...store.get(ORDERS_KEY, [])]);
    cart = []; saveCart(); closeAll(); btn.disabled = false;
    const eta = new Date(Date.now() + (co.type === 'delivery' ? 35 : 20) * 60000).toLocaleTimeString('ar-u-nu-latn', { hour: 'numeric', minute: '2-digit' });
    $('#sCard').innerHTML = `
      <div class="s-icon"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <h2>تم تأكيد طلبك بنجاح! 🎉</h2>
      <p>شكرًا ${order.name.split(' ')[0]}، بدأنا تحضير طلبك الآن</p>
      <div class="order-no">${order.no}</div>
      <div class="eta">⏱️ ${co.type === 'delivery' ? 'الوصول المتوقع' : 'جاهز للاستلام'}: ${eta}</div>
      <div class="track">
        <div class="t on"><span>✅</span>تم الاستلام</div>
        <div class="t on now"><span>👨‍🍳</span>قيد التحضير</div>
        <div class="t"><span>${co.type === 'delivery' ? '🛵' : '🛍️'}</span>${co.type === 'delivery' ? 'في الطريق' : 'جاهز'}</div>
        <div class="t"><span>🏠</span>تم التسليم</div>
      </div>
      <div class="s-summary">
        ${order.items.map(i => `<div class="r"><span>${i.qty}× ${i.name}</span><b>${money(i.price)}</b></div>`).join('')}
        <div class="r" style="border-top:1px solid var(--line);margin-top:6px;padding-top:8px"><span>المبلغ المستحق (الدفع عند الاستلام)</span><b style="color:var(--red)">${money(order.total)}</b></div>
      </div>
      <a class="btn btn-dark w100" style="margin-bottom:10px" href="track.html?no=${order.no.replace('#', '')}">🛵 تتبع طلبك</a>
      <button class="btn btn-light w100" id="backHome">العودة للقائمة</button>`;
    $('#success').classList.add('show'); document.body.classList.add('lock');
    $('#backHome').onclick = () => { $('#success').classList.remove('show'); document.body.classList.remove('lock'); scrollTo(0, 0); };
  }, 1000);
}

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400); }

renderTabs(); renderMenu(); saveCart();
