import { create } from 'zustand';
import { INITIAL_TRANSACTIONS } from '../services/mockData';
import { useInventoryStore } from './useInventoryStore';
import { useSettingsStore } from './useSettingsStore';

const STORAGE_KEY = 'gold_erp_transactions';

export const usePosStore = create((set, get) => ({
  cart: [],
  transactions: JSON.parse(localStorage.getItem(STORAGE_KEY)) || INITIAL_TRANSACTIONS,
  tradeIn: null, // { old_gold_weight, purity, scrap_rate_per_gram, trade_in_value }
  discount: 0,
  lastReceipt: null,

  saveTransactions: (txs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    set({ transactions: txs });
  },

  // Add product to cart
  addToCart: (product) => {
    const cart = get().cart;
    const exists = cart.find((item) => item.id === product.id);
    if (exists) {
      // Finished products are usually unique items in jewelry, but handle quantity
      set({
        cart: cart.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        ),
      });
    } else {
      set({
        cart: [...cart, { ...product, quantity: 1 }],
      });
    }
  },

  removeFromCart: (productId) => {
    set({
      cart: get().cart.filter((item) => item.id !== productId),
    });
  },

  clearCart: () => {
    set({ cart: [], tradeIn: null, discount: 0 });
  },

  // Set or update Trade-In
  setTradeIn: (tradeInData) => {
    if (!tradeInData) {
      set({ tradeIn: null });
      return;
    }
    const weight = parseFloat(tradeInData.old_gold_weight) || 0;
    const rate = parseFloat(tradeInData.scrap_rate_per_gram) || 0;
    const tradeInValue = Math.round(weight * rate * 100) / 100;

    set({
      tradeIn: {
        old_gold_weight: weight,
        purity: parseInt(tradeInData.purity, 10) || 585,
        scrap_rate_per_gram: rate,
        trade_in_value: tradeInValue,
        description: tradeInData.description || "Mijozdan topshirilgan eski tilla buyumi",
      },
    });
  },

  removeTradeIn: () => {
    set({ tradeIn: null });
  },

  setDiscount: (amount) => {
    set({ discount: Math.max(0, parseFloat(amount) || 0) });
  },

  // Calculate totals
  getCartTotals: () => {
    const { cart, tradeIn, discount } = get();
    const settings = useSettingsStore.getState().settings;

    const subtotal = cart.reduce((sum, item) => sum + (item.selling_price || 0) * (item.quantity || 1), 0);
    const totalWeight = cart.reduce((sum, item) => sum + (item.weight || 0) * (item.quantity || 1), 0);
    const tradeInDeduction = tradeIn ? tradeIn.trade_in_value : 0;
    const finalAmountUSD = Math.max(0, subtotal - discount - tradeInDeduction);
    const finalAmountUZS = Math.round(finalAmountUSD * (settings.usd_to_uzs || 12850));

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalWeight: Math.round(totalWeight * 1000) / 1000,
      tradeInDeduction,
      discount,
      finalAmountUSD: Math.round(finalAmountUSD * 100) / 100,
      finalAmountUZS,
    };
  },

  // Complete checkout
  checkout: ({ cashierName, customerName, customerPhone, paymentMethod = 'cash' }) => {
    const { cart, tradeIn, discount } = get();
    if (cart.length === 0) return { success: false, error: "Savat bo'sh" };

    const totals = get().getCartTotals();

    const transaction = {
      transaction_id: 'TX-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      cashier_name: cashierName || 'Kassir',
      customer_name: customerName || 'Doimiy Mijoz',
      customer_phone: customerPhone || '-',
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        weight: item.weight,
        purity: item.purity,
        price: item.selling_price,
        barcode: item.barcode,
        quantity: item.quantity || 1,
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      trade_in: tradeIn,
      total_amount: totals.finalAmountUSD,
      total_amount_uzs: totals.finalAmountUZS,
      payment_method: tradeIn ? 'trade_in' : paymentMethod,
      timestamp: new Date().toISOString(),
    };

    // 1. Mark cart items as sold in inventory
    cart.forEach((item) => {
      useInventoryStore.getState().markAsSold(item.id);
    });

    // 2. If Trade-In was done, add accepted scrap gold into inventory!
    if (tradeIn && tradeIn.old_gold_weight > 0) {
      useInventoryStore.getState().addReturnedScrap(tradeIn.purity, tradeIn.old_gold_weight);
    }

    // 3. Save transaction to history
    const updated = [transaction, ...get().transactions];
    get().saveTransactions(updated);

    // 4. Save receipt for printing/modal
    set({
      lastReceipt: transaction,
      cart: [],
      tradeIn: null,
      discount: 0,
    });

    return {
      success: true,
      transaction,
    };
  },
}));
