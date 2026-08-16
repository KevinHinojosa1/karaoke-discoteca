import React, { useState } from 'react';
import {
  Clock,
  Mic2,
  Crown,
  Sparkles,
  Trophy,
  CheckCircle2,
  Radio,
  ListOrdered,
  PlusCircle,
  Volume2,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';
import { RewardsRoulette } from './RewardsRoulette';
import { OrderTrackingBanner } from '../portal/OrderTrackingBanner';
import { AnimatedKaraokeMascot } from '../ui/AnimatedKaraokeMascot';

interface UserTrackingScreenProps {
  onRequestNewSong: () => void;
}

export const UserTrackingScreen: React.FC<UserTrackingScreenProps> = ({
  onRequestNewSong,
}) => {
  const { state, currentTable, activeTableId } = useKaraoke();
  const [showRouletteModal, setShowRouletteModal] = useState(false);

  const tierConfig = currentTable
    ? TIER_CONFIGS[currentTable.tier]
    : TIER_CONFIGS.standard;
  const totalAllowed = currentTable
    ? tierConfig.maxSongs + currentTable.extraQuotaBonus
    : 2;
  const quotaUsed = currentTable ? currentTable.quotaUsed : 0;
  const quotasRemaining = Math.max(0, totalAllowed - quotaUsed);

  // Find all songs requested by this table that are pending
  const tablePendingSongs = state.queue.filter(
    (s) => s.tableId === activeTableId && s.status === 'pending'
  );

  // Find the earliest requested song for this table
  const primarySong = tablePendingSongs[0];

  // Position in the overall queue
  const overallIndex = primarySong
    ? state.queue.findIndex((s) => s.id === primarySong.id)
    : -1;
  const positionInQueue = overallIndex >= 0 ? overallIndex + 1 : 0;
  const estimatedWaitMin = primarySong?.estimatedWaitMinutes || (positionInQueue * 3.5);

  // Get the 2-3 songs that will play before this table's song
  const songsBeforeUs =
    overallIndex > 0 ? state.queue.slice(0, Math.min(overallIndex, 3)) : [];

  // Check if our table is currently playing on stage!
  const isOurSongPlaying = state.currentSong?.tableId === activeTableId;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Persistent Order Tracking Banner */}
      <OrderTrackingBanner />
      {/* Dynamic Hero Status Card */}
      {isOurSongPlaying ? (
        <LiquidGlassCard
          variant="pink"
          className="p-5 border-2 border-pastel-pink/50 shadow-glow-pink animate-pulse"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-pastel-pink/30 border border-pastel-pink/50 flex items-center justify-center text-pastel-pink flex-shrink-0">
              <Mic2 className="w-8 h-8 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-pastel-pink text-night-base">
                  ¡EN TARIMA AHORA!
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-white truncate mt-1">
                {state.currentSong?.title}
              </h2>
              <p className="text-xs text-pastel-pink font-semibold">
                {state.currentSong?.artist} • ¡Sube con el DJ a cantar!
              </p>
            </div>
          </div>
        </LiquidGlassCard>
      ) : primarySong ? (
        <LiquidGlassCard variant="elevated" className="p-5 md:p-6 text-center relative overflow-hidden">
          {/* Refractive gradient backdrop banner */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pastel-lavender via-pastel-pink to-pastel-mint" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pastel-lavender/15 border border-pastel-lavender/30 text-pastel-lavender text-xs font-bold mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Seguimiento de tu Canción</span>
          </div>

          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
            "{primarySong.title}"
          </h3>
          <p className="text-xs text-slate-300 font-medium">{primarySong.artist}</p>

          {/* Animated Karaoke Mascot in Waiting Queue State */}
          <div className="my-2">
            <AnimatedKaraokeMascot
              status="waiting_queue"
              position={positionInQueue}
              estimatedWaitMin={estimatedWaitMin}
            />
          </div>

          {/* Quick Metrics Circle & Time Box */}
          <div className="grid grid-cols-2 gap-3 my-4">
            {/* Position Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 font-medium">Posición en Cola</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-pastel-lavender">
                  #{positionInQueue}
                </span>
                <span className="text-xs text-slate-400">de {state.queue.length}</span>
              </div>
              <span className="text-[10px] text-pastel-mint font-semibold mt-1">
                {positionInQueue === 1
                  ? '⚡ ¡Eres el siguiente!'
                  : positionInQueue === 2
                  ? '🔔 En 1 canción es tu turno'
                  : 'En fila por orden de prioridad'}
              </span>
            </div>

            {/* Wait Time Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400 font-medium">Tiempo Estimado</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-pastel-pink">
                  ~{estimatedWaitMin}
                </span>
                <span className="text-xs text-slate-400">minutos</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Aprox 3.5 min/canción
              </span>
            </div>
          </div>

          {/* Table Priority Badge */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-pastel-lavender" />
              <span className="text-slate-300">Categoría de Mesa:</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full font-bold border ${tierConfig.badgeBg}`}>
              {tierConfig.shortLabel}
            </span>
          </div>
        </LiquidGlassCard>
      ) : (
        <LiquidGlassCard variant="elevated" className="p-5 sm:p-6 text-center">
          <AnimatedKaraokeMascot status="idle" />
          <h3 className="text-lg font-bold text-white mt-1">No tienes canciones en cola</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Pide tu canción favorita ahora mismo para cantar en el escenario del club.
          </p>
          <div className="mt-4">
            <LiquidButton
              variant="lavender"
              fullWidth
              size="md"
              onClick={onRequestNewSong}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Pedir una Canción
            </LiquidButton>
          </div>
        </LiquidGlassCard>
      )}

      {/* Currently Playing Song in the Club (Now Playing Card) */}
      <LiquidGlassCard variant="subtle" className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pastel-pink opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pastel-pink"></span>
            </span>
            <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
              Sonando en la Discoteca
            </span>
          </div>
          {/* Animated Equalizer Wave Bars */}
          <div className="flex items-end gap-1 h-5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
            <div className="w-1 bg-pastel-pink rounded-full eq-bar-1" />
            <div className="w-1 bg-pastel-lavender rounded-full eq-bar-2" />
            <div className="w-1 bg-pastel-mint rounded-full eq-bar-3" />
            <div className="w-1 bg-pastel-sky rounded-full eq-bar-4" />
          </div>
        </div>

        {state.currentSong ? (
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pastel-pink/30 to-purple-500/20 border border-white/20 flex items-center justify-center text-pastel-pink flex-shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">
                {state.currentSong.title}
              </h4>
              <p className="text-xs text-slate-300 truncate">
                {state.currentSong.artist} • <strong className="text-pastel-lavender">{state.currentSong.tableName}</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-slate-400 bg-white/5 rounded-2xl">
            El DJ está preparando la siguiente tanda de karaoke
          </div>
        )}
      </LiquidGlassCard>

      {/* Upcoming 2-3 songs before ours */}
      {songsBeforeUs.length > 0 && (
        <LiquidGlassCard variant="subtle" className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-pastel-sky" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                Canciones antes de la tuya ({songsBeforeUs.length})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {songsBeforeUs.map((song, i) => (
              <div
                key={song.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                    {i + 1}
                  </span>
                  <div>
                    <h5 className="font-semibold text-white">{song.title}</h5>
                    <p className="text-[11px] text-slate-400">
                      {song.artist} • <span className="text-slate-300">{song.tableName}</span>
                    </p>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-pastel-sky border border-white/10">
                  ~{Math.round((i + 1) * 3.5)} min
                </span>
              </div>
            ))}
          </div>
        </LiquidGlassCard>
      )}

      {/* Quotas & Rewards Status */}
      <LiquidGlassCard variant="lavender" className="p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-300">
              Cupos de canciones de tu mesa
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              Has usado <strong className="text-pastel-lavender">{quotaUsed}</strong> de{' '}
              <strong className="text-pastel-mint">{totalAllowed}</strong> disponibles
            </div>
          </div>

          {quotasRemaining > 0 && (
            <LiquidButton
              variant="lavender"
              size="sm"
              onClick={onRequestNewSong}
              icon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Pedir Otra
            </LiquidButton>
          )}
        </div>

        {/* Won Prizes Badge */}
        {currentTable && currentTable.rewardsWon && currentTable.rewardsWon.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-pastel-yellow flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" /> Premios Ganados en Barra
              </span>
            </div>
            <div className="space-y-1.5">
              {currentTable.rewardsWon.map((rw) => (
                <div
                  key={rw.id}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-pastel-mint" />
                    <span className="font-semibold text-white">{rw.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{rw.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Button to open Roulette manually if standard tier */}
        {currentTable?.tier === 'standard' && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-slate-300">
              ¿Quieres probar tu suerte en la ruleta?
            </div>
            <button
              onClick={() => setShowRouletteModal(true)}
              className="px-3 py-1 rounded-xl bg-pastel-yellow/20 hover:bg-pastel-yellow/30 text-pastel-yellow border border-pastel-yellow/40 text-xs font-bold flex items-center gap-1 tap-squish"
            >
              <Sparkles className="w-3 h-3" />
              Girar Ruleta
            </button>
          </div>
        )}
      </LiquidGlassCard>

      <RewardsRoulette
        isOpen={showRouletteModal}
        onClose={() => setShowRouletteModal(false)}
      />
    </div>
  );
};
