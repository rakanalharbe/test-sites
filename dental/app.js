const $ = s => document.querySelector(s);
const state = { step: 1, spec: null, doc: null, date: null, time: null };

/* ---------- Specialties & doctors showcase ---------- */
function renderSpecs() {
  $('#specGrid').innerHTML = SPECIALTIES.map(s => `
    <button class="spec" data-spec="${s.id}">
      <div class="ic">${s.icon}</div><h3>${s.name}</h3><span>${s.desc}</span>
    </button>`).join('');
  $('#specGrid').onclick = e => {
    const b = e.target.closest('.spec'); if (!b) return;
    filterDoctors(b.dataset.spec);
    $('#doctors').scrollIntoView();
  };
}

function renderFilters(active = 'all') {
  const all = [{ id: 'all', name: 'جميع الأطباء' }, ...SPECIALTIES];
  $('#filters').innerHTML = all.map(s => `<button class="chip ${s.id === active ? 'active' : ''}" data-f="${s.id}">${s.name}</button>`).join('');
}
$('#filters').onclick = e => { const c = e.target.closest('.chip'); if (c) filterDoctors(c.dataset.f); };

function filterDoctors(f = 'all') {
  renderFilters(f);
  document.querySelectorAll('.spec').forEach(s => s.classList.toggle('active', s.dataset.spec === f));
  const list = f === 'all' ? DOCTORS : DOCTORS.filter(d => d.spec === f);
  $('#docGrid').innerHTML = list.map(d => `
    <article class="doc">
      <div class="doc-top" style="background:linear-gradient(135deg,${d.color},${d.color}aa)">
        <span class="rating">⭐ ${d.rating} <small style="color:#64748b">(${d.reviews})</small></span>
        <div class="avatar" style="color:${d.color}">${initials(d.name)}</div>
      </div>
      <div class="doc-body">
        <h3>${d.name}</h3>
        <span class="sp">${specById(d.spec).name}</span>
        <div class="doc-meta"><span>🎓 ${d.exp} سنة خبرة</span><span>💳 ${d.fee} ر.س</span></div>
        <button class="btn btn-primary" data-book="${d.id}">احجز مع ${d.name.split(' ')[1]}</button>
      </div>
    </article>`).join('');
}
$('#docGrid').onclick = e => {
  const b = e.target.closest('[data-book]'); if (!b) return;
  const d = docById(b.dataset.book);
  state.spec = d.spec; state.doc = d.id; state.date = null; state.time = null;
  renderBookingStep1(); goTo(2);
  $('#booking').scrollIntoView();
};

/* ---------- Booking wizard ---------- */
function renderBookingStep1() {
  $('#bSpecs').innerHTML = SPECIALTIES.map(s => `
    <button class="pick ${state.spec === s.id ? 'sel' : ''}" data-s="${s.id}">
      <span class="mini" style="background:var(--primary-soft);font-size:1.4rem">${s.icon}</span>
      <span><b>${s.name}</b><small>${DOCTORS.filter(d => d.spec === s.id).length} أطباء</small></span>
    </button>`).join('');
  const docs = state.spec ? DOCTORS.filter(d => d.spec === state.spec) : [];
  $('#bDocs').innerHTML = docs.length ? docs.map(d => `
    <button class="pick ${state.doc === d.id ? 'sel' : ''}" data-d="${d.id}">
      <span class="mini" style="background:${d.color}">${initials(d.name)[0]}</span>
      <span><b>${d.name}</b><small>⭐ ${d.rating} · ${d.exp} سنة · ${d.fee} ر.س</small></span>
    </button>`).join('') : '<p style="color:var(--muted)">اختر التخصص أولًا لعرض الأطباء</p>';
  updateNav();
}
$('#bSpecs').onclick = e => { const b = e.target.closest('[data-s]'); if (!b) return; state.spec = b.dataset.s; state.doc = null; renderBookingStep1(); };
$('#bDocs').onclick = e => { const b = e.target.closest('[data-d]'); if (!b) return; state.doc = +b.dataset.d; state.date = null; state.time = null; renderBookingStep1(); };

function availableDates(doc) {
  const out = [], d = new Date();
  for (let i = 0; out.length < 10 && i < 30; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (day.getDay() !== 5 && doc.days.includes(day.getDay())) out.push(day);
  }
  return out;
}

