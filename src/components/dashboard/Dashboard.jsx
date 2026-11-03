import React from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductionStore } from '../../store/useProductionStore';
import { usePosStore } from '../../store/usePosStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatWeight, formatCurrency, formatDate } from '../../utils/formatters';
import { StatCard } from '../common/StatCard';
import { GoldTicker } from './GoldTicker';
import { ProductionOverviewChart } from './ProductionOverviewChart';
import { CraftsmanBalancesTable } from './CraftsmanBalancesTable';
import { UgarAlertsWidget } from './UgarAlertsWidget';
import { 
  Coins, 
  Hammer, 
  Receipt, 
  Flame, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const getVaultSummary = useInventoryStore((state) => state.getVaultSummary);
  const users = useAuthStore((state) => state.users);
  const orders = useProductionStore((state) => state.orders);
  const transactions = usePosStore((state) => state.transactions);
  const settings = useSettingsStore((state) => state.settings);

  const vault = getVaultSummary();
  const craftsmen = users.filter((u) => u.role === 'craftsman');

  // Total active gold held by craftsmen
  const totalCraftsmenGold = craftsmen.reduce((sum, c) => sum + (c.current_gold_balance || 0), 0);

  // Today sales
  const today = new Date().toISOString().slice(0, 10);
  const todayTxs = transactions.filter((t) => t.timestamp && t.timestamp.startsWith(today));
  const todaySalesUSD = todayTxs.reduce((sum, t) => sum + (t.total_amount || 0), 0);

  // Overall average loss rate
  const completedOrders = orders.filter((o) => o.status === 'completed');
  const avgUgarRate =
    completedOrders.length > 0
      ? completedOrders.reduce((sum, o) => sum + (o.loss_percentage || 0), 0) / completedOrders.length
      : 1.5;

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <span>Boshqaruv Paneli (Super Admin)</span>
            <Sparkles className="w-5 h-5 text-gold-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ishlab chiqarish jarayoni, ombor zaxiralari va milligrammli ugar tahlili real vaqtda
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/production"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-gold-sm transition-all"
          >
            <Hammer className="w-4 h-4" />
            <span>Ishlab Chiqarishga O'tish</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ombordagi Jami Tilla"
          value={formatWeight(vault.totalWeight)}
          subvalue={`Baholanishi: ${formatCurrency(vault.totalValuationUSD)}`}
          icon={Coins}
          trend="+3.2% oyiga"
          trendPositive={true}
          glow={true}
          badge="Ombor"
        />

        <StatCard
          title="Ustalar Qo'lidagi Tilla"
          value={formatWeight(totalCraftsmenGold)}
          subvalue={`${craftsmen.length} nafar zargar ustada`}
          icon={Hammer}
          badge="Jarayonda"
        />

        <StatCard
          title="Bugungi Kassa Tushumi"
          value={formatCurrency(todaySalesUSD)}
          subvalue={`~ ${Number(todaySalesUSD * (settings.usd_to_uzs || 12850)).toLocaleString()} so'm`}
          icon={Receipt}
          trend={`${todayTxs.length} ta sotuv`}
          trendPositive={true}
          badge="POS"
        />

        <StatCard
          title="O'rtacha Ugar (Yo'qotish)"
          value={`${avgUgarRate.toFixed(2)}%`}
          subvalue={`Me'yor chegarasi: ${settings.max_allowed_loss_percentage || 2.0}%`}
          icon={Flame}
          trend={avgUgarRate <= 2.0 ? "Me'yor ichida" : "Oshib ketgan"}
          trendPositive={avgUgarRate <= 2.0}
          badge="Milligramm"
        />
      </div>

      {/* Real-time Gold Price Ticker */}
      <GoldTicker />

      {/* Charts & Analytics */}
      <ProductionOverviewChart />

      {/* Tables & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CraftsmanBalancesTable />
        </div>
        <div>
          <UgarAlertsWidget />
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="rounded-2xl bg-[#141824] border border-luxury-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-gold-400" />
              <span>Oxirgi Kassa Savdolari</span>
            </h3>
            <p className="text-xs text-slate-400">Naqd, karta va Trade-In orqali amalga oshirilgan xaridlar</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-medium transition-colors"
          >
            <span>Barcha tranzaksiyalar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-luxury-border text-slate-400 font-semibold">
                <th className="pb-3 pl-2">Chek ID</th>
                <th className="pb-3">Mijoz</th>
                <th className="pb-3">Vaqt</th>
                <th className="pb-3 text-center">To'lov Turi</th>
                <th className="pb-3 text-right pr-2">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {transactions.slice(0, 4).map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-[#1a2030]/60 transition-colors">
                  <td className="py-3 pl-2 font-mono font-bold text-gold-400">#{tx.transaction_id}</td>
                  <td className="py-3 text-slate-200">{tx.customer_name}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">{formatDate(tx.timestamp)}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                        tx.payment_method === 'cash'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : tx.payment_method === 'card'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {tx.payment_method}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2 font-mono font-bold text-white">
                    {formatCurrency(tx.total_amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
