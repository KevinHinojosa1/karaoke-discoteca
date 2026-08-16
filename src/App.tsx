import React, { useState } from 'react';
import {
  ListMusic,
  PlusCircle,
  QrCode,
} from 'lucide-react';
import { useKaraoke } from './context/KaraokeContext';
import { AmbientBackground } from './components/ui/AmbientBackground';
import { AdminSecretTrigger } from './components/ui/AdminSecretTrigger';
import { AdminLoginModal } from './components/ui/AdminLoginModal';
import { NotificationToast } from './components/ui/NotificationToast';
import { TableSwitcherModal } from './components/ui/TableSwitcherModal';
import { SongRequestForm } from './components/user/SongRequestForm';
import { UserTrackingScreen } from './components/user/UserTrackingScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StageDisplay } from './components/tv/StageDisplay';
import { TIER_CONFIGS } from './utils/queueAlgorithm';

import { TablePinVerification } from './components/user/TablePinVerification';

export const App: React.FC = () => {
  const {
    state,
    currentTable,
    activeTableId,
    activeView,
    setActiveView,
    isAdminAuthenticated,
    setIsAdminAuthenticated,
    showAdminLoginModal,
    setShowAdminLoginModal,
    isTableAuthenticated,
  } = useKaraoke();

  const [userSubTab, setUserSubTab] = useState<'form' | 'tracking'>('form');
  const [showTableModal, setShowTableModal] = useState(false);
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);

  // If activeView is 'stage', render the Stage / TV Display
  if (activeView === 'stage') {
    return <StageDisplay />;
  }

  // If activeView is 'admin' and authenticated, render the Admin Dashboard
  if (activeView === 'admin' && isAdminAuthenticated) {
    return (
      <AmbientBackground>
        <AdminDashboard />
        <NotificationToast />
      </AmbientBackground>
    );
  }

  const tierConfig = currentTable
    ? TIER_CONFIGS[currentTable.tier]
    : TIER_CONFIGS.standard;

  return (
    <AmbientBackground>
      {/* Top Mobile/Desktop Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-night-base/60 border-b border-white/10 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Secret Logo Trigger (Double Click to unlock Admin) */}
          <AdminSecretTrigger
            onAdminTrigger={() => setShowAdminLoginModal(true)}
            isAdminAuthenticated={isAdminAuthenticated}
            onOpenAdminDirectly={() => setActiveView('admin')}
          />

          {/* Table Switcher / QR Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowTableModal(true);
                setIsSpectatorMode(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-xs tap-squish shadow-liquid-sm"
              title="Cambiar mesa o simular escaneo QR"
            >
              <QrCode className="w-3.5 h-3.5 text-pastel-lavender" />
              <span className="font-bold text-white">
                {currentTable?.name || activeTableId}
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${tierConfig.badgeBg}`}>
                {tierConfig.shortLabel}
              </span>
              {isTableAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" title="Mesa Autenticada con PIN" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main User Container (Mobile-First Experience) */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5 space-y-4">
        {/* User Navigation Pills (Pedir vs Seguimiento) */}
        <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setUserSubTab('form')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all tap-squish ${
              userSubTab === 'form'
                ? 'bg-gradient-to-r from-pastel-lavender/30 to-pastel-pink/20 text-white border border-white/25 shadow-glow-lavender'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-pastel-lavender" />
            <span>Pedir Canción</span>
          </button>

          <button
            onClick={() => setUserSubTab('tracking')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all tap-squish relative ${
              userSubTab === 'tracking'
                ? 'bg-gradient-to-r from-pastel-pink/30 to-pastel-lavender/20 text-white border border-white/25 shadow-glow-pink'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-4 h-4 text-pastel-pink" />
            <span>Seguimiento en Vivo</span>
            {state.queue.some((s) => s.tableId === activeTableId) && (
              <span className="w-2 h-2 rounded-full bg-pastel-pink animate-ping absolute top-2 right-3" />
            )}
          </button>
        </div>

        {/* Content Body: If table not authenticated with PIN and user is on form tab, show Security Gate */}
        {!isTableAuthenticated && !isSpectatorMode && userSubTab === 'form' ? (
          <TablePinVerification
            onSpectatorMode={() => {
              setIsSpectatorMode(true);
              setUserSubTab('tracking');
            }}
          />
        ) : userSubTab === 'form' ? (
          <SongRequestForm
            onSuccessSubmitted={() => {
              setUserSubTab('tracking');
            }}
          />
        ) : (
          <UserTrackingScreen
            onRequestNewSong={() => {
              setIsSpectatorMode(false);
              setUserSubTab('form');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-500 max-w-md mx-auto px-4">
        <span>Karaoke Hinojosa • Sistema Digital</span>
        <div className="text-[10px] text-slate-600 mt-0.5">
          Doble clic en el logo para acceso administrativo
        </div>
      </footer>

      {/* Modals & Real-time Push Toasts */}
      <NotificationToast />

      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setActiveView('admin');
        }}
      />

      <TableSwitcherModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
      />
    </AmbientBackground>
  );
};
