/**
 * Oltin Narxlari va Kotirovkalari Servisi (XAU/USD, Probalar va UZS)
 */

export const calculatePurityPrice = (pureGoldPriceUSD, purity) => {
  // Sof 999.9 tilla narxidan kelib chiqib proba narxini hisoblash
  // Masalan: 585 proba = 999 narxi * (585 / 999.9)
  const factor = purity / 999.9;
  return Math.round(pureGoldPriceUSD * factor * 100) / 100;
};

export const fetchLiveGoldPrices = async () => {
  // Simulyatsiya qilingan real-time API kotirovkasi (yoki Tashqi API)
  // XAU/USD unsiya narxi hozirgi kunda ~2,650$ - 2,750$ atrofida
  // 1 troy unsiya = 31.1034768 gramm
  // 1 gramm 999 sof tilla = ~85 - 88 USD
  try {
    // Agar foydalanuvchi maxsus API kalit kiritsa, GoldAPI.io yoki Metalpriceapi chaqirish mumkin
    // Hozirda barqaror kotirovka bilan birga kutilmagan tebranishlarni taqdim qilamiz
    const basePurePrice = 85.20;
    const jitter = (Math.random() * 0.4 - 0.2); // kichik real vaqt tebranishi
    const purePrice = Math.round((basePurePrice + jitter) * 100) / 100;

    return {
      success: true,
      timestamp: new Date().toISOString(),
      currency: 'USD',
      rates: {
        999: purePrice,
        750: calculatePurityPrice(purePrice, 750),
        585: calculatePurityPrice(purePrice, 585),
        375: calculatePurityPrice(purePrice, 375),
      },
      usdToUzs: 12850,
      change24h: '+0.84%',
    };
  } catch (error) {
    console.error('Oltin narxini olishda xatolik:', error);
    return {
      success: false,
      rates: {
        999: 85.00,
        750: 63.75,
        585: 49.75,
        375: 31.90,
      },
      usdToUzs: 12850,
      change24h: '0.00%',
    };
  }
};
