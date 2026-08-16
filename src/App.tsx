import React, { useState, useRef } from 'react';
import {
  Home,
  Mic2,
  ListMusic,
  Wine,
  Gift,
  QrCode,
} from 'lucide-react';
import { useKaraoke } from './context/KaraokeContext';
import { AmbientBackground } from './components/ui/AmbientBackground';
import { AppBrandLogo } from './components/ui/AppBrandLogo';
import { AdminLoginModal } from './components/ui/AdminLoginModal';
import { NotificationToast } from './components/ui/NotificationToast';
import { MyTableInfoModal } from './components/ui/MyTableInfoModal';
import { HomePortal } from './components/portal/HomePortal';
import { LiquorCombosMenu } from './components/portal/LiquorCombosMenu';
import { SongRequestForm } from './components/user/SongRequestForm';
import { UserTrackingScreen } from './components/user/UserTrackingScreen';
import { RewardsRoulette } from './components/user/RewardsRoulette';
import { TablePinVerification } from './components/user/TablePinVerification';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StageDisplay } from './components/tv/StageDisplay';
import { TIER_CONFIGS } from './utils/queueAlgorithm';

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

  // Customer Navigation: 'home' | 'request' | 'tracking' | 'menu' | 'roulette'
  const [customerTab, setCustomerTab] = useState<
    'home' | 'request' | 'tracking' | 'menu' | 'roulette'
  >('home');

  const [showTableInfoModal, setShowTableInfoModal] = useState(false);
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);

  // Hidden 5-tap gesture on footer copyright for DJ
  const footerTapCount = useRef(0);
  const footerTapTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSecretFooterTap = () => {
    footerTapCount.current += 1;
    if (footerTapTimer.current) clearTimeout(footerTapTimer.current);

    if (footerTapCount.current >= 5) {
      footerTapCount.current = 0;
      setShowAdminLoginModal(true);
    } else {
      footerTapTimer.current = setTimeout(() => {
        footerTapCount.current = 0;
      }, 2500);
    }
  };

  // If activeView is 'stage', render the Stage / TV Display
  if (activeView === 'stage') {
    return <StageDisplay />;
  }

  // If activeView is 'admin', check authentication
  if (activeView === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <AmbientBackground>
          <AdminLoginModal
            isOpen={true}
            onClose={() => setActiveView('user')}
            onSuccess={() => setIsAdminAuthenticated(true)}
          />
        </AmbientBackground>
      );
    }

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

  const hasSongsInQueue = state.queue.some((s) => s.tableId === activeTableId);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: <Home className="w-5 h-5" /> },
    { id: 'request', label: 'Pedir', icon: <Mic2 className="w-5 h-5" /> },
    {
      id: 'tracking',
      label: 'Mi Turno',
      icon: <ListMusic className="w-5 h-5" />,
      hasBadge: hasSongsInQueue,
    },
    { id: 'menu', label: 'Carta', icon: <Wine className="w-5 h-5" /> },
    { id: 'roulette', label: 'Ruleta', icon: <Gift className="w-5 h-5" /> },
  ];

  return (
    <AmbientBackground>
      {/* Top Navigation Bar (100% Clean for customers, no admin buttons) */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-night-base/70 border-b border-white/10 px-3.5 sm:px-4 py-2.5 sm:py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Public Brand Logo */}
          <AppBrandLogo />

          {/* Current Table Info Badge (Only shows client's own table info) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTableInfoModal(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-xs tap-squish shadow-liquid-sm"
              title="Información de tu mesa asignada"
            >
              <QrCode className="w-3.5 h-3.5 text-pastel-lavender flex-shrink-0" />
              <span className="font-bold text-white truncate max-w-[120px] sm:max-w-none">
                {currentTable?.name || `Mesa ${activeTableId}`}
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold border hidden xs:inline-block ${tierConfig.badgeBg}`}
              >
                {tierConfig.shortLabel}
              </span>
              {isTableAuthenticated && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
                  title="Mesa Autenticada"
                />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Customer Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-3.5 sm:px-4 py-4 sm:py-5 pb-24 space-y-4">
        {/* 1. HOME PORTAL (Default Welcome Screen with Live Hero, Story & Combos) */}
        {customerTab === 'home' && (
          <HomePortal
            onRequestSong={() => setCustomerTab('request')}
            onViewMenu={() => setCustomerTab('menu')}
            onViewQueue={() => setCustomerTab('tracking')}
            onViewRoulette={() => setCustomerTab('roulette')}
          />
        )}

        {/* 2. REQUEST SONG (Form + Popular Song Picker or PIN verification) */}
        {customerTab === 'request' && (
          <div>
            {!isTableAuthenticated && !isSpectatorMode ? (
              <TablePinVerification
                onSpectatorMode={() => {
                  setIsSpectatorMode(true);
                  setCustomerTab('tracking');
                }}
              />
            ) : (
              <SongRequestForm
                onSuccessSubmitted={() => {
                  setCustomerTab('tracking');
                }}
              />
            )}
          </div>
        )}

        {/* 3. TRACKING / QUEUE (Live Queue, Wait Time & Now Playing) */}
        {customerTab === 'tracking' && (
          <UserTrackingScreen
            onRequestNewSong={() => {
              setIsSpectatorMode(false);
              setCustomerTab('request');
            }}
          />
        )}

        {/* 4. LIQUOR & COMBOS MENU */}
        {customerTab === 'menu' && (
          <LiquorCombosMenu
            onBackToHome={() => setCustomerTab('home')}
            onRequestSong={() => setCustomerTab('request')}
          />
        )}

        {/* 5. REWARDS ROULETTE */}
        {customerTab === 'roulette' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-pastel-yellow bg-pastel-yellow/15 px-2.5 py-0.5 rounded-full border border-pastel-yellow/30">
                RULETA DE RECOMPENSAS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Gana Premios para tu Mesa
              </h2>
              <p className="text-xs text-slate-400">
                Gira la ruleta y gana descuentos en barra, canciones extra o reducción de tiempo.
              </p>
            </div>
            <RewardsRoulette />
          </div>
        )}
      </main>

      {/* Footer with discreet copyright (5-taps for DJ emergency access) */}
      <footer className="py-4 pb-24 text-center text-[11px] text-slate-500 max-w-md mx-auto px-4 select-none">
        <span
          onClick={handleSecretFooterTap}
          className="cursor-default"
          title="Karaoke Hinojosa"
        >
          Karaoke Hinojosa • Todos los derechos reservados
        </span>
      </footer>

      {/* Bottom Floating App Navigation Bar (Liquid Glass Dock) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-night-base/85 backdrop-blur-2xl border-t border-white/10 px-2 sm:px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = customerTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCustomerTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all tap-squish relative select-none ${
                  isActive
                    ? 'text-pastel-lavender scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active Glowing Background Pill */}
                {isActive && (
                  <span className="absolute inset-0 bg-pastel-lavender/15 rounded-2xl border border-pastel-lavender/30 -z-10 shadow-glow-lavender" />
                )}

                <div className="relative">
                  {item.icon}
                  {item.hasBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pastel-pink animate-ping" />
                  )}
                </div>

                <span className="text-[10px] font-bold mt-0.5 tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

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

      {/* Only client's own table info */}
      <MyTableInfoModal
        isOpen={showTableInfoModal}
        onClose={() => setShowTableInfoModal(false)}
      />
    </AmbientBackground>
  );
};
