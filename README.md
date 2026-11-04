<div align="center">

# 👑 Gold Trade ERP
### Zargarlik Ishlab Chiqarish, Milligramm Ugar Nazorati va POS Kassa Tizimi

Jahon tajribasidagi zargarlik ERP dasturlari (**PIRO**, **Valigara**) andozasida yaratilgan, yuqori aniqlikdagi ishlab chiqarish jarayonlarini (milligramm hisobi, **"ugar" yo'qotishlari**) va zamonaviy POS savdoni (**Trade-In**, shtrix-kodlar) qat'iy nazorat qiluvchi to'laqonli Full-Stack ERP tizimi.

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-BaaS-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg?style=for-the-badge)](LICENSE)

[Imkoniyatlar](#-asosiy-imkoniyatlar-va-modullar) • [Arxitektura](#-tizim-arxitekturasi) • [Ugar Formulalari](#-ishlab-chiqarish-va-milligramm-ugar-hisobi) • [API Integratsiyalari](#-haqiqiy-tashqi-apilar-integratsiyasi) • [O'rnatish](#-tezkor-ornatish-va-ishga-tushirish) • [Vercel Deploy](#-vercel-va-firebase-deploy)

</div>

---

## 🌟 Asosiy Imkoniyatlar va Modullar

### 1. 📊 Super Admin Dashboard (Boshqaruv Paneli)
- **Real-Vaqt KPI Ko'rsatkichlari:** Ombordagi joriy sof tilla (gramm va dollar hisobida), ustalar qo'lidagi tilla qoldig'i, kunlik kassa tushumi va o'rtacha ugar darajasi.
- **Recharts Vizual Analitikasi:** Haftalik oltin aylanmasi (ombordan berilgan vs tayyor qabul qilingan tilla) hamda ustalar kesimida ugar me'yori dinamikasi.
- **Jonli Oltin Kotirovkalari:** 999.9, 750, 585 va 375 probalar bo'yicha dollar va so'mdagi narxlar real-vaqtda hisoblanadi.

### 2. 🔨 Ishlab Chiqarish va Milligramm Ugar Nazorati
- **Xomashyo Ajratish:** Ombordan ustaga xomashyo biriktirilganda ombor qoldig'i avtomatik kamayadi va usta balansiga o'tadi.
- **Mahsulotni Qabul Qilish:** Usta ishni yakunlagach, tayyor buyum og'irligi va qaytarilgan qirindi/chang kiritiladi.
- **Avtomatik Ugar Tahlili:** Tizim yo'qotish foizini hisoblab, $\le 2.0\%$ bo'lsa **Yashil Tasdiq** beradi. Agar oshib ketsa ($> 2.0\%$), **Qizil Alert** yonadi va Telegram bot orqali rahbariyatga avtomatik ogohlantirish yuboriladi.

### 3. 📦 Ombor Boshqaruvi (NoSQL Inventory)
- 3 toifali inventar nazorati:
  1. **Xomashyo:** Sof bank quymalari (999.9), qotishmalar (750, 585) va qaytarilgan qirindilar.
  2. **Qimmatbaho Toshlar:** Sertifikatlangan brilliantlar (karat va tozaligi bilan), zumrad, yoqut, sapfir.
  3. **Tayyor Buyumlar:** Zanjir, uzuk, sirg'a, bilakuzuk, kulon.
- Har bir buyum uchun **Shtrix-kod / QR-kod** generatsiyasi va chop etiladigan zargarlik birkasi.

### 4. 🛒 Kassa va POS Terminal (Trade-In bilan)
- **Shtrix-Kod Skaneri:** Skaner orqali buyumni soniyalar ichida savatga qo'shish.
- **Trade-In Moduli:** Mijoz eski tilla topshirganda, uning probasi va vazni kiritilib, avtomatik chegirma qilinadi. Qabul qilingan eski tilla esa xomashyo omboriga kirim qilinadi.
- **To'lov Usullari:** Naqd pul, Plastik karta, Trade-In.
- **Termal Chek:** Xarid yakunida xalqaro standartdagi termal chek chiqarish va chop etish (`window.print()`).

### 5. 🤖 Telegram Bot API Integratsiyasi
- **Ugar Alertlari:** Yo'qotish me'yordan oshganda shoshilinch xabarnoma (usta ismi, gramm va dollar zarari).
- **Kunlik Z-Hisoboti:** Kassa tushumi, naqd/karta taqsimoti, trade-in qabuli va ombor qoldig'i rahbariyatga bitta tugma orqali yetkaziladi.

---

## 📐 Tizim Arxitekturasi

```
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (Vite + React 18)                  │
│   Tailwind CSS • Zustand Store • Recharts • Lucide Icons    │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│     FIREBASE BaaS (NoSQL)    │ │    TASHQI HAQIQIY API'LAR   │
├──────────────────────────────┤ ├─────────────────────────────┤
│ • users (RBAC Rollar)        │ │ • O'zbekiston Markaziy      │
│ • inventory (Xomashyo/Buyum) │ │   Banki (CBU.uz - Valyuta)  │
│ • production_orders (Ugar)   │ │ • GoldAPI.io (Jonli XAU)    │
│ • transactions (Kassa/POS)   │ │ • Metals-API (Kotirovkalar) │
│ • firestore.rules (Xavfsiz)  │ │ • Telegram Bot API (Alert)  │
└──────────────────────────────┘ └─────────────────────────────┘
```

---

## ⚖️ Ishlab Chiqarish va Milligramm Ugar Hisobi

```
Berilgan Xomashyo:     100.000 gr (585)
Tayyor Mahsulot:        96.000 gr
Qaytarilgan Qirindi:     2.500 gr
─────────────────────────────────────────────
Jami Qaytdi:            98.500 gr
Haqiqiy Ugar:            1.500 gr (1.50%)  ==>  ✅ YASHIL TASDIQ (<= 2.0%)
```

Agar ugar limitdan oshsa (masalan $4.0\%$):
- 🛑 **Ortiqcha Yo'qotish:** $1.000\text{ gr}$
- 💸 **Moliyaviy Zarar:** $1.000\text{ gr} \times \$75 = \$75.00$
- 📱 **Telegram Bot:** Rahbariyatga avtomatik shoshilinch ogohlantirish yuboriladi va ustaning ish haqidan chegirish taklif etiladi.

---

## 🌐 Haqiqiy Tashqi API'lar Integratsiyasi

Tizim real tashqi API kotirovkalari bilan to'liq integratsiya qilingan:

1. **O'zbekiston Markaziy Banki (CBU) Rasmiy Kursi:**
   - URL: `https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/`
   - Bepul, ochiq va doimiy yangilanib turadigan davlat kursi.
2. **GoldAPI.io:**
   - URL: `https://www.goldapi.io/api/XAU/USD`
   - Header: `x-access-token: <API_KEY>` (24K, 18K, 14K tilla gramm narxlari).
3. **Metals-API:**
   - URL: `https://metals-api.com/api/latest?access_key=KEY&base=USD&symbols=XAU`
4. **Telegram Bot API:**
   - URL: `https://api.telegram.org/bot<TOKEN>/sendMessage`

---

## 🚀 Tezkor O'rnatish va Ishga Tushirish

### 1. Repozitoriyni klonlash:
```bash
git clone https://github.com/Rajabaliyev01/Gold-Trade.git
cd Gold-Trade
```

### 2. Bog'liqliklarni o'rnatish:
```bash
npm install
```

### 3. Muhit o'zgaruvchilarini sozlash (`.env`):
```bash
cp .env.example .env
```
`.env` fayliga kerakli API kalitlarini kiriting:
```env
# Telegram Bot Integratsiyasi
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id

# Oltin Narxlari API'si (Ixtiyoriy)
VITE_GOLD_API_KEY=your_goldapi_key
VITE_METALS_API_KEY=your_metals_key
```

### 4. Dasturni ishga tushirish:
```bash
npm run dev
```
Brauzerda `http://localhost:3000` (yoki ko'rsatilgan port) manzilini oching.

### 5. Production uchun yig'ish (Build):
```bash
npm run build
```

---

## ☁️ Vercel va Firebase Deploy

### Vercel orqali deploy (Frontend):
Loyiha ichida `vercel.json` fayli sozlangan. GitHub repozitoriyangizni Vercel platformasiga bog'lang:
```bash
npm i -g vercel
vercel
```

### Firebase orqali deploy (BaaS):
```bash
firebase deploy --only firestore:rules,hosting
```

---

## 👥 Demo Sinov Rollari (RBAC)

Ilovadagi profil menyusi orqali turli rollarni sinab ko'rish mumkin:
- **Dilshod Karimov (Admin)** — barcha modullar va boshqaruv.
- **Farhod Zargariy (Katta Usta)** — 100g ish topshirgan, ugar 1.5% (yashil).
- **Rustam Saidov (Usta)** — ugar 4.0% oshgan (qizil alert ko'rinishi).
- **Madina Umarova (Kassir)** — POS terminal va tranzaksiyalar.

---

## 📄 Litsenziya

Ushbu loyiha [MIT](LICENSE) litsenziyasi asosida tarqatiladi.

Muallif: **Javohir Rajabaliyev** ([@Rajabaliyev01](https://github.com/Rajabaliyev01))
