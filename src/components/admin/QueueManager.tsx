import React, { useState } from 'react';
import {
  Play,
  SkipForward,
  Trash2,
  Volume2,
  Clock,
  Crown,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import { useKaraoke } from '../../context/KaraokeContext';
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import { LiquidButton } from '../ui/LiquidButton';
import { TIER_CONFIGS } from '../../utils/queueAlgorithm';

export const QueueManager: React.FC = () => {
  const {
    state,
    startSong,
    completeCurrentSong,
    cancelSong,
    reorderQueueManual,
  } = useKaraoke();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredQueue = state.queue.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.tableName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || song.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newQueue = [...state.queue];
    const temp = newQueue[index];
    newQueue[index] = newQueue[index - 1];
    newQueue[index - 1] = temp;
    reorderQueueManual(newQueue);
  };

  const handleMoveDown = (index: number) => {
    if (index === state.queue.length - 1) return;
    const newQueue = [...state.queue];
    const temp = newQueue[index];
    newQueue[index] = newQueue[index + 1];
    newQueue[index + 1] = temp;
    reorderQueueManual(newQueue);
  };

  return (
    <div className="space-y-6">
      {/* DJ Live Playback Console (Now Playing) */}
      <LiquidGlassCard
        variant="elevated"
        className="p-5 md:p-6 border-2 border-pastel-lavender/30 shadow-glow-lavender"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-pastel-pink/30 via-purple-500/20 to-pastel-lavender/30 border border-white/25 flex items-center justify-center text-pastel-pink flex-shrink-0 shadow-liquid">
              <Volume2 className="w-8 h-8 animate-pulse" />
              {state.currentSong && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-night-base animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pastel-pink/25 text-pastel-pink border border-pastel-pink/40">
                  {state.currentSong ? '🔴 SONANDO EN TARIMA' : 'EN ESPERA DE SIGUIENTE'}
                </span>
                {state.currentSong && (
                  <span className="text-xs text-slate-400">
                    Mesa:{' '}
                    <strong className="text-white">
                      {state.currentSong.tableName}
                    </strong>
                  </span>
                )}
              </div>

              {state.currentSong ? (
                <div className="mt-1">
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    {state.currentSong.title}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {state.currentSong.artist}{' '}
                    {state.currentSong.notes && (
                      <span className="text-xs text-pastel-mint italic">
                        • "{state.currentSong.notes}"
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-1 text-sm text-slate-400 font-medium">
                  No hay canción sonando en este momento. Selecciona una de la cola.
                </div>
              )}
            </div>
          </div>

          {/* Action buttons for current song */}
          <div className="flex items-center gap-3 self-end md:self-center">
            {state.currentSong ? (
              <LiquidButton
                variant="lavender"
                size="md"
                onClick={completeCurrentSong}
                icon={<SkipForward className="w-4 h-4" />}
              >
                Finalizar y Siguiente Canción
              </LiquidButton>
            ) : (
              state.queue.length > 0 && (
                <LiquidButton
                  variant="lavender"
                  size="md"
                  onClick={() => startSong(state.queue[0].id)}
                  icon={<Play className="w-4 h-4" />}
                >
                  Iniciar Primera Canción ({state.queue[0].title})
                </LiquidButton>
              )
            )}
          </div>
        </div>
      </LiquidGlassCard>

      {/* Queue Controls & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por canción, artista o mesa..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-lavender text-xs"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Prioridad:
          </span>
          {[
            { id: 'all', label: 'Todas' },
            { id: 'high', label: '⭐ VIP $100+' },
            { id: 'medium', label: '💎 Medio $50+' },
            { id: 'low', label: '🎵 Estándar' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPriorityFilter(item.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                priorityFilter === item.id
                  ? 'bg-pastel-lavender/30 text-pastel-lavender border border-pastel-lavender/50'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pending Songs Queue List */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <LiquidGlassCard variant="subtle" className="p-8 text-center">
            <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">
              No hay canciones en cola con los filtros aplicados.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Las canciones solicitadas por los clientes aparecerán aquí automáticamente.
            </p>
          </LiquidGlassCard>
        ) : (
          filteredQueue.map((song) => {
            const config = TIER_CONFIGS[song.tier];
            const originalIndex = state.queue.findIndex((s) => s.id === song.id);

            return (
              <LiquidGlassCard
                key={song.id}
                variant={song.priority === 'high' ? 'lavender' : 'subtle'}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:border-white/20 transition-all"
              >
                {/* Left info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Position number */}
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm text-slate-300 flex-shrink-0">
                    #{originalIndex + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white truncate">
                        {song.title}
                      </h4>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${config.badgeBg}`}
                      >
                        {config.shortLabel}
                      </span>
                      {song.priority === 'high' && (
                        <span className="text-[10px] flex items-center gap-0.5 text-amber-300 font-bold">
                          <Crown className="w-3 h-3" /> Alta
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {song.artist} • <strong className="text-slate-200">{song.tableName}</strong>
                      {song.notes && (
                        <span className="text-pastel-mint ml-2 italic">
                          "{song.notes}"
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <span className="text-xs text-slate-400 mr-2 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> ~{song.estimatedWaitMinutes} min
                  </span>

                  {/* Play now */}
                  <button
                    onClick={() => startSong(song.id)}
                    className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-semibold flex items-center gap-1 tap-squish"
                    title="Poner en tarima ahora"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Cantar</span>
                  </button>

                  {/* Move Up/Down buttons for DJ override */}
                  <div className="flex items-center bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <button
                      onClick={() => handleMoveUp(originalIndex)}
                      disabled={originalIndex === 0}
                      className="px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30"
                      title="Mover arriba en la cola"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveDown(originalIndex)}
                      disabled={originalIndex === state.queue.length - 1}
                      className="px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10 disabled:opacity-30 border-l border-white/10"
                      title="Mover abajo en la cola"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Cancel / Delete */}
                  <button
                    onClick={() => cancelSong(song.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20 transition-colors tap-squish"
                    title="Cancelar canción"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </LiquidGlassCard>
            );
          })
        )}
      </div>
    </div>
  );
};
