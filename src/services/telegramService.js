/**
 * Telegram Bot API Integratsiyasi
 * Rahbariyat va ma'murlar uchun kassa, ugar va zargarlik xabarnomalari
 */

export const sendTelegramMessage = async ({ token, chatId, text, parseMode = 'HTML' }) => {
  if (!token || !chatId) {
    console.warn("Telegram Bot token yoki Chat ID belgilanmagan. Simulyatsiya rejimi.");
    return {
      success: false,
      isSimulation: true,
      message: "Telegram Bot token yoki Chat ID kiritilmagan (Sozlamalar bo'limida o'rnating).",
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.description || 'Telegram API xatoligi');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Telegram xabar yuborishda xatolik:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Ugar (yo'qotish) me'yordan oshganda shoshilinch Telegram ogohlantirishini formatlash
 */
export const formatUgarAlertMessage = ({ order, craftsman, excessLoss, financialDamage }) => {
  return `
🚨 <b>DIQQAT: UGAR ME'YORDAN OSHDI!</b> 🚨
━━━━━━━━━━━━━━━━━━━━
📦 <b>Buyurtma:</b> #${order.order_id}
🛠 <b>Mahsulot:</b> ${order.title || 'Zargarlik buyumi'}
👨‍🏭 <b>Usta:</b> ${craftsman?.name || order.craftsman_name || 'Noma\'lum'}
🏷 <b>Proba:</b> ${order.purity || 585}

⚖️ <b>Berilgan xomashyo:</b> <code>${Number(order.given_weight).toFixed(3)} gr</code>
📥 <b>Topshirildi (tayyor):</b> <code>${Number(order.received_weight).toFixed(3)} gr</code>
🧹 <b>Qaytarilgan qirindi:</b> <code>${Number(order.returned_scrap).toFixed(3)} gr</code>
━━━━━━━━━━━━━━━━━━━━
💥 <b>HAQIQIY UGAR:</b> <code>${Number(order.loss_weight).toFixed(3)} gr (${Number(order.loss_percentage).toFixed(2)}%)</code>
⚠️ <b>Ruxsat me'yori:</b> <code>${Number(order.allowed_loss_rate || 2.0).toFixed(2)}%</code>
🛑 <b>ORTIQCHA YO'QOTISH:</b> <code>${Number(excessLoss || 0).toFixed(3)} gr</code>
💸 <b>Moliyaviy zarar:</b> <b>$${Number(financialDamage || 0).toFixed(2)}</b>

<i>👉 Zudlik bilan ustaning balansi va kasting jarayonini tekshiring!</i>
`;
};

/**
 * Kassa kunlik Z-hisoboti (Daily Closing Report)
 */
export const formatDailyReportMessage = ({
  totalSalesUSD = 0,
  totalSalesUZS = 0,
  cashTotal = 0,
  cardTotal = 0,
  tradeInGoldGrams = 0,
  tradeInValue = 0,
  vaultGoldGrams = 0,
  ordersCount = 0,
  totalLossGrams = 0,
}) => {
  const now = new Date().toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
👑 <b>GOLD TRADE ERP - KUNLIK HISOBOT (Z-REPORT)</b>
📅 <b>Vaqt:</b> ${now}
━━━━━━━━━━━━━━━━━━━━
💰 <b>Kunlik Kassa Tushumi:</b> <b>$${Number(totalSalesUSD).toLocaleString()}</b> (~${Number(totalSalesUZS).toLocaleString()} so'm)
💵 <b>Naqd:</b> $${Number(cashTotal).toLocaleString()}
💳 <b>Plastik Karta:</b> $${Number(cardTotal).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
🔄 <b>Trade-In (Qabul qilingan tilla):</b> <code>${Number(tradeInGoldGrams).toFixed(3)} gr</code> ($${Number(tradeInValue).toLocaleString()})
🏭 <b>Bugungi jami Ugar:</b> <code>${Number(totalLossGrams).toFixed(3)} gr</code>
📦 <b>Ombordagi jami sof tilla:</b> <code>${Number(vaultGoldGrams).toFixed(3)} gr</code>
📝 <b>Amalga oshirilgan savdolar:</b> ${ordersCount} ta
━━━━━━━━━━━━━━━━━━━━
✅ <i>Hisobot avtomatik tarzda tizim orqali shakllantirildi.</i>
`;
};
