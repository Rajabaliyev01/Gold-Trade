/**
 * Zargarlik Ishlab Chiqarish - Ugar (yo'qotish) hisoblash logikasi
 * Milligramm aniqligida (3 ta o'nlik belgi)
 */

export const calculateUgar = ({
  givenWeight = 0,
  receivedWeight = 0,
  returnedScrap = 0,
  allowedLossRate = 2.0, // default 2%
  goldPricePerGram = 75, // USD per gram
}) => {
  const given = parseFloat(givenWeight) || 0;
  const received = parseFloat(receivedWeight) || 0;
  const scrap = parseFloat(returnedScrap) || 0;
  const rate = parseFloat(allowedLossRate) || 2.0;

  // Ugar (yo'qotish) = berilgan - (tayyor + qirindi)
  // Masalan: 100 - (96 + 2.5) = 1.5 gr
  const returnedTotal = Math.round((received + scrap) * 1000) / 1000;
  const lossWeight = Math.round((given - returnedTotal) * 1000) / 1000;

  // Haqiqiy yo'qotish foizi
  const lossPercentage = given > 0 ? (lossWeight / given) * 100 : 0;

  // Ruxsat etilgan maksimal me'yor (grammda)
  const allowedLossWeight = Math.round((given * (rate / 100)) * 1000) / 1000;

  // Me'yordan oshiqcha yo'qotish (agar bo'lsa)
  const excessLossWeight = Math.max(0, Math.round((lossWeight - allowedLossWeight) * 1000) / 1000);

  // Me'yordan oshgan holat
  const isOverThreshold = lossPercentage > rate;

  // Moliyaviy zarar (dollarda)
  const financialLoss = Math.round(excessLossWeight * goldPricePerGram * 100) / 100;

  return {
    givenWeight: given,
    receivedWeight: received,
    returnedScrap: scrap,
    returnedTotal,
    lossWeight: Math.max(0, lossWeight),
    lossPercentage: Math.max(0, lossPercentage),
    allowedLossRate: rate,
    allowedLossWeight,
    excessLossWeight,
    isOverThreshold,
    financialLoss,
    status: isOverThreshold ? 'alert' : 'acceptable',
  };
};
