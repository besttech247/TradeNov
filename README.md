# 🚀 TradeNov Monorepo

نظام التداول والتحليل الذكي المتكامل - مبني بنمط **Full-Serverless** فائق الخفة والسرعة باستخدام **React + Vite** و **Vercel** و **Neon PostgreSQL**.

---

## 📁 الهيكل المعماري (Architecture)

```
📦 TradeNov/
│
├── api/                   ← دوال Vercel السيرفرلس (Backend Endpoints)
│   ├── health.js          ← فحص صحة الاتصال بقاعدة البيانات
│   └── setup-db.js        ← تهيئة جداول قاعدة البيانات
│
├── backend/
│   ├── core/              ← النواة المشتركة (Database, Auth, Security)
│   │   ├── db.js          ← عميل Neon Serverless Client
│   │   └── schema.sql     ← مخطط جداول PostgreSQL
│   └── modules/           ← وحدات الباك إند المتخصصة (TA, PRO, Agent)
│
├── apps/                  ← واجهات التطبيقات المتوازية
│   ├── tradenov/          ← واجهة التحليل الفني والمؤشرات (TA)
│   ├── pro/               ← منصة التداول المتقدم والمحفظة (PRO)
│   └── agent/             ← واجهة الوكيل الذكي (Agent)
│
├── shared/                ← الحزم والأصول المشتركة
│   └── styles/tokens.css  ← متغيرات التصميم (Vanilla CSS Tokens)
│
├── src/                   ← واجهة لوحة التحكم المركزية وفحص الاتصال
├── ISSUE_LOG.md           ← سجل المشاكل التراكمي الدائم
├── vercel.json            ← تهيئة التوجيه لـ Vercel
└── vite.config.js         ← إعدادات Vite مع دعم الفحص المحلي للـ API
```

---

## ⚡ التشغيل المحلي (Local Development)

1. **تثبيت الحزم:**
```bash
npm install
```

2. **تهيئة المتغيرات البيئية:**
قم بإنشاء ملف `.env` وانسخ داخله رابط الاتصال من لوحة Neon:
```env
DATABASE_URL="postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require"
```

3. **تشغيل خادم التطوير:**
```bash
npm run dev
```
افتح المتصفح على الرابط `http://localhost:3000` واضغط زر **فحص الاتصال بقاعدة البيانات**.

---

## 🌐 النشر على Vercel و GitHub

1. قم برفع التعديلات إلى مستودع GitHub:
```bash
git add .
git commit -m "feat: setup TradeNov Monorepo with Vercel & Neon integration"
git push
```

2. في لوحة تحكم **Vercel**:
   - اربط مستودع GitHub `TradeNov`.
   - أضف المتغير البيئي `DATABASE_URL` في **Project Settings → Environment Variables**.
   - اضغط **Deploy**.
