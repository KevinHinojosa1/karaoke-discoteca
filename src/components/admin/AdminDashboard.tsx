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
  Mic2,
  Tv,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { QueueManager } from './QueueManager';
import { TableManager } from './TableManager';
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
    'queue' | 'tables' | 'roulette' | 'qrcodes' | 'history'
  >('queue');

  // Metrics
  const totalInQueue = state.queue.length;
  const activeTablesCount = Object.keys(state.tables).length;
  const vipTablesCount = Object.values(state.tables).filter(
    (t) => t.tier === 'vip_100' || t.tier === 'medium_50'
  ).length;
  const avgWaitMinutes = Math.round(totalInQueue * 3.5);
  const totalSung = state.history.length;

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    setActiveView('user');
  };

  const tabs = [
    { id: 'queue', label: 'Cola en Vivo', icon: <ListMusic className="w-4 h-4" /> },
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
            <span className="text-[10px] sm:text-xs text-slate-400">DJ & Staff Bar</span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1">
            Karaoke Master Control
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
        {/* Metric 1: In Queue */}
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

        {/* Metric 2: Avg Wait Time */}
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

        {/* Metric 3: Active Tables */}
        <LiquidGlassCard variant="subtle" className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Mesas</span>
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pastel-mint flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {activeTablesCount}
          </div>
          <span className="text-[9px] sm:text-[10px] text-pastel-mint block truncate">mesas activas</span>
        </LiquidGlassCard>

        {/* Metric 4: VIP Tables */}
        <LiquidGlassCard variant="subtle" className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Mesas VIP</span>
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {vipTablesCount}
          </div>
          <span className="text-[9px] sm:text-[10px] text-amber-300 block truncate">consumo alto</span>
        </LiquidGlassCard>

        {/* Metric 5: Sung History */}
        <LiquidGlassCard variant="subtle" className="p-3 sm:p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">Cantadas Hoy</span>
            <Mic2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pastel-sky flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">
            {totalSung}
          </div>
          <span className="text-[9px] sm:text-[10px] text-pastel-sky block truncate">canciones finalizadas</span>
        </LiquidGlassCard>
      </div>

      {/* Tabs Navigation (Responsive Horizontal Scrollable Container) */}
      <div className="flex items-center gap-1.5 sm:gap-2 border-b border-white/10 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all tap-squish flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-pastel-lavender/25 text-pastel-lavender border border-pastel-lavender/40 shadow-glow-lavender'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="mt-4">
        {activeTab === 'queue' && <QueueManager />}
        {activeTab === 'tables' && <TableManager />}
        {activeTab === 'roulette' && <RouletteConfigModal />}
        {activeTab === 'qrcodes' && <QRCodeCenter />}
        {activeTab === 'history' && <SongHistoryModal />}
      </div>
    </div>
  );
};
