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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar with Brand & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-pastel-lavender/20 text-pastel-lavender border border-pastel-lavender/30">
              PANEL DE CONTROL
            </span>
            <span className="text-xs text-slate-400">DJ & Staff Bar</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Karaoke Night Club — Master Control
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Stage Mode in New Tab or Switch */}
          <LiquidButton
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('stage')}
            icon={<Tv className="w-4 h-4 text-pastel-sky" />}
          >
            Modo Pantalla Gigante / TV
          </LiquidButton>

          <LiquidButton
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4 text-rose-400" />}
          >
            Salir al Modo Usuario
          </LiquidButton>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: In Queue */}
        <LiquidGlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">En Cola</span>
            <ListMusic className="w-4 h-4 text-pastel-lavender" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {totalInQueue}
          </div>
          <span className="text-[10px] text-pastel-lavender">canciones pendientes</span>
        </LiquidGlassCard>

        {/* Metric 2: Avg Wait Time */}
        <LiquidGlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Espera Promedio</span>
            <Clock className="w-4 h-4 text-pastel-pink" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            ~{avgWaitMinutes} <span className="text-xs font-normal text-slate-400">min</span>
          </div>
          <span className="text-[10px] text-pastel-pink">para la última canción</span>
        </LiquidGlassCard>

        {/* Metric 3: Active Tables */}
        <LiquidGlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mesas Activas</span>
            <Users className="w-4 h-4 text-pastel-mint" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {activeTablesCount}
          </div>
          <span className="text-[10px] text-pastel-mint">mesas registradas</span>
        </LiquidGlassCard>

        {/* Metric 4: VIP Tables */}
        <LiquidGlassCard variant="subtle" className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mesas VIP / Consumo</span>
            <TrendingUp className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {vipTablesCount}
          </div>
          <span className="text-[10px] text-amber-300">prioridad preferente</span>
        </LiquidGlassCard>

        {/* Metric 5: Sung History */}
        <LiquidGlassCard variant="subtle" className="p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Cantadas Hoy</span>
            <Mic2 className="w-4 h-4 text-pastel-sky" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {totalSung}
          </div>
          <span className="text-[10px] text-pastel-sky">shows completados</span>
        </LiquidGlassCard>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'queue', label: 'Cola en Vivo (DJ)', icon: <ListMusic className="w-4 h-4" /> },
          { id: 'tables', label: 'Mesas y Consumo', icon: <Users className="w-4 h-4" /> },
          { id: 'roulette', label: 'Configurar Ruleta', icon: <Trophy className="w-4 h-4" /> },
          { id: 'qrcodes', label: 'Códigos QR Mesas', icon: <QrCode className="w-4 h-4" /> },
          { id: 'history', label: 'Historial Cantadas', icon: <History className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all tap-squish ${
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

      {/* Tab Content */}
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
