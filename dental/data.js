const SPECIALTIES = [
  { id: 'general', name: 'طب الأسنان العام', icon: '🦷', desc: 'فحص وحشوات وتنظيف' },
  { id: 'ortho',   name: 'تقويم الأسنان',   icon: '😁', desc: 'تقويم معدني وشفاف' },
  { id: 'cosmetic',name: 'تجميل الأسنان',   icon: '✨', desc: 'ابتسامة هوليود وتبييض' },
  { id: 'endo',    name: 'علاج العصب',      icon: '🔬', desc: 'علاج الجذور بالمجهر' },
  { id: 'implant', name: 'زراعة الأسنان',   icon: '🔩', desc: 'زراعة فورية ودائمة' },
  { id: 'kids',    name: 'أسنان الأطفال',    icon: '🧸', desc: 'رعاية لطيفة للصغار' }
];

const DOCTORS = [
  { id: 1, name: 'د. سارة العتيبي',   spec: 'ortho',    exp: 12, rating: 4.9, reviews: 412, fee: 250, color: '#0e7c86', days: [6,0,1,2,3] },
  { id: 2, name: 'د. خالد القحطاني',  spec: 'implant',  exp: 18, rating: 4.8, reviews: 530, fee: 300, color: '#2563eb', days: [6,0,2,4] },
  { id: 3, name: 'د. نورة الشهري',    spec: 'cosmetic', exp: 9,  rating: 4.9, reviews: 288, fee: 280, color: '#db2777', days: [0,1,2,3,4] },
  { id: 4, name: 'د. فهد الدوسري',    spec: 'endo',     exp: 14, rating: 4.7, reviews: 301, fee: 220, color: '#7c3aed', days: [6,1,3,4] },
  { id: 5, name: 'د. ريم الزهراني',   spec: 'kids',     exp: 8,  rating: 5.0, reviews: 197, fee: 180, color: '#ea580c', days: [6,0,1,2,3,4] },
  { id: 6, name: 'د. عبدالله المطيري',spec: 'general',  exp: 10, rating: 4.8, reviews: 365, fee: 150, color: '#059669', days: [6,0,1,2,3,4] },
  { id: 7, name: 'د. هيفاء الغامدي',  spec: 'general',  exp: 6,  rating: 4.6, reviews: 142, fee: 150, color: '#0891b2', days: [6,1,2,4] },
  { id: 8, name: 'د. ماجد الحربي',    spec: 'ortho',    exp: 15, rating: 4.8, reviews: 376, fee: 250, color: '#4f46e5', days: [0,2,3,4] }
];

const SLOTS = {
  morning: ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30'],
  evening: ['16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30']
};

const STORE_KEY = 'basma_bookings';
const specById = id => SPECIALTIES.find(s => s.id === id);
const docById = id => DOCTORS.find(d => d.id === +id);
const initials = name => name.replace('د. ', '').split(' ').map(w => w.replace(/^ال/, '')[0]).join(' ');
const loadBookings = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; } };
const saveBookings = list => { try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch {} };
const fmtDate = (iso, opts = { weekday: 'long', day: 'numeric', month: 'long' }) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('ar-u-ca-gregory-nu-latn', opts);
const fmtTime = t => { const [h, m] = t.split(':').map(Number); const hh = h > 12 ? h - 12 : h; return `${hh}:${String(m).padStart(2,'0')} ${h >= 12 ? 'م' : 'ص'}`; };
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
