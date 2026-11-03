/**
 * Initial mock / seed data for Gold Trade ERP
 * Follows the exact Firestore NoSQL Schema from the TZ
 */

export const INITIAL_USERS = [
  {
    uid: 'user_admin_01',
    name: 'Dilshod Karimov',
    email: 'admin@goldtrade.uz',
    role: 'admin',
    status: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+998 90 123-45-67',
  },
  {
    uid: 'user_craftsman_01',
    name: 'Farhod Zargariy (Katta Usta)',
    email: 'farhod@goldtrade.uz',
    role: 'craftsman',
    status: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+998 93 987-65-43',
    current_gold_balance: 145.250, // grammda qo'lidagi tilla
    average_loss_rate: 1.45, // %
    total_completed_orders: 48,
  },
  {
    uid: 'user_craftsman_02',
    name: 'Alisher Qodirov (Modelist Usta)',
    email: 'alisher@goldtrade.uz',
    role: 'craftsman',
    status: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+998 97 456-12-34',
    current_gold_balance: 82.100,
    average_loss_rate: 1.72,
    total_completed_orders: 34,
  },
  {
    uid: 'user_craftsman_03',
    name: 'Rustam Saidov (Zanjir va quyuv ustasi)',
    email: 'rustam@goldtrade.uz',
    role: 'craftsman',
    status: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '+998 91 333-22-11',
    current_gold_balance: 210.000,
    average_loss_rate: 2.35, // Me'yordan sal baland
    total_completed_orders: 29,
  },
  {
    uid: 'user_cashier_01',
    name: 'Madina Umarova',
    email: 'madina@goldtrade.uz',
    role: 'cashier',
    status: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+998 99 876-54-32',
  },
  {
    uid: 'user_manager_01',
    name: 'Bobur Yoqubov',
    email: 'bobur@goldtrade.uz',
    role: 'manager',
    status: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    phone: '+998 94 555-44-33',
  }
];

