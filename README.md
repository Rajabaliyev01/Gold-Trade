# 👑 Gold Trade ERP - Zargarlik Ishlab Chiqarish va POS Tizimi

Jahon tajribasidagi zargarlik ERP dasturlari (PIRO, Valigara) andozasida yaratilgan, yuqori aniqlikdagi ishlab chiqarish jarayonlarini (milligramm hisobi, **"ugar" yo'qotishlari**) va zamonaviy POS savdoni (Trade-In, shtrix-kodlar) qat'iy nazorat qiluvchi to'laqonli Full-Stack tizim.

---

## 🌟 Asosiy Imkoniyatlar va Modullar

### 1. 📊 Super Admin Dashboard (Boshqaruv Paneli)
- **Real-vaqt KPI ko'rsatkichlari:** Ombordagi joriy qoldiq (gramm va dollar hisobida), ustalar qo'lidagi tilla qoldig'i, kunlik kassa tushumi va o'rtacha ugar yo'qotishi.
- **Recharts Analitik Grafikalari:** Haftalik oltin harakati (kirim vs chiqim) va ustalar kesimida ugar me'yorining dinamik taqqoslanishi.
- **XAU/USD Jonli Kotirovkalar:** 999, 750, 585 va 375 probadagi tilla narxlari real-vaqtda birja narxlari va Markaziy Bank kursi bo'yicha hisoblanadi.

### 2. 🔨 Ishlab Chiqarish va Milligramm Ugar Nazorati (Eng Muhim Modul)
- **Xomashyo Ajratish:** Admin yoki menejer ustaxonadagi ma'lum bir ustaga ombordan kerakli probadagi tillani biriktiradi. Tranzaksiya o'tishi bilan ombor qoldig'i avtomatik kamayadi va usta balansiga yoziladi.
- **Mahsulotni Qabul Qilish:** Usta ishni yakunlagach, tayyor mahsulot og'irligi (masalan 96.000 gr) va qaytarilgan qirindi/chang (scrap, masalan 2.500 gr) kiritiladi.
- **Avtomatik Ugar Hisobi:**
  $$\text{Ugar} = \text{Berilgan} - (\text{Tayyor Mahsulot} + \text{Qirindi})$$
  Masalan: $100.000\text{ gr} - (96.000\text{ gr} + 2.500\text{ gr}) = 1.500\text{ gr}$ ($1.5\%$).
- **Yashil Tasdiq vs Qizil Alert:** Agar ugar ruxsat etilgan limitdan (standart $2.0\%$) oshmasa, tizim yashil tasdiq beradi. Agar oshsa ($>2.0\%$), zudlik bilan Telegram bot orqali rahbariyatga ogohlantirish yuboriladi va ortiqcha zararni usta ish haqidan chegirish taklif etiladi.

### 3. 📦 Ombor Boshqaruvi (NoSQL Inventory)
- 3 toifali to'liq nazorat:
  1. **Xomashyo:** Sof bank quymalari (999.9), qotishmalar (750, 585) va qaytarilgan qirindilar.
  2. **Qimmatbaho Toshlar:** Brilliantlar (karat va tozalik ko'rsatkichi bilan), Zumrad, Yoqut, Sapfir, Zirkon.
  3. **Tayyor Mahsulotlar:** Zanjir, Uzuk, Sirg'a, Bilakuzuk, Kulon va komplektlar.
- Har bir mahsulot uchun avtomatik unikal **Shtrix-kod / QR-kod** generatsiyasi va chop etiladigan birka ko'rinishi.

### 4. 🛒 POS Kassa va Trade-In Terminali
- **Tezkor Skaner:** Shtrix-kod kiritish yoki skanerlash orqali mahsulotni soniyalar ichida savatga qo'shish.
- **Trade-In Moduli (Eski Tillani Qabul Qilish):** Xaridor keltirgan eski tilla buyumi yoki sinig'ining probasi va og'irligi kiritiladi. Tizim joriy lom narxi bo'yicha chegirmani hisoblaydi va yangi mahsulot summasidan avtomatik ayiradi. Qabul qilingan eski tilla esa to'g'ridan-to'g'ri xomashyo omboriga kirim qilinadi!
- **Ko'p Turdagi To'lov:** Naqd pul, Plastik karta yoki Trade-In orqali to'lov.
- **Chek Generatsiyasi:** Zamonaviy termal POS chekini generatsiya qilish va bir klikda chop etish (`Print Receipt`).

### 5. 🤖 Telegram Bot API Integratsiyasi
- **Ugar Alertlari:** Me'yordan oshgan har bir holatda Telegram bot orqali rahbariyatga batafsil ma'lumot (buyurtma raqami, usta ismi, gramm va dollar zarari) yuboriladi.
- **Kassa Kunlik Z-Hisoboti:** Bir klik bilan kun yakunidagi umumiy kassa tushumi, naqd/karta taqsimoti, qabul qilingan Trade-In tillasi va ombor qoldig'i Telegram kanal yoki guruhga yuboriladi.

---

## 🛠 Texnologik Stek

- **Frontend:** React 18, Vite.js, Tailwind CSS
- **Holat Boshqaruvi (State Management):** Zustand (global reaktiv do'konlar)
- **Vizualizatsiya & Grafika:** Recharts, Lucide React, Canvas Confetti
- **Backend & Database:** Firebase (Firestore, Auth, Storage) + Graceful Offline/Mock fallback
- **Integratsiyalar:** Telegram Bot API, XAU/USD Gold Price Engine
- **Deploy:** Vercel (Frontend CI/CD), Firebase CLI (`firestore.rules`, `firebase.json`)

---

## 🚀 O'rnatish va Ishga Tushirish

### 1. Repozitoriyni klonlash va bog'liqliklarni o'rnatish:
```bash
git clone <repo-url>
cd Gold-Trade
npm install
```

### 2. Muhit o'zgaruvchilari (`.env`):
`.env.example` faylidan nusxa oling va sozlang:
```bash
cp .env.example .env
```

Kerakli parametrlar:
```env
# Firebase Sozlamalari (Ixtiyoriy - ulanmagan bo'lsa mahalliy Mock rejimida to'liq ishlaydi)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# Telegram Bot Integratsiyasi
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Dasturni ishga tushirish:
```bash
npm run dev
```
Brauzerda `http://localhost:3000` (yoki ko'rsatilgan port) manzilini oching.

### 4. Loyihani yig'ish (Production Build):
```bash
npm run build
```

---

## 🛡 Xavfsizlik Qoidalari (`firestore.rules`)

Firebase Firestore uchun qat'iy Role-Based Access Control (RBAC):
- **Admin:** Ombor, buyurtmalar, kassa va sozlamalarni to'liq boshqarish.
- **Usta (Craftsman):** Faqat o'ziga biriktirilgan ishlab chiqarish buyurtmalarini ko'rish va yangilash.
- **Kassir (Cashier):** POS orqali tranzaksiya yaratish va ombor holatini o'qish.

---

## 📱 Sinov Rollari (Demo Role Switcher)

Tizim yuqori o'ng burchagidagi profil tugmasi orqali istalgan rolni soniyada almashtirib sinab ko'rishingiz mumkin:
1. **Dilshod Karimov (Admin)** — barcha tahlil va boshqaruv funksiyalari.
2. **Farhod Zargariy (Katta Usta)** — 100g 585 zanjir topshirgan, ugar 1.5% (yashil).
3. **Rustam Saidov (Usta)** — ugar 4.0% oshgan (qizil alert ko'rinishi).
4. **Madina Umarova (Kassir)** — tezkor POS savdo terminali.
