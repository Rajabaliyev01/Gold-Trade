import React from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductionStore } from '../../store/useProductionStore';
import { usePosStore } from '../../store/usePosStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useUIStore } from '../../store/useUIStore';
import { getTranslation } from '../../utils/i18n';
import { formatWeight, formatCurrency, formatDate } from '../../utils/formatters';
import { StatCard } from '../common/StatCard';
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
  Package,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const getVaultSummary = useInventoryStore((state) => state.getVaultSummary);
  const users = useAuthStore((state) => state.users);
  const orders = useProductionStore((state) => state.orders);
  const transactions = usePosStore((state) => state.transactions);
  const settings = useSettingsStore((state) => state.settings);
  const { language } = useUIStore();
  const t = (section, key) => getTranslation(language, section, key);

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

  // Active production stages count
  const inProgressOrders = orders.filter((o) => o.status === 'assigned' || o.status === 'in_progress');
  const qcOrders = orders.filter((o) => o.status === 'completed_by_craftsman');

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner / Greeting with Quick Action Links */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center space-x-2 text-xs text-gold-400 mb-1 font-semibold">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Enterprise ERP v2.5</span>
            </span>
            <span>•</span>
            <span className="text-slate-400">High-Precision Vault Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <span>{t('dashboard', 'title')}</span>
            <Sparkles className="w-6 h-6 text-gold-400 shrink-0" />
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Ishlab chiqarish jarayoni, ombor zaxiralari, milligrammli ugar va kassa hisob-kitoblari real vaqtda.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            to="/rates"
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-xs font-semibold transition-all cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-gold-400" />
            <span>{language === 'ru' ? 'Курсы валют' : language === 'en' ? 'Live Rates' : 'Jonli Kurslar'}</span>
          </Link>

          <Link
            to="/production"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-black font-bold text-xs shadow-gold hover:shadow-gold-glow transition-all active:scale-95 cursor-pointer"
          >
            <Hammer className="w-4 h-4" />
            <span>Ishlab Chiqarish</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard', 'totalInventory')}
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
          title={t('dashboard', 'todaySales')}
          value={formatCurrency(todaySalesUSD)}
          subvalue={`~ ${Number(todaySalesUSD * (settings.usd_to_uzs || 12850)).toLocaleString()} so'm`}
          icon={Receipt}
          trend={`${todayTxs.length} ta sotuv`}
          trendPositive={true}
          badge="POS"
        />

        <StatCard
          title={t('dashboard', 'ugarAlerts')}
          value={`${avgUgarRate.toFixed(2)}%`}
          subvalue={`Me'yor chegarasi: ${settings.max_allowed_loss_percentage || 2.0}%`}
          icon={Flame}
          trend={avgUgarRate <= 2.0 ? "Me'yor ichida" : "Oshib ketgan"}
          trendPositive={avgUgarRate <= 2.0}
          badge="Milligramm"
        />
      </div>

      {/* High-Tech Industrial Jewelry Pipeline Highlights Widget (Replacing the 2 charts) */}
      <div className="rounded-2xl bg-gradient-to-br from-[#12141c]/80 via-[#161a26]/70 to-[#12141c]/80 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-gold-400" />
              <span>5 Bosqichli Zargarlik Ishlab Chiqarish Quvvati</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Xomashyo kirimidan to sifat nazorati (QC) va omborga topshirish bosqichlari</p>
          </div>
          <Link
            to="/pipeline"
            className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center space-x-1 transition-colors self-start sm:self-auto"
          >
            <span>Batafsil Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5 Stages Interactive Visual Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Stage 1: Xomashyo */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                1-BOSQICH
              </span>
              <Boxes className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Xomashyo Kirimi</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formatWeight(vault.totalWeight)} sof zaxira</p>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-full rounded-full"></div>
            </div>
          </div>

          {/* Stage 2: Eritish & Ligatura */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                2-BOSQICH
              </span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Eritish &amp; Ligatura</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">585 / 750 qotishmalar</p>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-400 h-full w-[85%] rounded-full"></div>
            </div>
          </div>

          {/* Stage 3: Usta Buyurtmasi */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                3-BOSQICH
              </span>
              <Hammer className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Ustaxonada Ishlov</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{inProgressOrders.length} ta faol buyurtma</p>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full w-[65%] rounded-full"></div>
            </div>
          </div>

          {/* Stage 4: Sifat Nazorati (QC) */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                4-BOSQICH
              </span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Sifat Nazorati (QC)</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{qcOrders.length} ta tekshiruvda</p>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-400 h-full w-[50%] rounded-full"></div>
            </div>
          </div>

          {/* Stage 5: Proba & Birka */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                5-BOSQICH
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Tayyor Mahsulot</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{completedOrders.length} ta topshirilgan</p>
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-full rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

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
      <div className="rounded-2xl bg-[#12141c]/60 backdrop-blur-xl border border-white/10 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Receipt className="w-4 h-4 text-gold-400" />
              <span>Oxirgi Kassa Savdolari (POS)</span>
            </h3>
            <p className="text-xs text-slate-400">Naqd, karta va Trade-In orqali amalga oshirilgan xaridlar</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs text-gold-400 hover:text-gold-300 flex items-center space-x-1 font-semibold transition-colors"
          >
            <span>Barcha tranzaksiyalar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold">
                <th scope="col" className="pb-3 pl-2">Chek ID</th>
                <th scope="col" className="pb-3">Mijoz</th>
                <th scope="col" className="pb-3">Vaqt</th>
                <th scope="col" className="pb-3 text-center">To'lov Turi</th>
                <th scope="col" className="pb-3 text-right pr-2">Summa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 pl-2 font-mono font-bold text-gold-400">#{tx.transaction_id}</td>
                  <td className="py-3 text-slate-200 font-medium">{tx.customer_name || 'Noma\'lum'}</td>
                  <td className="py-3 text-slate-400 font-mono text-[11px]">{formatDate(tx.timestamp)}</td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
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
