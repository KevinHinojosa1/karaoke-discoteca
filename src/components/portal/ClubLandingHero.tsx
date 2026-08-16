import React from 'react';
import {
  Mic2,
  Sparkles,
  Flame,
  Wine,
  Crown,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';

interface ClubLandingHeroProps {
  onRequestSong: () => void;
  onViewMenu: () => void;
  onViewQueue: () => void;
}

export const ClubLandingHero: React.FC<ClubLandingHeroProps> = ({
  onRequestSong,
  onViewMenu,
  onViewQueue,
}) => {
  const { state, currentTable, activeTableId } = useKaraoke();

  const tierConfig = currentTable
    ? TIER_CONFIGS[currentTable.tier]
    : TIER_CONFIGS.standard;

  return (
    <div className="space-y-4">
      {/* Table Status Strip */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">
            Conectado a <strong className="text-white">{currentTable?.name || `Mesa ${activeTableId}`}</strong>
          </span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${tierConfig.badgeBg}`}>
          {tierConfig.shortLabel}
        </span>
      </div>

      {/* Hero Live Card: EN TARIMA AHORA */}
      <LiquidGlassCard
        variant="elevated"
        className="p-5 sm:p-6 border-2 border-pastel-lavender/40 shadow-glow-lavender relative overflow-hidden"
      >
        {/* Glowing Background Accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-pastel-pink/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-pastel-lavender/15 blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-pink/20 border border-pastel-pink/40 text-pastel-pink text-xs font-extrabold shadow-glow-pink">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>EN TARIMA AHORA</span>
          </div>

          {/* Equalizer bars */}
          <div className="flex items-end gap-1 h-5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
            <div className="w-1 bg-pastel-pink rounded-full eq-bar-1" />
            <div className="w-1 bg-pastel-lavender rounded-full eq-bar-2" />
            <div className="w-1 bg-pastel-mint rounded-full eq-bar-3" />
            <div className="w-1 bg-pastel-sky rounded-full eq-bar-4" />
          </div>
        </div>

        {/* Now Playing Content */}
        {state.currentSong ? (
          <div className="space-y-2 my-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-pastel-mint bg-pastel-mint/15 px-2.5 py-0.5 rounded-lg border border-pastel-mint/30 inline-block">
              {state.currentSong.tableName}
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              "{state.currentSong.title}"
            </h2>

            <p className="text-base sm:text-lg text-pastel-lavender font-bold">
              {state.currentSong.artist}
            </p>

            {state.currentSong.notes && (
              <p className="text-xs text-slate-300 italic pt-1">
                💬 "{state.currentSong.notes}"
              </p>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">
            <Mic2 className="w-10 h-10 text-pastel-lavender mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-white">¡El escenario está listo para ti!</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Sé el primero en pedir tu canción favorita esta noche
            </p>
          </div>
        )}

        {/* Upcoming Next In Line Preview */}
        {state.queue.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate text-slate-300">
              <span className="font-bold text-pastel-pink">Siguiente:</span>
              <span className="font-medium text-white truncate max-w-[170px] sm:max-w-xs">
                {state.queue[0].title} ({state.queue[0].artist})
              </span>
            </div>
            <button
              onClick={onViewQueue}
              className="text-[11px] font-bold text-pastel-lavender hover:underline flex items-center gap-0.5 flex-shrink-0"
            >
              <span>Ver cola ({state.queue.length})</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Big Action Buttons */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <LiquidButton
            variant="lavender"
            size="lg"
            fullWidth
            onClick={onRequestSong}
            icon={<Flame className="w-5 h-5 text-pastel-pink animate-pulse" />}
          >
            🎤 ¡Pedir mi Canción!
          </LiquidButton>

          <LiquidButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onViewMenu}
            icon={<Wine className="w-5 h-5 text-pastel-yellow" />}
          >
            🍸 Ver Combos de Licores
          </LiquidButton>
        </div>
      </LiquidGlassCard>

      {/* VIP Promotion Banner */}
      <div
        onClick={onViewMenu}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-400/15 via-purple-500/15 to-pastel-pink/15 border border-amber-300/30 cursor-pointer flex items-center justify-between transition-all hover:border-amber-300/50 tap-squish shadow-liquid-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>¿Quieres cantar con Prioridad VIP Alta?</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </h4>
            <p className="text-[11px] text-slate-300">
              Pide un combo de botella en barra ($100+) y sube a 5 canciones sin espera.
            </p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-amber-300 flex-shrink-0" />
      </div>
    </div>
  );
};
