# مواقع اختبارات

نموذجان لمواقع واجهات أمامية (HTML + CSS + JavaScript) بدون باك إند، أُعدّا للعرض على لجنة التقييم.

| الموقع | الوصف | الرابط |
|---|---|---|
| 🦷 مجمع بسمة لطب الأسنان | حجز مواعيد: التخصصات ← الطبيب ← الموعد ← البيانات ← التأكيد | `dental/` |
| 🍕 فرن الحارة | طلب بيتزا وفطائر: القائمة ← الحجم والإضافات ← السلة ← الدفع عند الاستلام | `pizza/` |

لكل موقع صفحة `admin.html`، وهي لوحة تحكم تعرض الحجوزات أو الطلبات المحفوظة في متصفح الزائر (localStorage).

## النشر على GitHub Pages
1. أنشئ مستودعًا جديدًا على GitHub (مثلًا `test-sites`).
2. ارفع الملفات:
   ```bash
   git remote add origin https://github.com/USERNAME/test-sites.git
   git push -u origin main
   ```
3. من إعدادات المستودع: **Settings ← Pages ← Source: Deploy from a branch ← main / (root)**.
4. بعد دقيقة تقريبًا تصبح الروابط:
   - الصفحة الرئيسية: `https://USERNAME.github.io/test-sites/`
   - العيادة: `https://USERNAME.github.io/test-sites/dental/`
   - المطعم: `https://USERNAME.github.io/test-sites/pizza/`