export const INITIAL_INVENTORY = [
  // Raw Gold (Xomashyo)
  {
    id: 'inv_raw_01',
    name: 'Sof Bank Quymo Tillasi',
    type: 'raw_gold',
    purity: 999,
    weight: 450.000,
    price_per_gram: 84.50,
    status: 'in_stock',
    barcode: 'RAW-999-001',
    category: 'Quymo',
    notes: 'Markaziy Bank sertifikatlangan 999.9 quymasi',
    created_at: '2026-10-15T09:00:00Z',
  },
  {
    id: 'inv_raw_02',
    name: 'Klassik Standart Qotishma 585',
    type: 'raw_gold',
    purity: 585,
    weight: 285.500,
    price_per_gram: 49.50,
    status: 'in_stock',
    barcode: 'RAW-585-002',
    category: 'Qotishma',
    notes: 'Ishlab chiqarishga tayyor zargarlik qotishmasi',
    created_at: '2026-10-18T11:20:00Z',
  },
  {
    id: 'inv_raw_03',
    name: 'Italyan Oq Qotishma 750',
    type: 'raw_gold',
    purity: 750,
    weight: 120.350,
    price_per_gram: 63.40,
    status: 'in_stock',
    barcode: 'RAW-750-003',
    category: 'Oq Qotishma',
    notes: 'Yuqori proba oq tilla qotishmasi',
    created_at: '2026-10-22T14:15:00Z',
  },

  // Gemstones (Qimmatbaho Toshlar)
  {
    id: 'inv_gem_01',
    name: 'Brilliant Yakutiya (0.50 ct, VVS1, D)',
    type: 'gemstone',
    purity: null,
    weight: 0.100, // 0.5 karat ~ 0.1 gramm
    price_per_gram: 12000, // dona yoki gramm hisobida
    price_per_unit: 1200, // $1200 / dona
    pieces_count: 8,
    status: 'in_stock',
    barcode: 'GEM-DIA-001',
    category: 'Brilliant',
    notes: 'Sertifikatli tabiiy olmos',
    created_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'inv_gem_02',
    name: 'Zumrad Kolumbiya (1.20 ct)',
    type: 'gemstone',
    purity: null,
    weight: 0.240,
    price_per_unit: 650,
    pieces_count: 5,
    status: 'in_stock',
    barcode: 'GEM-EMR-002',
    category: 'Zumrad',
    notes: 'Toza yashil rangli tabiiy zumrad',
    created_at: '2026-10-24T12:00:00Z',
  },

  // Finished Products (Tayyor mahsulotlar - POS uchun)
  {
    id: 'inv_fp_01',
    name: 'Bismark Qalin Zanjir (Klassik)',
    type: 'finished_product',
    purity: 585,
    weight: 34.250,
    price_per_gram: 75.00,
    selling_price: 2568.75, // $
    status: 'in_stock',
    barcode: 'GOLD-CH-585-01',
    category: 'Zanjir',
    craftsman_id: 'user_craftsman_01',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80',
    notes: 'Qo\'lda to\'qilgan mustahkam qulfli zanjir',
    created_at: '2026-10-25T16:30:00Z',
  },
  {
    id: 'inv_fp_02',
    name: 'Brilliantli Nikoh Uzugi (750)',
    type: 'finished_product',
    purity: 750,
    weight: 5.420,
    price_per_gram: 110.00,
    selling_price: 1350.00,
    status: 'in_stock',
    barcode: 'GOLD-RG-750-02',
    category: 'Uzuk',
    craftsman_id: 'user_craftsman_02',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&auto=format&fit=crop&q=80',
    notes: 'Markaziy brilliant 0.35ct + 12 ta mayda brilliant',
    created_at: '2026-10-26T11:00:00Z',
  },
  {
    id: 'inv_fp_03',
    name: 'Italiya Sirg\'a (Osma, 585)',
    type: 'finished_product',
    purity: 585,
    weight: 8.150,
    price_per_gram: 82.00,
    selling_price: 668.30,
    status: 'in_stock',
    barcode: 'GOLD-ER-585-03',
    category: 'Sirg\'a',
    craftsman_id: 'user_craftsman_01',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=300&auto=format&fit=crop&q=80',
    notes: 'Nozik naqshli, ingliz qulfiga ega',
    created_at: '2026-10-27T14:45:00Z',
  },
  {
    id: 'inv_fp_04',
    name: 'Kardinal Erkaklar Bilakuzugi (585)',
    type: 'finished_product',
    purity: 585,
    weight: 24.800,
    price_per_gram: 78.00,
    selling_price: 1934.40,
    status: 'in_stock',
    barcode: 'GOLD-BR-585-04',
    category: 'Bilakuzuk',
    craftsman_id: 'user_craftsman_03',
    image: 'https://images.unsplash.com/photo-1611591475152-47831138249b?w=300&auto=format&fit=crop&q=80',
    notes: 'Qora emal qoplamali zamonaviy dizayn',
    created_at: '2026-10-28T18:10:00Z',
  },
  {
    id: 'inv_fp_05',
    name: 'Zumradli Kulon (750)',
    type: 'finished_product',
    purity: 750,
    weight: 4.310,
    price_per_gram: 105.00,
    selling_price: 890.00,
    status: 'in_stock',
    barcode: 'GOLD-PD-750-05',
    category: 'Kulon',
    craftsman_id: 'user_craftsman_02',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=80',
    notes: 'Kolumbiya zumradi bilan bezatilgan',
    created_at: '2026-10-29T10:15:00Z',
  }
];

