const CATEGORIES = [
  { id: 'pizza', name: 'البيتزا', icon: '🍕' },
  { id: 'pies', name: 'الفطائر', icon: '🥟' },
  { id: 'drinks', name: 'المشروبات', icon: '🥤' }
];

const SIZE_LABELS = {
  pizza:  [{ n: 'صغير', d: '20 سم', s: 22 }, { n: 'وسط', d: '28 سم', s: 30 }, { n: 'كبير', d: '35 سم', s: 38 }],
  pies:   [{ n: 'حبة', d: 'قطعة واحدة', s: 22 }, { n: '6 حبات', d: 'علبة وسط', s: 30 }, { n: '12 حبة', d: 'علبة عائلية', s: 38 }],
  drinks: [{ n: 'صغير', d: '250 مل', s: 22 }, { n: 'وسط', d: '400 مل', s: 30 }, { n: 'كبير', d: '600 مل', s: 38 }]
};

const EXTRAS = {
  pizza: [
    { n: 'جبنة موزاريلا إضافية', i: '🧀', p: 6 }, { n: 'حواف محشوة بالجبن', i: '🥖', p: 9 },
    { n: 'فطر طازج', i: '🍄', p: 4 }, { n: 'زيتون أسود', i: '🫒', p: 3 },
    { n: 'هالبينو حار', i: '🌶️', p: 3 }, { n: 'صوص رانش', i: '🥣', p: 3 }
  ],
  pies: [
    { n: 'جبنة إضافية', i: '🧀', p: 3 }, { n: 'عسل', i: '🍯', p: 3 },
    { n: 'سمسم وحبة البركة', i: '🌰', p: 1 }, { n: 'صوص حار', i: '🌶️', p: 2 }
  ],
  drinks: [{ n: 'ثلج إضافي', i: '🧊', p: 0 }, { n: 'شريحة ليمون', i: '🍋', p: 1 }]
};

const MENU = [
  { id: 'p1', cat: 'pizza', name: 'مارغريتا', desc: 'صوص طماطم إيطالي، موزاريلا طازجة وريحان', icon: '🍕', bg: '#ffe1d6', prices: [25, 35, 45], tag: 'الأكثر طلبًا' },
  { id: 'p2', cat: 'pizza', name: 'بيبروني', desc: 'شرائح بيبروني بقري مع جبنة موزاريلا ذائبة', icon: '🍕', bg: '#ffd6d6', prices: [30, 42, 54], tag: '🔥 حار' },
  { id: 'p3', cat: 'pizza', name: 'دجاج باربكيو', desc: 'دجاج مشوي، بصل أحمر، صوص باربكيو مدخن', icon: '🍗', bg: '#fde7c8', prices: [32, 44, 56] },
  { id: 'p4', cat: 'pizza', name: 'خضار', desc: 'فلفل ملون، فطر، زيتون، ذرة وطماطم', icon: '🫑', bg: '#dff3d8', prices: [27, 37, 47] },
  { id: 'p5', cat: 'pizza', name: 'أربعة أجبان', desc: 'موزاريلا، شيدر، بارميزان وجبنة زرقاء', icon: '🧀', bg: '#fff1c2', prices: [33, 45, 58], tag: 'جديد' },
  { id: 'p6', cat: 'pizza', name: 'سوبريم', desc: 'لحم مفروم، بيبروني، خضار مشكلة وزيتون', icon: '🍕', bg: '#f3dccb', prices: [35, 48, 62] },

  { id: 'f1', cat: 'pies', name: 'فطيرة جبنة', desc: 'عجينة هشة محشوة بجبنة عكاوي وموزاريلا', icon: '🧀', bg: '#fff1c2', prices: [6, 30, 55], tag: 'الأكثر طلبًا' },
  { id: 'f2', cat: 'pies', name: 'فطيرة زعتر', desc: 'زعتر بلدي فاخر مع زيت زيتون بكر', icon: '🌿', bg: '#e1f0d5', prices: [4, 20, 36] },
  { id: 'f3', cat: 'pies', name: 'فطيرة لحم', desc: 'لحم غنم مفروم مع بصل وبهارات خاصة', icon: '🥩', bg: '#f8d9d0', prices: [8, 42, 78] },
  { id: 'f4', cat: 'pies', name: 'فطيرة سبانخ', desc: 'سبانخ طازجة مع بصل وسماق ودبس رمان', icon: '🥬', bg: '#d8f0dc', prices: [5, 26, 48] },
  { id: 'f5', cat: 'pies', name: 'فطيرة محمرة', desc: 'فلفل أحمر وجوز ودبس رمان على الطريقة الحلبية', icon: '🌶️', bg: '#ffd9cc', prices: [5, 26, 48] },
  { id: 'f6', cat: 'pies', name: 'فطيرة دجاج', desc: 'دجاج متبل بالفلفل والفطر وصوص كريمي', icon: '🍗', bg: '#fde7c8', prices: [7, 36, 66], tag: 'جديد' },

  { id: 'd1', cat: 'drinks', name: 'عصير برتقال طازج', desc: 'برتقال معصور طازجًا عند الطلب', icon: '🍊', bg: '#ffe6c7', prices: [9, 12, 15] },
  { id: 'd2', cat: 'drinks', name: 'مشروب غازي', desc: 'اختيارك من المشروبات الغازية الباردة', icon: '🥤', bg: '#e0e7ff', prices: [4, 5, 7] },
  { id: 'd3', cat: 'drinks', name: 'ليمون بالنعناع', desc: 'ليمون منعش مع نعناع طازج ومثلج', icon: '🍋', bg: '#f1f7c8', prices: [8, 11, 14] },
  { id: 'd4', cat: 'drinks', name: 'مياه معدنية', desc: 'مياه معدنية باردة', icon: '💧', bg: '#dbeafe', prices: [1, 2, 3] }
];

const DELIVERY_FEE = 10, FREE_DELIVERY = 100;
const DISTRICTS = ['النرجس', 'الياسمين', 'الملقا', 'حطين', 'العقيق', 'الربيع', 'الصحافة', 'القيروان'];
const CART_KEY = 'furn_cart', ORDERS_KEY = 'furn_orders';
const itemById = id => MENU.find(m => m.id === id);
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};
const money = n => `${n.toLocaleString('en')} ر.س`;
