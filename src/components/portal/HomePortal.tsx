import React from 'react';
import {
  Flame,
  Wine,
  Crown,
  ListMusic,
  ChevronRight,
  Gift,
} from 'lucide-react';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { ClubLandingHero } from './ClubLandingHero';
import { ClubStorySection } from './ClubStorySection';
import { LIQUOR_MENU_ITEMS } from '../../data/liquorMenu';
import { OrderTrackingBanner } from './OrderTrackingBanner';

interface HomePortalProps {
  onRequestSong: () => void;
  onViewMenu: () => void;
  onViewQueue: () => void;
  onViewRoulette: () => void;
}

export const HomePortal: React.FC<HomePortalProps> = ({
  onRequestSong,
  onViewMenu,
  onViewQueue,
  onViewRoulette,
}) => {
  const featuredCombos = LIQUOR_MENU_ITEMS.filter((item) => item.category === 'combos_vip').slice(0, 2);

  return (
    <div className="space-y-5 sm:space-y-7 w-full animate-in fade-in duration-300">
      {/* Persistent Order Tracking Banner */}
      <OrderTrackingBanner />

      {/* 1. Live Hero Section: En Tarima Ahora & Main Action */}
      <ClubLandingHero
        onRequestSong={onRequestSong}
        onViewMenu={onViewMenu}
        onViewQueue={onViewQueue}
      />

      {/* 2. Interactive Navigation Quick Cards (2 cols mobile, 4 cols tablet/desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <button
          onClick={onRequestSong}
          className="p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-pastel-lavender/20 border border-white/10 hover:border-pastel-lavender/40 text-left transition-all tap-squish group flex flex-col justify-between shadow-liquid-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-pastel-lavender/20 text-pastel-lavender flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Pedir Canción</h4>
            <span className="text-[10px] sm:text-xs text-slate-400">Catálogo digital</span>
          </div>
        </button>

        <button
          onClick={onViewQueue}
          className="p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-pastel-pink/20 border border-white/10 hover:border-pastel-pink/40 text-left transition-all tap-squish group flex flex-col justify-between shadow-liquid-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-pastel-pink/20 text-pastel-pink flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ListMusic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Mi Turno & Cola</h4>
            <span className="text-[10px] sm:text-xs text-slate-400">Seguimiento en vivo</span>
          </div>
        </button>

        <button
          onClick={onViewMenu}
          className="p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-pastel-yellow/20 border border-white/10 hover:border-pastel-yellow/40 text-left transition-all tap-squish group flex flex-col justify-between shadow-liquid-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-pastel-yellow/20 text-pastel-yellow flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Wine className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Carta & Combos</h4>
            <span className="text-[10px] sm:text-xs text-slate-400">Barra & Licores</span>
          </div>
        </button>

        <button
          onClick={onViewRoulette}
          className="p-3.5 sm:p-4 rounded-2xl bg-white/5 hover:bg-pastel-mint/20 border border-white/10 hover:border-pastel-mint/40 text-left transition-all tap-squish group flex flex-col justify-between shadow-liquid-sm"
        >
          <div className="w-8 h-8 rounded-xl bg-pastel-mint/20 text-pastel-mint flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Ruleta Premios</h4>
            <span className="text-[10px] sm:text-xs text-slate-400">Gana descuentos</span>
          </div>
        </button>
      </div>

      {/* 3. Featured Combos Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              Combos de Botellas Destacados
            </h3>
          </div>
          <button
            onClick={onViewMenu}
            className="text-xs text-pastel-lavender hover:underline flex items-center gap-0.5 font-bold"
          >
            <span>Ver carta completa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {featuredCombos.map((combo) => (
            <LiquidGlassCard
              key={combo.id}
              variant="elevated"
              className="p-4 sm:p-5 flex flex-col justify-between border-amber-300/30"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                    {combo.tag || 'VIP'}
                  </span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    ${combo.price}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white mt-1.5">
                  {combo.name}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
                  {combo.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-pastel-mint font-semibold">
                  ✓ 5 canciones VIP incluidas
                </span>
                <button
                  onClick={onViewMenu}
                  className="text-xs font-bold text-pastel-lavender hover:underline"
                >
                  Ver combo →
                </button>
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      </div>

      {/* 4. Club History & Identity */}
      <ClubStorySection />
    </div>
  );
};