// deterministic "busy" slots so the demo looks realistic
function isBusy(docId, date, time) {
  const taken = loadBookings().some(b => b.doc === docId && b.date === date && b.time === time && b.status !== 'cancelled');
  if (taken) return true;
  let h = 0; for (const c of `${docId}${date}${time}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  if (h % 100 < 35) return true;
  const now = new Date();
  if (date === isoDate(now)) { const [hh, mm] = time.split(':').map(Number); return hh * 60 + mm <= now.getHours() * 60 + now.getMinutes() + 30; }
  return false;
}

function renderStep2() {
  const doc = docById(state.doc);
  $('#docHint').textContent = `مواعيد ${doc.name} — ${specById(doc.spec).name}`;
  const dates = availableDates(doc);
  if (!state.date) state.date = isoDate(dates[0]);
  $('#dates').innerHTML = dates.map(d => {
    const iso = isoDate(d);
    return `<button class="date ${state.date === iso ? 'sel' : ''}" data-date="${iso}">
      <small>${d.toLocaleDateString('ar-u-ca-gregory', { weekday: 'long' })}</small>
      <b>${d.getDate()}</b>
      <small>${d.toLocaleDateString('ar-u-ca-gregory', { month: 'short' })}</small></button>`;
  }).join('');
  const block = (title, arr) => `<div class="period">${title}</div><div class="slots">${arr.map(t =>
    `<button class="slot ${state.time === t ? 'sel' : ''}" data-t="${t}" ${isBusy(doc.id, state.date, t) ? 'disabled' : ''}>${fmtTime(t)}</button>`).join('')}</div>`;
  $('#slots').innerHTML = block('🌤️ الفترة الصباحية', SLOTS.morning) + block('🌙 الفترة المسائية', SLOTS.evening);
  updateNav();
}
$('#dates').onclick = e => { const b = e.target.closest('[data-date]'); if (!b) return; state.date = b.dataset.date; state.time = null; renderStep2(); };
$('#slots').onclick = e => { const b = e.target.closest('[data-t]'); if (!b || b.disabled) return; state.time = b.dataset.t; renderStep2(); };

function validateForm(show = true) {
  const name = $('#fName').value.trim(), phone = $('#fPhone').value.trim();
  const okName = name.split(/\s+/).length >= 2 && name.length >= 5;
  const okPhone = /^05\d{8}$/.test(phone);
  if (show) {
    $('#fName').parentElement.classList.toggle('err', !okName);
    $('#fPhone').parentElement.classList.toggle('err', !okPhone);
  }
  return okName && okPhone;
}
$('#fPhone').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, ''); });
['#fName', '#fPhone'].forEach(s => $(s).addEventListener('input', () => { $(s).parentElement.classList.remove('err'); updateNav(); }));

function renderSummary() {
  const doc = docById(state.doc);
  const items = [
    ['👨‍⚕️', 'الطبيب', doc.name], ['🦷', 'التخصص', specById(doc.spec).name],
    ['📅', 'التاريخ', fmtDate(state.date)], ['🕘', 'الوقت', fmtTime(state.time)],
    ['👤', 'المراجع', $('#fName').value.trim()], ['📱', 'الجوال', $('#fPhone').value],
    ['📋', 'نوع الزيارة', $('#fType').value], ['💳', 'رسوم الكشف', `${doc.fee} ر.س (${$('#fIns').value})`]
  ];
  $('#summary').innerHTML = items.map(([i, l, v]) => `<div class="sum-item"><span class="ic">${i}</span><div><small>${l}</small><b>${v}</b></div></div>`).join('');
}
$('#agree').onchange = updateNav;

function canNext() {
  return { 1: !!state.doc, 2: !!state.time, 3: validateForm(false), 4: $('#agree').checked }[state.step];
}
function updateNav() {
  $('#nextBtn').disabled = !canNext();
  $('#nextBtn').textContent = state.step === 4 ? 'تأكيد الحجز ✓' : 'التالي ←';
  $('#prevBtn').style.visibility = state.step > 1 ? 'visible' : 'hidden';
}

function goTo(n) {
  state.step = n;
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('show', +p.dataset.step === n));
  document.querySelectorAll('.step').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
    s.classList.toggle('done', i + 1 < n);
    s.querySelector('.n').textContent = i + 1 < n ? '✓' : i + 1;
  });
  if (n === 1) renderBookingStep1();
  if (n === 2) renderStep2();
  if (n === 4) renderSummary();
  updateNav();
}

$('#nextBtn').onclick = () => {
  if (state.step === 3 && !validateForm()) return;
  if (state.step < 4) { goTo(state.step + 1); $('#booking').scrollIntoView(); return; }
  confirmBooking();
};
$('#prevBtn').onclick = () => goTo(state.step - 1);

function confirmBooking() {
  const btn = $('#nextBtn');
  btn.disabled = true; btn.textContent = 'جارِ التأكيد...';
  setTimeout(() => {
    const doc = docById(state.doc);
    const code = 'BS-' + Math.floor(100000 + Math.random() * 900000);
    const booking = {
      code, doc: doc.id, spec: doc.spec, date: state.date, time: state.time,
      name: $('#fName').value.trim(), phone: $('#fPhone').value, age: $('#fAge').value,
      gender: $('#fGender').value, type: $('#fType').value, insurance: $('#fIns').value,
      notes: $('#fNotes').value.trim(), fee: doc.fee, status: 'confirmed', createdAt: new Date().toISOString()
    };
    saveBookings([booking, ...loadBookings()]);
    $('#ticket').innerHTML = `
      <div class="code">${code}</div>
      <div class="row"><span>الطبيب</span><b>${doc.name}</b></div>
      <div class="row"><span>التاريخ</span><b>${fmtDate(state.date)}</b></div>
      <div class="row"><span>الوقت</span><b>${fmtTime(state.time)}</b></div>
      <div class="row"><span>المراجع</span><b>${booking.name}</b></div>
      <div class="row"><span>الموقع</span><b>مجمع بسمة – حي النرجس</b></div>`;
    $('#successBox').classList.add('show');
  }, 900);
}

$('#newBooking').onclick = () => {
  $('#successBox').classList.remove('show');
  Object.assign(state, { spec: null, doc: null, date: null, time: null });
  $('#pForm').reset(); $('#agree').checked = false;
  goTo(1); toast('يمكنك الآن إضافة حجز جديد');
};

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); }

renderSpecs(); filterDoctors(); renderBookingStep1();
