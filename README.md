# Laban Al Asfour Storefront

واجهة متجر مبنية بـ `React + Vite + TypeScript` مع تكامل `Supabase` لإدارة المنتجات والفئات والملفات.

## المتطلبات

- `Node.js 24+` (انظر `.nvmrc` / `.node-version`)
- `pnpm 10+` (مفعّل عبر `corepack enable`)

## التشغيل المحلي

1. أنشئ ملف البيئة المحلي:

```bash
cp .env.example .env
```

2. حدّث القيم المطلوبة داخل `.env`.

3. ثبّت الحزم وشغّل المشروع:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## أوامر العمل اليومية

```bash
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm check
```

`pnpm check` هو أمر التحقق القياسي قبل أي دمج أو نشر.

> ملاحظة: بيئة معاينة Lovable الداخلية تستخدم `bun.lock`، لذلك يبقى الملف موجوداً.
> أما البناء الإنتاجي و CI فيعتمدان على `pnpm-lock.yaml` مع Node.js 24.

## متغيرات البيئة

القيم الأساسية:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SITE_URL`
- `VITE_ASSET_BASE_URL`
- `VITE_APP_ENV`
- `VITE_ENABLE_ADMIN`
- `VITE_MONITORING_ENABLED`
- `VITE_MONITORING_ENDPOINT`

ملاحظات:

- مسار `/admin` معطّل افتراضياً. فعّله فقط عند الحاجة التشغيلية.
- عند تفعيل `/admin` أصبح الوصول يتطلب جلسة Supabase صالحة مع مستخدم يحمل دور `owner`.
- مراقبة الأخطاء الأساسية تعمل عند تفعيل `VITE_MONITORING_ENABLED=true` وتحديد `VITE_MONITORING_ENDPOINT`.
- لا تحفظ `.env` داخل Git. استخدم `.env.example` كمرجع فقط.
- الأصول ثلاثية الأبعاد وصور الكتالوج يجب أن تُخزن في bucket/CDN خارجي واحد، لا داخل GitHub.

## بنية المشروع

- `src/pages`: صفحات المتجر ولوحة الإدارة
- `src/components`: مكونات الواجهة
- `src/integrations/supabase`: العميل والأنواع المولدة
- `supabase/migrations`: ترحيلات قاعدة البيانات
- `docs/production-readiness.md`: قائمة التحقق قبل النشر الأولي

## سير العمل المقترح

1. أنشئ فرعاً لكل مهمة.
2. نفّذ `npm run check`.
3. راجع متغيرات البيئة وخطة النشر.
4. افتح Pull Request مع وصف مختصر للتغيير والأثر.

## النشر الأولي

راجع الملف التالي قبل أول إطلاق:

[`docs/production-readiness.md`](./docs/production-readiness.md)
