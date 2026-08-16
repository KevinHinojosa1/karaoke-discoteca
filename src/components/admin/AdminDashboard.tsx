import React, { useState } from 'react';
import {
  ListMusic,
  Users,
  Trophy,
  QrCode,
  History,
  LogOut,
  TrendingUp,
  Clock,
  Tv,
  ShoppingBag,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { QueueManager } from './QueueManager';
import { TableManager } from './TableManager';
import { OrdersFinanceDashboard } from './OrdersFinanceDashboard';
import { RouletteConfigModal } from './RouletteConfigModal';
import { QRCodeCenter } from './QRCodeCenter';
import { SongHistoryModal } from './SongHistoryModal';

export const AdminDashboard: React.FC = () => {
  const {
    state,
    setActiveView,
    setIsAdminAuthenticated,
  } = useKaraoke();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'queue' | 'tables' | 'roulette' | 'qrcodes' | 'history'
  >('orders');

  // Metrics
  const totalInQueue = state.queue.length;
  const activeTablesCount = Object.keys(state.tables).length;
  const pendingOrdersCount = (state.orders || []).filter((o) => o.status === 'pending').length;
  const totalRevenue = (state.orders || [])
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const avgWaitMinutes = Math.round(totalInQueue * 3.5);

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveView('user');
  };

  const tabs = [
    {
      id: 'orders',
      label: '🍸 Pedidos & Finanzas',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'queue', label: 'Cola en Vivo (DJ)', icon: <ListMusic className="w-4 h-4" /> },
    { id: 'tables', label: 'Mesas y Consumo', icon: <Users className="w-4 h-4" /> },
    { id: 'roulette', label: 'Ruleta', icon: <Trophy className="w-4 h-4" /> },
    { id: 'qrcodes', label: 'Códigos QR', icon: <QrCode className="w-4 h-4" /> },
    { id: 'history', label: 'Historial', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* Top Bar with Brand & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-pastel-lavender/20 text-pastel-lavender border border-pastel-lavender/30">
              PANEL DE CONTROL
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">DJ & Barra Staff</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1">
            Karaoke Hinojosa — Master Control
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Open Stage Mode */}
          <LiquidButton
            variant="secondary"
            size="sm"
            className="flex-1 sm:flex-initial"
            onClick={() => setActiveView('stage')}
            icon={<Tv className="w-4 h-4 text-pastel-sky" />}
          >
            <span className="hidden xs:inline">Modo </span>Pantalla TV
          </LiquidButton>

          <LiquidButton
            variant="ghost"
            size="sm"
            className="flex-1 sm:flex-initial"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4 text-rose-400" />}
          >
            Salir
          </LiquidButton>
        </div>
      </div>

      {/* Metrics Row (Fluid Responsive Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3.5">
        {/* Metric 1: Total Revenue Tonight */}
        <LiquidGlassCard variant="elevated" className="p-3 sm:p-4 border-emerald-400/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Ventas Hoy</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 font-mono mt-1">
            ${totalRevenue}
          </div>
          <span className="text-[9px] sm:text-[10px] text-emerald-400/80 block truncate">consumo despachado</span>
        </LiquidGlassCard>

        {/* Metric 2: Pending Orders */}
        <LiquidGlassCard
          variant={pendingOrdersCount > 0 ? 'lavender' : 'subtle'}
          className={`p-3 sm:p-4 ${pendingOrdersCount > 0 ? 'border-pastel-pink/50 shadow-glow-pink' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Comandas</span>
            <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pastel-pink flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
            {pendingOrdersCount}
          </div>
          <span className="text-[9px] sm:text-[10px] text-pastel-pink block truncate">pedidos pendientes</span>
        </LiquidGlassCard>

        {/* Metric 3: Songs In Queue */}
        <LiquidGlassCard variant="subtle" className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">En Cola</span>
            <ListMusic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pastel-lavender flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {totalInQueue}
          </div>
          <span className="text-[9px] sm:text-[10px] text-pastel-lavender block truncate">canciones en fila</span>
        </LiquidGlassCard>

        {/* Metric 4: Avg Wait Time */}
        <LiquidGlassCard variant="subtle" className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Espera Aprox</span>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pastel-pink flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            ~{avgWaitMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-pastel-pink block truncate">último turno</span>
        </LiquidGlassCard>

        {/* Metric 5: Active Tables */}
        <LiquidGlassCard variant="subtle" className="p-3 sm:p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Mesas Activas</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pastel-mint flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {activeTablesCount}
          </div>
          <span className="text-[9px] sm:text-[10px] text-pastel-mint block truncate">mesas en el local</span>
        </LiquidGlassCard>
      </div>

      {/* Tabs Navigation (Responsive Horizontal Scrollable Container) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/10 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all tap-squish flex-shrink-0 relative ${
              activeTab === tab.id
                ? 'bg-pastel-lavender/25 text-pastel-lavender border border-pastel-lavender/40 shadow-glow-lavender'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-pastel-pink text-night-base text-[10px] font-black animate-bounce">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="mt-4">
        {activeTab === 'orders' && <OrdersFinanceDashboard />}
        {activeTab === 'queue' && <QueueManager />}
        {activeTab === 'tables' && <TableManager />}
        {activeTab === 'roulette' && <RouletteConfigModal />}
        {activeTab === 'qrcodes' && <QRCodeCenter />}
        {activeTab === 'history' && <SongHistoryModal />}
      </div>
    </div>
  );
};