export const INITIAL_PRODUCTION_ORDERS = [
  {
    order_id: 'ORD-2026-001',
    title: '585 Proba Bismark Zanjir Yasash (100g)',
    craftsman_id: 'user_craftsman_01',
    craftsman_name: 'Farhod Zargariy',
    purity: 585,
    given_weight: 100.000,
    received_weight: 96.000,
    returned_scrap: 2.500,
    loss_weight: 1.500, // 100 - (96 + 2.5) = 1.5g
    loss_percentage: 1.50, // 1.5% <= 2.0% me'yor (Yashil)
    allowed_loss_rate: 2.0,
    status: 'completed',
    alert_triggered: false,
    notes: 'Klassik 60 sm uzunlikdagi zanjir tayyorlandi. Ugar me\'yorda.',
    timestamp: '2026-10-24T14:00:00Z',
    completed_at: '2026-10-26T17:30:00Z',
  },
  {
    order_id: 'ORD-2026-002',
    title: '750 Oq Tilla Brilliantli Komplekt',
    craftsman_id: 'user_craftsman_02',
    craftsman_name: 'Alisher Qodirov',
    purity: 750,
    given_weight: 65.000,
    received_weight: 0,
    returned_scrap: 0,
    loss_weight: 0,
    loss_percentage: 0,
    allowed_loss_rate: 2.0,
    status: 'in_progress',
    alert_triggered: false,
    notes: 'Qolip tayyorlanmoqda, kasting (quyish) bosqichida',
    timestamp: '2026-11-01T10:30:00Z',
    completed_at: null,
  },
  {
    order_id: 'ORD-2026-003',
    title: '585 Erkaklar Kardinal Zanjiri (50g)',
    craftsman_id: 'user_craftsman_03',
    craftsman_name: 'Rustam Saidov',
    purity: 585,
    given_weight: 50.000,
    received_weight: 46.500,
    returned_scrap: 1.500,
    loss_weight: 2.000, // 50 - (46.5 + 1.5) = 2.0g
    loss_percentage: 4.00, // 4.0% > 2.0% (QIZIL ALERT!)
    allowed_loss_rate: 2.0,
    status: 'completed',
    alert_triggered: true,
    excess_loss: 1.000, // 1g ortiqcha yo'qotish
    financial_damage: 75.00, // $75
    notes: 'Kastingda tilla sochilib ketgan. Telegramga alert jo\'natildi.',
    timestamp: '2026-10-28T09:15:00Z',
    completed_at: '2026-10-30T15:00:00Z',
  },
  {
    order_id: 'ORD-2026-004',
    title: '585 Proba Italiya Sirg\'alari (40g partiya)',
    craftsman_id: 'user_craftsman_01',
    craftsman_name: 'Farhod Zargariy',
    purity: 585,
    given_weight: 40.000,
    received_weight: 0,
    returned_scrap: 0,
    loss_weight: 0,
    loss_percentage: 0,
    allowed_loss_rate: 2.0,
    status: 'assigned',
    alert_triggered: false,
    notes: 'Xomashyo ombordan berildi. Usta ish boshlashini kutmoqda.',
    timestamp: '2026-11-03T08:00:00Z',
    completed_at: null,
  }
];

export const INITIAL_TRANSACTIONS = [
  {
    transaction_id: 'TX-2026-901',
    cashier_name: 'Madina Umarova',
    customer_name: 'Aziz Mahmudov',
    customer_phone: '+998 90 777-88-99',
    items: [
      {
        id: 'inv_fp_01',
        name: 'Bismark Qalin Zanjir (Klassik)',
        weight: 34.250,
        purity: 585,
        price: 2568.75,
        quantity: 1,
      }
    ],
    subtotal: 2568.75,
    discount: 68.75,
    trade_in: null,
    total_amount: 2500.00,
    payment_method: 'card',
    timestamp: '2026-11-02T16:20:00Z',
  },
  {
    transaction_id: 'TX-2026-902',
    cashier_name: 'Madina Umarova',
    customer_name: 'Nodira Salimova',
    customer_phone: '+998 93 111-22-33',
    items: [
      {
        id: 'inv_fp_02',
        name: 'Brilliantli Nikoh Uzugi (750)',
        weight: 5.420,
        purity: 750,
        price: 1350.00,
        quantity: 1,
      }
    ],
    subtotal: 1350.00,
    discount: 0,
    trade_in: {
      old_gold_weight: 8.500, // 8.5g eski 585 tilla topshirgan
      purity: 585,
      scrap_rate_per_gram: 46.00,
      trade_in_value: 391.00, // 8.5 * $46 = $391 chegirma
    },
    total_amount: 959.00, // 1350 - 391 = $959 to'lagan
    payment_method: 'trade_in',
    timestamp: '2026-11-03T11:45:00Z',
  }
];

export const INITIAL_SETTINGS = {
  gold_rate_999: 84.50, // USD/g
  gold_rate_750: 63.40,
  gold_rate_585: 49.50,
  gold_rate_375: 31.70,
  usd_to_uzs: 12850,
  max_allowed_loss_percentage: 2.0, // 2% ugar me'yori
  telegram_bot_token: '',
  telegram_chat_id: '',
  notify_on_excess_ugar: true,
  notify_on_daily_close: true,
  notify_on_new_order: false,
};
