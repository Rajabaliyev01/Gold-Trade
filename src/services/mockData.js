/**
 * Mock / seed data for Gold Trade ERP
 * All demo data cleared — real data comes from Firebase/Firestore
 */

export const INITIAL_USERS = [];

export const INITIAL_INVENTORY = [];

export const INITIAL_PRODUCTION_ORDERS = [];

export const INITIAL_TRANSACTIONS = [];

export const INITIAL_SETTINGS = {
  gold_rate_999: 0,
  gold_rate_750: 0,
  gold_rate_585: 0,
  gold_rate_375: 0,
  usd_to_uzs: 0,
  max_allowed_loss_percentage: 2.0,
  telegram_bot_token: '',
  telegram_chat_id: '',
  notify_on_excess_ugar: true,
  notify_on_daily_close: true,
  notify_on_new_order: false,
};
